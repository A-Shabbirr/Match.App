'use client'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';

const Layout = ({ children }) => {
    const Router = useRouter();
    const [Loading, setLoading] = useState(true);
    useEffect(() => {
        const Auth = getAuth();
        const unsubscribe = onAuthStateChanged(Auth, (user) => {
            if (!user) {
                Router.push('/login');
            }
            setLoading(false)
        });
        return () => unsubscribe();

    }, [Router]);
    if (Loading) return <Spinner />;
    return <>{children}</>
}

export default Layout;
