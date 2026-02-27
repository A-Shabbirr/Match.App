// backend/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRole } = require("../middleware/authmiddleware");
const Tournament = require("../models/Tournament");

// All routes here require user role
router.use(verifyToken, authorizeRole(["user"]));

// Get all tournaments (read-only)
router.get("/tournaments", async (req, res) => {
    try {
        const tournaments = await Tournament.find();
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single tournament by id
router.get("/tournaments/:id", async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: "Tournament not found" });
        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Optional: get only tournaments user is participating in
router.get("/my-tournaments", async (req, res) => {
    try {
        const userId = req.user.id;
        const tournaments = await Tournament.find({ players: userId });
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;