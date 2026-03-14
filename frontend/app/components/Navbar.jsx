'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles/navbar.module.css';
import { useRouter } from 'next/navigation';
import { UserContext } from '../context/UserContext';

const API = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_AVATAR = "https://res.cloudinary.com/dyi3wxmy3/image/upload/v1773435973/T_logo_iwqy4i.png";

const Navbar = () => {
    const router = useRouter();
    const { user, setUser, fetchUser } = useContext(UserContext);

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [bio, setBio] = useState("");
    const [profileFile, setProfileFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const modalRef = useRef(null);

    // Reset bio & file when modal closes
    const handleCloseModal = () => {
        setShowProfileModal(false);
        setIsEditing(false);
        setBio("");      
        setProfileFile(null); 
    };

    // Fetch user if not loaded
    useEffect(() => {
        if (!user) fetchUser();
    }, [user]);

    // Close modal on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleCloseModal();
            }
        };
        if (showProfileModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showProfileModal]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        setUser(null);
        window.dispatchEvent(new Event("authChanged"));
        router.replace("/login");
    };

    const handleProfileUpdate = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) return alert("User not authenticated");

        const formData = new FormData();
        formData.append("bio", bio);
        if (profileFile) formData.append("profilePicture", profileFile);

        try {
            const res = await fetch(`${API}/users/${userId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Profile update failed");

            setUser(data);       // Update global context
            handleCloseModal();
        } catch (err) {
            console.error("Error updating profile:", err);
            alert(err.message);
        }
    };

    return (
        <nav className={styles.navbar}>
            {/* Logo */}
            <div className={styles.logoContainer}>
                <Link href={user ? '/dashboard' : '/'}>
                    <div className={styles.logoCircle}>
                        <Image src='/T_logo.png' width={50} height={50} alt='App Logo' />
                    </div>
                </Link>
            </div>

            {/* Title */}
            <div className={styles.title}>The Match'App</div>

            {/* Profile Section */}
            <div className={styles.profileSection}>
                {user ? (
                    <div
                        className={styles.profileTrigger}
                        onClick={() => {
                            setBio(user?.bio || "");
                            setIsEditing(false);
                            setShowProfileModal(true);
                        }}
                    >
                        <Image
                            src={user?.profilePicture || DEFAULT_AVATAR}
                            alt="Profile"
                            width={35}
                            height={35}
                            className={styles.profilePic}
                        />
                        <span className={styles.username}>{user.header || "User"}</span>
                    </div>
                ) : (
                    <>
                        <Link href='/login' className={styles.authLink}>Login</Link>
                        <span className={styles.separator}>|</span>
                        <Link href='/signup' className={styles.authLink}>Sign Up</Link>
                    </>
                )}
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className={styles.modalOverlay}>
                    <div ref={modalRef} className={styles.profilePopup}>
                        {/* Avatar */}
                        <Image
                            src={user?.profilePicture || DEFAULT_AVATAR}
                            width={80}
                            height={80}
                            alt="avatar"
                            className={styles.popupAvatar}
                        />

                        {/* Header & Email */}
                        <div className={styles.profileHeader}>
                            <h3>{user?.header}</h3>
                            <p>{user?.email}</p>
                        </div>

                        {/* Bio */}
                        {!isEditing && (
                            <div className={styles.profileBio}>
                                {user?.bio || "No bio yet"}
                            </div>
                        )}

                        {/* Edit + Logout buttons */}
                        {!isEditing && (
                            <div className={styles.profileActions}>
                                <button className={styles.editBtn} onClick={() => setIsEditing(true)}>Edit</button>
                                <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                            </div>
                        )}

                        {/* Edit form */}
                        {isEditing && (
                            <div className={styles.profileEdit}>
                                <label>Profile Picture</label>
                                {/* File input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProfileFile(e.target.files[0])}
                                />
                                {/* Show selected file name with cancel */}
                                {profileFile && (
                                    <div className={styles.fileChip}>
                                        <span>{profileFile.name}</span>
                                        <button onClick={() => setProfileFile(null)}>✖</button>
                                    </div>
                                )}

                                <label>Bio</label>
                                <textarea  onChange={(e) => setBio(e.target.value)} rows={3} />
                                <div className={styles.popupButtons}>
                                    <button onClick={handleProfileUpdate}>Save</button>
                                    <button className={styles.cancelBtn} onClick={handleCloseModal}>Close</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
