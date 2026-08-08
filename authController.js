// ==========================================
// MediCore
// Authentication Controller
// ==========================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");


// ==========================================
// Register User
// ==========================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role,
            phone
        } = req.body;


        // Validation

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        // Check existing user

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase()]
        );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });

        }


        // Hash password

        const passwordHash = await bcrypt.hash(
            password,
            12
        );


        // Allowed roles

        const allowedRoles = [
            "ADMIN",
            "DOCTOR",
            "PATIENT",
            "RECEPTIONIST",
            "LAB_STAFF"
        ];


        const selectedRole =
            role && allowedRoles.includes(role)
                ? role
                : "PATIENT";


        // Create user

        const result = await pool.query(
            `
            INSERT INTO users
            (
                name,
                email,
                password_hash,
                role,
                phone
            )
            VALUES
            ($1, $2, $3, $4, $5)
            RETURNING
                id,
                name,
                email,
                role,
                phone,
                created_at
            `,
            [
                name,
                email.toLowerCase(),
                passwordHash,
                selectedRole,
                phone || null
            ]
        );


        const user = result.rows[0];


        res.status(201).json({

            success: true,

            message: "User registered successfully",

            user

        });


    } catch (error) {

        console.error(
            "Registration Error:",
            error.message
        );


        res.status(500).json({

            success: false,

            message: "Server error during registration"

        });

    }

};


// ==========================================
// Login User
// ==========================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required"

            });

        }


        // Find user

        const result = await pool.query(

            `
            SELECT
                id,
                name,
                email,
                password_hash,
                role,
                phone,
                is_active
            FROM users
            WHERE email = $1
            `,

            [email.toLowerCase()]

        );


        if (result.rows.length === 0) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password"

            });

        }


        const user = result.rows[0];


        // Check account status

        if (!user.is_active) {

            return res.status(403).json({

                success: false,

                message: "Your account is disabled"

            });

        }


        // Compare password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password"

            });

        }


        // Create JWT

        const token = jwt.sign(

            {
                userId: user.id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        // Remove password hash

        delete user.password_hash;


        res.json({

            success: true,

            message: "Login successful",

            token,

            user

        });


    } catch (error) {

        console.error(
            "Login Error:",
            error.message
        );


        res.status(500).json({

            success: false,

            message: "Server error during login"

        });

    }

};


module.exports = {

    registerUser,

    loginUser

};