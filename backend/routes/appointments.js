// ==========================================
// MediCore
// Appointments API Routes
// ==========================================

const express = require("express");

const router = express.Router();

const db = require("../database");


// ==========================================
// GET ALL APPOINTMENTS
// ==========================================

router.get("/", async (req, res) => {

    try {

        const [appointments] = await db.query(`
            SELECT
                a.*,
                p.name AS patient_name,
                d.name AS doctor_name
            FROM appointments a

            LEFT JOIN patients p
                ON a.patient_id = p.id

            LEFT JOIN doctors d
                ON a.doctor_id = d.id

            ORDER BY a.appointment_date DESC
        `);

        res.json({

            success: true,

            count: appointments.length,

            data: appointments

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

        const [appointments] = await db.query(`

            SELECT
                a.*,
                p.name AS patient_name,
                d.name AS doctor_name

            FROM appointments a

            LEFT JOIN patients p
                ON a.patient_id = p.id

            LEFT JOIN doctors d
                ON a.doctor_id = d.id

            WHERE a.id = ?

        `, [req.params.id]);


        if (appointments.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Appointment not found"

            });

        }


        res.json({

            success: true,

            data: appointments[0]

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
            reason,
            status
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


        const [result] = await db.query(`

            INSERT INTO appointments
            (
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time,
                reason,
                status
            )

            VALUES (?, ?, ?, ?, ?, ?)

        `, [

            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            reason || null,
            status || "pending"

        ]);


        res.status(201).json({

            success: true,

            message:
                "Appointment created successfully",

            appointmentId:
                result.insertId

        });

    } catch (error) {

        console.error(error);

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
            reason,
            status
        } = req.body;


        const [result] = await db.query(`

            UPDATE appointments

            SET

                patient_id = ?,
                doctor_id = ?,
                appointment_date = ?,
                appointment_time = ?,
                reason = ?,
                status = ?

            WHERE id = ?

        `, [

            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            reason || null,
            status || "pending",
            req.params.id

        ]);


        if (result.affectedRows === 0) {

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

        res.status(500).json({

            success: false,

            message:
                "Failed to update appointment"

        });

    }

});


// ==========================================
// DELETE APPOINTMENT
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const [result] = await db.query(

            "DELETE FROM appointments WHERE id = ?",

            [req.params.id]

        );


        if (result.affectedRows === 0) {

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
