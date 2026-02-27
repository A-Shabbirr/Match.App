'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import styles from './ct.module.css';

const API = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState([]);
    const [playerMap, setPlayerMap] = useState({});
    const [token, setToken] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'round_robin',
        startDate: '',
        endDate: '',
        selectedPlayers: []
    });

    // Get token from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);
    }, []);

    // Fetch tournaments
    useEffect(() => {
        if (!token) return;

        const fetchTournaments = async () => {
            try {
                const res = await fetch(`${API}/tournaments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setTournaments(data);
            } catch (err) {
                console.error("Error fetching tournaments:", err);
            }
        };

        fetchTournaments();
    }, [token]);

    // Fetch users
    useEffect(() => {
        if (!token) return;

        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API}/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setPlayers(data);

                // Map player IDs to headers
                const map = {};
                data.forEach(p => map[p._id] = p.header || p.name || "User");
                setPlayerMap(map);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };

        fetchUsers();
    }, [token]);

    // Fetch matches for selected tournament
    useEffect(() => {
        if (!selectedTournament || !token) return;

        const fetchMatches = async () => {
            try {
                const res = await fetch(`${API}/tournaments/${selectedTournament._id}/matches`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setMatches(data);
            } catch (err) {
                console.error("Error fetching matches:", err);
            }
        };

        fetchMatches();
    }, [selectedTournament?._id, token]);

    // Create tournament
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, type, startDate, endDate, selectedPlayers } = formData;

        if (!name || selectedPlayers.length < 2) {
            alert('Add a tournament name and select at least 2 players');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert('End date should be after or the same as start date!');
            return;
        }

        try {
            const res = await fetch(`${API}/tournaments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    type,
                    startDate,
                    endDate,
                    players: selectedPlayers
                })
            });

            const newTournament = await res.json();

            alert('Tournament Created');

            setFormData({
                name: '',
                type: 'round_robin',
                startDate: '',
                endDate: '',
                selectedPlayers: []
            });

            // Refresh tournaments list
            setTournaments(prev => [...prev, newTournament]);

        } catch (err) {
            console.error("Error creating tournament:", err);
        }
    };

    return (
        <div className={styles.page}>
            <Navbar />
            <h1 className={styles.h1}>Create Your Own Tournament</h1>

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
                    <option value="round_robin">Round Robin</option>
                    <option value="knockout">Knockout</option>
                </select>

                <h3 className={styles.h1}>Select Players</h3>
                <div className={styles.gridContainer}>
                    {players.map(p => (
                        <label key={p._id} className={styles.check}>
                            <input
                                type="checkbox"
                                value={p._id}
                                checked={formData.selectedPlayers.includes(p._id)}
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
                            {p.header || p.name}
                        </label>
                    ))}
                </div>

                <button className={styles.button} type="submit">Create Tournament</button>
            </form>

            <h2 className={styles.h2}>All Tournaments</h2>
            {tournaments.map(t => (
                <div key={t._id} className={styles.tournamentWrapper}>
                    <div
                        className={styles.tournamentCard}
                        onClick={() => setSelectedTournament(selectedTournament?._id === t._id ? null : t)}
                    >
                        <span>{t.name} ({t.type})</span>
                        <Link href={`schedule/${t._id}`}>
                            <p className={styles.vd_l}>View Details</p>
                        </Link>
                    </div>

                    {selectedTournament?._id === t._id && (
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
                                <p className={styles.vd}>Click details above to see all matches, standings and others</p>
                                <div className={styles.MatchCard_T_child}>
                                    {matches.length === 0 ? (
                                        <p>No matches yet</p>
                                    ) : (
                                        matches.slice(0, 3).map(m => (
                                            <div key={m._id} className={styles.matchCard}>
                                                <h4>
                                                    {playerMap[m.playerA._id]} vs {playerMap[m.playerB._id]}
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
};

export default Page;