// components/Filters.js
"use client";
import styles from "./Filters.module.css";

export default function Filters({ filters, onChange, type }) {
    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value || undefined });
    };

    return (
        <div className={styles.filters}>
            <div className={styles.group}>
                <input
                    type="text"
                    placeholder="Category..."
                    value={filters.category || ""}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.group}>
                <input
                    type="date"
                    placeholder="Start Date"
                    value={filters.startDate || ""}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className={styles.input}
                />
                <span className={styles.to}>to</span>
                <input
                    type="date"
                    placeholder="End Date"
                    value={filters.endDate || ""}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.group}>
                <input
                    type="number"
                    placeholder="Min Amount"
                    value={filters.minAmount || ""}
                    onChange={(e) => handleChange("minAmount", e.target.value)}
                    className={styles.input}
                />
                <input
                    type="number"
                    placeholder="Max Amount"
                    value={filters.maxAmount || ""}
                    onChange={(e) => handleChange("maxAmount", e.target.value)}
                    className={styles.input}
                />
            </div>

            {(filters.category || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount) && (
                <button
                    className={styles.clearBtn}
                    onClick={() => onChange({})}
                >
                    Clear
                </button>
            )}
        </div>
    );
}
