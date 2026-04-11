"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";

export default function LoginPage() {
  const { lang } = useLanguage();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (!error) setSent(true);
  }

  return (
    <main className="app-shell">
      <section className="page-container-narrow">
        <h1 className="page-title mb-4">
          {lang === "he" ? "התחברות" : "Login"}
        </h1>

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mb-4"
        />

        <button onClick={handleLogin} className="primary-btn w-full">
          {lang === "he" ? "שלח קוד" : "Send code"}
        </button>

        {sent && (
          <p className="mt-4 text-[var(--text-secondary)]">
            {lang === "he"
              ? "נשלח קוד למייל שלך"
              : "Check your email for the code"}
          </p>
        )}
      </section>
    </main>
  );
}