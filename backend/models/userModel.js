const db = require('../db');


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
    console.log('sta je ovo', response)
}

const updatePassword = async(hashedPassword, email) => {

    const [result] = await db.query('UPDATE user SET password = ? WHERE email = ?', [hashedPassword, email])
    return result
}

const getUsers = async() => {
    const [users] = await db.query('SELECT * FROM user WHERE role_id = 1');
    return users;
}

const valuesForUpdate = async(email, name, surname, birthdate) => {
    // Priprema promenljivih za SQL upit
    let sql = "UPDATE user SET ";
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
    // if (imageUrl) {
    //     sql += "urlSlike = ?, ";
    //     values.push();
    // }

    // Uklanjamo višak zarez sa kraja i dodajemo WHERE uslov
    sql = sql.slice(0, -2); // Skida poslednji zarez
    sql += " WHERE email = ?";
    values.push(email);

    return { values, sql };
}

const uploadProfileImage = async(email, profileImageUrl) => {
    const [results] = await db.query('UPDATE user SET urlSlike = ? WHERE email = ?', [profileImageUrl, email]);
    return results;
}

const updateIsActive = async(userId, isActive) => {
    console.log(userId)
    console.log(isActive)
    const response = await db.query("UPDATE user SET isActive = ? WHERE id = ?", [isActive, userId]);
    return response;
}


module.exports = {
    getUserByEmail,
    insertUser,
    setIsActive,
    updatePassword,
    getUsers,
    valuesForUpdate,
    uploadProfileImage,
    updateIsActive
    // getVerificationStatus
    // updateUserVerification
};