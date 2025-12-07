"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "../../utils/auth";
import styles from "./page.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${apiBase}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).catch((fetchErr) => {
        // Handle network errors (CORS, connection refused, etc.)
        throw new Error("Unable to connect to server. Please check your connection.");
      });

      const status = res.status;
      const text = await res.text(); // read raw body ONCE

      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error("Non-JSON response from /auth/signup:", { status, text });
          throw new Error("Invalid response from server. Please try again.");
        }
      }

      if (!res.ok) {
        const msg = (data && data.error) || `Signup failed (status ${status})`;
        throw new Error(msg);
      }

      if (!data || !data.token) {
        console.error("Signup: missing token in response:", data);
        throw new Error("Signup failed: invalid server response");
      }

      saveToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Signup error");
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Signup</h2>

      <form className={styles.form} onSubmit={submit}>
        <input name="name" className={styles.input} placeholder="Name" value={form.name} onChange={update} />
        <input name="email" className={styles.input} placeholder="Email" value={form.email} onChange={update} />
        <input name="password" type="password" className={styles.input} placeholder="Password" value={form.password} onChange={update} />
        <button className={styles.button} type="submit">Signup</button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.meta}>
        Already have an account? <a className={styles.link} href="/login">Login</a>
      </div>
    </div>
  );
}
