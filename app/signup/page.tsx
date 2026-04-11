"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";

export default function SignupPage() {
  const { lang } = useLanguage();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSignup() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (!error) setSent(true);
  }

  return (
    <main className="app-shell">
      <section className="page-container-narrow">
        <h1 className="page-title mb-4">
          {lang === "he" ? "הרשמה" : "Sign up"}
        </h1>

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mb-4"
        />

        <button onClick={handleSignup} className="primary-btn w-full">
          {lang === "he" ? "הרשם" : "Sign up"}
        </button>

        {sent && (
          <p className="mt-4 text-[var(--text-secondary)]">
            {lang === "he"
              ? "נשלח קוד למייל שלך"
              : "Check your email"}
          </p>
        )}
      </section>
    </main>
  );
}