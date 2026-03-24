'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import styles from './ct.module.css';

const API = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_AVATAR =
    "https://res.cloudinary.com/dyi3wxmy3/image/upload/v1773435973/T_logo_iwqy4i.png";

const Page = () => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [teamMap, setTeamMap] = useState({});
    const [token, setToken] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'league',
        startDate: '',
        endDate: '',
        selectedTeams: [],
    });

    // Get token
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);
    }, []);

    // Fetch tournaments
    useEffect(() => {
        if (!token) return;
        fetch(`${API}/tournaments`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setTournaments(data))
            .catch(err => console.error("Error fetching tournaments:", err));
    }, [token]);

    // Fetch teams and map
    useEffect(() => {
        if (!token) return;
        fetch(`${API}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setTeams(data);
                const map = {};
                data.forEach(t => (map[t._id] = t));
                setTeamMap(map);
            })
            .catch(err => console.error("Error fetching teams:", err));
    }, [token]);

    // Fetch matches for selected tournament
    useEffect(() => {
        if (!selectedTournament || !token) return;
        fetch(`${API}/tournaments/${selectedTournament._id}/matches`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setMatches(data))
            .catch(err => console.error("Failed to fetch matches", err));
    }, [selectedTournament, token]);

    // Handle tournament creation
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, type, startDate, endDate, selectedTeams } = formData;

        if (!name || selectedTeams.length < 2) {
            alert("Add tournament name and select at least 2 teams");
            return;
        }
        if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
            alert("Select valid start and end dates!");
            return;
        }

        try {
            const res = await fetch(`${API}/tournaments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, type, startDate, endDate, teams: selectedTeams }),
            });

            if (!res.ok) throw new Error("Tournament creation failed");
            const newTournament = await res.json();
            setTournaments(prev => [...prev, newTournament]);
            setFormData({ name: '', type: 'league', startDate: '', endDate: '', selectedTeams: [] });
            alert("Tournament created successfully!");
        } catch (err) {
            console.error(err);
            alert("Tournament creation failed!");
        }
    };

    return (
        <div className={styles.page}>
            <Navbar />
            <h1 className={styles.h1}>Create Your Own Tournament</h1>

            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Tournament Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    className={styles.input}
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
                <input
                    className={styles.input}
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
                <select
                    className={styles.select}
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                    <option value="league">League</option>
                    <option value="knockout">Knockout</option>
                </select>

                <h3 className={styles.h1}>Select Teams</h3>
                <div className={styles.gridContainer}>
                    {teams.map(t => (
                        <label key={t._id} className={styles.check}>
                            <input
                                type="checkbox"
                                value={t._id}
                                checked={formData.selectedTeams.includes(t._id)}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        selectedTeams: prev.selectedTeams.includes(val)
                                            ? prev.selectedTeams.filter(id => id !== val)
                                            : [...prev.selectedTeams, val],
                                    }));
                                }}
                            />
                            <div className={styles.teamItem}>
                                <img src={t.profilePicture || DEFAULT_AVATAR} alt={t.header || t.name} className={styles.teamAvatar} />
                                <span>{t.header || t.name}</span>
                            </div>
                        </label>
                    ))}
                </div>

                <button className={styles.button} type="submit">Create Tournament</button>
            </form>

            <h2 className={styles.h2}>All Tournaments</h2>
            {tournaments.length === 0 && <p>No tournaments yet.</p>}

            {tournaments.map(t => (
                <div key={t._id} className={styles.tournamentWrapper}>
                    <div
                        className={styles.tournamentCard}
                        onClick={() => setSelectedTournament(selectedTournament?._id === t._id ? null : t)}
                    >
                        <div>
                            <span className={styles.tournamentName}>{t.name}</span>
                            <p className={styles.tournamentDates}>
                                Start: {new Date(t.startDate).toLocaleDateString()} | End: {new Date(t.endDate).toLocaleDateString()}
                            </p>
                        </div>
                        <Link href={`schedule/${t._id}`}>
                            <p className={styles.vd_l}>View Details</p>
                        </Link>
                    </div>

                    {selectedTournament?._id === t._id && (
                        <div className={styles.MatchCard}>
                            {/* Tournament Info */}
                            <div className={styles.MatchCard_F}>
                                <h3>{t.name}</h3>
                                <p>Type: {t.type}</p>
                                <p>Status: {t.status || "Upcoming"}</p>
                            </div>

                            {/* Teams */}
                            <div className={styles.MatchCard_S}>
                                <h4>Teams</h4>
                                <ul className={styles.MatchCard_S_UL}>
                                    {t.teams?.map(id => {
                                        const team = teamMap[id];
                                        return (
                                            <li key={id} className={styles.teamItem}>
                                                <img src={team?.profilePicture || DEFAULT_AVATAR} alt={team?.header || team?.name} className={styles.teamAvatar} />
                                                <span>{team?.header || team?.name}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* Matches */}
                            <div className={styles.MatchCard_T}>
                                <h4>Matches</h4>
                                <div className={styles.MatchCard_D}>
                                    {matches.length === 0 ? (
                                        <p>No matches yet</p>
                                    ) : (
                                        matches.slice(0, 3).map(m => {
                                            const teamA = teamMap[m.teamA];
                                            const teamB = teamMap[m.teamB];
                                            const showScore = m.status && !["upcoming", "pending"].includes(m.status.toLowerCase());

                                            return (
                                                <div key={m._id} className={styles.matchCard}>
                                                    <div className={styles.parent_Up}>
                                                        <div className={styles.Up}>
                                                            <img
                                                                src={teamA?.profilePicture || DEFAULT_AVATAR}
                                                                alt={teamA?.header || teamA?.name}
                                                                className={styles.teamAvatar}
                                                            />
                                                            {/* <span>{teamA?.header || teamA?.name}</span> */}
                                                        </div>
                                                        <span className={styles.vsText}>vs</span>
                                                        <div className={styles.Up}>
                                                            <img
                                                                src={teamB?.profilePicture || DEFAULT_AVATAR}
                                                                alt={teamB?.header || teamB?.name}
                                                                className={styles.teamAvatar}
                                                            />
                                                            {/* <span>{teamB?.header || teamB?.name}</span> */}
                                                        </div>
                                                    </div>

                                                    {/* Conditionally show score */}
                                                    {showScore && (
                                                        <p className={styles.score}>
                                                            Score: {m.scoreA ?? 0} - {m.scoreB ?? 0}
                                                        </p>
                                                    )}

                                                    <p className={styles.status}>
                                                        Status: {m.status || "Pending"}
                                                    </p>
                                                </div>
                                            );
                                        })
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
