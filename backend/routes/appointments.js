
// ==========================================
// MediCore
// Appointments API Routes
// PostgreSQL
// ==========================================

const express = require("express");
const router = express.Router();
const db = require("../database");


// ==========================================
// GET ALL APPOINTMENTS
// ==========================================

router.get("/", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                a.id,
                a.patient_id,
                p.patient_number,
                pu.name AS patient_name,

                a.doctor_id,
                du.name AS doctor_name,

                a.appointment_date,
                a.appointment_time,
                a.status,
                a.reason,
                a.notes,
                a.created_at,
                a.updated_at

            FROM appointments a

            INNER JOIN patients p
                ON a.patient_id = p.id

            INNER JOIN users pu
                ON p.user_id = pu.id

            INNER JOIN doctors d
                ON a.doctor_id = d.id

            INNER JOIN users du
                ON d.user_id = du.id

            ORDER BY
                a.appointment_date DESC,
                a.appointment_time DESC
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
            message: "Failed to fetch appointments"
        });

    }

});


// ==========================================
// GET APPOINTMENT BY ID
// ==========================================

router.get("/:id", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                a.id,
                a.patient_id,
                p.patient_number,
                pu.name AS patient_name,

                a.doctor_id,
                du.name AS doctor_name,

                a.appointment_date,
                a.appointment_time,
                a.status,
                a.reason,
                a.notes,
                a.created_at,
                a.updated_at

            FROM appointments a

            INNER JOIN patients p
                ON a.patient_id = p.id

            INNER JOIN users pu
                ON p.user_id = pu.id

            INNER JOIN doctors d
                ON a.doctor_id = d.id

            INNER JOIN users du
                ON d.user_id = du.id

            WHERE a.id = $1

        `, [req.params.id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found"
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
            message: "Failed to fetch appointment"
        });

    }

});


// ==========================================
// CREATE APPOINTMENT
// ==========================================

router.post("/", async (req, res) => {

    try {

        const {
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            status,
            reason,
            notes
        } = req.body;


        if (
            !patientId ||
            !doctorId ||
            !appointmentDate ||
            !appointmentTime
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Patient, doctor, date and time are required"
            });

        }


        // Check patient

        const patientCheck = await db.query(
            "SELECT id FROM patients WHERE id = $1",
            [patientId]
        );


        if (patientCheck.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }


        // Check doctor

        const doctorCheck = await db.query(
            "SELECT id FROM doctors WHERE id = $1",
            [doctorId]
        );


        if (doctorCheck.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });

        }


        const result = await db.query(`
            INSERT INTO appointments
            (
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time,
                status,
                reason,
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
            appointmentDate,
            appointmentTime,
            status || "PENDING",
            reason || null,
            notes || null

        ]);


        res.status(201).json({

            success: true,

            message:
                "Appointment created successfully",

            appointmentId:
                result.rows[0].id

        });

    } catch (error) {

        console.error(error);


        // PostgreSQL unique constraint

        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message:
                    "Doctor already has an appointment at this date and time"

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to create appointment"

        });

    }

});


// ==========================================
// UPDATE APPOINTMENT
// ==========================================

router.put("/:id", async (req, res) => {

    try {

        const {
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            status,
            reason,
            notes
        } = req.body;


        const result = await db.query(`
            UPDATE appointments

            SET
                patient_id = $1,
                doctor_id = $2,
                appointment_date = $3,
                appointment_time = $4,
                status = $5,
                reason = $6,
                notes = $7,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $8

            RETURNING id

        `, [

            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            status || "PENDING",
            reason || null,
            notes || null,
            req.params.id

        ]);


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found"

            });

        }


        res.json({

            success: true,

            message:
                "Appointment updated successfully"

        });

    } catch (error) {

        console.error(error);


        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message:
                    "Doctor already has an appointment at this date and time"

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to update appointment"

        });

    }

});


// ==========================================
// UPDATE APPOINTMENT STATUS
// ==========================================

router.patch("/:id/status", async (req, res) => {

    try {

        const { status } = req.body;


        if (!status) {

            return res.status(400).json({

                success: false,

                message:
                    "Status is required"

            });

        }


        const result = await db.query(`
            UPDATE appointments

            SET
                status = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $2

            RETURNING id, status

        `, [

            status,
            req.params.id

        ]);


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found"

            });

        }


        res.json({

            success: true,

            message:
                "Appointment status updated",

            data:
                result.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to update appointment status"

        });

    }

});


// ==========================================
// DELETE APPOINTMENT
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const result = await db.query(`
            DELETE FROM appointments

            WHERE id = $1

            RETURNING id
        `, [req.params.id]);


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found"

            });

        }


        res.json({

            success: true,

            message:
                "Appointment deleted successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to delete appointment"

        });

    }

});


module.exports = router;