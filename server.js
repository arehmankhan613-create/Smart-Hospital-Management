// ==========================================
// MediCore
// Smart Hospital Management System
// Backend Server
// ==========================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


// ==========================================
// Middleware
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ==========================================
// Health Check
// ==========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "MediCore API is running",
        version: "1.0.0"
    });

});


// ==========================================
// API Health Check
// ==========================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        status: "OK",
        service: "MediCore Backend"
    });

});


// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found"
    });

});


// ==========================================
// Global Error Handler
// ==========================================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});


// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`
=========================================
        MediCore Backend
=========================================

Server running on port: ${PORT}

API:
http://localhost:${PORT}

Health:
http://localhost:${PORT}/api/health

=========================================
    `);

});