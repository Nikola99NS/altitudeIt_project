const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'gagi1999', //ovo moram da promenim kasnije
    database: 'altitudeIt'
});

const promiseDb = db.promise();


db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = promiseDb;