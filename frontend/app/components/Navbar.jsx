// Navbar.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles/navbar.module.css';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;
// Use the uploaded Cloudinary image as default avatar
const DEFAULT_AVATAR = "https://res.cloudinary.com/dyi3wxmy3/image/upload/v1773435973/T_logo_iwqy4i.png";

const Navbar = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [bio, setBio] = useState("");
    const [profileFile, setProfileFile] = useState(null);
    const router = useRouter();

    const fetchUser = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        console.log("Token:", token);
        console.log("UserId:", userId);
        if (!token || !userId) {
            setUserDetails(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to fetch user");

            const data = await res.json();
            setUserDetails(data);

        } catch (err) {
            console.error("Error fetching user:", err);
            setUserDetails(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
        const handleAuthChange = () => fetchUser();
        const handleStorage = (e) => fetchUser();

        window.addEventListener("authChanged", handleAuthChange);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("authChanged", handleAuthChange);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        setUserDetails(null);
        window.dispatchEvent(new Event("authChanged"));
        router.replace("/login");
    };

    const handleProfileUpdate = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        console.log("API:", API);
        console.log("userId:", userId);
        const formData = new FormData();
        formData.append("bio", bio);
        if (profileFile) formData.append("profilePicture", profileFile);

        try {
            const res = await fetch(`${API}/users/${userId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error("Profile update failed");

            console.log("PUT URL:", `${API}/users/${userId}`);
            const updated = await res.json();
            setUserDetails(updated);
            setShowProfileModal(false);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    if (loading) return null;

    return (
        <nav className={styles.navbar}>
            <div className={styles.logoContainer}>
                <Link href={userDetails ? '/dashboard' : '/'}>
                    <div className={styles.logoCircle}>
                        <Image src='/T_logo.png' width={50} height={50} alt='App Logo' />
                    </div>
                </Link>
            </div>

            <div className={styles.title}>The Match'App</div>

            <div className={styles.profileSection}>
                {userDetails ? (
                    <>
                        <div
                            className={styles.profileTrigger}
                            onClick={() => {
                                setBio(userDetails?.bio || "");
                                setShowProfileModal(true);
                            }}
                        >
                            <Image
                                src={userDetails?.profilePicture || DEFAULT_AVATAR}
                                alt="Profile"
                                width={35}
                                height={35}
                                className={styles.profilePic}
                            />
                            <span className={styles.username}>{userDetails.header || "User"}</span>
                        </div>
                        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link href='/login' className={styles.authLink}>Login</Link>
                        <span className={styles.separator}>|</span>
                        <Link href='/signup' className={styles.authLink}>Sign Up</Link>
                    </>
                )}
            </div>

            {showProfileModal && (
                <div className={styles.profilePopup}>
                    <div className={styles.profileCard}>
                        <div className={styles.profileHeader}>
                            <Image
                                src={userDetails?.profilePicture || DEFAULT_AVATAR}
                                width={80}
                                height={80}
                                alt="avatar"
                                className={styles.popupAvatar}
                            />
                            <h3>{userDetails?.header}</h3>
                            <p>{userDetails?.email}</p>
                        </div>

                        <div className={styles.profileEdit}>
                            <label>Profile Picture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfileFile(e.target.files[0])}
                            />
                            <label>Bio</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                            <div className={styles.popupButtons}>
                                <button onClick={handleProfileUpdate}>Save</button>
                                <button className={styles.cancelBtn} onClick={() => setShowProfileModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;