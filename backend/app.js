const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();
const db = require('./db');
const { sendOrderConfirmationEmail } = require('./services/emailService'); // Adjust the path as needed
const { response } = require('express');
const app = express();
app.use(express.json());
app.use(cors());


app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));



async function sendVerificationEmail(email, code) {
    try {
        await sendOrderConfirmationEmail(email, code);
        return { success: true }; // Vraća uspeh
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send verification email'); // Bacanje greške
    }
}

app.post('/register', async(req, res) => {
    const { firstName, lastName, email, password, birthDate } = req.body;

    try {
        // Proveri da li email već postoji
        const [existingUser] = await db.query('SELECT * FROM User WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Hashovanje lozinke
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generisanje verifikacionog koda
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-cifreni kod

        // Umetanje novog korisnika
        const [results] = await db.query('INSERT INTO User (ime, prezime, email, password, datum_rodjenja, role_id) VALUES (?, ?, ?, ?, ?, ?)', [firstName, lastName, email, hashedPassword, birthDate, 1]);

        const userId = results.insertId;

        // Umetanje podataka o verifikaciji sa verifikacionim kodom
        await db.query('INSERT INTO Verified (user_id, isVerificated, verificationCode) VALUES (?, false, ?)', [userId, verificationCode]);

        // Pošalji verifikacioni email
        await sendVerificationEmail(email, verificationCode);
        res.status(201).json({ message: 'User registered. Check your email for verification code.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error registering user' });
    }
});

// Ruta za proveru verifikacije korisničkog naloga
app.post('/check-verification', async(req, res) => {
    const { email } = req.body; // Prima email umesto user_id
    if (!email) {
        return res.status(400).json({ message: 'Email je obavezan.' });
    }
    try {
        // Prvo pronađi userId na osnovu emaila
        const [userRows] = await db.query(
            'SELECT id FROM user WHERE email = ?', [email]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Korisnik nije pronađen.' });
        }
        const userId = userRows[0].id;
        // Zatim proveri status verifikacije
        const [verificationRows] = await db.query(
            'SELECT isVerificated FROM verified WHERE user_id = ?', [userId]
        );
        if (verificationRows.length === 0) {
            return res.status(404).json({ message: 'Verifikacija nije pronađena.' });
        }
        const isVerificated = verificationRows[0].isVerificated;
        // Vraća status verifikacije kao boolean vrednost
        res.json({ isVerificated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Došlo je do greške prilikom provere verifikacije.' });
    }
});

app.post('/login', async(req, res) => {
    const { email, password, verificationCode } = req.body;

    try {
        // Dohvatimo podatke o korisniku
        const [results] = await db.query('SELECT * FROM User WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const user = results[0];
        // Provera lozinke
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        // Proverimo da li je korisnik verifikovan
        const [verificationResults] = await db.query('SELECT * FROM Verified WHERE user_id = ? AND isVerificated = true', [user.id]);
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Ako korisnik nije verifikovan
        if (verificationResults.length === 0) {
            if (!verificationCode) {
                return res.status(403).json({ success: false, message: 'Account not verified. Please enter your verification code.' });
            }

            // Ako je unet verifikacioni kod, proverimo ga
            const [codeResults] = await db.query('SELECT * FROM Verified WHERE user_id = ? AND verificationCode = ?', [user.id, verificationCode]);
            if (codeResults.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid verification code' });
            }

            // Ažuriranje isVerificated u tabeli Verified i isActive u tabeli User
            await db.query('UPDATE Verified SET isVerificated = true WHERE user_id = ?', [user.id]);
            await db.query('UPDATE User SET isActive = true WHERE id = ?', [user.id]);
            // Login uspešan nakon verifikacije
            return res.status(200).json({
                success: true,
                message: 'Login successful and account verified',
                token: token,
                user: {
                    id: user.id,
                    ime: user.ime,
                    prezime: user.prezime,
                    email: user.email,
                    dateBirth: user.datum_rodjenja
                }
            });
        } else {
            //ako nije aktivan ( znaci da je deaktiviran)
            if (user.isActive === 0) {
                console.log("NIJE AKTIVAN")
                return res.status(400).json({ success: false, message: 'Your profile is deactivated' });
            }
            // Ako je korisnik već verifikovan, dozvoli login
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    ime: user.ime,
                    prezime: user.prezime,
                    email: user.email,
                    dateBirth: user.datum_rodjenja,
                    urlSlike: user.urlSlike,
                    role_id: user.role_id
                }
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error during login process' });
    }
});

// Ruta za proveru verifikacije korisničkog naloga
app.post('/check-password', async(req, res) => {
    const { email, password } = req.body;
    try {
        // Prvo pronađite korisnika u bazi podataka po emailu
        const [results] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

        // Proverite da li je korisnik pronađen
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const user = results[0];

        // Uporedite unesenu lozinku sa enkriptovanom lozinkom
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // Lozinka je tačna
            return res.status(200).json({ success: true, message: 'Password is correct' });
        } else {
            // Lozinka nije tačna
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (err) {
        console.error('Error checking password:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.post('/update-password', async(req, res) => {
    const { email, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await db.query('UPDATE user SET password = ? WHERE email = ?', [hashedPassword, email]);

        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Greška pri ažuriranju lozinke:', error);
        res.status(500).json({ success: false });
    }
});


// Konfiguracija za čuvanje slika
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images'); // direktorijum gde će se čuvati slike
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.post('/upload-profile-image', upload.single('profileImage'), async(req, res) => {
    const { email } = req.body;

    try {
        // Proveri da li je fajl uspešno uploadovan
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const profileImageUrl = `/uploads/images/${req.file.filename}`; // Putanja do slike
        // SQL upit za ažuriranje URL-a profilne slike
        const sql = 'UPDATE user SET urlSlike = ? WHERE email = ?';
        const [results] = await db.query(sql, [profileImageUrl, email]);
        // Provera rezultata
        if (results.affectedRows > 0) {
            console.log('Profile image updated successfully');
            res.json({ success: true, profileImageUrl });
        } else {
            console.log('User not found');
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        // Hvatanje grešaka
        console.error("Error updating profile image:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});



app.post("/update-user-info", async(req, res) => {
    const { email, name, surname, birthdate } = req.body;

    // Priprema promenljivih za SQL upit
    let sql = "UPDATE user SET ";
    const values = [];

    try {
        // Dinamički dodajemo polja koja treba ažurirati
        if (name) {
            sql += "ime = ?, ";
            values.push(name);
        }
        if (surname) {
            sql += "prezime = ?, ";
            values.push(surname);
        }
        if (birthdate) {
            sql += "datum_rodjenja = ?, ";
            values.push(birthdate);
        }
        // if (imageUrl) {
        //     sql += "urlSlike = ?, ";
        //     values.push();
        // }

        // Uklanjamo višak zarez sa kraja i dodajemo WHERE uslov
        sql = sql.slice(0, -2); // Skida poslednji zarez
        sql += " WHERE email = ?";
        values.push(email);
        // Ako nema polja za ažuriranje, vraćamo poruku
        if (values.length === 1) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        // Izvršavanje SQL upita
        const [result] = await db.query(sql, values)
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        // Hvatanje bilo kakve greške tokom obrade
        console.error("Error in update-user-info route:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


app.get('/users', async(req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM user WHERE role_id = 1');
        res.json(users);

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});


app.post("/updateIsActive", async(req, res) => {
    const { userId, isActive } = req.body;

    console.log("active", isActive)
    try {
        const sql = "UPDATE user SET isActive = ? WHERE id = ?";
        await db.query(sql, [isActive, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ success: false, message: "Database update failed" });
    }
});



// Pokretanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});