const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController");
const matchController = require("../controllers/matchController")

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

//Matches Route
router.get("/:tournamentId/matches", matchController.getMatchesByTournament);
router.put("/matches/:matchId", matchController.updateMatch);

module.exports = router;