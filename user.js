// ==========================================
// MediCore
// User Controller
// ==========================================

const pool = require("../config/database");


// ==========================================
// Get Current User
// GET /api/users/me
// ==========================================

const getCurrentUser = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                role,
                phone,
                is_active,
                created_at
            FROM users
            WHERE id = $1
            `,
            [req.user.userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get User Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};


module.exports = {
    getCurrentUser
};