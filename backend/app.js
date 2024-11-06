const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const db = require('./db');
const { sendOrderConfirmationEmail } = require('./services/emailService'); // Adjust the path as needed
const app = express();
app.use(express.json());
app.use(cors());

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

app.post('/login', async(req, res) => {
    const { email, password, verificationCode } = req.body;

    try {
        // Dohvatimo podatke o korisniku
        const [results] = await db.query('SELECT * FROM User WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const user = results[0];

        // Provera lozinke
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }


        // Proverimo da li je korisnik verifikovan
        const [verificationResults] = await db.query('SELECT * FROM Verified WHERE user_id = ? AND isVerificated = true', [user.id]);
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Ako korisnik nije verifikovan
        if (verificationResults.length === 0) {
            if (!verificationCode) {
                return res.status(403).json({ error: 'Account not verified. Please enter your verification code.' });
            }

            // Ako je unet verifikacioni kod, proverimo ga
            const [codeResults] = await db.query('SELECT * FROM Verified WHERE user_id = ? AND verificationCode = ?', [user.id, verificationCode]);
            if (codeResults.length === 0) {
                return res.status(400).json({ error: 'Invalid verification code' });
            }

            // Ažuriranje isVerificated u tabeli Verified i isActive u tabeli User
            await db.query('UPDATE Verified SET isVerificated = true WHERE user_id = ?', [user.id]);
            await db.query('UPDATE User SET isActive = true WHERE id = ?', [user.id]);

            // Login uspešan nakon verifikacije
            return res.status(200).json({
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
            // Ako je korisnik već verifikovan, dozvoli login
            return res.status(200).json({
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    ime: user.ime,
                    prezime: user.prezime,
                    email: user.email,
                    dateBirth: user.datum_rodjenja
                }
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error during login process' });
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


// Pokretanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});