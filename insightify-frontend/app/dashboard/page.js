"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "../../utils/auth";
import styles from "./page.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState({ total: 0, monthly: 0, categories: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true); // <-- add loading state

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

        if (res.status === 401) {
          clearToken();
          if (mounted) router.replace("/login");
          return;
        }

        if (!res.ok) {
          if (mounted) router.replace("/login");
          return;
        }

        const text = await res.text();
        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (parseErr) {
          console.error("Failed to parse response:", parseErr);
          if (mounted) router.replace("/login");
          return;
        }

        if (mounted) setUser(data?.user || data);

        // attempt to fetch expenses; graceful fallback if endpoint missing
        try {
          const expRes = await fetch(`${apiBase}/expenses`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (expRes.ok) {
            const expText = await expRes.text();
            let expData = null;
            try {
              expData = expText ? JSON.parse(expText) : [];
            } catch (parseErr) {
              console.error("Failed to parse expenses:", parseErr);
              expData = [];
            }
            if (!mounted) return;

            const total = expData.reduce((s, e) => s + Number(e.amount || 0), 0);
            const now = new Date();
            const monthly = expData
              .filter((e) => {
                const d = new Date(e.incurredAt || e.incurred_at || e.createdAt || e.created_at || Date.now());
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              })
              .reduce((s, e) => s + Number(e.amount || 0), 0);
            const categories = new Set(expData.map((e) => e.category || "Uncategorized")).size;

            if (mounted) {
              setMetrics({ total, monthly, categories });
              setRecent(expData.slice(0, 8));
            }
          } else {
            if (mounted) {
              setMetrics({ total: 0, monthly: 0, categories: 0 });
              setRecent([]);
            }
          }
        } catch (err) {
          if (mounted) {
            setMetrics({ total: 0, monthly: 0, categories: 0 });
            setRecent([]);
          }
        }
      } catch (err) {
        console.error(err);
        if (mounted) router.replace("/login");
      } finally {
        if (mounted) setLoading(false); // <-- safe now
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brandRow}>
            <div className={styles.logo}>I</div>
            <div>
              <div className={styles.brandTitle}>Insightify</div>
              <div className={styles.brandSub}>Personal finance — calm + simple</div>
            </div>
          </div>
        </header>

        <main className={styles.container}>
          <div style={{ padding: 24, textAlign: "center", color: "#475569" }}>Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <div className={styles.logo}>I</div>
          <div>
            <div className={styles.brandTitle}>Insightify</div>
            <div className={styles.brandSub}>Personal finance — calm + simple</div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.primaryBtn} onClick={() => router.push("/dashboard")}>Add expense</button>
          <button className={styles.ghostBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className={styles.container}>
        <section className={styles.grid}>
          <div className={styles.left}>
            <div className={styles.metricsRow}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>This month</div>
                <div className={styles.metricValue}>₹ {Number(metrics.monthly || 0).toLocaleString()}</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>All time</div>
                <div className={styles.metricValue}>₹ {Number(metrics.total || 0).toLocaleString()}</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Categories</div>
                <div className={styles.metricValue}>{metrics.categories}</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Recent transactions</h3>
                <a className={styles.smallLink} href="/expenses">View all</a>
              </div>

              <div className={styles.list}>
                {recent.length === 0 ? (
                  <div className={styles.empty}>No transactions yet — add one to get started.</div>
                ) : (
                  recent.map((t) => (
                    <div key={t.id || JSON.stringify(t)} className={styles.row}>
                      <div className={styles.rowLeft}>
                        <div className={styles.txTitle}>{t.title || t.name || "Expense"}</div>
                        <div className={styles.txMeta}>{t.category || "Uncategorized"} • {new Date(t.incurredAt || t.incurred_at || t.createdAt || t.created_at || Date.now()).toLocaleDateString()}</div>
                      </div>
                      <div className={styles.rowRight}>
                        <div className={styles.txAmount}>₹ {Number(t.amount || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className={styles.right}>
            <div className={styles.cardSticky}>
              <h4 className={styles.cardTitle}>Quick actions</h4>
              <div className={styles.actionList}>
                <button className={styles.actionItem} onClick={() => router.push("/dashboard")}>+ Add expense</button>
                <button className={styles.actionItem} onClick={() => alert("Export not implemented yet")}>Export CSV</button>
                <button className={styles.actionItem} onClick={() => router.push("/about")}>About</button>
              </div>
            </div>

            <div className={styles.card}>
              <h4 className={styles.cardTitle}>Profile</h4>
              <div className={styles.profile}>
                <div className={styles.avatar}>{(user?.name || "U").split(" ").map(n => n[0]).slice(0,2).join("")}</div>
                <div>
                  <div className={styles.profileName}>{user?.name || "—"}</div>
                  <div className={styles.profileEmail}>{user?.email || "—"}</div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h4 className={styles.cardTitle}>Tip</h4>
              <p className={styles.tip}>Log small spends daily — habits compound. Try adding entries for a week.</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
