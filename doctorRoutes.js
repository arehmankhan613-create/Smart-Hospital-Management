const express = require("express");

const {
    getAllDoctors,
    getDoctorById,
    getDoctorsByDepartment
} = require("../controllers/doctor");

const router = express.Router();


// Get all doctors
router.get("/", getAllDoctors);


// Get doctors by department
router.get(
    "/department/:departmentId",
    getDoctorsByDepartment
);


// Get single doctor
router.get(
    "/:id",
    getDoctorById
);


module.exports = router;