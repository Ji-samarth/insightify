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

  useEffect(() => {
    Promise.resolve().then(() => {
      setToken(getToken());
    });

    const onStorage = (evt) => {
      if (evt.key === "insightify_token") {
        setToken(getToken());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  const doLogout = () => {
    clearToken();
    setToken(null);
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
            <Link href="/login" className={styles.btn}>Login</Link>
            <Link href="/signup" className={`${styles.btn} ${styles.secondary}`}>Signup</Link>
          </>
        ) : (
          <>
            <Link href="/" className={styles.btnAlt}>Profile</Link>
            <button onClick={doLogout} className={styles.btn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
