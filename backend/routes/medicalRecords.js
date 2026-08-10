// ==========================================
// MediCore
// Medical Records API Routes
// ==========================================

const express = require("express");
const router = express.Router();
const db = require("../database");


// GET ALL MEDICAL RECORDS
router.get("/", async (req, res) => {

    try {

        const [records] = await db.query(`
            SELECT
                mr.*,
                p.name AS patient_name,
                d.name AS doctor_name
            FROM medical_records mr
            LEFT JOIN patients p
                ON mr.patient_id = p.id
            LEFT JOIN doctors d
                ON mr.doctor_id = d.id
            ORDER BY mr.id DESC
        `);

        res.json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch medical records"
        });

    }

});


// GET MEDICAL RECORD BY ID
router.get("/:id", async (req, res) => {

    try {

        const [records] = await db.query(`
            SELECT
                mr.*,
                p.name AS patient_name,
                d.name AS doctor_name
            FROM medical_records mr
            LEFT JOIN patients p
                ON mr.patient_id = p.id
            LEFT JOIN doctors d
                ON mr.doctor_id = d.id
            WHERE mr.id = ?
        `, [req.params.id]);


        if (records.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });

        }


        res.json({
            success: true,
            data: records[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch medical record"
        });

    }

});


// CREATE MEDICAL RECORD
router.post("/", async (req, res) => {

    try {

        const {
            patientId,
            doctorId,
            diagnosis,
            symptoms,
            prescription,
            notes
        } = req.body;


        if (!patientId || !doctorId || !diagnosis) {

            return res.status(400).json({
                success: false,
                message:
                    "Patient, doctor and diagnosis are required"
            });

        }


        const [result] = await db.query(`
            INSERT INTO medical_records
            (
                patient_id,
                doctor_id,
                diagnosis,
                symptoms,
                prescription,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            patientId,
            doctorId,
            diagnosis,
            symptoms || null,
            prescription || null,
            notes || null
        ]);


        res.status(201).json({

            success: true,

            message:
                "Medical record created successfully",

            recordId:
                result.insertId

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to create medical record"

        });

    }

});


// UPDATE MEDICAL RECORD
router.put("/:id", async (req, res) => {

    try {

        const {
            patientId,
            doctorId,
            diagnosis,
            symptoms,
            prescription,
            notes
        } = req.body;


        const [result] = await db.query(`
            UPDATE medical_records

            SET
                patient_id = ?,
                doctor_id = ?,
                diagnosis = ?,
                symptoms = ?,
                prescription = ?,
                notes = ?

            WHERE id = ?
        `, [
            patientId,
            doctorId,
            diagnosis,
            symptoms || null,
            prescription || null,
            notes || null,
            req.params.id
        ]);


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });

        }


        res.json({

            success: true,

            message:
                "Medical record updated successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to update medical record"

        });

    }

});


// DELETE MEDICAL RECORD
router.delete("/:id", async (req, res) => {

    try {

        const [result] = await db.query(
            "DELETE FROM medical_records WHERE id = ?",
            [req.params.id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });

        }


        res.json({

            success: true,

            message:
                "Medical record deleted successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to delete medical record"

        });

    }

});


module.exports = router;
