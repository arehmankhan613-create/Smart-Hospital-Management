// ==========================================
// MediCore
// Patient Controller
// ==========================================

const pool = require("../config/database");


// ==========================================
// Get All Patients
// GET /api/patients
// ==========================================

const getAllPatients = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                p.id,
                p.patient_number,
                u.name,
                u.email,
                u.phone,
                p.date_of_birth,
                p.gender,
                p.blood_group,
                p.emergency_contact_name,
                p.emergency_contact_phone,
                p.address,
                p.allergies,
                p.created_at
            FROM patients p

            INNER JOIN users u
                ON p.user_id = u.id

            WHERE u.is_active = TRUE

            ORDER BY p.created_at DESC
        `);

        res.json({
            success: true,
            count: result.rows.length,
            patients: result.rows
        });

    } catch (error) {

        console.error(
            "Get Patients Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch patients"
        });

    }

};


// ==========================================
// Get Patient By ID
// GET /api/patients/:id
// ==========================================

const getPatientById = async (req, res) => {

    try {

        const patientId = Number(req.params.id);

        if (!Number.isInteger(patientId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid patient ID"
            });

        }


        const result = await pool.query(`
            SELECT
                p.id,
                p.patient_number,
                u.name,
                u.email,
                u.phone,
                p.date_of_birth,
                p.gender,
                p.blood_group,
                p.emergency_contact_name,
                p.emergency_contact_phone,
                p.address,
                p.allergies,
                p.created_at
            FROM patients p

            INNER JOIN users u
                ON p.user_id = u.id

            WHERE p.id = $1
            AND u.is_active = TRUE
        `, [patientId]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }


        res.json({
            success: true,
            patient: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get Patient Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch patient"
        });

    }

};


// ==========================================
// Get Current Patient Profile
// GET /api/patients/me
// ==========================================

const getMyPatientProfile = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                p.id,
                p.patient_number,
                u.name,
                u.email,
                u.phone,
                p.date_of_birth,
                p.gender,
                p.blood_group,
                p.emergency_contact_name,
                p.emergency_contact_phone,
                p.address,
                p.allergies,
                p.created_at
            FROM patients p

            INNER JOIN users u
                ON p.user_id = u.id

            WHERE p.user_id = $1
        `, [req.user.userId]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });

        }


        res.json({
            success: true,
            patient: result.rows[0]
        });

    } catch (error) {

        console.error(
            "My Patient Profile Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch your profile"
        });

    }

};


module.exports = {

    getAllPatients,

    getPatientById,

    getMyPatientProfile

};