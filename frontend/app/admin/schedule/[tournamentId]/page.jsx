'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '../[tournamentId]/tournament.module.css';
import Spinner from '@/app/components/Spinner';

const API = process.env.NEXT_PUBLIC_API_URL;

const SchedulePage = () => {
    const { tournamentId } = useParams();

    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [playerMap, setPlayerMap] = useState({});
    const [editMatchID, setEditMatchID] = useState(null);
    const [editData, setEditData] = useState({
        scoreA: 0,
        scoreB: 0,
        status: 'Upcoming',
        winner: ''
    });
    const [token, setToken] = useState(null);

    // Get token safely
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    // Fetch tournament
    useEffect(() => {
        if (!token || !tournamentId) return;

        const fetchTournament = async () => {
            try {
                const res = await fetch(`${API}/tournaments/${tournamentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();
                setTournament(data);
            } catch (err) {
                console.error("Error fetching tournament:", err);
            }
        };

        fetchTournament();
    }, [token, tournamentId]);

    // Fetch users
    useEffect(() => {
        if (!token) return;

        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API}/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const users = await res.json();
                const map = {};

                users.forEach(user => {
                    map[user._id] = user.header;
                });

                setPlayerMap(map);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };

        fetchUsers();
    }, [token]);

    // Fetch matches
    useEffect(() => {
        if (!token || !tournamentId) return;

        const fetchMatches = async () => {
            try {
                const res = await fetch(
                    `${API}/tournaments/${tournamentId}/matches`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const data = await res.json();
                setMatches(data);
            } catch (err) {
                console.error("Error fetching matches:", err);
            }
        };

        fetchMatches();
    }, [token, tournamentId]);

    const edit = (match) => {
        setEditMatchID(match._id);
        setEditData({
            scoreA: match.scoreA,
            scoreB: match.scoreB,
            status: match.status,
            winner: match.winner || ''
        });
    };

    const save = async (matchId) => {
        try {
            await fetch(
                `${API}/tournaments/${tournamentId}/matches/${matchId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        scoreA: Number(editData.scoreA),
                        scoreB: Number(editData.scoreB),
                        status: editData.status,
                        winner: editData.winner || ''
                    })
                }
            );

            setEditMatchID(null);

            // Refresh matches after update
            const res = await fetch(
                `${API}/tournaments/${tournamentId}/matches`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const data = await res.json();
            setMatches(data);

        } catch (err) {
            console.error("Error updating match:", err);
        }
    };

    const calculateStandings = () => {
        if (!tournament) return [];

        const table = {};

        tournament.players.forEach(pid => {
            table[pid] = {
                playerId: pid,
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                points: 0
            };
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

        return Object.values(table).sort(
            (a, b) => b.points - a.points || b.wins - a.wins
        );
    };

    return (
        <div className={styles.page}>
            {!tournament ? (
                <Spinner />
            ) : (
                <>
                    <h1 style={{ marginBottom: '10px' }}>
                        Tournament: {tournament.name}
                    </h1>

                    <div className={styles.matchCard_parent}>
                        {matches.map(match => {
                            const isEditing = editMatchID === match._id;

                            return (
                                <div key={match._id} className={styles.matchCard}>
                                    <p className={styles.matchPlayers}>
                                        <strong>{match.playerA.header}</strong> vs{' '}
                                        <strong>{match.playerB.header}</strong>
                                    </p>

                                    {isEditing ? (
                                        <>
                                            <input
                                                type="number"
                                                value={editData.scoreA}
                                                onChange={e =>
                                                    setEditData({ ...editData, scoreA: e.target.value })
                                                }
                                            />
                                            <span> - </span>
                                            <input
                                                type="number"
                                                value={editData.scoreB}
                                                onChange={e =>
                                                    setEditData({ ...editData, scoreB: e.target.value })
                                                }
                                            />

                                            <select
                                                value={editData.status}
                                                onChange={e =>
                                                    setEditData({ ...editData, status: e.target.value })
                                                }
                                            >
                                                <option value="Upcoming">Upcoming</option>
                                                <option value="Ongoing">Ongoing</option>
                                                <option value="Completed">Full Time</option>
                                            </select>

                                            <select
                                                value={editData.winner}
                                                onChange={e =>
                                                    setEditData({ ...editData, winner: e.target.value })
                                                }
                                            >
                                                <option value="">No winner</option>
                                                <option value={match.playerA._id}>
                                                    {match.playerA.header}
                                                </option>
                                                <option value={match.playerB._id}>
                                                    {match.playerB.header}
                                                </option>
                                            </select>

                                            <button onClick={() => save(match._id)}>Save</button>
                                            <button onClick={() => setEditMatchID(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <p>Score: {match.scoreA} - {match.scoreB}</p>
                                            <p>Status: {match.status}</p>
                                            <p>
                                                Winner:{' '}
                                                {match.winner
                                                    ? playerMap[match.winner]
                                                    : 'TBD'}
                                            </p>

                                            <button
                                                style={{
                                                    width: 100,
                                                    backgroundColor: '#ec1ad0',
                                                    height: 40,
                                                    border: 'none',
                                                    borderRadius: 7,
                                                    color: 'white'
                                                }}
                                                onClick={() => edit(match)}
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

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
                                        <td className={styles.points}>
                                            {index + 1}. {playerMap[row.playerId]}
                                        </td>
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

export default SchedulePage;