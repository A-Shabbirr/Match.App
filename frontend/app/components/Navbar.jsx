'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/app/components/styles/navbar.module.css';
import { useRouter } from 'next/navigation';

const Navbar = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            const role = localStorage.getItem("role");

            if (!token || !userId || !role) {
                setUserDetails(null);
                setLoading(false);
                return;
            }

            try {
                // Optional: fetch full user info from backend
                const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error("Failed to fetch user info");

                const data = await res.json();
                setUserDetails(data);
                console.log(data);

            } catch (error) {
                console.error("Error fetching user info:", error);
                setUserDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
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
                        {/* Profile Picture can be added later */}
                        <span className={styles.username}>{userDetails.header}</span>
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