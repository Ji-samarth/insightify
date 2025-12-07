"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "../../utils/auth";
import styles from "./navbar.module.css";

export default function NavBar() {
  const router = useRouter();

  // Start with null so server and client initial render match.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    Promise.resolve().then(() => {
      const currentToken = getToken();
      setToken(currentToken);
      
      // Fetch user data if token exists
      if (currentToken) {
        fetchUserData(currentToken);
      }
    });

    const onStorage = (evt) => {
      if (evt.key === "insightify_token") {
        const currentToken = getToken();
        setToken(currentToken);
        if (currentToken) {
          fetchUserData(currentToken);
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchUserData = async (authToken) => {
    try {
      const res = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        const text = await res.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            setUser(data?.user || data);
          } catch (parseErr) {
            console.error("Failed to parse user data:", parseErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  const doLogout = () => {
    clearToken();
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          <div className={styles.logo}>I</div>
          <span className={styles.brandText}>Insightify</span>
        </Link>

        <ul className={styles.links}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/about">About</Link></li>
        </ul>
      </div>

      <div className={styles.right}>
        {!token ? (
          <>
            <Link href="/login" className={styles.btn}>Login</Link>
            <Link href="/signup" className={`${styles.btn} ${styles.secondary}`}>Signup</Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={styles.profileLink}>
              <div className={styles.profileAvatar}>{getUserInitials()}</div>
            </Link>
            <button onClick={doLogout} className={styles.btn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
