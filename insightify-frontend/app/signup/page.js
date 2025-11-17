"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "../../utils/auth";
import styles from "./page.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${apiBase}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      saveToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Signup error");
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Signup</h2>

      <form className={styles.form} onSubmit={submit}>
        <input name="name" className={styles.input} placeholder="Name" onChange={update} />
        <input name="email" className={styles.input} placeholder="Email" onChange={update} />
        <input name="password" type="password" className={styles.input} placeholder="Password" onChange={update} />
        <button className={styles.button} type="submit">Signup</button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.meta}>
        Already have an account? <a className={styles.link} href="/login">Login</a>
      </div>
    </div>
  );
}
