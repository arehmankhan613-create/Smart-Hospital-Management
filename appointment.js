// ==========================================
// MediCore
// Appointment Controller
// ==========================================

const pool = require("../config/database");


// ==========================================
// Book Appointment
// POST /api/appointments
// ==========================================

const createAppointment = async (req, res) => {

    try {

        const {
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            notes
        } = req.body;

        // Basic validation

        if (
            !doctor_id ||
            !appointment_date ||
            !appointment_time
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Doctor, date and time are required"
            });

        }

        // Find patient linked to logged-in user

        const patientResult = await pool.query(
            `
            SELECT id
            FROM patients
            WHERE user_id = $1
            `,
            [req.user.userId]
        );

        if (patientResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });

        }

        const patientId = patientResult.rows[0].id;

        // Check doctor

        const doctorResult = await pool.query(
            `
            SELECT id
            FROM doctors
            WHERE id = $1
            `,
            [doctor_id]
        );

        if (doctorResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });

        }

        // Prevent booking in the past

        const appointmentDateTime =
            new Date(
                `${appointment_date}T${appointment_time}`
            );

        if (
            Number.isNaN(
                appointmentDateTime.getTime()
            )
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid appointment date or time"
            });

        }

        if (appointmentDateTime < new Date()) {

            return res.status(400).json({
                success: false,
                message:
                    "Appointment cannot be booked in the past"
            });

        }

        // Check existing appointment

        const existingAppointment =
            await pool.query(
                `
                SELECT id
                FROM appointments
                WHERE doctor_id = $1
                AND appointment_date = $2
                AND appointment_time = $3
                AND status NOT IN (
                    'CANCELLED',
                    'NO_SHOW'
                )
                `,
                [
                    doctor_id,
                    appointment_date,
                    appointment_time
                ]
            );

        if (
            existingAppointment.rows.length > 0
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "This doctor is already booked for this time"
            });

        }

        // Create appointment

        const result = await pool.query(
            `
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
                'PENDING',
                $5,
                $6
            )
            RETURNING *
            `,
            [
                patientId,
                doctor_id,
                appointment_date,
                appointment_time,
                reason || null,
                notes || null
            ]
        );

        res.status(201).json({

            success: true,

            message:
                "Appointment booked successfully",

            appointment: result.rows[0]

        });

    } catch (error) {

        console.error(
            "Create Appointment Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to create appointment"
        });

    }

};


// ==========================================
// Get Patient Appointments
// GET /api/appointments/my
// ==========================================

const getMyAppointments = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.status,
                a.reason,
                a.notes,

                u.name AS doctor_name,

                d.specialization,

                dep.name AS department

            FROM appointments a

            INNER JOIN patients p
                ON a.patient_id = p.id

            INNER JOIN doctors d
                ON a.doctor_id = d.id

            INNER JOIN users u
                ON d.user_id = u.id

            INNER JOIN departments dep
                ON d.department_id = dep.id

            WHERE p.user_id = $1

            ORDER BY
                a.appointment_date DESC,
                a.appointment_time DESC
            `,
            [req.user.userId]
        );

        res.json({

            success: true,

            count: result.rows.length,

            appointments: result.rows

        });

    } catch (error) {

        console.error(
            "My Appointments Error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to fetch appointments"

        });

    }

};


// ==========================================
// Get Doctor Appointments
// GET /api/appointments/doctor
// ==========================================

const getDoctorAppointments = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT

                a.id,

                a.appointment_date,

                a.appointment_time,

                a.status,

                a.reason,

                a.notes,

                p.patient_number,

                u.name AS patient_name,

                u.phone AS patient_phone

            FROM appointments a

            INNER JOIN patients p
                ON a.patient_id = p.id

            INNER JOIN users u
                ON p.user_id = u.id

            INNER JOIN doctors d
                ON a.doctor_id = d.id

            WHERE d.user_id = $1

            ORDER BY
                a.appointment_date ASC,
                a.appointment_time ASC
            `,
            [req.user.userId]
        );

        res.json({

            success: true,

            count: result.rows.length,

            appointments: result.rows

        });

    } catch (error) {

        console.error(
            "Doctor Appointments Error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to fetch doctor appointments"

        });

    }

};


// ==========================================
// Update Appointment Status
// PATCH /api/appointments/:id/status
// ==========================================

const updateAppointmentStatus = async (
    req,
    res
) => {

    try {

        const appointmentId =
            Number(req.params.id);

        const { status } = req.body;

        const allowedStatuses = [
            "CONFIRMED",
            "CHECKED_IN",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
            "NO_SHOW"
        ];

        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid appointment status"

            });

        }

        const result = await pool.query(
            `
            UPDATE appointments

            SET
                status = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $2

            RETURNING *
            `,
            [
                status,
                appointmentId
            ]
        );

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

            appointment:
                result.rows[0]

        });

    } catch (error) {

        console.error(
            "Update Appointment Error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to update appointment"

        });

    }

};


module.exports = {

    createAppointment,

    getMyAppointments,

    getDoctorAppointments,

    updateAppointmentStatus

};