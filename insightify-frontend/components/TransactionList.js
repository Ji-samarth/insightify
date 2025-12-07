// components/TransactionList.js
"use client";
import { useState, useEffect } from "react";
import styles from "./TransactionList.module.css";
import Filters from "./Filters";
import { getToken } from "../utils/auth";
import { Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import TransactionForm from "./TransactionForm";

export default function TransactionList({ type, refreshTrigger }) {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState({ sortBy: "incurredAt", sortOrder: "desc" }); // incurredAt or receivedAt
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const fetchTransactions = async () => {
        setLoading(true);
        const token = getToken();
        const endpoint = type === "expense" ? `${apiBase}/expenses` : `${apiBase}/incomes`;

        // Build query string
        const params = new URLSearchParams({
            page: pagination.page,
            limit: pagination.limit,
            ...filters,
            sortBy: sort.sortBy,
            sortOrder: sort.sortOrder
        });

        // Fix date field name for sorting based on type
        if (sort.sortBy === "date") {
            params.set("sortBy", type === "expense" ? "incurredAt" : "receivedAt");
        }

        try {
            const res = await fetch(`${endpoint}?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
                setPagination(prev => ({ ...prev, ...json.pagination }));
            }
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, pagination.page, filters, sort, refreshTrigger]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        const token = getToken();
        const endpoint = type === "expense" ? `${apiBase}/expenses` : `${apiBase}/incomes`;
        try {
            await fetch(`${endpoint}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTransactions();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleSort = (field) => {
        setSort(prev => ({
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc"
        }));
    };

    return (
        <div className={styles.container}>
            <Filters filters={filters} onChange={setFilters} type={type} />

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort("title")}>Title</th>
                            <th onClick={() => handleSort("category")}>Category</th>
                            <th onClick={() => handleSort("amount")}>Amount</th>
                            <th onClick={() => handleSort("date")}>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className={styles.center}>Loading...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan="5" className={styles.center}>No transactions found</td></tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.title}</td>
                                    <td>
                                        <span className={styles.badge}>{item.category || "Uncategorized"}</span>
                                    </td>
                                    <td className={styles.amount}>₹ {item.amount.toLocaleString()}</td>
                                    <td>{new Date(item.incurredAt || item.receivedAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button onClick={() => setEditingItem(item)} className={styles.iconBtn}><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className={`${styles.iconBtn} ${styles.danger}`}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.pagination}>
                <button
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    className={styles.pageBtn}
                >
                    <ChevronLeft size={16} /> Previous
                </button>
                <span className={styles.pageInfo}>Page {pagination.page} of {pagination.totalPages}</span>
                <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    className={styles.pageBtn}
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>

            {editingItem && (
                <TransactionForm
                    type={type}
                    initialData={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSuccess={() => {
                        setEditingItem(null);
                        fetchTransactions();
                    }}
                />
            )}
        </div>
    );
}
