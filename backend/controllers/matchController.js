// controllers/matchesController.js
const Match = require("../models/Match");
const Tournament = require("../models/Tournament");

// Get all matches for a tournament
exports.getMatchesByTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.tournamentId).populate("matches");
        if (!tournament) return res.status(404).json({ message: "Tournament not found" });
        res.json(tournament.matches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching matches" });
    }
};

// Get a single match by ID
exports.getMatchById = async (req, res) => {
    try {
        const { tournamentId, matchId } = req.params;
        const match = await Match.findOne({ _id: matchId, tournament: tournamentId });
        if (!match) return res.status(404).json({ message: "Match not found" });
        res.json(match);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching match" });
    }
};

// Update a match
exports.updateMatch = async (req, res) => {
    try {
        const { tournamentId, matchId } = req.params;
        const { scoreA, scoreB, status } = req.body;

        const match = await Match.findOne({ _id: matchId, tournament: tournamentId });
        if (!match) return res.status(404).json({ message: "Match not found" });

        if (scoreA !== undefined) match.scoreA = scoreA;
        if (scoreB !== undefined) match.scoreB = scoreB;
        if (status) match.status = status;

        // Auto-calc winner
        if (status === "Completed") {
            if (scoreA > scoreB) match.winner = match.teamA;
            else if (scoreB > scoreA) match.winner = match.teamB;
            else match.winner = null;
        }

        await match.save();
        res.json(match);
    } catch (err) {
        console.error("Error updating match:", err);
        res.status(500).json({ message: "Server error updating match" });
    }
};