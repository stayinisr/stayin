import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime    = "edge";
export const size       = { width: 1200, height: 630 };
export const contentType = "image/png";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function formatDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${String(dt.getFullYear()).slice(2)}`;
}

function flagEmoji(team: string | null): string {
  if (!team) return "🏳️";
  const map: Record<string,string> = {
    "Brazil":"🇧🇷","Spain":"🇪🇸","Argentina":"🇦🇷","France":"🇫🇷",
    "Germany":"🇩🇪","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Portugal":"🇵🇹","Netherlands":"🇳🇱",
    "USA":"🇺🇸","Mexico":"🇲🇽","Canada":"🇨🇦","Morocco":"🇲🇦",
    "Japan":"🇯🇵","South Korea":"🇰🇷","Australia":"🇦🇺","Croatia":"🇭🇷",
    "Belgium":"🇧🇪","Uruguay":"🇺🇾","Colombia":"🇨🇴","Senegal":"🇸🇳",
    "Ghana":"🇬🇭","Cameroon":"🇨🇲","Nigeria":"🇳🇬","Egypt":"🇪🇬",
    "Saudi Arabia":"🇸🇦","Iran":"🇮🇷","Qatar":"🇶🇦","Turkey":"🇹🇷",
    "Poland":"🇵🇱","Denmark":"🇩🇰","Sweden":"🇸🇪","Switzerland":"🇨🇭",
    "Serbia":"🇷🇸","Ukraine":"🇺🇦","Italy":"🇮🇹",
  };
  return map[team] ?? "🏳️";
}

// ── Cell — reusable info cell ─────────────────────────────────────────────────
function Cell({ label, val, highlight, wide }: { label: string; val: string; highlight?: boolean; wide?: boolean }) {
  const empty = !val || val === "—" || val === "null";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: wide ? 120 : 70 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,.25)", textTransform: "uppercase" as const }}>{label}</div>
      {empty ? (
        <div style={{ width: 48, height: 2, background: "rgba(255,255,255,.15)", borderRadius: 1, marginTop: 12 }} />
      ) : (
        <div style={{ fontSize: highlight ? 26 : 19, fontWeight: 900, color: highlight ? "#1abfb0" : "rgba(255,255,255,.88)", letterSpacing: highlight ? -1 : 0, lineHeight: 1 }}>{val}</div>
      )}
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 40, background: "rgba(255,255,255,.1)", flexShrink: 0, alignSelf: "center" }} />;
}

export default async function OGImage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: listing } = await sb.from("listings").select("*").eq("id", id).single();

  if (!listing) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: "#070e1f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 40 }}>Stayin</div>,
      { width: 1200, height: 630 }
    );
  }

  let matchData: any = null;
  let isIL = false;
  if (listing.match_id) {
    const { data } = await sb.from("matches").select("*").eq("id", listing.match_id).single();
    matchData = data;
  } else if (listing.israeli_match_id) {
    const { data } = await sb.from("israeli_matches").select("*").eq("id", listing.israeli_match_id).single();
    matchData = data; isIL = true;
  }

  const isSell = listing.type === "sell";
  const TEAL   = "#1abfb0";
  const DARK   = "#070e1f";
  const STUB   = "#081020";
  const BORDER = "rgba(26,191,176,0.18)";
  const stripeColors = isIL ? ["#1a3a8f","#006847","#1abfb0"] : ["#1a3a6b","#e63946","#006847"];
  const badgeBg    = isSell ? TEAL   : "#1a3a8f";
  const badgeColor = isSell ? "#0a1628" : "#fff";
  const badgeLabel = isSell ? "מכירה" : "קנייה";

  // ── Match fields ─────────────────────────────────────────────────────────────
  let homeTeam = "TBD", awayTeam = "TBD";
  let city = "—", matchDate = "—", matchTime = "—";
  let eventLabel = "", subLabel = "";
  let matchNum = "";

  if (matchData) {
    if (isIL) {
      homeTeam   = matchData.home_team  ?? "TBD";
      awayTeam   = matchData.away_team  ?? "TBD";
      city       = matchData.city       ?? matchData.stadium ?? "—";
      matchDate  = formatDate(matchData.match_date);
      matchTime  = (matchData.match_time ?? "—").slice(0,5);
      eventLabel = matchData.competition === "state_cup" ? "גביע המדינה" : "ליגת העל 2025/26";
      subLabel   = matchData.round      ?? "";
    } else {
      homeTeam   = matchData.home_team_name ?? "TBD";
      awayTeam   = matchData.away_team_name ?? "TBD";
      city       = matchData.city           ?? "—";
      matchDate  = formatDate(matchData.match_date);
      matchTime  = (matchData.match_time    ?? "—").slice(0,5);
      eventLabel = "FIFA WORLD CUP 2026™";
      subLabel   = matchData.stage          ?? "";
      matchNum   = matchData.fifa_match_number ? `#${matchData.fifa_match_number}` : "";
    }
  }

  // ── Listing fields — show dash line if missing ────────────────────────────
  const price      = listing.price    ? (isIL ? `₪${listing.price}` : `$${listing.price}`) : "—";
  const qty        = listing.quantity ? `${listing.quantity}` : "—";
  const category   = (!isIL && listing.category) ? listing.category : "—";
  const block      = listing.seats_block    || "—";
  const row        = listing.seats_row      || "—";
  const seats      = listing.seats_numbers  || "—";
  const together   = listing.seated_together === "yes" ? "✓ יחד" : listing.seated_together === "no" ? "לא יחד" : "—";
  const notes      = listing.notes          || "";

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: DARK, display: "flex", flexDirection: "column", fontFamily: "'Noto Sans Hebrew','Segoe UI',sans-serif", position: "relative", overflow: "hidden" }}>

        {/* Top stripe */}
        <div style={{ display: "flex", height: 5, width: "100%", flexShrink: 0 }}>
          {stripeColors.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>

        {/* Ticket */}
        <div style={{ flex: 1, display: "flex", margin: "16px 18px 18px", borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}`, position: "relative" }}>

          {/* ── STUB ── */}
          <div style={{ width: 190, background: STUB, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "24px 0", borderRight: "2px dashed rgba(26,191,176,.18)", position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: -10, right: -10, width: 20, height: 20, borderRadius: "50%", background: DARK }} />
            <div style={{ position: "absolute", bottom: -10, right: -10, width: 20, height: 20, borderRadius: "50%", background: DARK }} />

            {/* Logo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>Stay</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: TEAL, letterSpacing: -1 }}>in</span>
                <div style={{ width: 28, height: 28, background: "rgba(26,191,176,.15)", border: `1.5px solid ${BORDER}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎟️</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", color: "rgba(255,255,255,.28)", textTransform: "uppercase" }}>TICKETS</div>
            </div>

            {/* Barcode */}
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
              {[16,26,12,30,18,24,14,28,20,16,26,12].map((h, i) => (
                <div key={i} style={{ width: 3, height: h, background: "rgba(26,191,176,.32)", borderRadius: 1 }} />
              ))}
            </div>

            {/* Badge + URL */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
              <div style={{ background: badgeBg, color: badgeColor, fontSize: 17, fontWeight: 900, paddingTop: 7, paddingBottom: 7, paddingLeft: 26, paddingRight: 26, borderRadius: 999 }}>
                {badgeLabel}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>stayin.co.il</div>
            </div>
          </div>

          {/* ── BODY ── */}
          <div style={{ flex: 1, background: "linear-gradient(135deg,#0a1628 0%,#0f1e3a 55%,#091420 100%)", display: "flex", flexDirection: "column", padding: "22px 32px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 380, height: 380, top: -110, right: -70, borderRadius: "50%", background: "radial-gradient(circle,rgba(26,191,176,.07),transparent 65%)" }} />
            <div style={{ position: "absolute", width: 280, height: 280, bottom: -90, left: -50, borderRadius: "50%", background: "radial-gradient(circle,rgba(26,58,143,.1),transparent 65%)" }} />
            {!isIL && <div style={{ position: "absolute", top: 16, right: 24, fontSize: 48, opacity: .2 }}>🏆</div>}

            {/* Event label */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", color: TEAL, textTransform: "uppercase" as const }}>{eventLabel}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", color: "rgba(255,255,255,.28)", textTransform: "uppercase" as const }}>{subLabel}</div>
            </div>

            {/* Teams */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: isIL ? 10 : 8 }}>
              <div style={{ width: 4, height: 46, background: TEAL, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>
                {homeTeam}
                <span style={{ color: "rgba(255,255,255,.28)", fontWeight: 300, fontSize: 24, margin: "0 12px" }}>נגד</span>
                {awayTeam}
              </div>
            </div>

            {/* Flags (WC) */}
            {!isIL && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 30 }}>{flagEmoji(homeTeam)}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.28)", letterSpacing: "0.1em" }}>VS</div>
                <div style={{ fontSize: 30 }}>{flagEmoji(awayTeam)}</div>
              </div>
            )}

            {/* ── ROW 1: Match info ── */}
            <div style={{ display: "flex", gap: 0, alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
              {matchNum && <><Cell label="משחק"    val={matchNum} /><Divider /></>}
              <Cell label="עיר"      val={city}      />
              <Divider />
              <Cell label="תאריך"    val={matchDate} />
              <Divider />
              <Cell label="שעה"      val={matchTime} />
              {!isIL && <><Divider /><Cell label="קטגוריה" val={category} /></>}
            </div>

            {/* ── DASHED DIVIDER ── */}
            <div style={{ borderTop: "1.5px dashed rgba(26,191,176,.18)", margin: "10px 0" }} />

            {/* ── ROW 2: Listing details ── */}
            <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
              {/* PRICE — most prominent */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginLeft: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,.25)", textTransform: "uppercase" as const }}>
                  {isSell ? "מחיר לכרטיס" : "תקציב"}
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: TEAL, letterSpacing: -1.5, lineHeight: 1 }}>{price}</div>
              </div>
              <Divider />
              <Cell label="כמות"    val={qty}      />
              <Divider />
              <Cell label="כניסה"   val="—"        />
              <Divider />
              <Cell label="בלוק"    val={block}    />
              <Divider />
              <Cell label="שורה"    val={row}      />
              <Divider />
              <Cell label="מושבים"  val={seats}    />
              <Divider />
              <Cell label="יחד"     val={together} />
            </div>

            {/* Notes */}
            {notes && (
              <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,.35)", fontStyle: "italic", letterSpacing: 0, borderRight: `2px solid rgba(26,191,176,.3)`, paddingRight: 8, maxWidth: 500 }}>
                "{notes.slice(0,80)}{notes.length > 80 ? "..." : ""}"
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
