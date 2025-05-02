const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'sharpener',
    password: 'Sharp@25',
    database: 'scheduler_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
