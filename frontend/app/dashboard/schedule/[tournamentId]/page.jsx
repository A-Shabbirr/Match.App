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
    const [playerMap, setPlayerMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // Get token from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);
    }, []);

    // Fetch tournament and matches
    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch tournament details
                const tournamentRes = await fetch(`${API}/tournaments/${tournamentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!tournamentRes.ok) throw new Error("Failed to fetch tournament");
                const tournamentData = await tournamentRes.json();
                setTournament(tournamentData);

                // Fetch users (for playerMap)
                const usersRes = await fetch(`${API}/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const usersData = await usersRes.json();
                const map = {};
                usersData.forEach(u => {
                    map[u._id] = u.header || u.name || "User";
                });
                setPlayerMap(map);

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

    // Calculate standings
    const calculateStandings = () => {
        if (!tournament) return [];

        const table = {};
        tournament.players.forEach(pid => {
            table[pid] = { playerId: pid, played: 0, wins: 0, draws: 0, losses: 0, points: 0 };
        });

        matches.forEach(match => {
            if (match.status !== 'Completed') return;

            const playerAId = match.playerA._id;
            const playerBId = match.playerB._id;

            if (!table[playerAId] || !table[playerBId]) return;

            table[playerAId].played++;
            table[playerBId].played++;

            if (match.scoreA === match.scoreB) {
                table[playerAId].draws++;
                table[playerBId].draws++;
                table[playerAId].points++;
                table[playerBId].points++;
                return;
            }

            if (match.winner === playerAId) {
                table[playerAId].wins++;
                table[playerAId].points += 3;
                table[playerBId].losses++;
            } else if (match.winner === playerBId) {
                table[playerBId].wins++;
                table[playerBId].points += 3;
                table[playerAId].losses++;
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
                        {matches.map(match => (
                            <div key={match._id} className={styles.matchCard}>
                                <p className={styles.matchPlayers}>
                                    <strong>{match.playerA.header}</strong> vs{' '}
                                    <strong>{match.playerB.header}</strong>
                                </p>
                                <p>Score: {match.scoreA} - {match.scoreB}</p>
                                <p>Status: {match.status}</p>
                                <p>Winner: {match.winner ? playerMap[match.winner] : 'TBD'}</p>
                            </div>
                        ))}
                    </div>

                    {/* Standings */}
                    <div className={styles.standingsCard}>
                        <h2 className={styles.standingsTitle}>Standings</h2>
                        <table className={styles.standingsTable}>
                            <thead>
                                <tr>
                                    <th className={styles.points}>Player</th>
                                    <th className={styles.points}>P</th>
                                    <th className={styles.points}>W</th>
                                    <th className={styles.points}>D</th>
                                    <th className={styles.points}>L</th>
                                    <th className={styles.points}>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculateStandings().map((row, index) => (
                                    <tr key={row.playerId}>
                                        <td className={styles.points}>{index + 1}. {playerMap[row.playerId]}</td>
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