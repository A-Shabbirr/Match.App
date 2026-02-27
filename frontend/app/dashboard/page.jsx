'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import styles from './dashboard.module.css';
import TournamentCard from '../components/TournamentCard';
import UserCard from '../components/Usercard';

const API = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
    const [tournaments, setTournaments] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loadingTournaments, setLoadingTournaments] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [token, setToken] = useState(null);

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
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch tournaments");
                const data = await res.json();

                // Format dates for display
                const formattedData = data.map(t => ({
                    ...t,
                    startDate: new Date(t.startDate).toLocaleDateString(),
                    endDate: new Date(t.endDate).toLocaleDateString()
                }));

                setTournaments(formattedData);
            } catch (error) {
                console.error(error);
                setTournaments([]);
            } finally {
                setLoadingTournaments(false);
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
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch users");
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error(error);
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [token]);

    // Filter tournaments and users
    const filteredTournaments = tournaments.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredUsers = users.filter(u =>
        (u.header || u.name)?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.page}>
            <Navbar />

            {/* Hero Section */}
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Hello and Welcome to Match'App</h1>
                <p className={styles.heroSubtitle}>Create your own customized tournaments</p>
            </div>

            {/* Search Box */}
            <div className={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Search tournaments or users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* Tournaments Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Tournaments</h2>
                    <Link href="/dashboard/tournaments" className={styles.viewAllButton}>
                        Create Tournament
                    </Link>
                </div>

                {loadingTournaments ? (
                    <p>Loading tournaments...</p>
                ) : (
                    <div className={styles.grid}>
                        {filteredTournaments.length > 0 ? (
                            filteredTournaments.map(t => (
                                <TournamentCard key={t._id} tournament={t} linkdetail="dashboard/schedule" />
                            ))
                        ) : (
                            <p>No tournaments found.</p>
                        )}
                    </div>
                )}
            </section>

            {/* Users Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Users</h2>
                </div>

                {loadingUsers ? (
                    <p>Loading users...</p>
                ) : (
                    <div className={styles.grid}>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => <UserCard key={user._id} user={user} />)
                        ) : (
                            <p>No users found.</p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Page;