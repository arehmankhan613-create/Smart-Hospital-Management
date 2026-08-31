// ==========================================
// MediCore
// Doctors API Routes
// PostgreSQL
// ==========================================

const express = require("express");
const router = express.Router();
const db = require("../database");


// ==========================================
// GET ALL DOCTORS
// ==========================================

router.get("/", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                d.id,
                u.name,
                u.email,
                u.phone,
                d.specialization,
                d.license_number,
                d.qualification,
                d.experience_years,
                d.consultation_fee,
                d.bio,
                dep.name AS department,
                d.created_at

            FROM doctors d

            INNER JOIN users u
                ON d.user_id = u.id

            INNER JOIN departments dep
                ON d.department_id = dep.id

            ORDER BY d.id DESC
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
            message: "Failed to fetch doctors"
        });

    }

});


// ==========================================
// GET DOCTOR BY ID
// ==========================================

router.get("/:id", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                d.id,
                u.name,
                u.email,
                u.phone,
                d.specialization,
                d.license_number,
                d.qualification,
                d.experience_years,
                d.consultation_fee,
                d.bio,
                dep.name AS department,
                d.created_at

            FROM doctors d

            INNER JOIN users u
                ON d.user_id = u.id

            INNER JOIN departments dep
                ON d.department_id = dep.id

            WHERE d.id = $1
        `, [req.params.id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Doctor not found"
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
            message: "Failed to fetch doctor"
        });

    }

});


// ==========================================
// CREATE DOCTOR
// ==========================================

router.post("/", async (req, res) => {

    const client = await db.connect();

    try {

        const {
            name,
            email,
            passwordHash,
            phone,
            departmentId,
            specialization,
            licenseNumber,
            qualification,
            experienceYears,
            consultationFee,
            bio
        } = req.body;


        if (
            !name ||
            !email ||
            !passwordHash ||
            !departmentId ||
            !specialization ||
            !licenseNumber
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email, passwordHash, departmentId, specialization and licenseNumber are required"
            });

        }


        await client.query("BEGIN");


        // Create user

        const userResult = await client.query(`
            INSERT INTO users
            (
                name,
                email,
                password_hash,
                role,
                phone
            )

            VALUES
            (
                $1,
                $2,
                $3,
                'DOCTOR',
                $4
            )

            RETURNING id
        `, [
            name,
            email,
            passwordHash,
            phone || null
        ]);


        const userId = userResult.rows[0].id;


        // Create doctor

        const doctorResult = await client.query(`
            INSERT INTO doctors
            (
                user_id,
                department_id,
                specialization,
                license_number,
                qualification,
                experience_years,
                consultation_fee,
                bio
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8
            )

            RETURNING id
        `, [
            userId,
            departmentId,
            specialization,
            licenseNumber,
            qualification || null,
            experienceYears || 0,
            consultationFee || 0,
            bio || null
        ]);


        await client.query("COMMIT");


        res.status(201).json({

            success: true,

            message:
                "Doctor added successfully",

            doctorId:
                doctorResult.rows[0].id

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);


        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message:
                    "Email or license number already exists"

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to add doctor"

        });

    } finally {

        client.release();

    }

});


// ==========================================
// UPDATE DOCTOR
// ==========================================

router.put("/:id", async (req, res) => {

    const client = await db.connect();

    try {

        const {
            name,
            email,
            phone,
            departmentId,
            specialization,
            licenseNumber,
            qualification,
            experienceYears,
            consultationFee,
            bio
        } = req.body;


        await client.query("BEGIN");


        const doctorResult = await client.query(`
            SELECT user_id
            FROM doctors
            WHERE id = $1
        `, [req.params.id]);


        if (doctorResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });

        }


        const userId =
            doctorResult.rows[0].user_id;


        await client.query(`
            UPDATE users

            SET
                name = $1,
                email = $2,
                phone = $3,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $4
        `, [
            name,
            email,
            phone || null,
            userId
        ]);


        await client.query(`
            UPDATE doctors

            SET
                department_id = $1,
                specialization = $2,
                license_number = $3,
                qualification = $4,
                experience_years = $5,
                consultation_fee = $6,
                bio = $7

            WHERE id = $8
        `, [
            departmentId,
            specialization,
            licenseNumber,
            qualification || null,
            experienceYears || 0,
            consultationFee || 0,
            bio || null,
            req.params.id
        ]);


        await client.query("COMMIT");


        res.json({

            success: true,

            message:
                "Doctor updated successfully"

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to update doctor"

        });

    } finally {

        client.release();

    }

});


// ==========================================
// DELETE DOCTOR
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const result = await db.query(`
            DELETE FROM doctors
            WHERE id = $1
            RETURNING id
        `, [req.params.id]);


        if (result.rows.length === 0) {

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
