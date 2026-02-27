// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRole } = require("../middleware/authmiddleware");
const tournamentController = require("../controllers/tournamentController");
const User = require("../models/User");

// All routes here require admin role
router.use(verifyToken, authorizeRole(["admin"]));

// Tournament CRUD for admin
router.post("/tournaments", tournamentController.createTournament);
router.get("/tournaments", tournamentController.getAllTournaments);
router.get("/tournaments/:id", tournamentController.getTournamentById);
router.put("/tournaments/:id", tournamentController.updateTournament);
router.delete("/tournaments/:id", tournamentController.deleteTournament);

// Admin: get all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;