'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './tournament.module.css';
import Spinner from '@/app/components/Spinner';
import Navbar from '@/app/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL;

const DEFAULT_TEAM =
    "https://res.cloudinary.com/dyi3wxmy3/image/upload/v1773435973/T_logo_iwqy4i.png";

const SchedulePage = () => {
    const { tournamentId } = useParams();
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [teamMap, setTeamMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    const [editingMatchId, setEditingMatchId] = useState(null);
    const [tempScores, setTempScores] = useState({});

    // Get token from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);
    }, []);

    // Fetch tournament, users, matches
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const tournamentRes = await fetch(`${API}/tournaments/${tournamentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const tournamentData = await tournamentRes.json();
                setTournament(tournamentData);

                const usersRes = await fetch(`${API}/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const usersData = await usersRes.json();

                const map = {};
                usersData.forEach(u => {
                    map[u._id] = {
                        name: u.header || u.name || "Team",
                        avatar: (u.profilePicture || u.avatar || u.image || "").trim() || DEFAULT_TEAM
                    };
                });
                setTeamMap(map);

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

    // Start editing
    const startEdit = (match) => {
        setEditingMatchId(match._id);
        setTempScores(prev => ({
            ...prev,
            [match._id]: {
                scoreA: match.scoreA != null ? match.scoreA : 0,
                scoreB: match.scoreB != null ? match.scoreB : 0
            }
        }));
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingMatchId(null);
    };

    // Save edited match
    const saveMatch = async (matchId) => {
        const temp = tempScores[matchId];
        if (!temp) return;

        const match = matches.find(m => m._id === matchId);
        if (!match) return;

        const updatedFields = {
            scoreA: temp.scoreA,
            scoreB: temp.scoreB,
            status: 'Completed',
            winner: temp.scoreA > temp.scoreB ? match.teamA :
                temp.scoreA < temp.scoreB ? match.teamB : null
        };

        try {
            const res = await fetch(`${API}/matches/${matchId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedFields),
            });

            // Check for valid JSON response
            const contentType = res.headers.get("content-type");
            if (!res.ok || !contentType?.includes("application/json")) {
                let errMsg = 'Failed to update match';
                try {
                    const errData = await res.json();
                    if (errData?.message) errMsg = errData.message;
                } catch { }
                throw new Error(errMsg);
            }

            const savedMatch = await res.json();
            setMatches(prev => prev.map(m => m._id === matchId ? savedMatch : m));
            setEditingMatchId(null);

        } catch (err) {
            console.error(err);
            alert(err.message || 'Failed to update match!');
        }
    };

    // Calculate standings dynamically
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

        return Object.values(table).sort((x, y) => y.points - x.points || y.wins - x.wins);
    };

    // Group matches by round
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
                    <h1 className={styles.title}>{tournament.name} Schedule</h1>

                    <div className={styles.scheduleContainer}>
                        {Object.entries(groupedMatches).map(([round, games]) => (
                            <div key={round}>
                                <h3 className={styles.matchdayTitle}>{round}</h3>

                                {games.map(match => {
                                    const isEditing = editingMatchId === match._id;
                                    const temp = tempScores[match._id] || {
                                        scoreA: match.scoreA != null ? match.scoreA : 0,
                                        scoreB: match.scoreB != null ? match.scoreB : 0
                                    };

                                    return (
                                        <div className={styles.fixtureRow} key={match._id}>
                                            {/* LEFT TEAM */}
                                            <div className={styles.teamBlock}>
                                                <img
                                                    src={teamMap[match.teamA]?.avatar || DEFAULT_TEAM}
                                                    onError={(e) => e.target.src = DEFAULT_TEAM}
                                                    className={styles.teamLogo}
                                                />
                                                <span>{teamMap[match.teamA]?.name || "Team A"}</span>
                                            </div>

                                            {/* SCORE */}
                                            <div className={styles.scoreBox}>
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={temp.scoreA}
                                                            className={styles.scoreInput}
                                                            onChange={(e) =>
                                                                setTempScores(prev => ({
                                                                    ...prev,
                                                                    [match._id]: { ...prev[match._id], scoreA: parseInt(e.target.value) || 0 }
                                                                }))
                                                            }
                                                        />
                                                        -
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={temp.scoreB}
                                                            className={styles.scoreInput}
                                                            onChange={(e) =>
                                                                setTempScores(prev => ({
                                                                    ...prev,
                                                                    [match._id]: { ...prev[match._id], scoreB: parseInt(e.target.value) || 0 }
                                                                }))
                                                            }
                                                        />
                                                    </>
                                                ) : (
                                                    `${match.scoreA ?? 0} - ${match.scoreB ?? 0}`
                                                )}
                                            </div>

                                            {/* RIGHT TEAM */}
                                            <div className={styles.teamBlock}>
                                                <span>{teamMap[match.teamB]?.name || "Team B"}</span>
                                                <img
                                                    src={teamMap[match.teamB]?.avatar || DEFAULT_TEAM}
                                                    onError={(e) => e.target.src = DEFAULT_TEAM}
                                                    className={styles.teamLogo}
                                                />
                                            </div>

                                            {/* BUTTONS */}
                                            <div className={styles.matchMeta}>
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => saveMatch(match._id)}>Save</button>
                                                        <button onClick={cancelEdit}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => startEdit(match)}>Edit</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
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
                                                onError={(e) => e.target.src = DEFAULT_TEAM}
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

export default SchedulePage;