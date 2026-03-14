'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './tournament.module.css';
import Spinner from '@/app/components/Spinner';
import Navbar from '@/app/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL;

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

                // Fetch tournament
                const tournamentRes = await fetch(`${API}/tournaments/${tournamentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!tournamentRes.ok) throw new Error("Failed to fetch tournament");
                const tournamentData = await tournamentRes.json();
                setTournament(tournamentData);

                // Fetch teams/users for mapping
                const usersRes = await fetch(`${API}/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const usersData = await usersRes.json();
                const map = {};
                usersData.forEach(u => map[u._id] = u.header || u.name || "Team");
                setTeamMap(map);

                // Fetch matches
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

    // Calculate standings (example for league)
    const calculateStandings = () => {
        if (!tournament || !matches) return [];

        const table = {};
        tournament.teams.forEach(tid => {
            table[tid] = { teamId: tid, played: 0, wins: 0, draws: 0, losses: 0, points: 0 };
        });

        matches.forEach(match => {
            if (match.status !== 'Completed') return;

            const teamAId = match.teamA;
            const teamBId = match.teamB;

            table[teamAId].played++;
            table[teamBId].played++;

            if (match.scoreA === match.scoreB) {
                table[teamAId].draws++;
                table[teamBId].draws++;
                table[teamAId].points++;
                table[teamBId].points++;
                return;
            }

            if (match.winner === teamAId) {
                table[teamAId].wins++;
                table[teamAId].points += 3;
                table[teamBId].losses++;
            } else if (match.winner === teamBId) {
                table[teamBId].wins++;
                table[teamBId].points += 3;
                table[teamAId].losses++;
            }
        });

        return Object.values(table).sort((a, b) => b.points - a.points || b.wins - a.wins);
    };

    if (loading) return <Spinner />;

    return (
        <div className={styles.page}>
            <Navbar />
            {!tournament ? (
                <p>Failed to load tournament.</p>
            ) : (
                <>
                    <h1 style={{ marginBottom: '10px' }}>
                        Tournament: {tournament.name}
                    </h1>

                    <div className={styles.matchCard_parent}>
                        {matches.length === 0 ? (
                            <p>No matches yet</p>
                        ) : (
                            matches.map(match => (
                                <div key={match._id} className={styles.matchCard}>
                                    <p className={styles.matchPlayers}>
                                        <strong>{teamMap[match.teamA] || match.teamA}</strong> vs{' '}
                                        <strong>{teamMap[match.teamB] || match.teamB}</strong>
                                    </p>
                                    <p>Score: {match.scoreA ?? 0} - {match.scoreB ?? 0}</p>
                                    <p>Status: {match.status || "Pending"}</p>
                                    <p>Winner: {match.winner ? teamMap[match.winner] : 'TBD'}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Standings */}
                    <div className={styles.standingsCard}>
                        <h2 className={styles.standingsTitle}>Standings</h2>
                        <table className={styles.standingsTable}>
                            <thead>
                                <tr>
                                    <th className={styles.points}>Team</th>
                                    <th className={styles.points}>P</th>
                                    <th className={styles.points}>W</th>
                                    <th className={styles.points}>D</th>
                                    <th className={styles.points}>L</th>
                                    <th className={styles.points}>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculateStandings().map((row, index) => (
                                    <tr key={row.teamId}>
                                        <td className={styles.points}>{index + 1}. {teamMap[row.teamId]}</td>
                                        <td className={styles.points}>{row.played}</td>
                                        <td className={styles.points}>{row.wins}</td>
                                        <td className={styles.points}>{row.draws}</td>
                                        <td className={styles.points}>{row.losses}</td>
                                        <td className={styles.points}>{row.points}</td>
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
