import mysql from 'mysql2';

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    /* For Saskatchewan timezone; Only affect how the node server interprets 
    the timestamp, doesn't change the actual timezone settings on mysql server */
    timezone: '-06:00'
}).promise();

export default db;