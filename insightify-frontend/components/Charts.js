// components/Charts.js
"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import styles from "./Charts.module.css";

const COLORS = ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#ef4444", "#a855f7"];

export default function Charts({ monthlyData, categoryData }) {
    // If no data, show empty state or return null
    if (!monthlyData?.length && !categoryData?.length) return null;

    return (
        <div className={styles.container}>
            <div className={styles.chartCard}>
                <h3 className={styles.title}>Monthly Trends</h3>
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `₹${val / 1000}k`} />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                formatter={(val) => `₹ ${val.toLocaleString()}`}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.chartCard}>
                <h3 className={styles.title}>Spending by Category</h3>
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val) => `₹ ${val.toLocaleString()}`} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
