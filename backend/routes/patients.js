// ==========================================
// MediCore
// Patients API Routes
// ==========================================

const express = require("express");

const router = express.Router();

const db = require("../database");


// ==========================================
// GET ALL PATIENTS
// ==========================================

router.get("/", async (req, res) => {

    try {

        const [patients] = await db.query(
            "SELECT * FROM patients ORDER BY id DESC"
        );

        res.json({
            success: true,
            count: patients.length,
            data: patients
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patients"
        });

    }

});


// ==========================================
// GET PATIENT BY ID
// ==========================================

router.get("/:id", async (req, res) => {

    try {

        const [patients] = await db.query(
            "SELECT * FROM patients WHERE id = ?",
            [req.params.id]
        );

        if (patients.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }

        res.json({
            success: true,
            data: patients[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patient"
        });

    }

});


// ==========================================
// CREATE PATIENT
// ==========================================

router.post("/", async (req, res) => {

    try {

        const {
            name,
            phone,
            dob,
            gender,
            bloodGroup,
            emergency,
            address
        } = req.body;


        if (!name || !phone || !dob || !gender) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, phone, date of birth and gender are required"
            });

        }


        const [result] = await db.query(

            `INSERT INTO patients
            (
                name,
                phone,
                dob,
                gender,
                blood_group,
                emergency_contact,
                address
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,

            [
                name,
                phone,
                dob,
                gender,
                bloodGroup || null,
                emergency || null,
                address || null
            ]

        );


        res.status(201).json({

            success: true,

            message:
                "Patient registered successfully",

            patientId:
                result.insertId

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to register patient"

        });

    }

});


// ==========================================
// UPDATE PATIENT
// ==========================================

router.put("/:id", async (req, res) => {

    try {

        const {
            name,
            phone,
            dob,
            gender,
            bloodGroup,
            emergency,
            address
        } = req.body;


        const [result] = await db.query(

            `UPDATE patients

             SET
                name = ?,
                phone = ?,
                dob = ?,
                gender = ?,
                blood_group = ?,
                emergency_contact = ?,
                address = ?

             WHERE id = ?`,

            [
                name,
                phone,
                dob,
                gender,
                bloodGroup || null,
                emergency || null,
                address || null,
                req.params.id
            ]

        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient not found"

            });

        }


        res.json({

            success: true,

            message:
                "Patient updated successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to update patient"

        });

    }

});


// ==========================================
// DELETE PATIENT
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const [result] = await db.query(

            "DELETE FROM patients WHERE id = ?",

            [req.params.id]

        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient not found"

            });

        }


        res.json({

            success: true,

            message:
                "Patient deleted successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to delete patient"

        });

    }

});


module.exports = router;
