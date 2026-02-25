'use client';

import { db } from '@/app/auth/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    updateDoc
} from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '../[tournamentId]/tournament.module.css';
import Spinner from '@/app/components/Spinner';

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

    // Fetch tournament
    useEffect(() => {
        const fetchTournament = async () => {
            const ref = doc(db, 'tournaments', tournamentId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setTournament({ id: snap.id, ...snap.data() });
            }
        };
        fetchTournament();
    }, [tournamentId]);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            const snap = await getDocs(collection(db, 'users'));
            const map = {};
            snap.docs.forEach(doc => {
                map[doc.id] = doc.data().header;
            });
            setPlayerMap(map);
            console.log('this is map:', map);

        };
        fetchUsers();
    }, []);

    // Listen to matches
    useEffect(() => {
        const matchesRef = collection(db, 'tournaments', tournamentId, 'matches');
        const unsubscribe = onSnapshot(matchesRef, snapshot => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMatches(data);
            console.log('Matches Data:', data);

        });

        return () => unsubscribe();
    }, [tournamentId]);

    const edit = (match) => {
        setEditMatchID(match.id);
        setEditData({
            scoreA: match.scoreA,
            scoreB: match.scoreB,
            status: match.status,
            winner: match.winner || ''
        });
    };

    const save = async (matchId) => {
        const ref = doc(db, 'tournaments', tournamentId, 'matches', matchId);

        await updateDoc(ref, {
            scoreA: Number(editData.scoreA),
            scoreB: Number(editData.scoreB),
            status: editData.status, // ✅ fixed typo
            winner: editData.winner || ''
        });

        setEditMatchID(null);
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

            const playerAId = match.playerA.uid;
            const playerBId = match.playerB.uid;

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
                            const isEditing = editMatchID === match.id;
                            return (
                                <div key={match.id} className={styles.matchCard}>
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
                                                <option value={match.playerA.uid}>
                                                    {match.playerA.header}
                                                </option>
                                                <option value={match.playerB.uid}>
                                                    {match.playerB.header}
                                                </option>
                                            </select>

                                            <button onClick={() => save(match.id)}>Save</button>
                                            <button onClick={() => setEditMatchID(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <p>Score: {match.scoreA} - {match.scoreB}</p>
                                            <p>Status: {match.status}</p>
                                            <p>
                                                Winner:{' '}
                                                {match.winner ? playerMap[match.winner] : 'TBD'}
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
                    {/* STANDINGS */}
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
                                        <td className={styles.points}> {index + 1}. {playerMap[row.playerId]}</td>
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
