'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/app/components/styles/navbar.module.css';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

const Navbar = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            if (typeof window === "undefined") return;
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) {
                setUserDetails(null);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to fetch user");
                const data = await res.json();
                setUserDetails(data);
            } catch (err) {
                console.error(err);
                setUserDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        // Sync user state across tabs
        const handleStorage = () => fetchUser();
        window.addEventListener("storage", handleStorage);

        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        setUserDetails(null);
        router.replace("/login");
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className={styles.Navbar}>
            <div className={styles.image_div}>
                <Link href={userDetails ? '/dashboard' : '/'}>
                    <Image
                        className={styles.image}
                        src='/T_logo.png'
                        width={50}
                        height={50}
                        alt='logo'
                    />
                </Link>
            </div>

            <p className={styles.head}>The Match'App</p>

            <div className={styles.profileSection}>
                {userDetails ? (
                    <>
                        <span className={styles.username}>
                            {userDetails.header || userDetails.name || "User"}
                        </span>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href='/login'>Login</Link> | <Link href='/signup'>Sign Up</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;