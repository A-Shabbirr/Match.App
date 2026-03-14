'use client';

import Link from "next/link";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "./components/Spinner";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (token && userRole) {
      setIsAuthenticated(true);
      setRole(userRole);

      // auto redirect after 1.5s
      setTimeout(() => {
        router.replace(userRole === "admin" ? "/admin" : "/dashboard");
      }, 1500);
    }

    setLoading(false);
  }, [router]);

  if (loading) return <Spinner />;

  return (
    <div className={styles.page}>
      {!isAuthenticated ? (
        <div className={styles.splashContainer}>
          <img src="/T_logo.png" alt="App Logo" className={styles.logo} />
          <h1 className={styles.appName}>Match'App</h1>
          <Link href="/signup" className={styles.signupButton}>
            Sign Up to your account
          </Link>
        </div>
      ) : (
        <div className={styles.splashContainer}>
          <img src="/T_logo.png" alt="App Logo" className={styles.logo} />
          <h1 className={styles.appName}>Welcome back!</h1>
          <p>Redirecting to the app...</p>
        </div>
      )}
    </div>
  );
}
