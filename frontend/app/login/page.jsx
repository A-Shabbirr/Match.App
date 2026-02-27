'use client';
import React, { useState } from "react";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

const page = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Use dynamic API base URL from environment
            const API_BASE = process.env.NEXT_PUBLIC_API_URL;

            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Login failed");

            // Save token and role locally
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("id", data._id);

            // Redirect based on role
            if (data.role === 'admin') {
                router.replace('/admin');
            } else {
                router.replace('/dashboard');
            }

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.login_container}>
            <form className={styles.login_form} onSubmit={handleSubmit}>
                <h2>Login</h2>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default page;