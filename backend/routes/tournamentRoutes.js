const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController");
const matchesController = require("../controllers/matchController");

// Tournament CRUD
router.post("/", tournamentController.createTournament);
router.get("/", tournamentController.getAllTournaments);
router.get("/:id", tournamentController.getTournamentById);
router.put("/:id", tournamentController.updateTournament);
router.delete("/:id", tournamentController.deleteTournament);

// Matches routes (nested under tournaments)
router.get("/:tournamentId/matches", matchesController.getMatchesByTournament);
router.get("/:tournamentId/matches/:matchId", matchesController.getMatchById);
router.patch("/:tournamentId/matches/:matchId", matchesController.updateMatch);

module.exports = router;