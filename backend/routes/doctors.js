// ==========================================
// MediCore
// Doctors API Routes
// ==========================================

const express = require("express");
const router = express.Router();
const db = require("../database");


// ==========================================
// GET ALL DOCTORS
// ==========================================

router.get("/", async (req, res) => {

    try {

        const [doctors] = await db.query(`
            SELECT *
            FROM doctors
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            count: doctors.length,
            data: doctors
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch doctors"
        });

    }

});


// ==========================================
// GET DOCTOR BY ID
// ==========================================

router.get("/:id", async (req, res) => {

    try {

        const [doctors] = await db.query(
            "SELECT * FROM doctors WHERE id = ?",
            [req.params.id]
        );

        if (doctors.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });

        }

        res.json({
            success: true,
            data: doctors[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch doctor"
        });

    }

});


// ==========================================
// CREATE DOCTOR
// ==========================================

router.post("/", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            specialization,
            department,
            experience,
            licenseNumber
        } = req.body;


        if (
            !name ||
            !email ||
            !phone ||
            !specialization
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email, phone and specialization are required"
            });

        }


        const [result] = await db.query(`

            INSERT INTO doctors
            (
                name,
                email,
                phone,
                specialization,
                department,
                experience,
                license_number
            )

            VALUES (?, ?, ?, ?, ?, ?, ?)

        `, [

            name,
            email,
            phone,
            specialization,
            department || null,
            experience || 0,
            licenseNumber || null

        ]);


        res.status(201).json({

            success: true,

            message:
                "Doctor added successfully",

            doctorId:
                result.insertId

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to add doctor"

        });

    }

});


// ==========================================
// UPDATE DOCTOR
// ==========================================

router.put("/:id", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            specialization,
            department,
            experience,
            licenseNumber
        } = req.body;


        const [result] = await db.query(`

            UPDATE doctors

            SET

                name = ?,
                email = ?,
                phone = ?,
                specialization = ?,
                department = ?,
                experience = ?,
                license_number = ?

            WHERE id = ?

        `, [

            name,
            email,
            phone,
            specialization,
            department || null,
            experience || 0,
            licenseNumber || null,
            req.params.id

        ]);


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found"

            });

        }


        res.json({

            success: true,

            message:
                "Doctor updated successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to update doctor"

        });

    }

});


// ==========================================
// DELETE DOCTOR
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const [result] = await db.query(
            "DELETE FROM doctors WHERE id = ?",
            [req.params.id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found"

            });

        }


        res.json({

            success: true,

            message:
                "Doctor deleted successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to delete doctor"

        });

    }

});


module.exports = router;
