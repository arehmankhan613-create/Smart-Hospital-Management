// ==========================================
// MediCore
// User Routes
// ==========================================

const express = require("express");

const {
    getCurrentUser
} = require("../controllers/userController");

const {
    authenticate
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// Protected User Profile
// ==========================================

router.get(
    "/me",
    authenticate,
    getCurrentUser
);


module.exports = router;