'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import authRole from '../auth/authRole';

export default function AdminLayout({ children }) {
    const [allowed, setAllowed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
            if (!user) {
                router.push('/login');
                return;
            }

            const role = await authRole();
            console.log('role of user:', role);
            // use currentUser inside authRole
            if (role !== 'admin') {
                router.push('/dashboard'); // non-admins cannot access
                return;
            }

            setAllowed(true); // admin allowed
        });

        return () => unsubscribe();
    }, [router]);

    if (!allowed) return <p style={{ textAlign: 'center' }}>Checking access...</p>;

    return <>{children}</>;
}
