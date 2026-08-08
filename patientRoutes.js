// ==========================================
// MediCore
// Patient Routes
// ==========================================

const express = require("express");

const {
    getAllPatients,
    getPatientById,
    getMyPatientProfile
} = require("../controllers/patient");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// Current Patient Profile
// GET /api/patients/me
// ==========================================

router.get(
    "/me",
    authenticate,
    authorize("PATIENT"),
    getMyPatientProfile
);


// ==========================================
// All Patients
// GET /api/patients
// ==========================================

router.get(
    "/",
    authenticate,
    authorize(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST",
        "LAB_STAFF"
    ),
    getAllPatients
);


// ==========================================
// Patient By ID
// GET /api/patients/:id
// ==========================================

router.get(
    "/:id",
    authenticate,
    authorize(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST",
        "LAB_STAFF"
    ),
    getPatientById
);


module.exports = router;