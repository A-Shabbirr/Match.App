'use client'
import React, { useState } from "react";
import styles from "./signup.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

const page = () => {

    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [Name, setName] = useState('');
    const [header, setHeader] = useState('');
    const [phone, setphone] = useState('');
    const [loading, setloading] = useState(false);

    const router = useRouter()

    const handleChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'name':
                setName(value);
                break;
            case 'header':
                setHeader(value);
                break;
            case 'email':
                setemail(value);
                break;
            case 'password':
                setpassword(value);
                break;
            default:
                break;
        }
    };
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setphone(value);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setloading(true)
        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: Name,
                    header,
                    phone,
                    email,
                    password,
                    role: "user"
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            alert("You've registered successfully!");
            router.push('/login');

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setloading(false);
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
                        placeholder="Name will not be displayed anywhere"
                        value={Name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Header
                    <input
                        type="text"
                        name="header"
                        placeholder="Displayed Everywhere i.e. Capt Jack"
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
                        placeholder="Enter numbers only"
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
                    <p className={styles.p}>
                        Already have an account
                    </p>
                    <Link href='login'>
                        <p className={styles.pl}>
                            Login
                        </p>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default page;
