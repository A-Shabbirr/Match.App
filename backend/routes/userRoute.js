const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authmiddleware");
const { getUserById, getAllUsers } = require("../controllers/userController");

// Protected routes
router.get("/", verifyToken, getAllUsers);      // all users
router.get("/:id", verifyToken, getUserById);  // single user

module.exports = router;