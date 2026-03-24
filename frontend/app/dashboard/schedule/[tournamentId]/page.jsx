'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './tournament.module.css';
import Spinner from '@/app/components/Spinner';
import Navbar from '@/app/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL;

// ✅ GLOBAL DEFAULT IMAGE (FIXES 404)
const DEFAULT_TEAM =
    "https://res.cloudinary.com/dyi3wxmy3/image/upload/v1773435973/T_logo_iwqy4i.png";

const DashboardSchedulePage = () => {
    const { tournamentId } = useParams();
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [teamMap, setTeamMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // Get token
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // TOURNAMENT
                const tournamentRes = await fetch(`${API}/tournaments/${tournamentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const tournamentData = await tournamentRes.json();
                setTournament(tournamentData);

                // USERS → TEAM MAP
                const usersRes = await fetch(`${API}/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const usersData = await usersRes.json();

                const map = {};
                usersData.forEach(u => {
                    map[u._id] = {
                        name: u.header || u.name || "Team",
                        avatar:
                            (u.profilePicture || u.avatar || u.image || "").trim() ||
                            DEFAULT_TEAM
                    };
                });
                setTeamMap(map);

                // MATCHES
                const matchesRes = await fetch(`${API}/tournaments/${tournamentId}/matches`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const matchesData = await matchesRes.json();
                setMatches(matchesData);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, tournamentId]);

    const calculateStandings = () => {
        if (!tournament || !matches) return [];

        const table = {};
        tournament.teams.forEach(tid => {
            table[tid] = { teamId: tid, played: 0, wins: 0, draws: 0, losses: 0, points: 0 };
        });

        matches.forEach(match => {
            if (match.status !== 'Completed') return;

            const a = match.teamA;
            const b = match.teamB;

            table[a].played++;
            table[b].played++;

            if (match.scoreA === match.scoreB) {
                table[a].draws++;
                table[b].draws++;
                table[a].points++;
                table[b].points++;
            } else if (match.winner === a) {
                table[a].wins++;
                table[a].points += 3;
                table[b].losses++;
            } else {
                table[b].wins++;
                table[b].points += 3;
                table[a].losses++;
            }
        });

        return Object.values(table).sort((a, b) => b.points - a.points || b.wins - a.wins);
    };

    // GROUP MATCHES
    const groupedMatches = matches.reduce((acc, match) => {
        const key = match.round || "Matchday 1";
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
    }, {});

    if (loading) return <Spinner />;

    return (
        <div className={styles.page}>
            <Navbar />

            {!tournament ? (
                <p>Failed to load tournament.</p>
            ) : (
                <>
                    <h1 className={styles.title}>
                        {tournament.name} Schedule
                    </h1>

                    {/* FIXTURES */}
                    <div className={styles.scheduleContainer}>
                        {Object.entries(groupedMatches).map(([round, games]) => (
                            <div key={round}>
                                <h3 className={styles.matchdayTitle}>{round}</h3>

                                {games.map(match => (
                                    <div className={styles.fixtureRow} key={match._id}>

                                        {/* LEFT TEAM */}
                                        <div className={styles.teamBlock}>
                                            <img
                                                src={teamMap[match.teamA]?.avatar || DEFAULT_TEAM}
                                                onError={(e) => (e.target.src = DEFAULT_TEAM)}
                                                className={styles.teamLogo}
                                            />
                                            <span>
                                                {teamMap[match.teamA]?.name || "Team A"}
                                            </span>
                                        </div>

                                        {/* SCORE */}
                                        <div className={styles.scoreBox}>
                                            {match.status === "Completed"
                                                ? `${match.scoreA ?? 0} - ${match.scoreB ?? 0}`
                                                : "vs"}
                                        </div>

                                        {/* RIGHT TEAM */}
                                        <div className={styles.teamBlock}>
                                            <span>
                                                {teamMap[match.teamB]?.name || "Team B"}
                                            </span>
                                            <img
                                                src={teamMap[match.teamB]?.avatar || DEFAULT_TEAM}
                                                onError={(e) => (e.target.src = DEFAULT_TEAM)}
                                                className={styles.teamLogo}
                                            />
                                        </div>

                                        {/* STATUS */}
                                        <div className={styles.matchMeta}>
                                            {match.status || "Upcoming"}
                                        </div>

                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* STANDINGS */}
                    <div className={styles.standingsCard}>
                        <h2 className={styles.standingsTitle}>Standings</h2>

                        <table className={styles.standingsTable}>
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    <th>P</th>
                                    <th>W</th>
                                    <th>D</th>
                                    <th>L</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculateStandings().map((row, index) => (
                                    <tr key={row.teamId}>
                                        <td className={styles.teamCell}>
                                            <img
                                                src={teamMap[row.teamId]?.avatar || DEFAULT_TEAM}
                                                onError={(e) => (e.target.src = DEFAULT_TEAM)}
                                                className={styles.tableLogo}
                                            />
                                            {index + 1}. {teamMap[row.teamId]?.name || "Team"}
                                        </td>
                                        <td>{row.played}</td>
                                        <td>{row.wins}</td>
                                        <td>{row.draws}</td>
                                        <td>{row.losses}</td>
                                        <td>{row.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardSchedulePage;