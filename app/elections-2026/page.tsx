"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ToastProvider";
import {
  PARTIES, TOTAL_SEATS, THRESHOLD_SEATS, POLLS_CLOSE,
  normalizeSeats, roundToKnesset, hemicycle, type Party,
} from "./parties";

const C = {
  band: "#0d1b3e", bandInk: "#f2f5fb", bandMuted: "#a9b5cc", gold: "#f1c14b",
  text: "#0d1b3e", muted: "#64748b", border: "#e3e8f0", bg: "#f5f7fb",
  accent: "#e63946", ok: "#15803d", warn: "#b4500f",
};
const OTP_LENGTH = 6;
const SEATS = hemicycle();
type Summary = { count: number; avg: Record<string, number> };

function Letters({ p, size }: { p: Party; size: "sm" | "lg" }) {
  return (
    <div className={`el-letters el-letters-${size}`} style={{ ["--pc" as string]: p.color }}>
      {p.letters}
    </div>
  );
}

export default function Elections2026Page() {
  const toast = useToast();
  const [summary, setSummary] = useState<Summary>({ count: 0, avg: {} });
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [seats, setSeats] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closed, setClosed] = useState(() => Date.now() >= POLLS_CLOSE.getTime());

  // login (email code)
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [accepted, setAccepted] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadSummary = useCallback(async () => {
    const { data, error } = await supabase.rpc("election_summary_2026");
    if (!error && data) {
      const d = data as Summary;
      setSummary({ count: Number(d.count) || 0, avg: d.avg || {} });
    }
  }, []);

  useEffect(() => {
    loadSummary();
    const t = setInterval(loadSummary, 20000);
    const c = setInterval(() => setClosed(Date.now() >= POLLS_CLOSE.getTime()), 30000);
    return () => { clearInterval(t); clearInterval(c); };
  }, [loadSummary]);

  useEffect(() => {
    let cancelled = false;
    const apply = (id: string | null, em: string | null) => {
      if (cancelled) return;
      setUserId(id); setUserEmail(em); setAuthChecked(true);
    };
    supabase.auth.getSession().then(({ data: { session } }) =>
      apply(session?.user?.id ?? null, session?.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      apply(session?.user?.id ?? null, session?.user?.email ?? null));
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  // load my saved forecast
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("election_predictions_2026")
        .select("display_name,seats")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) {
        setSeats((data.seats as Record<string, number>) || {});
        setName(data.display_name || "");
        setHasSaved(true);
      } else {
        const { data: prof } = await supabase
          .from("profiles").select("full_name").eq("id", userId).maybeSingle();
        if (prof?.full_name) setName((n) => n || prof.full_name);
      }
    })();
  }, [userId]);

  const total = useMemo(() => PARTIES.reduce((s, p) => s + (seats[p.id] || 0), 0), [seats]);
  const problem =
    total !== TOTAL_SEATS
      ? total < TOTAL_SEATS ? `חסרים ${TOTAL_SEATS - total} מנדטים` : `יש ${total - TOTAL_SEATS} מנדטים מיותרים`
      : !name.trim() ? "הזן שם להצגה" : "";
  const canEdit = !!userId && !closed;

  function setSeat(id: string, v: number) {
    setSeats((s) => ({ ...s, [id]: normalizeSeats(v) }));
  }

  async function save() {
    if (problem || !userId) return;
    setSaving(true);
    const payload: Record<string, number> = {};
    PARTIES.forEach((p) => (payload[p.id] = seats[p.id] || 0));
    const { error } = await supabase.from("election_predictions_2026").upsert({
      user_id: userId,
      display_name: name.trim().slice(0, 40),
      seats: payload,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      console.error("election save failed", error);
      const missingTable = error.code === "PGRST205" || error.code === "42P01" || /does not exist|schema cache/i.test(error.message);
      toast.error(
        closed ? "הקלפיות נסגרו, אי אפשר לשמור יותר"
        : missingTable ? "הטבלה עוד לא קיימת ב-Supabase (צריך להריץ את קובץ ה-SQL)"
        : `השמירה נכשלה: ${error.message}`
      );
      return;
    }
    setHasSaved(true);
    toast.success(hasSaved ? "התחזית עודכנה" : "התחזית נשמרה");
    loadSummary();
  }

  async function sendCode() {
    if (!email.trim()) { toast.error("יש להזין אימייל"); return; }
    if (!accepted) { toast.error("יש לאשר את תנאי השימוש ומדיניות הפרטיות"); return; }
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setAuthBusy(false);
    if (error) { toast.error("שליחת הקוד נכשלה, נסה שוב"); return; }
    setDigits(Array(OTP_LENGTH).fill(""));
    setStep("otp");
    toast.success("קוד נשלח למייל");
    setTimeout(() => otpRefs.current[0]?.focus(), 80);
  }

  async function verifyCode(code = digits.join("")) {
    if (code.length !== OTP_LENGTH) { toast.error("הזן 6 ספרות"); return; }
    setAuthBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: "email" });
    setAuthBusy(false);
    if (error) { toast.error("קוד שגוי או שפג תוקפו"); return; }
    toast.success("התחברת, אפשר למלא את התחזית");
  }

  function onDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      const next = clean.slice(0, OTP_LENGTH).split("");
      const filled = [...next, ...Array(OTP_LENGTH - next.length).fill("")];
      setDigits(filled);
      if (next.length === OTP_LENGTH) verifyCode(next.join(""));
      else otpRefs.current[next.length]?.focus();
      return;
    }
    const d = [...digits]; d[i] = clean; setDigits(d);
    if (clean && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
    if (d.every(Boolean)) verifyCode(d.join(""));
  }

  // results
  const rounded = useMemo(() => roundToKnesset(summary.avg), [summary.avg]);
  const sorted = useMemo(
    () => [...PARTIES].sort((a, b) => (rounded[b.id] || 0) - (rounded[a.id] || 0) || (summary.avg[b.id] || 0) - (summary.avg[a.id] || 0)),
    [rounded, summary.avg]
  );
  const seatColors = useMemo(() => {
    const out: string[] = [];
    sorted.forEach((p) => { for (let k = 0; k < (rounded[p.id] || 0); k++) out.push(p.color); });
    return out;
  }, [sorted, rounded]);
  const maxAvg = Math.max(1, ...PARTIES.map((p) => summary.avg[p.id] || 0));
  const hasResults = summary.count > 0;

  return (
    <div className="el-root" dir="rtl">
      <style>{css}</style>

      <div className="el-band">
        <div className="el-inner el-hero">
          <div className="el-eyebrow">בחירות לכנסת ה-26 · 27 באוקטובר 2026</div>
          <h1>מה תהיה הכנסת הבאה?</h1>
          <p className="el-lede">
            כל משתתף מחלק 120 מנדטים לפי ההערכה שלו. כאן מוצגת הכנסת לפי ממוצע כל התחזיות.
            {closed ? " הקלפיות נסגרו, התחזיות נעולות." : " אפשר להגיש ולעדכן עד 22:00, סגירת הקלפיות."}
          </p>
          <div className="el-hemi-wrap">
            <svg className="el-hemi" viewBox="0 0 400 215" role="img" aria-label="מפת 120 המושבים לפי ממוצע התחזיות">
              {SEATS.map((pt, i) => (
                <circle key={i} cx={pt.x.toFixed(1)} cy={pt.y.toFixed(1)} r="6.4"
                  fill={seatColors[i] || "rgba(255,255,255,0.14)"} style={{ transition: "fill .5s" }} />
              ))}
            </svg>
            <div className="el-hemi-center">
              <b>{summary.count}</b>
              <span>משתתפים הגישו תחזית</span>
            </div>
          </div>
          {hasResults ? (
            <div className="el-legend">
              {sorted.filter((p) => rounded[p.id] > 0).map((p) => (
                <span key={p.id} className="el-chip">
                  <i style={{ background: p.color }}>{p.letters}</i>
                  <span>{p.name}</span>
                  <b>{rounded[p.id]}</b>
                </span>
              ))}
            </div>
          ) : (
            <div className="el-empty">עדיין אין תחזיות. כשהתחזית הראשונה תישמר, המושבים יתמלאו בצבעי המפלגות.</div>
          )}
        </div>
      </div>

      <div className="el-inner el-main">
        {hasResults && (
          <section className="el-sec">
            <h2>הממוצע לפי מפלגה</h2>
            <p className="el-sub">המספר הגדול הוא המנדטים אחרי עיגול (סך הכול 120). מתחתיו הממוצע המדויק.</p>
            <div className="el-res">
              {sorted.map((p) => (
                <div key={p.id} className="el-rrow">
                  <Letters p={p} size="sm" />
                  <div className="el-mid">
                    <div className="el-nm">{p.name}</div>
                    <div className="el-track">
                      <div className="el-fill" style={{ width: `${((summary.avg[p.id] || 0) / maxAvg) * 100}%`, background: p.color }} />
                    </div>
                  </div>
                  <div className="el-val">
                    <b>{rounded[p.id] || 0}</b>
                    <small>{(summary.avg[p.id] || 0).toFixed(1)}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="el-sec">
          <h2>הפתקים שלי</h2>

          {!authChecked ? (
            <div className="el-card el-sub">בודק התחברות…</div>
          ) : !userId ? (
            <div className="el-card el-auth">
              <div>
                <b>התחברות עם קוד למייל</b>
                <p className="el-sub">נשלח לך קוד בן 6 ספרות. כל כתובת מייל יכולה להגיש תחזית אחת.</p>
              </div>
              {step === "email" ? (
                <>
                  <label htmlFor="el-email" className="el-label">אימייל</label>
                  <input id="el-email" type="email" dir="ltr" autoComplete="email" className="el-input"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendCode()} placeholder="name@example.com" />
                  <label className="el-check">
                    <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                    <span>
                      אני מאשר/ת את <Link href="/terms-of-use">תנאי השימוש</Link> ואת{" "}
                      <Link href="/privacy-policy">מדיניות הפרטיות</Link>
                    </span>
                  </label>
                  <button className="el-btn" onClick={sendCode} disabled={authBusy}>
                    {authBusy ? "שולח…" : "שלח לי קוד"}
                  </button>
                </>
              ) : (
                <>
                  <p className="el-sub">הקוד נשלח אל <b dir="ltr">{email}</b></p>
                  <div className="el-otp" dir="ltr">
                    {digits.map((d, i) => (
                      <input key={i} id={`el-otp-${i}`} ref={(el) => { otpRefs.current[i] = el; }}
                        inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"}
                        aria-label={`ספרה ${i + 1}`} value={d}
                        onChange={(e) => onDigit(i, e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) otpRefs.current[i - 1]?.focus(); }} />
                    ))}
                  </div>
                  <div className="el-row">
                    <button className="el-btn" onClick={() => verifyCode()} disabled={authBusy}>
                      {authBusy ? "בודק…" : "אישור"}
                    </button>
                    <button className="el-btn el-ghost" onClick={() => setStep("email")}>החלף מייל</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="el-card el-who">
              <div className="el-who-id">
                <span className="el-verified">✓ מחובר/ת</span>
                <span dir="ltr" className="el-sub">{userEmail}</span>
              </div>
              <div className="el-field">
                <label htmlFor="el-name" className="el-label">שם להצגה</label>
                <input id="el-name" className="el-input" maxLength={40} value={name}
                  onChange={(e) => setName(e.target.value)} disabled={closed} />
              </div>
            </div>
          )}

          <p className="el-sub">
            לחיצה על + ברשימה שעומדת על 0 מקפיצה אותה ישר ל-{THRESHOLD_SEATS} מנדטים, אחוז החסימה. לחיצה על − ב-{THRESHOLD_SEATS} מחזירה ל-0.
          </p>

          <div className="el-slips">
            {PARTIES.map((p) => {
              const v = seats[p.id] || 0;
              const addStep = v === 0 ? THRESHOLD_SEATS : 1;
              return (
                <div key={p.id} className={`el-slip${v > 0 ? " on" : ""}`} style={{ ["--pcs" as string]: p.color }}>
                  <Letters p={p} size="lg" />
                  <div className="el-slip-nm">{p.name}</div>
                  <div className="el-step">
                    <button type="button" aria-label={`הוסף ל${p.name}`}
                      disabled={!canEdit || total + addStep > TOTAL_SEATS}
                      onClick={() => setSeat(p.id, v + addStep)}>+</button>
                    <input id={`el-seat-${p.id}`} inputMode="numeric" aria-label={`מנדטים ל${p.name}`}
                      value={v} disabled={!canEdit}
                      onChange={(e) => setSeats((s) => ({ ...s, [p.id]: Number(e.target.value.replace(/\D/g, "")) || 0 }))}
                      onBlur={(e) => setSeat(p.id, Number(e.target.value) || 0)} />
                    <button type="button" aria-label={`הפחת ל${p.name}`}
                      disabled={!canEdit || v === 0}
                      onClick={() => setSeat(p.id, v <= THRESHOLD_SEATS ? 0 : v - 1)}>−</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="el-bar">
        <div className="el-inner el-bar-in">
          <div className="el-meter">
            <div className="el-meter-t">
              <b className={total === TOTAL_SEATS ? "good" : "bad"}>{total}</b>
              <span className="el-sub">מתוך 120 מנדטים</span>
              {userId && problem && !closed && <span className="el-problem">· {problem}</span>}
            </div>
            <div className="el-mtrack">
              {PARTIES.filter((p) => seats[p.id]).map((p) => (
                <span key={p.id} style={{ width: `${((seats[p.id] || 0) / TOTAL_SEATS) * 100}%`, background: p.color }} />
              ))}
            </div>
          </div>
          <button className="el-btn" onClick={save} disabled={!canEdit || !!problem || saving}>
            {closed ? "הקלפיות נסגרו" : saving ? "שומר…" : hasSaved ? "עדכן תחזית" : "שמור תחזית"}
          </button>
        </div>
      </div>
    </div>
  );
}

const css = `
.el-root{background:${C.bg};color:${C.text};font-family:var(--font-he),var(--font-dm),sans-serif}
.el-inner{max-width:880px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.el-band{background:${C.band};color:${C.bandInk}}
.el-hero{padding-block:32px 28px;display:grid;gap:16px}
.el-eyebrow{font-size:.78rem;letter-spacing:.08em;font-weight:800;color:${C.gold}}
.el-root h1{font-size:clamp(2rem,7vw,3.2rem);font-weight:800;margin:0;line-height:1.1;text-wrap:balance}
.el-root h2{font-size:1.5rem;font-weight:800;margin:0}
.el-lede{margin:0;color:${C.bandMuted};max-width:60ch;line-height:1.6}
.el-hemi-wrap{position:relative;display:grid;justify-items:center}
.el-hemi{width:100%;max-width:560px;height:auto;display:block}
.el-hemi-center{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);text-align:center;line-height:1}
.el-hemi-center b{display:block;font-size:clamp(2.4rem,9vw,3.4rem);font-weight:800;font-variant-numeric:tabular-nums}
.el-hemi-center span{font-size:.85rem;color:${C.bandMuted}}
.el-legend{display:flex;flex-wrap:wrap;gap:8px 10px;justify-content:center}
.el-chip{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:999px;padding:3px 10px 3px 4px;font-size:.88rem}
.el-chip i{font-style:normal;font-weight:800;min-width:1.7em;height:1.7em;padding:0 .3em;border-radius:999px;display:inline-grid;place-items:center;color:#fff;font-size:.8rem}
.el-chip b{font-variant-numeric:tabular-nums}
.el-empty{color:${C.bandMuted};text-align:center;padding:12px;border:1px dashed rgba(255,255,255,.25);border-radius:8px}
.el-main{padding-block:28px 40px;display:grid;gap:34px}
.el-sec{display:grid;gap:14px}
.el-sub{color:${C.muted};margin:0;font-size:.93rem}
.el-res{display:grid;gap:8px}
.el-rrow{display:grid;grid-template-columns:3.4rem minmax(0,1fr) 3.6rem;gap:12px;align-items:center;background:#fff;border:1px solid ${C.border};border-radius:8px;padding:8px 12px}
.el-mid{display:grid;gap:5px;min-width:0}
.el-nm{font-weight:700;overflow-wrap:anywhere}
.el-track{height:8px;background:${C.bg};border-radius:4px;overflow:hidden}
.el-fill{height:100%;border-radius:4px;transition:width .5s ease}
.el-val{text-align:left;font-variant-numeric:tabular-nums;line-height:1.1}
.el-val b{font-size:1.5rem;font-weight:800;display:block}
.el-val small{color:${C.muted}}
.el-letters{font-family:var(--font-ballot),"David",Georgia,serif;font-weight:900;color:#111;background:#fff;border:2px solid #111;border-radius:3px;display:grid;place-items:center;line-height:1;aspect-ratio:1.15;box-shadow:inset 0 -5px 0 var(--pc)}
.el-letters-sm{width:3.4rem;font-size:1.15rem}
.el-letters-lg{width:72%;font-size:clamp(1.6rem,6vw,2.2rem)}
.el-card{background:#fff;border:1px solid ${C.border};border-radius:10px;padding:16px}
.el-auth{display:grid;gap:10px;max-width:460px}
.el-label{font-weight:700;font-size:.88rem}
.el-input{font:inherit;color:${C.text};background:${C.bg};border:1px solid ${C.border};border-radius:8px;padding:10px 12px;width:100%;box-sizing:border-box}
.el-check{display:flex;gap:8px;align-items:flex-start;font-size:.9rem}
.el-check a{color:${C.accent}}
.el-otp{display:flex;gap:8px;justify-content:center}
.el-otp input{width:2.6rem;height:3rem;text-align:center;font:inherit;font-size:1.4rem;font-weight:800;border:1px solid ${C.border};border-radius:8px;background:${C.bg};color:${C.text}}
.el-row{display:flex;gap:10px;flex-wrap:wrap}
.el-who{display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap}
.el-who-id{display:grid;gap:2px}
.el-verified{color:${C.ok};font-weight:800;font-size:.9rem}
.el-field{display:grid;gap:4px;flex:1;min-width:12rem}
.el-slips{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.el-slip{background:#fff;border:1px solid ${C.border};border-radius:8px;padding:12px;display:grid;gap:10px;justify-items:center;text-align:center;transition:box-shadow .15s,border-color .15s}
.el-slip.on{border-color:var(--pcs);box-shadow:0 0 0 2px var(--pcs) inset}
.el-slip-nm{font-weight:700;font-size:.92rem;line-height:1.25;min-height:2.5em;display:grid;place-items:center;overflow-wrap:anywhere}
.el-step{display:flex;align-items:center;gap:6px}
.el-step button{width:36px;height:36px;border-radius:50%;border:1px solid ${C.border};background:${C.bg};color:${C.text};font:inherit;font-size:1.2rem;font-weight:800;cursor:pointer;line-height:1}
.el-step button:disabled{opacity:.35;cursor:not-allowed}
.el-step input{width:2.8rem;text-align:center;font:inherit;font-size:1.3rem;font-weight:800;font-variant-numeric:tabular-nums;color:${C.text};background:transparent;border:0;border-bottom:2px solid ${C.border};padding:2px 0}
.el-bar{position:sticky;bottom:0;z-index:20;background:#fff;border-top:1px solid ${C.border};padding-bottom:env(safe-area-inset-bottom,0px)}
.el-bar-in{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding-block:12px}
.el-meter{flex:1;min-width:10rem;display:grid;gap:4px}
.el-meter-t{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}
.el-meter-t b{font-size:1.7rem;font-weight:800;font-variant-numeric:tabular-nums}
.el-meter-t b.good{color:${C.ok}} .el-meter-t b.bad{color:${C.warn}}
.el-problem{color:${C.warn};font-size:.88rem}
.el-mtrack{height:8px;border-radius:4px;background:${C.bg};display:flex;overflow:hidden}
.el-mtrack span{height:100%}
.el-btn{font:inherit;font-weight:800;border:0;border-radius:8px;padding:12px 22px;background:${C.accent};color:#fff;cursor:pointer}
.el-btn:disabled{opacity:.4;cursor:not-allowed}
.el-ghost{background:transparent;color:${C.text};border:1px solid ${C.border}}
.el-root button:focus-visible,.el-root input:focus-visible{outline:3px solid ${C.accent};outline-offset:2px}
@media (max-width:520px){.el-slips{grid-template-columns:repeat(2,minmax(0,1fr))}.el-rrow{grid-template-columns:2.9rem minmax(0,1fr) 3.2rem}.el-letters-sm{width:2.9rem;font-size:1rem}}
@media (prefers-reduced-motion:reduce){.el-fill,.el-slip{transition:none}}
`;
