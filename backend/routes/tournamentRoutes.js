const express = require("express");
const router = express.Router();

const tournamentController = require("../controllers/tournamentController");

// Create Tournament
router.post("/tournament", tournamentController.createTournament);

// Get All Tournaments
router.get("/tournament", tournamentController.getAllTournaments);

// Get Single Tournament
router.get("/tournament/:id", tournamentController.getTournamentById);

// Update Tournament
router.put("/tournament/:id", tournamentController.updateTournament);

// Delete Tournament
router.delete("/tournament/:id", tournamentController.deleteTournament);

module.exports = router;