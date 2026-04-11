"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";
import { useToast } from "../../components/ToastProvider";

const C = { usa: "#1a3a6b", canada: "#e63946", mexico: "#006847", border: "#e8edf5", text: "#0d1b3e", muted: "#64748b", hint: "#94a3b8", faint: "#cbd5e1" };

type AuthState = "loading" | "no-auth" | "no-profile" | "ready";

export default function ContactPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const toast = useToast();
  const isHe = lang === "he";

  const listingId = params.get("listingId");
  const matchId   = params.get("matchId");

  const [authState, setAuthState] = useState<AuthState>("loading");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setAuthState("no-auth"); return; }
    const { data } = await supabase.from("profiles").select("full_name,phone,country").eq("id", session.user.id).maybeSingle();
    if (!data?.full_name || !data?.phone || !data?.country) { setAuthState("no-profile"); return; }
    setAuthState("ready");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { toast.error(isHe ? "יש לכתוב סיבה" : "Please write a reason"); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); router.push("/auth"); return; }
    const { error } = await supabase.from("reports").insert({ listing_id: listingId, match_id: matchId, reporter_user_id: user.id, reason: message.trim(), status: "open" });
    setLoading(false);
    if (error) { toast.error(isHe ? "שליחה נכשלה" : "Failed to submit"); return; }
    setSent(true);
  }

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.88)", border: `1px solid ${C.border}`, borderRadius: "10px", backdropFilter: "blur(12px)", boxShadow: "0 2px 12px rgba(13,27,62,0.05)" };
  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.9)", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "13px", color: C.text, outline: "none", boxSizing: "border-box" as const, fontFamily: "var(--font-dm),var(--font-he),sans-serif" };

  // ── Guard: Loading ──
  if (authState === "loading") return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <style>{`@keyframes sk{from{background-position:-400px 0}to{background-position:400px 0}}.sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:600px 100%;animation:sk 1.4s infinite linear;border-radius:8px;}`}</style>
        <div className="sk" style={{ height: "200px" }} />
      </div>
    </main>
  );

  // ── Guard: Not logged in ──
  if (authState === "no-auth") return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />
      <div style={{ maxWidth: "440px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ ...card, padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔐</div>
          <h2 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "20px", fontWeight: 800, color: C.text, marginBottom: "8px" }}>
            {isHe ? "נדרשת התחברות" : "Login required"}
          </h2>
          <p style={{ fontSize: "13px", color: C.muted, marginBottom: "24px", lineHeight: 1.7 }}>
            {isHe ? "כדי לדווח על מודעה, עליך להיות מחובר עם פרופיל מלא." : "To report a listing, you need to be logged in with a complete profile."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href={`/auth?redirect=/contact?listingId=${listingId}&matchId=${matchId}`}
              style={{ display: "block", padding: "12px", background: C.usa, color: "#fff", borderRadius: "6px", fontSize: "13px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
              {isHe ? "התחבר / הרשמה" : "Login / Sign up"}
            </Link>
            {matchId && (
              <Link href={`/matches/${matchId}`}
                style={{ display: "block", padding: "12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", fontWeight: 500, color: C.muted, textDecoration: "none", textAlign: "center" }}>
                {isHe ? "← חזרה למשחק" : "← Back to match"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );

  // ── Guard: Profile incomplete ──
  if (authState === "no-profile") return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />
      <div style={{ maxWidth: "440px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ ...card, padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>👤</div>
          <h2 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "20px", fontWeight: 800, color: C.text, marginBottom: "8px" }}>
            {isHe ? "פרופיל לא מלא" : "Profile incomplete"}
          </h2>
          <p style={{ fontSize: "13px", color: C.muted, marginBottom: "24px", lineHeight: 1.7 }}>
            {isHe ? "כדי לדווח על מודעות, יש להשלים את פרטי הפרופיל שלך." : "To report listings, you need to complete your profile first."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/complete-profile"
              style={{ display: "block", padding: "12px", background: C.usa, color: "#fff", borderRadius: "6px", fontSize: "13px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
              {isHe ? "השלם פרופיל" : "Complete profile"}
            </Link>
            {matchId && (
              <Link href={`/matches/${matchId}`}
                style={{ display: "block", padding: "12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", fontWeight: 500, color: C.muted, textDecoration: "none", textAlign: "center" }}>
                {isHe ? "← חזרה למשחק" : "← Back to match"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );

  // ── Success state ──
  if (sent) return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />
      <div style={{ maxWidth: "440px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ ...card, padding: "40px 32px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(0,104,71,0.1)", border: `2px solid rgba(0,104,71,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>✓</div>
          <h2 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "22px", fontWeight: 800, color: C.text, marginBottom: "10px" }}>
            {isHe ? "הדיווח נשלח" : "Report submitted"}
          </h2>
          <p style={{ fontSize: "13px", color: C.muted, marginBottom: "28px", lineHeight: 1.8 }}>
            {isHe ? "נבדוק את המודעה בהקדם. תודה שעזרת לשמור על הקהילה." : "We'll review the listing soon. Thanks for helping keep the community safe."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {matchId && (
              <Link href={`/matches/${matchId}`} style={{ display: "block", padding: "12px", background: C.usa, color: "#fff", borderRadius: "6px", fontSize: "13px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                {isHe ? "← חזרה למשחק" : "← Back to match"}
              </Link>
            )}
            <Link href="/" style={{ display: "block", padding: "12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", fontWeight: 500, color: C.muted, textDecoration: "none", textAlign: "center" }}>
              {isHe ? "דף הבית" : "Home"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );

  // ── Main form ──
  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {matchId ? (
          <Link href={`/matches/${matchId}`} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: C.hint, textDecoration: "none", marginBottom: "20px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            ← {isHe ? "חזרה למשחק" : "Back to match"}
          </Link>
        ) : (
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: C.hint, textDecoration: "none", marginBottom: "20px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            ← {isHe ? "דף הבית" : "Home"}
          </Link>
        )}

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.canada, marginBottom: "10px" }}>REPORT</div>
          <h1 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 800, letterSpacing: "-0.5px", color: C.text, lineHeight: 1.1 }}>
            {isHe ? "דיווח על מודעה" : "Report a listing"}
          </h1>
          <p style={{ fontSize: "13px", color: C.muted, marginTop: "8px", lineHeight: 1.8, fontWeight: 300 }}>
            {isHe ? "לוקחים דיווחים ברצינות. תאר את הבעיה שמצאת." : "We take reports seriously. Describe the issue you found."}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ ...card, padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.hint, marginBottom: "7px" }}>
              {isHe ? "סיבת הדיווח" : "Reason for report"}
            </label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
              placeholder={isHe ? "למה המודעה לא אמינה או בעייתית?" : "Why is this listing suspicious or problematic?"}
              style={{ ...inp, resize: "vertical", lineHeight: 1.7 }}
              onFocus={e => (e.target.style.borderColor = C.usa)} onBlur={e => (e.target.style.borderColor = C.border)} />
            <p style={{ fontSize: "10px", color: C.faint, marginTop: "5px" }}>{message.length}/500</p>
          </div>

          <button type="submit" disabled={loading}
            style={{ padding: "12px", background: C.canada, color: "#fff", fontSize: "13px", fontWeight: 700, border: "none", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? (isHe ? "שולח..." : "Sending...") : (isHe ? "שלח דיווח" : "Submit report")}
          </button>

          <button type="button" onClick={() => router.back()}
            style={{ padding: "11px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", fontWeight: 500, color: C.muted, cursor: "pointer" }}>
            {isHe ? "ביטול" : "Cancel"}
          </button>
        </form>
      </div>
    </main>
  );
}
