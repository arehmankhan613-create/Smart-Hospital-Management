// ==========================================
// MediCore
// Departments API Routes
// ==========================================

const express = require("express");
const router = express.Router();
const db = require("../database");


// ==========================================
// GET ALL DEPARTMENTS
// ==========================================

router.get("/", async (req, res) => {

    try {

        const [departments] = await db.query(`
            SELECT *
            FROM departments
            ORDER BY id ASC
        `);

        res.json({
            success: true,
            count: departments.length,
            data: departments
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch departments"
        });

    }

});


// ==========================================
// GET DEPARTMENT BY ID
// ==========================================

router.get("/:id", async (req, res) => {

    try {

        const [departments] = await db.query(
            "SELECT * FROM departments WHERE id = ?",
            [req.params.id]
        );

        if (departments.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Department not found"
            });

        }

        res.json({
            success: true,
            data: departments[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch department"
        });

    }

});


// ==========================================
// CREATE DEPARTMENT
// ==========================================

router.post("/", async (req, res) => {

    try {

        const {
            name,
            description
        } = req.body;


        if (!name) {

            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });

        }


        const [result] = await db.query(
            `
            INSERT INTO departments
            (
                name,
                description
            )
            VALUES (?, ?)
            `,
            [
                name,
                description || null
            ]
        );


        res.status(201).json({

            success: true,

            message:
                "Department created successfully",

            departmentId:
                result.insertId

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to create department"

        });

    }

});


// ==========================================
// UPDATE DEPARTMENT
// ==========================================

router.put("/:id", async (req, res) => {

    try {

        const {
            name,
            description
        } = req.body;


        const [result] = await db.query(
            `
            UPDATE departments

            SET
                name = ?,
                description = ?

            WHERE id = ?
            `,
            [
                name,
                description || null,
                req.params.id
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Department not found"

            });

        }


        res.json({

            success: true,

            message:
                "Department updated successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to update department"

        });

    }

});


// ==========================================
// DELETE DEPARTMENT
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const [result] = await db.query(
            "DELETE FROM departments WHERE id = ?",
            [req.params.id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Department not found"

            });

        }


        res.json({

            success: true,

            message:
                "Department deleted successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to delete department"

        });

    }

});


module.exports = router;
