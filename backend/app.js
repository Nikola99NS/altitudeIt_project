const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const db = require('./db');
const { sendOrderConfirmationEmail } = require('./services/emailService'); // Adjust the path as needed
const app = express();
app.use(express.json());


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
    const { ime, prezime, email, password, datum_rodjenja } = req.body;

    // Hashovanje lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generisanje verifikacionog koda
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-cifreni kod

    // Umetanje novog korisnika
    db.query('INSERT INTO User (ime, prezime, email, password, datum_rodjenja, role_id) VALUES (?, ?, ?, ?, ?, ?)', [ime, prezime, email, hashedPassword, datum_rodjenja, 1],
        (error, results) => {
            if (error) {
                // Proverite da li je greška vezana za jedinstveni email
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already in use' });
                }
                return res.status(500).json({ error: 'Error registering user' });
            }

            const userId = results.insertId;

            // Umetanje podataka o verifikaciji sa verifikacionim kodom
            db.query('INSERT INTO Verified (user_id, isVerificated, verificationCode) VALUES (?, false, ?)', [userId, verificationCode],
                async(error) => {
                    if (error) {
                        return res.status(500).json({ error: 'Error adding verification info' });
                    }

                    try {
                        await sendVerificationEmail(email, verificationCode); // Čekamo da se email pošalje
                        res.status(201).json({ message: 'User registered. Check your email for verification code.' });
                    } catch (sendError) {
                        return res.status(500).json({ error: sendError.message }); // Vraćamo grešku ako slanje ne uspe
                    }
                }
            );
        }
    );
});

app.post('/login', async(req, res) => {
    const { email, password, verificationCode } = req.body;

    // Dohvatimo podatke o korisniku
    db.query('SELECT * FROM User WHERE email = ?', [email], async(error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error querying database' });
        }

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
        db.query('SELECT * FROM Verified WHERE user_id = ? AND isVerificated = true', [user.id], async(error, verificationResults) => {
            if (error) {
                return res.status(500).json({ error: 'Error querying verification data' });
            }

            // Ako korisnik nije verifikovan
            if (verificationResults.length === 0) {
                if (!verificationCode) {
                    return res.status(403).json({ error: 'Account not verified. Please enter your verification code.' });
                }

                // Ako je unet verifikacioni kod, proverimo ga
                db.query('SELECT * FROM Verified WHERE user_id = ? AND verificationCode = ?', [user.id, verificationCode], (error, codeResults) => {
                    if (error) {
                        return res.status(500).json({ error: 'Error verifying code' });
                    }

                    if (codeResults.length === 0) {
                        return res.status(400).json({ error: 'Invalid verification code' });
                    }

                    // Ažuriranje isVerificated u tabeli Verified i isActive u tabeli User
                    db.query('UPDATE Verified SET isVerificated = true WHERE user_id = ?', [user.id], async(error) => {
                        if (error) {
                            return res.status(500).json({ error: 'Error updating verification status' });
                        }
                        // Ažuriranje isActive u tabeli User na true
                        db.query('UPDATE User SET isActive = true WHERE id = ?', [user.id], (error) => {
                            if (error) {
                                return res.status(500).json({ error: 'Error updating user active status' });
                            }

                            // Login uspešan nakon verifikacije
                            res.status(200).json({
                                message: 'Login successful and account verified',
                                user: {
                                    id: user.id,
                                    ime: user.ime,
                                    prezime: user.prezime,
                                    email: user.email
                                }
                            });
                        });
                    });
                });
            } else {
                // Ako je korisnik već verifikovan, dozvoli login
                res.status(200).json({
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        ime: user.ime,
                        prezime: user.prezime,
                        email: user.email
                    }
                });
            }
        });
    });
});


// Pokretanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});