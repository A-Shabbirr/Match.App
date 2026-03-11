const Match = require("../models/Match")
const Tournament = require("../models/Tournament");

// Get all Matches for a Tournament
exports.getMatchesByTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.tournamentId).populate("matches");
        if (!tournament) return res.status(404).json({ message: "Tournament not found" });

        res.json(tournament.matches); // send only the matches array
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching matches" });
    }
};


// Update a match (scores or status)
exports.updateMatch = async (req, res) => {
    try {
        const match = await Match.findByIdAndUpdate(
            req.params.matchId,
            req.body,
            { new: true, runValidators: true }
        );
        if (!match) return res.status(404).json({ message: "Match not found" });
        res.json(match);
    } catch (err) {
        console.error("Error updating match:", err);
        res.status(500).json({ message: err.message });
    }
};