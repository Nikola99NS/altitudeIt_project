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

// Pokretanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});