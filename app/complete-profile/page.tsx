"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { useToast } from "../../components/ToastProvider";

const C = { usa: "#1a3a6b", canada: "#e63946", mexico: "#006847", border: "#e8edf5", text: "#0d1b3e", muted: "#64748b", hint: "#94a3b8", faint: "#cbd5e1", bg: "#f8f9fc" };

const COUNTRIES = [
  { country: "Israel", code: "+972", flag: "🇮🇱" },
  { country: "United States", code: "+1", flag: "🇺🇸" },
  { country: "Canada", code: "+1", flag: "🇨🇦" },
  { country: "Mexico", code: "+52", flag: "🇲🇽" },
  { country: "Argentina", code: "+54", flag: "🇦🇷" },
  { country: "Brazil", code: "+55", flag: "🇧🇷" },
  { country: "England", code: "+44", flag: "🇬🇧" },
  { country: "France", code: "+33", flag: "🇫🇷" },
  { country: "Germany", code: "+49", flag: "🇩🇪" },
  { country: "Spain", code: "+34", flag: "🇪🇸" },
  { country: "Italy", code: "+39", flag: "🇮🇹" },
  { country: "Portugal", code: "+351", flag: "🇵🇹" },
  { country: "Netherlands", code: "+31", flag: "🇳🇱" },
  { country: "Morocco", code: "+212", flag: "🇲🇦" },
  { country: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { country: "UAE", code: "+971", flag: "🇦🇪" },
  { country: "Turkey", code: "+90", flag: "🇹🇷" },
  { country: "Japan", code: "+81", flag: "🇯🇵" },
  { country: "South Korea", code: "+82", flag: "🇰🇷" },
  { country: "Australia", code: "+61", flag: "🇦🇺" },
];

const STEPS = ["name", "country", "phone"] as const;

export default function CompleteProfilePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const toast = useToast();
  const isHe = lang === "he";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("Israel");
  const [countryCode, setCountryCode] = useState("+972");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => { loadProfile(); }, []);

  const selectedCountry = useMemo(() => COUNTRIES.find(c => c.country === country) || COUNTRIES[0], [country]);
  const fullPhone = `${countryCode}${phoneLocal.replace(/\D/g, "")}`;

  async function loadProfile() {
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) { router.push("/auth"); return; }
    setEmail(user.email || "");
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) {
      setFullName(data.full_name || ""); setCountry(data.country || "Israel");
      const saved = data.phone || "";
      const prefix = COUNTRIES.map(c => c.code).sort((a, b) => b.length - a.length).find(p => saved.startsWith(p)) || "+972";
      setCountryCode(prefix);
      setPhoneLocal(saved.startsWith(prefix) ? saved.slice(prefix.length).replace(/\D/g, "") : saved.replace(/\D/g, ""));
    }
    setLoading(false);
  }

  function handleCountryChange(val: string) {
    setCountry(val);
    const match = COUNTRIES.find(c => c.country === val);
    if (match) setCountryCode(match.code);
  }

  function nextStep() {
    if (step === 0 && !fullName.trim()) { toast.error(isHe ? "יש להזין שם מלא" : "Enter your full name"); return; }
    if (step === 1 && !country.trim()) { toast.error(isHe ? "יש לבחור מדינה" : "Choose a country"); return; }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  async function save() {
    if (!phoneLocal.trim()) { toast.error(isHe ? "יש להזין מספר טלפון" : "Enter your phone number"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); router.push("/auth"); return; }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, email: user.email, full_name: fullName.trim(),
      phone: fullPhone, country: country.trim(), updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { toast.error(isHe ? "שמירה נכשלה" : "Failed to save"); return; }
    toast.success(isHe ? "הפרופיל נשמר ✓" : "Profile saved ✓");
    router.push("/");
  }

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.88)", border: `1px solid ${C.border}`, borderRadius: "10px", backdropFilter: "blur(12px)", boxShadow: "0 2px 16px rgba(13,27,62,0.06)", padding: "24px" };
  const lbl: React.CSSProperties = { display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.hint, marginBottom: "7px" };
  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.9)", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "13px", color: C.text, outline: "none", boxSizing: "border-box" as const, fontFamily: "var(--font-dm),var(--font-he),sans-serif" };

  if (loading) return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <style>{`@keyframes sk{from{background-position:-400px 0}to{background-position:400px 0}}.sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:600px 100%;animation:sk 1.4s infinite linear;border-radius:8px;}`}</style>
        {[120, 80, 60].map((h, i) => <div key={i} className="sk" style={{ height: `${h}px`, marginBottom: "12px" }} />)}
      </div>
    </main>
  );

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: C.hint, textDecoration: "none", marginBottom: "20px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ← {isHe ? "חזרה" : "Back"}
        </Link>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.usa, marginBottom: "10px" }}>STAY IN THE GAME</div>
          <h1 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(24px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-0.5px", color: C.text, lineHeight: 1.1 }}>
            {isHe ? "השלמת פרופיל" : "Complete your profile"}
          </h1>
          <p style={{ fontSize: "13px", color: C.muted, marginTop: "8px", lineHeight: 1.8, fontWeight: 300 }}>
            {isHe ? "נדרש כדי לפרסם מודעות וליצור קשר עם מוכרים." : "Required to post listings and contact sellers."}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            {[isHe ? "שם" : "Name", isHe ? "מדינה" : "Country", isHe ? "טלפון" : "Phone"].map((l, i) => (
              <span key={l} style={{ fontSize: "10px", fontWeight: 700, color: i <= step ? C.usa : C.faint, letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</span>
            ))}
          </div>
          <div style={{ height: "4px", background: C.border, borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.usa}, ${C.mexico})`, borderRadius: "4px", transition: "width 400ms ease" }} />
          </div>
        </div>

        <div style={card}>
          {/* Email (always shown, disabled) */}
          <div style={{ marginBottom: "18px" }}>
            <label style={lbl}>{isHe ? "אימייל" : "Email"}</label>
            <input type="email" value={email} disabled style={{ ...inp, opacity: 0.5, cursor: "not-allowed" }} />
          </div>

          {/* Step 0: Name */}
          {step >= 0 && (
            <div style={{ marginBottom: "18px" }}>
              <label style={lbl}>{isHe ? "שם מלא" : "Full name"}</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder={isHe ? "השם שלך" : "Your full name"} style={inp}
                onFocus={e => (e.target.style.borderColor = C.usa)} onBlur={e => (e.target.style.borderColor = C.border)} />
              <p style={{ fontSize: "11px", color: C.faint, marginTop: "5px" }}>{isHe ? "יוצג למשתמשים אחרים" : "Shown to other users"}</p>
            </div>
          )}

          {/* Step 1: Country */}
          {step >= 1 && (
            <div style={{ marginBottom: "18px" }}>
              <label style={lbl}>{isHe ? "מדינה" : "Country"}</label>
              <input list="countries" value={country} onChange={e => handleCountryChange(e.target.value)}
                placeholder={isHe ? "בחר מדינה" : "Choose your country"} style={inp}
                onFocus={e => (e.target.style.borderColor = C.usa)} onBlur={e => (e.target.style.borderColor = C.border)} />
              <datalist id="countries">
                {COUNTRIES.map(c => <option key={c.country + c.code} value={c.country} />)}
              </datalist>
              {selectedCountry && (
                <p style={{ fontSize: "11px", color: C.muted, marginTop: "5px" }}>{selectedCountry.flag} {selectedCountry.country}</p>
              )}
            </div>
          )}

          {/* Step 2: Phone */}
          {step >= 2 && (
            <div style={{ marginBottom: "18px" }}>
              <label style={lbl}>{isHe ? "טלפון / וואטסאפ" : "Phone / WhatsApp"}</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} dir="ltr"
                  style={{ ...inp, width: "auto", minWidth: "100px", flexShrink: 0, padding: "11px 8px", cursor: "pointer" }}>
                  {COUNTRIES.map(c => <option key={c.country + c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <input type="tel" inputMode="numeric" value={phoneLocal} onChange={e => setPhoneLocal(e.target.value.replace(/\D/g, ""))}
                  placeholder="501234567" dir="ltr" style={inp}
                  onFocus={e => (e.target.style.borderColor = C.usa)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <p style={{ fontSize: "11px", color: C.faint, marginTop: "5px" }}>
                {isHe ? "יישמר כ: " : "Saved as: "}<span style={{ color: C.text, fontWeight: 500 }}>{fullPhone}</span>
              </p>
            </div>
          )}

          {/* CTA */}
          {step < STEPS.length - 1 ? (
            <button onClick={nextStep} style={{ width: "100%", padding: "12px", background: C.usa, color: "#fff", fontSize: "13px", fontWeight: 700, border: "none", borderRadius: "6px", cursor: "pointer", letterSpacing: "0.02em" }}>
              {isHe ? "המשך →" : "Continue →"}
            </button>
          ) : (
            <button onClick={save} disabled={saving} style={{ width: "100%", padding: "12px", background: C.usa, color: "#fff", fontSize: "13px", fontWeight: 700, border: "none", borderRadius: "6px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? (isHe ? "שומר..." : "Saving...") : (isHe ? "שמור פרופיל ✓" : "Save profile ✓")}
            </button>
          )}

          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ width: "100%", marginTop: "8px", padding: "10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", fontWeight: 500, color: C.muted, cursor: "pointer" }}>
              {isHe ? "← חזרה" : "← Back"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
