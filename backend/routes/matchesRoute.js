// routes/matchesRoute.js
const express = require("express");
const router = express.Router();
const matchesController = require("../controllers/matchController");

// Fetch all matches for a tournament
router.get("/tournaments/:tournamentId/matches", matchesController.getMatchesByTournament);

// Fetch single match by ID
router.get("/tournaments/:tournamentId/matches/:matchId", matchesController.getMatchById);

// Update match
router.patch("/tournaments/:tournamentId/matches/:matchId", matchesController.updateMatch);

module.exports = router;