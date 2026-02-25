'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import styles from './dashboard.module.css';

import TournamentCard from '../components/TournamentCard';

const page = () => {
    const [tournaments, setTournaments] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch tournaments from backend
    useEffect(() => {
        const fetchTournaments = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("http://localhost:5000/api/tournaments", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
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
    }, []);

    // Filter tournaments by search
    const filteredTournaments = tournaments.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.page}>
            <Navbar />

            {/* HERO */}
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Hello and Welcome to Match'App</h1>
                <p className={styles.heroSubtitle}>Create your own customized tournaments</p>
            </div>

            {/* SEARCH */}
            <div className={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Search tournaments..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* TOURNAMENTS */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Tournaments</h2>
                    <Link href="/dashboard/tournaments" className={styles.viewAllButton}>
                        Create Tournament
                    </Link>
                </div>

                {loading ? (
                    <p>Loading tournaments...</p>
                ) : (
                    <div className={styles.grid}>
                        {filteredTournaments.length > 0 ? (
                            filteredTournaments.map(t => (
                                <TournamentCard key={t._id} tournament={t} linkdetail='dashboard/schedule' />
                            ))
                        ) : (
                            <p>No tournaments found.</p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default page;