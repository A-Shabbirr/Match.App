const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
        default: "Upcoming"
    },
    type: {
        type: String,
        required: true,
        enum: ["League", "Knockout "]
    },
    teams: [
        {
            type: String
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model("Tournament", tournamentSchema)