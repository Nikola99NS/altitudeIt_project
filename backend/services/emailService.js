const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Postavi OAuth2 klijent koristeći Google podakte
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);


// Setuj refresh token koji si dobio
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendOrderConfirmationEmail(email, kod) {
    try {
        // novi access token dobijen pomocu refresh tokena
        const accessToken = await oAuth2Client.getAccessToken();

        // transporter za Nodemailer sa OAuth2
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'nikolasimidzija1@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: 'nikolasimidzija1@gmail.com',
            to: email,
            subject: 'Potvrda registracije',
            html: `<h1>Potrebno je da unesete ovaj kod prilikom logovanja! </h1><p>Vas kod je:</p><pre>${kod}</pre>`,
        };

        // Pošalji mejl
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Greška pri slanju mejla:', error);
        throw error;
    }
}

module.exports = { sendOrderConfirmationEmail };