"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";
import { useToast } from "../../components/ToastProvider";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 300;
type Mode = "login" | "signup";

const C = { usa: "#1a3a6b", canada: "#e63946", mexico: "#006847", border: "#e8edf5", text: "#0d1b3e", muted: "#64748b", hint: "#94a3b8", faint: "#cbd5e1", bg: "#f8f9fc" };

const BENEFITS = [
  { icon: "🎟️", en: "Free to join", he: "הרשמה בחינם" },
  { icon: "📋", en: "Up to 10 listings", he: "עד 10 מודעות" },
  { icon: "⭐", en: "2 gold listings", he: "2 מוזהבות" },
  { icon: "💬", en: "Direct WhatsApp contact", he: "קשר ישיר בוואטסאפ" },
];

export default function AuthPage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const toast = useToast();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!secondsLeft) return;
    const t = setInterval(() => setSecondsLeft(p => p <= 1 ? (clearInterval(t), 0) : p - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  async function sendCode() {
    if (!email.trim()) { toast.error(isHe ? "יש להזין אימייל" : "Enter your email"); return; }
    setLoading(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc("check_auth_email_exists", { p_email: email.trim().toLowerCase() });
      if (rpcErr) throw rpcErr;
      const exists = !!data;
      if (mode === "login" && !exists) { toast.warning(isHe ? "לא נמצא חשבון — אפשר להירשם בחינם" : "No account found — sign up for free"); setLoading(false); return; }
      if (mode === "signup" && exists) { toast.warning(isHe ? "חשבון קיים — אפשר להתחבר" : "Account exists — log in instead"); setLoading(false); return; }
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: mode === "signup" } });
      if (error) { toast.error(isHe ? "שליחה נכשלה" : "Failed to send"); setLoading(false); return; }
      setDigits(Array(OTP_LENGTH).fill(""));
      setStep("otp"); setSecondsLeft(RESEND_COOLDOWN);
      toast.success(isHe ? "קוד נשלח ✉️" : "Code sent ✉️");
      setTimeout(() => refs.current[0]?.focus(), 80);
    } catch { toast.error(isHe ? "שגיאה, נסה שוב" : "Error, try again"); }
    setLoading(false);
  }

  async function verifyCode() {
    const code = digits.join("");
    if (code.length !== OTP_LENGTH) { toast.error(isHe ? "הזן 6 ספרות" : "Enter 6 digits"); return; }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: "email" });
    setLoading(false);
    if (error) { toast.error(isHe ? "קוד שגוי או פג תוקף" : "Invalid or expired code"); return; }
    toast.success(isHe ? "התחברת בהצלחה 🎉" : "Logged in 🎉");
    window.location.href = mode === "signup" ? "/complete-profile" : "/";
  }

  function handleDigit(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(-1);
    const n = [...digits]; n[i] = c; setDigits(n);
    if (c && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
    if (e.key === "Enter") step === "email" ? sendCode() : verifyCode();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const n = Array(OTP_LENGTH).fill("");
    p.split("").forEach((c, i) => { n[i] = c; });
    setDigits(n);
    refs.current[Math.min(p.length, OTP_LENGTH - 1)]?.focus();
  }

  function resetToEmail(m?: Mode) {
    setStep("email"); setDigits(Array(OTP_LENGTH).fill("")); setSecondsLeft(0);
    if (m) setMode(m);
  }

  const cardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.88)", border: `1px solid ${C.border}`, borderRadius: "10px", backdropFilter: "blur(12px)", boxShadow: "0 2px 16px rgba(13,27,62,0.06)" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.9)", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "13px", color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "var(--font-dm),var(--font-he),sans-serif", transition: "border-color 150ms" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.hint, marginBottom: "7px" };

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />

      <div style={{ maxWidth: "460px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: C.hint, textDecoration: "none", marginBottom: "20px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ← {isHe ? "דף הבית" : "Home"}
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.usa, marginBottom: "10px" }}>STAY IN THE GAME</div>
          <h1 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(26px,4vw,36px)", fontWeight: 800, letterSpacing: "-0.5px", color: C.text, marginBottom: "8px", lineHeight: 1.1 }}>
            {isHe ? "ברוך הבא ל־Stayin" : "Welcome to Stayin"}
          </h1>
          <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.8, fontWeight: 300 }}>
            {isHe ? "הפלטפורמה הפשוטה ביותר לקנייה ומכירה של כרטיסי מונדיאל 2026." : "The simplest platform to buy and sell World Cup 2026 tickets."}
          </p>
        </div>

        {/* Benefits */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
          {BENEFITS.map(({ icon, en, he }) => (
            <div key={en} style={{ ...cardStyle, padding: "12px 14px", display: "flex", alignItems: "center", gap: "9px" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: C.text }}>{isHe ? he : en}</span>
            </div>
          ))}
        </div>

        {/* Auth card */}
        <div style={{ ...cardStyle, padding: "24px" }}>
          {/* Mode toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden", marginBottom: "22px" }}>
            {(["login", "signup"] as Mode[]).map((m) => (
              <button key={m} onClick={() => resetToEmail(m)}
                style={{ padding: "11px", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", transition: "all 150ms", background: mode === m ? C.usa : "rgba(255,255,255,0.9)", color: mode === m ? "#fff" : C.hint, letterSpacing: "0.02em" }}>
                {m === "login" ? (isHe ? "התחברות" : "Login") : (isHe ? "הרשמה בחינם" : "Sign up free")}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Email */}
            <div>
              <label style={labelStyle}>{isHe ? "כתובת אימייל" : "Email address"}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={step === "otp"}
                placeholder="you@example.com" dir="ltr" onKeyDown={e => handleKeyDown(-1, e as any)}
                style={{ ...inputStyle, opacity: step === "otp" ? 0.6 : 1 }}
                onFocus={e => (e.target.style.borderColor = C.usa)} onBlur={e => (e.target.style.borderColor = C.border)} />
            </div>

            {step === "email" && (
              <button onClick={sendCode} disabled={loading}
                style={{ padding: "12px", background: C.usa, color: "#fff", fontSize: "13px", fontWeight: 700, border: "none", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, letterSpacing: "0.02em" }}>
                {loading ? (isHe ? "שולח..." : "Sending...") : mode === "login" ? (isHe ? "שלח קוד התחברות" : "Send login code") : (isHe ? "הירשם בחינם" : "Sign up free")}
              </button>
            )}

            {step === "otp" && (
              <>
                <div>
                  <label style={labelStyle}>{isHe ? "קוד אימות" : "Verification code"}</label>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }} dir="ltr">
                    {digits.map((d, i) => (
                      <input key={i} ref={el => { refs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleDigit(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste}
                        style={{ flex: 1, maxWidth: "48px", height: "52px", textAlign: "center", fontSize: "20px", fontWeight: 800, background: "rgba(255,255,255,0.9)", border: `2px solid ${d ? C.usa : C.border}`, borderRadius: "6px", color: C.text, outline: "none", transition: "border-color 150ms" }} />
                    ))}
                  </div>
                  <p style={{ marginTop: "8px", fontSize: "11px", color: C.hint }}>
                    {isHe ? "קוד נשלח אל " : "Code sent to "}<span style={{ color: C.text, fontWeight: 600 }}>{email}</span>
                  </p>
                </div>

                <button onClick={verifyCode} disabled={loading}
                  style={{ padding: "12px", background: C.usa, color: "#fff", fontSize: "13px", fontWeight: 700, border: "none", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                  {loading ? (isHe ? "מאמת..." : "Verifying...") : (isHe ? "אמת קוד והתחבר" : "Verify & sign in")}
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {secondsLeft > 0
                    ? <span style={{ fontSize: "11px", color: C.hint }}>{isHe ? `שלח שוב בעוד ${fmt(secondsLeft)}` : `Resend in ${fmt(secondsLeft)}`}</span>
                    : <button onClick={sendCode} disabled={loading} style={{ background: "none", border: "none", fontSize: "11px", color: C.usa, cursor: "pointer", fontWeight: 600, padding: 0 }}>{isHe ? "שלח שוב" : "Resend code"}</button>
                  }
                  <button onClick={() => resetToEmail()} style={{ background: "none", border: "none", fontSize: "11px", color: C.muted, cursor: "pointer", fontWeight: 500, padding: 0 }}>
                    {isHe ? "שנה אימייל" : "Change email"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", fontSize: "11px", color: C.faint, marginTop: "16px", lineHeight: 1.6 }}>
          {isHe ? "בהתחברות אתה מסכים לתנאי השימוש" : "By continuing you agree to our terms of use"}
        </p>
      </div>
    </main>
  );
}
