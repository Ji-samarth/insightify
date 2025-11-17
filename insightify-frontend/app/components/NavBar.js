"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "../../utils/auth";
import styles from "./navbar.module.css";

export default function NavBar() {
  const router = useRouter();

  // Initialize from storage (lazy) — avoids calling setState in an effect synchronously.
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return getToken();
  });

  useEffect(() => {
    // Listen for storage events from other tabs/windows
    const onStorage = (evt) => {
      // Only respond to our token key changes
      if (evt.key === "insightify_token") {
        setToken(getToken());
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []); // run once on mount

  const doLogout = () => {
    clearToken();
    setToken(null); // immediately update navbar in same tab
    router.push("/login");
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
            <Link href="/login"><button className={styles.btn}>Login</button></Link>
            <Link href="/signup"><button className={`${styles.btn} ${styles.secondary}`}>Signup</button></Link>
          </>
        ) : (
          <>
            <Link href="/"><button className={styles.btnAlt}>Profile</button></Link>
            <button onClick={doLogout} className={styles.btn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
