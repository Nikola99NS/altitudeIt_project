const db = require('../db');
const bcrypt = require('bcryptjs');


const getUserByEmail = async(email) => {
    const [results] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
    return results;
};

const insertUser = async(firstName, lastName, email, hashedPassword, birthDate) => {
    const [results] = await db.query(
        'INSERT INTO User (ime, prezime, email, password, datum_rodjenja, role_id) VALUES (?, ?, ?, ?, ?, ?)', [firstName, lastName, email, hashedPassword, birthDate, 1]
    );
    return results.insertId;
};

const setIsActive = async(userId) => {
    const response = await db.query('UPDATE User SET isActive = true WHERE id = ?', [userId]);
}

const updatePassword = async(hashedPassword, email) => {

    const [result] = await db.query('UPDATE user SET password = ? WHERE email = ?', [hashedPassword, email])
    return result
}

const getUsers = async() => {
    const [users] = await db.query(`
    SELECT u.*, v.isVerificated 
    FROM User AS u
    LEFT JOIN Verified AS v ON u.id = v.user_id
    WHERE u.role_id = 1
`);
    return users;
}

const valuesForUpdate = async(email, name, surname, birthdate) => {
    // Priprema promenljivih za SQL upit
    let sql = "UPDATE User SET ";
    const values = [];

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
    // Uklanjamo višak zarez sa kraja i dodajemo WHERE uslov
    sql = sql.slice(0, -2); // Skida poslednji zarez
    sql += " WHERE email = ?";
    values.push(email);

    return { values, sql };
}

const uploadProfileImage = async(email, profileImageUrl) => {
    const [results] = await db.query('UPDATE User SET urlSlike = ? WHERE email = ?', [profileImageUrl, email]);
    return results;
}

const updateIsActive = async(userId, isActive) => {
    const response = await db.query("UPDATE User SET isActive = ? WHERE id = ?", [isActive, userId]);
    return response;
}

const get2FaStatus = async(userId) => {
    const [response] = await db.query('SELECT twoFA FROM User WHERE id = ?', [userId]);
    return response;
}

const insertTwoFACode = async(userId, twoFACode) => {
    return await db.query('update User set twoFACode = ? where id = ?', [twoFACode, userId])
}

const checkTwoFACode = async(email, password, twoFACode) => {
    const [response] = await db.query('SELECT * FROM User WHERE email = ? AND twoFACode = ?', [email, twoFACode]);
    return response;
}

const change2FAStatus = async(email, status) => {
    return await db.query("update User set twoFA = ? where email = ?", [status, email]);

}

module.exports = {
    getUserByEmail,
    insertUser,
    setIsActive,
    updatePassword,
    getUsers,
    valuesForUpdate,
    uploadProfileImage,
    updateIsActive,
    get2FaStatus,
    insertTwoFACode,
    checkTwoFACode,
    change2FAStatus
    // getVerificationStatus
    // updateUserVerification
};