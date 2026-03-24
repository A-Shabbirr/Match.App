'use client';

import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        // ✅ NO TOKEN / USER → GUEST MODE (NO CRASH)
        if (!token || !userId) {
            setUser(null);
            setLoading(false);
            return; // ❗ removed forced redirect
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // ✅ HANDLE INVALID TOKEN / USER NOT FOUND
            if (!res.ok) {
                console.warn("User not found or token invalid");

                // clear bad auth
                localStorage.removeItem("token");
                localStorage.removeItem("userId");

                setUser(null);
                setLoading(false);

                return; // ❗ no crash
            }

            const data = await res.json();
            setUser(data);

        } catch (err) {
            // ✅ NETWORK FAIL SAFE
            console.warn("Fetch user failed (network/server issue)");

            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, fetchUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};