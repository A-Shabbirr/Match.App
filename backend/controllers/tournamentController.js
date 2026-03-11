const Tournament = require("../models/Tournament");
const Match = require("../models/Match")
const { generateKnockoutMatches, generateLeagueMatches } = require("../services/tournamentServices")

// CREATE
exports.createTournament = async (req, res) => {
    try {
        const { name, type, status, teams, startDate, endDate } = req.body;

        if (!type) {
            return res.status(400).json({
                message: "Tournament Type is required (League or Knockout)"
            });
        }

        if (!teams || teams.length < 2) {
            return res.status(400).json({
                message: "Tournament requires at least 2 teams"
            });
        }

        if (type === "knockout" && teams.length % 2 !== 0) {
            return res.status(400).json({
                message: "Knockout requires even number of teams"
            });
        }
        const tournament = await Tournament.create({
            name,
            type,
            status,
            teams,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
        let matchesData = [];
        if (type === "league") {
            matchesData = generateLeagueMatches(teams);
        }
        if (type === "knockout") {
            matchesData = generateKnockoutMatches(teams);
        }
        const matchDocs = await Promise.all(matchesData.map(m =>
            Match.create({ ...m, tournament: tournament._id })
        ));

        tournament.matches = matchDocs.map(m => m._id);
        await tournament.save();

        // Populate matches before returning if you want
        await tournament.populate("matches");
        res.status(201).json(tournament);

    } catch (error) {
        console.error("Error creating tournament:", error);
        res.status(500).json({ message: error.message });
    }
};


// GET ALL
exports.getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find();
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET BY ID
exports.getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.json(tournament);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// UPDATE
exports.updateTournament = async (req, res) => {
    try {
        const updatedTournament = await Tournament.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.json(updatedTournament);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// DELETE
exports.deleteTournament = async (req, res) => {
    try {
        const deletedTournament = await Tournament.findByIdAndDelete(req.params.id);

        if (!deletedTournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.json({ message: "Tournament deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};