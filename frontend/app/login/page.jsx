'use client'
import React, { useState } from "react";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

const page = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setloading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setloading(true)
        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Login failed");

            localStorage.setItem("token", data.token);
            localStorage.setItem("id", data._id);
            localStorage.setItem("role", data.role);

            if (data.role === 'admin') {
                router.replace('/admin');
            } else if (data.role === 'user') {
                router.replace('/dashboard');
            } else {
                router.replace('/signup'); // fallback
            }
            console.log("login Successful", data);

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setloading(false);
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
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        name="password"
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
