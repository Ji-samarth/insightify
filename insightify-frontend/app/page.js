"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../utils/auth";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        setUser(data.user || data);

        // optional: try to fetch recent expenses; ignore errors
        try {
          const r = await fetch(`${apiBase}/expenses`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r.ok) {
            const arr = await r.json();
            if (mounted) setRecent(Array.isArray(arr) ? arr.slice(0, 6) : []);
          } else {
            // no endpoint — keep recent empty
            if (mounted) setRecent([]);
          }
        } catch {
          if (mounted) setRecent([]);
        }
      } catch (err) {
        console.error(err);
        router.replace("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.loader} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.kicker}>Welcome</div>
          <h1 className={styles.title}>
            {user?.name ? `${user.name.split(" ")[0]}` : "There"}
          </h1>
          <p className={styles.subtitle}>A calm place to track your daily spends.</p>
        </div>

        <div className={styles.chips}>
          <div className={styles.chip}>
            <div className={styles.chipLabel}>This month</div>
            <div className={styles.chipValue}>₹ {0}</div>
          </div>

          <div className={styles.chip}>
            <div className={styles.chipLabel}>Categories</div>
            <div className={styles.chipValue}>—</div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.recent}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent</h3>
            <a className={styles.link} href="/dashboard">See all</a>
          </div>

          {recent.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>No transactions yet — add one to begin.</p>
              <a className={styles.addBtn} href="/dashboard">Add an expense</a>
            </div>
          ) : (
            <ul className={styles.list}>
              {recent.map((t) => (
                <li key={t.id || JSON.stringify(t)} className={styles.row}>
                  <div>
                    <div className={styles.name}>{t.title || t.name || "Expense"}</div>
                    <div className={styles.meta}>{t.category || "Uncategorized"}</div>
                  </div>
                  <div className={styles.amount}>₹ {Number(t.amount || 0).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className={styles.side}>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Quick tip</h4>
            <p className={styles.cardText}>Log purchases as they happen — 10–20 seconds per entry keeps things effortless.</p>
          </div>

          <div className={styles.card}>
            <h4 className={styles.cardTitle}>About</h4>
            <p className={styles.cardText}>This app is focused on clarity — minimal UI, private data, and tiny habits that add up.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
