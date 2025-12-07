"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "../../utils/auth";
import styles from "./page.module.css";
import TransactionForm from "../../components/TransactionForm";
import TransactionList from "../../components/TransactionList";
import Charts from "../../components/Charts";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("expense"); // 'expense' or 'income'
  const [activeTab, setActiveTab] = useState("expenses"); // 'expenses' or 'incomes'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    fetchDashboardData(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const fetchDashboardData = async (token) => {
    try {
      // Fetch User
      const userRes = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userRes.ok) {
        if (userRes.status === 401) {
          clearToken();
          router.replace("/login");
        }
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // Fetch Analytics Summary
      const analyticsRes = await fetch(`${apiBase}/analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setMetrics(analyticsData);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  const openAddModal = (type) => {
    setFormType(type);
    setShowForm(true);
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <div className={styles.logo}>I</div>
          <div>
            <div className={styles.brandTitle}>Insightify</div>
            <div className={styles.brandSub}>Financial clarity</div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.primaryBtn} onClick={() => openAddModal("expense")}>- Expense</button>
          <button className={styles.secondaryBtn} onClick={() => openAddModal("income")}>+ Income</button>
          <button className={styles.ghostBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className={styles.container}>
        {/* Metrics Cards */}
        <section className={styles.metricsRow}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Total Balance</div>
            <div className={styles.metricValue}>₹ {Number(metrics?.summary?.balance || 0).toLocaleString()}</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Monthly Income</div>
            <div className={`${styles.metricValue} ${styles.positive}`}>+ ₹ {Number(metrics?.summary?.monthlyIncome || 0).toLocaleString()}</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Monthly Expense</div>
            <div className={`${styles.metricValue} ${styles.negative}`}>- ₹ {Number(metrics?.summary?.monthlyExpense || 0).toLocaleString()}</div>
          </div>
        </section>

        {/* Charts */}
        {/* <Charts monthlyData={metrics?.charts?.monthly} categoryData={metrics?.charts?.categories} /> */}

        {/* Transactions Tab & List */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'expenses' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'incomes' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('incomes')}
          >
            Incomes
          </button>
        </div>

        <TransactionList
          type={activeTab === 'expenses' ? 'expense' : 'income'}
          refreshTrigger={refreshTrigger}
        />

      </main>

      {showForm && (
        <TransactionForm
          type={formType}
          onClose={() => setShowForm(false)}
          onSuccess={() => setRefreshTrigger(p => p + 1)}
        />
      )}
    </div>
  );
}
