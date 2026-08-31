// ==========================================
// MediCore
// Patients API Routes
// PostgreSQL
// ==========================================

const express = require("express");
const router = express.Router();
const db = require("../database");


// ==========================================
// GET ALL PATIENTS
// ==========================================

router.get("/", async (req, res) => {

    try {

        const result = await db.query(`
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

            ORDER BY p.id DESC
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
            message: "Failed to fetch patients"
        });

    }

});


// ==========================================
// GET PATIENT BY ID
// ==========================================

router.get("/:id", async (req, res) => {

    try {

        const result = await db.query(`
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
        `, [req.params.id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
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
            message: "Failed to fetch patient"
        });

    }

});


// ==========================================
// CREATE PATIENT
// ==========================================

router.post("/", async (req, res) => {

    const client = await db.connect();

    try {

        const {
            name,
            email,
            passwordHash,
            phone,
            patientNumber,
            dateOfBirth,
            gender,
            bloodGroup,
            emergencyContactName,
            emergencyContactPhone,
            address,
            allergies
        } = req.body;


        if (
            !name ||
            !email ||
            !passwordHash ||
            !patientNumber
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email, passwordHash and patientNumber are required"
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

            VALUES ($1, $2, $3, 'PATIENT', $4)

            RETURNING id
        `, [
            name,
            email,
            passwordHash,
            phone || null
        ]);


        const userId = userResult.rows[0].id;


        // Create patient

        const patientResult = await client.query(`
            INSERT INTO patients
            (
                user_id,
                patient_number,
                date_of_birth,
                gender,
                blood_group,
                emergency_contact_name,
                emergency_contact_phone,
                address,
                allergies
            )

            VALUES
            (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9
            )

            RETURNING id, patient_number
        `, [

            userId,
            patientNumber,
            dateOfBirth || null,
            gender || null,
            bloodGroup || null,
            emergencyContactName || null,
            emergencyContactPhone || null,
            address || null,
            allergies || null

        ]);


        await client.query("COMMIT");


        res.status(201).json({

            success: true,

            message:
                "Patient registered successfully",

            patient: patientResult.rows[0]

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);


        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message:
                    "Email or patient number already exists"

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to register patient"

        });

    } finally {

        client.release();

    }

});


// ==========================================
// UPDATE PATIENT
// ==========================================

router.put("/:id", async (req, res) => {

    const client = await db.connect();

    try {

        const {
            name,
            email,
            phone,
            dateOfBirth,
            gender,
            bloodGroup,
            emergencyContactName,
            emergencyContactPhone,
            address,
            allergies
        } = req.body;


        await client.query("BEGIN");


        const patientResult = await client.query(`
            SELECT user_id
            FROM patients
            WHERE id = $1
        `, [req.params.id]);


        if (patientResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }


        const userId =
            patientResult.rows[0].user_id;


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
            UPDATE patients

            SET
                date_of_birth = $1,
                gender = $2,
                blood_group = $3,
                emergency_contact_name = $4,
                emergency_contact_phone = $5,
                address = $6,
                allergies = $7

            WHERE id = $8
        `, [

            dateOfBirth || null,
            gender || null,
            bloodGroup || null,
            emergencyContactName || null,
            emergencyContactPhone || null,
            address || null,
            allergies || null,
            req.params.id

        ]);


        await client.query("COMMIT");


        res.json({

            success: true,

            message:
                "Patient updated successfully"

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to update patient"

        });

    } finally {

        client.release();

    }

});


// ==========================================
// DELETE PATIENT
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const result = await db.query(`
            DELETE FROM patients
            WHERE id = $1
            RETURNING id
        `, [req.params.id]);


        if (result.rows.length === 0) {

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
