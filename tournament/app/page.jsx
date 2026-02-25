'use client';
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "./components/Spinner";

export default function Home() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");

      if (!token || !userId || !role) {
        // No token or role → redirect to signup
        setLoading(false);
        return;
      }

      try {
        // Optional: fetch full user details from backend
        const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to fetch user details");

        const data = await res.json();
        setUserDetails(data);

        // Redirect based on role
        if (role === "admin") router.replace("/admin");
        else if (role === "user") router.replace("/dashboard");
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetails(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className={styles.page}>
      <Navbar />
      {loading ? (
        <Spinner />
      ) : (
        !userDetails && <Link href='/signup'>Sign Up to your account</Link>
      )}
    </div>
  );
}