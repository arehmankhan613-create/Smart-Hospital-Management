// ==========================================
// MediCore
// PostgreSQL Database Connection
// ==========================================

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : false
});

pool.on("connect", () => {
    console.log("✅ PostgreSQL Database Connected");
});

pool.on("error", (error) => {
    console.error("❌ PostgreSQL Pool Error:", error.message);
});

async function testDatabaseConnection() {

    try {

        const result = await pool.query("SELECT NOW()");

        console.log(
            "✅ Database Connection Successful:",
            result.rows[0]
        );

    } catch (error) {

        console.error(
            "❌ Database Connection Failed:",
            error.message
        );

    }

}

testDatabaseConnection();

module.exports = pool;
