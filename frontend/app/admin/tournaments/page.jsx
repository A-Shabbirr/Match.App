'use client';

import { db } from '@/app/auth/firebase';
import { addDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styles from './ct.module.css';

const Page = () => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState([]);
    const [playerMap, setPlayerMap] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        type: 'round_robin',
        startDate: '',
        endDate: '',
        selectedPlayers: []
    });

    // Fetch tournaments
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'tournaments'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTournaments(data);
        });
        return () => unsubscribe();
    }, []);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            const snap = await getDocs(collection(db, 'users'));
            const data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            setPlayers(data);

            // Map player IDs to headers
            const map = {};
            data.forEach(p => map[p.uid] = p.header);
            setPlayerMap(map);
            console.log('Playermap :', map);

        }
        fetchUsers();
    }, []);


    // Create tournament
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, type, startDate, endDate, selectedPlayers } = formData;

        if (!name || selectedPlayers.length < 2) {
            alert('Add a tournament name and select at least 2 players');
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            alert('End date should be after or the same as start date!');
            return;
        }
        const tournamentRef = await addDoc(collection(db, 'tournaments'), {
            name, type, startDate, endDate, players: selectedPlayers, status: 'Upcoming', winner: ''
        });

        const tournamentId = tournamentRef.id;
        const matchesRef = collection(db, 'tournaments', tournamentId, 'matches');
        if (type === 'round_robin') {
            for (let i = 0; i < players.length; i++) {
                for (let j = i + 1; j < players.length; j++) {
                    await addDoc(matchesRef, {
                        playerA: players[i],
                        playerB: players[j],
                        scoreA: 0,
                        scoreB: 0,
                        round: 'Round Robin',
                        status: 'Upcoming',
                        winner: ''
                    });
                }
            }
        } else {
            // Knockout
            let round = 1;
            let current = [...players].sort(() => Math.random() - 0.5);
            while (current.length > 1) {
                const nextRound = [];
                for (let i = 0; i < current.length; i += 2) {
                    const playerA = current[i];
                    const playerB = current[i + 1] || null;
                    await addDoc(matchesRef,
                        {
                            playerA,
                            playerB,
                            scoreA: 0,
                            scoreB: 0,
                            round: `Round ${round}`,
                            status: 'Upcoming',
                            winner: ''
                        });
                    nextRound.push(playerA);
                }
                current = nextRound;
                round++;
            }
        }

        alert('Tournament Created');
        setFormData({ name: '', type: 'round_robin', startDate: '', endDate: '', selectedPlayers: [] });
    };


    // Fetch matches for selected tournament
    useEffect(() => {
        if (!selectedTournament) return;
        const unsubscribe = onSnapshot(
            collection(db, 'tournaments', selectedTournament.id, 'matches'),
            snapshot => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMatches(data);
            }
        );
        return () => unsubscribe();
    }, [selectedTournament?.id]);

    return (
        <div className={styles.page}>
            <h1 className={styles.h1}>Admin – Tournaments</h1>

            <form className={styles.form} onSubmit={handleSubmit}>
                <input className={styles.input}
                    type="text"
                    placeholder="Tournament Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input className={styles.input}
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
                <input className={styles.input}
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
                <select className={styles.select} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option className={styles.option} value="round_robin">Round Robin</option>
                    <option className={styles.option} value="knockout">Knockout</option>
                </select>
                <h3 className={styles.h1}>Select Players</h3>
                <div className={styles.gridContainer}>
                    {players.map(p => (
                        <label key={p.uid} className={styles.check}>
                            <input
                                className={styles.input}
                                type="checkbox"
                                value={p.uid}
                                checked={formData.selectedPlayers.includes(p.uid)}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        selectedPlayers: prev.selectedPlayers.includes(val)
                                            ? prev.selectedPlayers.filter(id => id !== val)
                                            : [...prev.selectedPlayers, val]
                                    }));
                                }}
                            />
                            {p.header}
                        </label>
                    ))}
                </div>

                <button className={styles.button} type="submit">Create Tournament</button>
            </form>

            <h2 className={styles.h2}>All Tournaments</h2>
            {tournaments.map(t => (
                <div key={t.id} className={styles.tournamentWrapper}>

                    <div
                        className={styles.tournamentCard}
                        onClick={() =>
                            setSelectedTournament(
                                selectedTournament?.id === t.id ? null : t
                            )
                        }
                    >
                        <span>{t.name} ({t.type})</span>
                        <Link
                            href={`schedule/${t.id}`}>
                            <p className={styles.vd_l}>View Details</p>
                        </Link>

                    </div>

                    {selectedTournament?.id === t.id && (
                        <div className={styles.MatchCard}>
                            <div className={styles.MatchCard_F}>
                                <h3>{t.name}</h3>
                                <p>Type: {t.type}</p>
                                <p>Status: {t.status}</p>

                            </div>

                            <div className={styles.MatchCard_S}>
                                <h4>Players</h4>
                                <ul>
                                    {t.players.map(pid => (
                                        <li key={pid}>{playerMap[pid] || pid}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.MatchCard_T}>
                                <h4>Matches</h4>
                                <p className={styles.vd}>Click details above to see all matches , standings and others</p>
                                <div className={styles.MatchCard_T_child}>
                                    {matches.length === 0 ? (
                                        <p>No matches yet</p>
                                    ) : (
                                        matches.slice(0, 3).map(m => (
                                            <div key={m.id} className={styles.matchCard}>
                                                <h4>
                                                    {playerMap[m.playerA]} vs {playerMap[m.playerB]}
                                                </h4>
                                                <p>Score: {m.scoreA} - {m.scoreB}</p>
                                                <p>Status: {m.status}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}



        </div>
    );
}

export default Page;
