// services/tournamentService.js

const generateLeagueMatches = (teams) => {
    const matches = [];

    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            matches.push({
                teamA: teams[i],
                teamB: teams[j]
            });
        }
    }

    return matches;
};

const generateKnockoutMatches = (teams) => {
    const matches = [];

    for (let i = 0; i < teams.length; i += 2) {
        matches.push({
            teamA: teams[i],
            teamB: teams[i + 1]
        });
    }

    return matches;
};

module.exports = {
    generateLeagueMatches,
    generateKnockoutMatches
};