// ==========================================
// MediCore
// Database Connection
// ==========================================

const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testDatabaseConnection() {

    try {

        const connection = await pool.getConnection();

        console.log("✅ MySQL Database Connected Successfully");

        connection.release();

    } catch (error) {

        console.error(
            "❌ Database Connection Failed:",
            error.message
        );

    }

}

testDatabaseConnection();

module.exports = pool;
