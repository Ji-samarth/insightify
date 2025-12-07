// components/TransactionForm.js
"use client";
import { useState } from "react";
import { getToken } from "../utils/auth";
import styles from "./TransactionForm.module.css";
import { X } from "lucide-react";

export default function TransactionForm({ type, onClose, onSuccess, initialData = null }) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        amount: initialData?.amount || "",
        category: initialData?.category || "",
        date: initialData ? (initialData.incurredAt || initialData.receivedAt)?.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = getToken(); // Use utility to get correct token key
        const endpoint = type === "expense" ? `${apiBase}/expenses` : `${apiBase}/incomes`;
        const method = initialData ? "PUT" : "POST";
        const url = initialData ? `${endpoint}/${initialData.id}` : endpoint;

        const payload = {
            title: formData.title,
            amount: Number(formData.amount),
            category: formData.category,
            [type === "expense" ? "incurredAt" : "receivedAt"]: new Date(formData.date),
        };

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save transaction");

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>{initialData ? "Edit" : "Add"} {type === "expense" ? "Expense" : "Income"}</h3>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.group}>
                        <label>Title</label>
                        <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Groceries"
                        />
                    </div>

                    <div className={styles.group}>
                        <label>Amount</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                        />
                    </div>

                    <div className={styles.group}>
                        <label>Category</label>
                        <input
                            list="categories"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Select or type..."
                        />
                        <datalist id="categories">
                            {type === "expense" ? (
                                <>
                                    <option value="Food" />
                                    <option value="Transport" />
                                    <option value="Utilities" />
                                    <option value="Entertainment" />
                                </>
                            ) : (
                                <>
                                    <option value="Salary" />
                                    <option value="Freelance" />
                                    <option value="Investment" />
                                </>
                            )}
                        </datalist>
                    </div>

                    <div className={styles.group}>
                        <label>Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" disabled={loading} className={styles.submitBtn}>
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
