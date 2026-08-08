// ==========================================
// MediCore
// Doctor Controller
// ==========================================

const pool = require("../config/database");


// ==========================================
// Get All Doctors
// GET /api/doctors
// ==========================================

const getAllDoctors = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                d.id,
                u.name,
                u.email,
                u.phone,
                d.specialization,
                d.qualification,
                d.experience_years,
                d.consultation_fee,
                d.license_number,
                dep.name AS department
            FROM doctors d

            INNER JOIN users u
                ON d.user_id = u.id

            INNER JOIN departments dep
                ON d.department_id = dep.id

            WHERE u.is_active = TRUE

            ORDER BY u.name ASC
        `);

        res.json({
            success: true,
            count: result.rows.length,
            doctors: result.rows
        });

    } catch (error) {

        console.error(
            "Get Doctors Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch doctors"
        });

    }

};


// ==========================================
// Get Doctor By ID
// GET /api/doctors/:id
// ==========================================

const getDoctorById = async (req, res) => {

    try {

        const doctorId = Number(req.params.id);

        if (!Number.isInteger(doctorId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid doctor ID"
            });

        }


        const result = await pool.query(`
            SELECT
                d.id,
                u.name,
                u.email,
                u.phone,
                d.specialization,
                d.qualification,
                d.experience_years,
                d.consultation_fee,
                d.license_number,
                d.bio,
                dep.name AS department
            FROM doctors d

            INNER JOIN users u
                ON d.user_id = u.id

            INNER JOIN departments dep
                ON d.department_id = dep.id

            WHERE d.id = $1
            AND u.is_active = TRUE
        `, [doctorId]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });

        }


        res.json({
            success: true,
            doctor: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get Doctor Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch doctor"
        });

    }

};


// ==========================================
// Get Doctors By Department
// GET /api/doctors/department/:departmentId
// ==========================================

const getDoctorsByDepartment = async (req, res) => {

    try {

        const departmentId =
            Number(req.params.departmentId);


        if (!Number.isInteger(departmentId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid department ID"
            });

        }


        const result = await pool.query(`
            SELECT
                d.id,
                u.name,
                d.specialization,
                d.qualification,
                d.experience_years,
                d.consultation_fee,
                dep.name AS department
            FROM doctors d

            INNER JOIN users u
                ON d.user_id = u.id

            INNER JOIN departments dep
                ON d.department_id = dep.id

            WHERE d.department_id = $1
            AND u.is_active = TRUE

            ORDER BY u.name ASC
        `, [departmentId]);


        res.json({
            success: true,
            count: result.rows.length,
            doctors: result.rows
        });

    } catch (error) {

        console.error(
            "Department Doctors Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch department doctors"
        });

    }

};


module.exports = {

    getAllDoctors,

    getDoctorById,

    getDoctorsByDepartment

};