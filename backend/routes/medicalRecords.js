// ==========================================
// MediCore
// Medical Records API Routes
// PostgreSQL
// ==========================================

const express = require("express");
const router = express.Router();
const db = require("../database");


// ==========================================
// GET ALL MEDICAL RECORDS
// ==========================================

router.get("/", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                mr.id,
                mr.patient_id,
                pu.name AS patient_name,

                mr.doctor_id,
                du.name AS doctor_name,

                mr.appointment_id,
                mr.diagnosis,
                mr.symptoms,
                mr.treatment,
                mr.notes,
                mr.created_at

            FROM medical_records mr

            INNER JOIN patients p
                ON mr.patient_id = p.id

            INNER JOIN users pu
                ON p.user_id = pu.id

            INNER JOIN doctors d
                ON mr.doctor_id = d.id

            INNER JOIN users du
                ON d.user_id = du.id

            ORDER BY mr.created_at DESC
        `);


        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch medical records"
        });

    }

});


// ==========================================
// GET MEDICAL RECORD BY ID
// ==========================================

router.get("/:id", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                mr.id,
                mr.patient_id,
                pu.name AS patient_name,

                mr.doctor_id,
                du.name AS doctor_name,

                mr.appointment_id,
                mr.diagnosis,
                mr.symptoms,
                mr.treatment,
                mr.notes,
                mr.created_at

            FROM medical_records mr

            INNER JOIN patients p
                ON mr.patient_id = p.id

            INNER JOIN users pu
                ON p.user_id = pu.id

            INNER JOIN doctors d
                ON mr.doctor_id = d.id

            INNER JOIN users du
                ON d.user_id = du.id

            WHERE mr.id = $1
        `, [req.params.id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });

        }


        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch medical record"
        });

    }

});


// ==========================================
// CREATE MEDICAL RECORD
// ==========================================

router.post("/", async (req, res) => {

    try {

        const {
            patientId,
            doctorId,
            appointmentId,
            diagnosis,
            symptoms,
            treatment,
            notes
        } = req.body;


        if (
            !patientId ||
            !doctorId ||
            !diagnosis
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Patient, doctor and diagnosis are required"
            });

        }


        const result = await db.query(`
            INSERT INTO medical_records
            (
                patient_id,
                doctor_id,
                appointment_id,
                diagnosis,
                symptoms,
                treatment,
                notes
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            )

            RETURNING id
        `, [

            patientId,
            doctorId,
            appointmentId || null,
            diagnosis,
            symptoms || null,
            treatment || null,
            notes || null

        ]);


        res.status(201).json({

            success: true,

            message:
                "Medical record created successfully",

            recordId:
                result.rows[0].id

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


// ==========================================
// UPDATE MEDICAL RECORD
// ==========================================

router.put("/:id", async (req, res) => {

    try {

        const {
            patientId,
            doctorId,
            appointmentId,
            diagnosis,
            symptoms,
            treatment,
            notes
        } = req.body;


        const result = await db.query(`
            UPDATE medical_records

            SET
                patient_id = $1,
                doctor_id = $2,
                appointment_id = $3,
                diagnosis = $4,
                symptoms = $5,
                treatment = $6,
                notes = $7

            WHERE id = $8

            RETURNING id

        `, [

            patientId,
            doctorId,
            appointmentId || null,
            diagnosis,
            symptoms || null,
            treatment || null,
            notes || null,
            req.params.id

        ]);


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Medical record not found"

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


// ==========================================
// DELETE MEDICAL RECORD
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const result = await db.query(`
            DELETE FROM medical_records

            WHERE id = $1

            RETURNING id
        `, [req.params.id]);


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Medical record not found"

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
