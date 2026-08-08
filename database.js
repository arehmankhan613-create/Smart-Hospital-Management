// ==========================================
// MediCore
// PostgreSQL Database Connection
// ==========================================

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("connect", () => {
    console.log("✅ PostgreSQL database connected");
});

pool.on("error", (error) => {
    console.error("❌ PostgreSQL error:", error.message);
});

module.exports = pool;