"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "../../utils/auth";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      saveToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login error");
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Login</h2>

      <form className={styles.form} onSubmit={submit}>
        <input name="email" className={styles.input} placeholder="Email" onChange={update} />
        <input name="password" type="password" className={styles.input} placeholder="Password" onChange={update} />
        <button className={styles.button} type="submit">Login</button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.meta}>
        No account? <a className={styles.link} href="/signup">Signup</a>
      </div>
    </div>
  );
}
