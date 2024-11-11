const bcrypt = require('bcryptjs');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const userModel = require('../models/userModel');
const verifiedModel = require('../models/verifiedModel');
const { generateToken, validatePassword } = require('../models/authModel');


const register = async(req, res) => {
    const { firstName, lastName, email, password, birthDate } = req.body;

    try {
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const userId = await userModel.insertUser(firstName, lastName, email, hashedPassword, birthDate);
        await verifiedModel.insertVerification(userId, verificationCode);

        await sendOrderConfirmationEmail(email, verificationCode);
        res.status(201).json({ message: 'User registered. Check your email for verification code.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error registering user' });
    }
};

const login = async(req, res) => {
    const { email, password, verificationCode } = req.body;
    try {
        const results = await userModel.getUserByEmail(email);
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const user = results[0];
        const isPasswordMatch = await validatePassword(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        const verificationResults = await verifiedModel.checkIsVerified(user.id);

        // Ako korisnik nije verifikovan
        if (verificationResults.length === 0) {
            if (!verificationCode) {
                return res.status(403).json({ success: false, message: 'Account not verified. Please enter your verification code.' });
            }

            // Ako je unet verifikacioni kod, proverimo ga
            const codeResults = await verifiedModel.checkVerificationCode(user.id, verificationCode);
            if (codeResults.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid verification code' });
            }

            await verifiedModel.updateVerified(user.id);

            await userModel.setIsActive(user.id);


            // Login uspesan nakon verifikacije
            return res.status(200).json({
                success: true,
                message: 'Login successful and account verified',
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
        } else {
            //ako nije aktivan ( znaci da je deaktiviran)
            if (user.isActive === 0) {
                console.log("NIJE AKTIVAN")
                return res.status(400).json({ success: false, message: 'Your profile is deactivated' });
            }
            // Ako je korisnik vec verifikovan,  proveri da li je potrebna 2FA
            const [getTwoFAStatus] = await userModel.get2FaStatus(user.id);
            if (getTwoFAStatus.twoFA) {
                const twoFACode = Math.floor(100000 + Math.random() * 900000);
                await userModel.insertTwoFACode(user.id, twoFACode);
                await sendOrderConfirmationEmail(email, twoFACode);
                return res.json({ success: false, message: "Potrebno je da unesete kod koji smo vam poslali na mejl", twoFACode: twoFACode })
            }

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    ime: user.ime,
                    prezime: user.prezime,
                    email: user.email,
                    datum_rodjenja: user.datum_rodjenja,
                    urlSlike: user.urlSlike,
                    role_id: user.role_id
                }
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error during login process' });
    }
};

const checkTwoFACode = async(req, res) => {
    const { email, password, twoFACode } = req.body;
    try {
        const response = await userModel.checkTwoFACode(email, password, twoFACode);
        if (response.length === 0) {
            return res.json({ success: false, message: "Neispravan mejl ili kod" });
        }

        const match = await bcrypt.compare(password, response[0].password);
        if (!match) {
            return res.json({ success: false, message: "Neispravan password" });
        }
        const token = generateToken(response[0]);

        return res.json({ user: response[0], success: true, token: token })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error during checking process' });
    }
}

const change2FAStatus = async(req, res) => {
    const { email, newStatus } = req.body;

    try {
        const [response] = await userModel.change2FAStatus(email, newStatus);
        if (response.affectedRows > 0) {
            res.json({ success: true })
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Došlo je do greške prilikom promene 2FA stanja .' });
    }
}

const checkVerification = async(req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email je obavezan.' });
    }
    try {
        const [user] = await userModel.getUserByEmail(email);

        if (user === null) {
            return res.status(404).json({ message: 'Korisnik nije pronađen.' });
        }

        const verificationResults = await verifiedModel.checkIsVerified(user.id);
        if (verificationResults === null) {
            return res.status(404).json({ message: 'Verifikacija nije pronađena.' });
        }
        res.json({ "isVerificated": verificationResults.isVerificated })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Došlo je do greške prilikom provere verifikacije.' });
    }
}

const checkPassword = async(req, res) => {
    const { email, password } = req.body;
    try {
        // Prvo pronađite korisnika u bazi podataka po emailu
        const [user] = await userModel.getUserByEmail(email);
        console.log(user)
            // Proverite da li je korisnik pronađen
        if (user === null) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // // Uporedite unesenu lozinku sa enkriptovanom lozinkom
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            return res.status(200).json({ success: true, message: 'Password is correct' });
        } else {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (err) {
        console.error('Error checking password:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

const updatePassword = async(req, res) => {
    const { email, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log(hashedPassword)
        const result = await userModel.updatePassword(hashedPassword, email);
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Greška pri ažuriranju lozinke:', error);
        res.status(500).json({ success: false });
    }
}


module.exports = { register, login, checkVerification, checkPassword, updatePassword, checkTwoFACode, change2FAStatus };