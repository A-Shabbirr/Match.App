const { verifyToken } = require("../middleware/authmiddleware");
const User = require("../models/User");
const express = require("express");
const router = express.Router();

// Get all users (protected)
router.get("/", verifyToken, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;