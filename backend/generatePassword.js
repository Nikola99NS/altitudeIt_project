const bcrypt = require('bcrypt');
require('dotenv').config();

async function generateHashedPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Hashed password:", hashedPassword);
}

generateHashedPassword(process.env.ADMIN_PASSWORD);