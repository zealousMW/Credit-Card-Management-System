require('dotenv').config();

const mysql = require('mysql2');
const fs = require('fs');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl: {
        ca: fs.readFileSync(__dirname+'/isrgrootx1.pem'),
    }
});


module.exports = pool.promise();