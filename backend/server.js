// ==========================================
// MediCore
// Smart Hospital Management System
// Backend Server
// ==========================================

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./database");

const patientsRoutes = require("./routes/patients");
const doctorsRoutes = require("./routes/doctors");
const appointmentsRoutes = require("./routes/appointments");
const medicalRecordsRoutes = require("./routes/medicalRecords");
const departmentsRoutes = require("./routes/departments");

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ==========================================
// SERVER INFORMATION
// ==========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "MediCore Hospital Management API is running",

        version: "1.0.0",

        status: "online"

    });

});


// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", async (req, res) => {

    try {

        await db.query("SELECT 1");

        res.json({

            success: true,

            server: "online",

            database: "connected"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            server: "online",

            database: "disconnected"

        });

    }

});


// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/patients",
    patientsRoutes
);

app.use(
    "/api/doctors",
    doctorsRoutes
);

app.use(
    "/api/appointments",
    appointmentsRoutes
);

app.use(
    "/api/medical-records",
    medicalRecordsRoutes
);

app.use(
    "/api/departments",
    departmentsRoutes
);


// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "API endpoint not found",

        path: req.originalUrl

    });

});


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {

    console.error("Server Error:", error);

    res.status(500).json({

        success: false,

        message: "Internal server error"

    });

});


// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(`
==========================================
       MediCore API Server
==========================================

Server:
http://localhost:${PORT}

Health:
http://localhost:${PORT}/api/health

Patients:
http://localhost:${PORT}/api/patients

Doctors:
http://localhost:${PORT}/api/doctors

Appointments:
http://localhost:${PORT}/api/appointments

Medical Records:
http://localhost:${PORT}/api/medical-records

Departments:
http://localhost:${PORT}/api/departments

==========================================
    `);

});
