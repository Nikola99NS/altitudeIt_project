const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

//lokalna bazas
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'gagi1999',
//     database: 'altitudeIt'
// });


//online baza
const db = mysql.createConnection({
    host: 'mysql-93e4dea-srdjan92ns-2762.h.aivencloud.com',
    user: 'avnadmin',
    password: process.env.DB_PASSWORD,
    database: 'defaultdb',
    port: '15652',
    ssl: {
        ca: fs.readFileSync('./ca.pem')
    }
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