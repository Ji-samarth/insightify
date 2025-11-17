import styles from "./page.module.css";

function Feature({ title, desc }) {
  return (
    <div className={styles.feature}>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>About Insightify</h1>
          <p className={styles.subtitle}>
            A simple, private place to track your spending and understand your money.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What it does</h2>
        <p className={styles.lead}>
          Insightify helps you record expenses, see a quick snapshot of where your money goes,
          and spot small habits that add up. It’s built for people who want clarity, not
          complexity.
        </p>

        <div className={styles.features}>
          <Feature
            title="Track expenses quickly"
            desc="Add a purchase in a couple of taps — amount, category, note. Get back to your day."
          />
          <Feature
            title="See your monthly picture"
            desc="A simple at-a-glance view of your monthly spend so you know if you're on track."
          />
          <Feature
            title="Your data, your control"
            desc="Only you can access your records. We don’t sell or share your personal data."
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why it exists</h2>
        <p className={styles.lead}>
          Most finance tools are bloated or made for accountants. This is intentionally lean —
          built so you can form better habits rather than drown in graphs.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Privacy, in plain words</h2>
        <p className={styles.lead}>
          Your data stays private. We store the minimum necessary so the app works. There are no advertising trackers and we don’t sell your data. If you want your data removed, contact us and we’ll delete it.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Get started</h2>
        <p className={styles.lead}>
          New here? Create an account and add your first expense. Existing user? Log in and check your dashboard.
        </p>
        <div className={styles.ctaRow}>
          <a className={styles.primaryBtn} href="/signup">Create account</a>
          <a className={styles.secondaryBtn} href="/login">Sign in</a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Made with care</strong>
          <div className={styles.footerNote}>Built by samarth</div>
        </div>

        <div className={styles.social}>
          <a href="#" aria-label="GitHub">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
