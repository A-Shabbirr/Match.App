'use client';
import React, { useState } from "react";
import styles from "./signup.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

const page = () => {
    const [name, setName] = useState('');
    const [header, setHeader] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const API = process.env.NEXT_PUBLIC_API_URL; // dynamic backend URL

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'name': setName(value); break;
            case 'header': setHeader(value); break;
            case 'email': setEmail(value); break;
            case 'password': setPassword(value); break;
            default: break;
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) setPhone(value);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API}/auth/register`, { // dynamic URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    header,
                    phone,
                    email,
                    password,
                    role: "user"
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Something went wrong");

            alert("Registration successful! Please login.");
            router.push('/login');

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.signup_container}>
            <form className={styles.signup_form} onSubmit={handleSubmit}>
                <h2>Create Account</h2>

                <label>
                    Name
                    <input
                        type="text"
                        name="name"
                        placeholder="Full name (not displayed publicly)"
                        value={name}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Header
                    <input
                        type="text"
                        name="header"
                        placeholder="Display name e.g. Capt Jack"
                        value={header}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Contact Number
                    <input
                        type="text"
                        name="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="Numbers only"
                        required
                    />
                </label>

                <label>
                    Email
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        required
                    />
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>

                <div className={styles.login}>
                    <p>Already have an account?</p>
                    <Link href="/login">
                        <p className={styles.pl}>Login</p>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default page;