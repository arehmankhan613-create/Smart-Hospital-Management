// ==========================================
// MediCore
// Appointment Routes
// ==========================================

const express = require("express");

const {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus
} = require("../controllers/appointment");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// Patient: Book Appointment
// POST /api/appointments
// ==========================================

router.post(
    "/",
    authenticate,
    authorize("PATIENT"),
    createAppointment
);


// ==========================================
// Patient: My Appointments
// GET /api/appointments/my
// ==========================================

router.get(
    "/my",
    authenticate,
    authorize("PATIENT"),
    getMyAppointments
);


// ==========================================
// Doctor: My Appointments
// GET /api/appointments/doctor
// ==========================================

router.get(
    "/doctor",
    authenticate,
    authorize("DOCTOR"),
    getDoctorAppointments
);


// ==========================================
// Update Appointment Status
// PATCH /api/appointments/:id/status
// ==========================================

router.patch(
    "/:id/status",
    authenticate,
    authorize(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST"
    ),
    updateAppointmentStatus
);


module.exports = router;