const { response } = require('express');
const db = require('../db');

const insertVerification = async(userId, verificationCode) => {
    await db.query('INSERT INTO Verified (user_id, isVerificated, verificationCode) VALUES (?, false, ?)', [userId, verificationCode]);
};

const checkIsVerified = async(userId) => {
    const [response] = await db.query('SELECT * FROM Verified WHERE user_id = ? AND isVerificated = true', [userId])
    return response;
}

const checkVerificationCode = async(userId, verificationCode) => {
    const [response] = await db.query('SELECT * FROM Verified WHERE user_id = ? AND verificationCode = ?', [userId, verificationCode]);
    return response;
}

const updateVerified = async(userId) => {
    await db.query('UPDATE Verified SET isVerificated = true WHERE user_id = ?', [userId]);
}


const getVerificationStatus = async(userId) => {
    const [verificationRows] = await db.query(
        'SELECT isVerificated FROM verified WHERE user_id = ?', [userId]
    );
    return verificationRows;
};

module.exports = {
    insertVerification,
    checkIsVerified,
    checkVerificationCode,
    updateVerified,
    getVerificationStatus
};