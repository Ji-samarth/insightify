"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "../../utils/auth";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Check if API URL is configured
      if (!apiBase || apiBase === "http://localhost:4000") {
        throw new Error("API server not configured. Please contact support.");
      }

      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).catch((fetchErr) => {
        // Handle network errors (CORS, connection refused, etc.)
        console.error("Fetch error:", fetchErr);
        throw new Error(`Unable to connect to server at ${apiBase}. Please check your connection and ensure the backend is deployed.`);
      });

      const status = res.status;
      const text = await res.text(); // read raw body ONCE

      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error("Non-JSON response from /auth/login:", { status, text });
          throw new Error("Invalid response from server. Please try again.");
        }
      }

      if (!res.ok) {
        const msg = (data && data.error) || `Login failed (status ${status})`;
        throw new Error(msg);
      }

      if (!data || !data.token) {
        console.error("Login: missing token in response:", data);
        throw new Error("Login failed: invalid server response");
      }

      saveToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login error");
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Login</h2>

      <form className={styles.form} onSubmit={submit}>
        <input name="email" className={styles.input} placeholder="Email" value={form.email} onChange={update} />
        <input name="password" type="password" className={styles.input} placeholder="Password" value={form.password} onChange={update} />
        <button className={styles.button} type="submit">Login</button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.meta}>
        No account? <a className={styles.link} href="/signup">Signup</a>
      </div>
    </div>
  );
}
