const express = require("express");
const router = express.Router();

const tournamentController = require("../controllers/tournamentController");

// Create Tournament
router.post("/", tournamentController.createTournament);

// Get All Tournaments
router.get("/", tournamentController.getAllTournaments);

// Get Single Tournament
router.get("/:id", tournamentController.getTournamentById);

// Update Tournament
router.put("/:id", tournamentController.updateTournament);

// Delete Tournament
router.delete("/:id", tournamentController.deleteTournament);

module.exports = router;