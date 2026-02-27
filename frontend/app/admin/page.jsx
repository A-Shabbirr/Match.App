'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import styles from './admin.module.css';

import UserCard from '../components/Usercard';
import TournamentCard from '../components/TournamentCard';

const API = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
    const [users, setUsers] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [token, setToken] = useState(null);

    // Get token safely (client-side only)
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    // Fetch users
    useEffect(() => {
        if (!token) return;

        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch users");

                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
                setUsers([]);
            }
        };

        fetchUsers();
    }, [token]);

    // Fetch tournaments
    useEffect(() => {
        if (!token) return;

        const fetchTournaments = async () => {
            try {
                const res = await fetch(`${API}/tournaments`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch tournaments");

                const data = await res.json();
                setTournaments(data);
            } catch (error) {
                console.error("Error fetching tournaments:", error);
                setTournaments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [token]);

    // Filter lists
    const filteredUsers = users.filter(u =>
        u.header?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredTournaments = tournaments.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p>Loading admin dashboard...</p>;

    return (
        <div className={styles.page}>
            <Navbar />

            {/* HERO */}
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Admin Dashboard</h1>
                <p className={styles.heroSubtitle}>Manage users & tournaments</p>
            </div>

            {/* SEARCH */}
            <div className={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Search users or tournaments..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* USERS */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Users</h2>
                </div>

                <div className={styles.grid}>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <UserCard key={user._id} user={user} />
                        ))
                    ) : (
                        <p>No users found.</p>
                    )}
                </div>
            </section>

            {/* TOURNAMENTS */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Tournaments</h2>
                    <Link href="/admin/tournaments" className={styles.viewAllButton}>
                        Create Tournament
                    </Link>
                </div>

                <div className={styles.grid}>
                    {filteredTournaments.length > 0 ? (
                        filteredTournaments.map(t => (
                            <TournamentCard
                                key={t._id}
                                tournament={t}
                                linkdetail="admin/schedule"
                            />
                        ))
                    ) : (
                        <p>No tournaments found.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Page;