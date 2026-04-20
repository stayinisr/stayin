"use client";

import { Suspense, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";
import { useToast } from "../../components/ToastProvider";
import SuccessModal from "../../components/SuccessModal";
import { teamName, flagImgSrc } from "../../lib/teams";

const C = {
  usa: "#1a3a6b",
  canada: "#e63946",
  mexico: "#006847",
  border: "#e8edf5",
  text: "#0d1b3e",
  muted: "#64748b",
  hint: "#94a3b8",
  faint: "#cbd5e1",
  bg: "#f8f9fc",
  gold: "#d4a017",
};

type MatchItem = {
  id: string;
  fifa_match_number: number;
  home_team_name: string | null;
  away_team_name: string | null;
  city: string;
  stadium: string;
  match_date: string;
  stage?: string | null;
};

function isGroupStage(stage?: string | null) {
  return !!stage && (stage.startsWith("Group") || stage === "Group Stage");
}

function hasRealTeam(name: string | null | undefined) {
  return !!name && name !== "TBD" && name !== "TBC";
}

function stageLabel(stage: string | null | undefined, isHe: boolean) {
  if (!stage) return "";
  if (!isHe) return stage;

  if (stage === "Group Stage") return "שלב הבתים";
  if (stage === "Round of 32") return "32 האחרונות";
  if (stage === "Round of 16") return "16 האחרונות";
  if (stage === "Quarter Finals") return "רבע הגמר";
  if (stage === "Semi Finals") return "חצי הגמר";
  if (stage === "Third Place") return "מקום שלישי";
  if (stage === "Final") return "הגמר";

  const groupMatch = stage.match(/^Group\s+([A-Z])$/i);
  if (groupMatch) return `בית \u2068${groupMatch[1].toUpperCase()}\u2069`;

  return stage;
}

function TeamInline({
  name,
  stage,
  isHe,
}: {
  name: string | null;
  stage?: string | null;
  isHe: boolean;
}) {
  const showFlag = isGroupStage(stage) && hasRealTeam(name);
  const imgSrc = showFlag ? flagImgSrc(name) : "";
  const label = teamName(name, isHe);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: isHe
          ? "var(--font-he,'Heebo',sans-serif)"
          : "var(--font-dm,'DM Sans',sans-serif)",
        fontSize: "11px",
        fontWeight: 600,
        color: C.hint,
        lineHeight: 1.45,
        verticalAlign: "middle",
      }}
    >
      {showFlag && imgSrc ? (
        <span
          style={{
            width: "16px",
            height: "11px",
            borderRadius: "3px",
            overflow: "hidden",
            background: "#fff",
            border: "1px solid rgba(13,27,62,0.10)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 1px 2px rgba(13,27,62,0.04)",
          }}
        >
          <img
            src={imgSrc}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </span>
      ) : null}
      <span>{label}</span>
    </span>
  );
}

function matchOptionLabel(m: MatchItem, isHe: boolean) {
  const home = teamName(m.home_team_name, isHe);
  const away = teamName(m.away_team_name, isHe);
  return isHe
    ? `משחק ${m.fifa_match_number} — ${home} / ${away}`
    : `Match ${m.fifa_match_number} — ${home} / ${away}`;
}

function PostListingPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, lang } = useLanguage();
  const toast = useToast();
  const isHe = lang === "he";

  const preMatchId = params.get("matchId") || "";
  const preType = params.get("type") || "sell";
  const editId = params.get("listingId") || "";

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loadingM, setLoadingM] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [type, setType] = useState(preType);
  const [matchId, setMatchId] = useState(preMatchId);
  const [category, setCategory] = useState("Category 1");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [seatedTogether, setSeatedTogether] = useState("unknown");
  const [seatsBlock, setSeatsBlock] = useState("");
  const [seatsRow, setSeatsRow] = useState("");
  const [seatsNums, setSeatsNums] = useState("");

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (!editId) {
      if (preMatchId) setMatchId(preMatchId);
      if (preType) setType(preType);
    }
  }, [preMatchId, preType, editId]);

  useEffect(() => {
    if (editId) loadEdit(editId);
  }, [editId]);

  async function fetchMatches() {
    setLoadingM(true);
    const { data } = await supabase
      .from("matches")
      .select(
        "id,fifa_match_number,home_team_name,away_team_name,city,stadium,match_date,stage"
      )
      .order("fifa_match_number", { ascending: true });

    setMatches((data || []) as MatchItem[]);
    setLoadingM(false);
  }

  async function loadEdit(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      router.push("/my-listings");
      return;
    }

    setType(data.type);
    setMatchId(data.match_id);
    setCategory(data.category);
    setQuantity(data.quantity);
    setPrice(String(data.price));
    setNotes(data.notes || "");
    setSeatedTogether(data.seated_together || "unknown");
    setSeatsBlock(data.seats_block || "");
    setSeatsRow(data.seats_row || "");
    setSeatsNums(data.seats_numbers || "");
  }

  const selectedMatch = useMemo(
    () => matches.find((m) => m.id === matchId),
    [matches, matchId]
  );

  async function handleSubmit() {
    if (!matchId) {
      toast.error(t.selectMatchAlert);
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error(t.validPriceAlert);
      return;
    }
    if (quantity <= 0) {
      toast.error(t.validQuantityAlert);
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      toast.error(t.loginFirst);
      router.push("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,phone,country,last_post_at,is_premium,plan")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.full_name || !profile?.phone || !profile?.country) {
      setSubmitting(false);
      toast.error(t.saveProfileFirst);
      router.push("/complete-profile");
      return;
    }

    if (
      !editId &&
      profile.last_post_at &&
      !profile.is_premium &&
      Date.now() - new Date(profile.last_post_at).getTime() < 30000
    ) {
      setSubmitting(false);
      toast.error(t.postEvery30Seconds);
      return;
    }

    const userPlan = (profile.plan as string) ?? (profile.is_premium ? "premium" : "free");
    const validityDays = userPlan === "free" ? 7 : 14;
    const exp = new Date(Date.now() + validityDays * 86400000).toISOString();

    const payload: Record<string, any> = {
      type,
      match_id: matchId,
      category,
      quantity,
      price: Number(price),
      notes: notes.trim() || null,
      seated_together: quantity > 1 ? seatedTogether : "unknown",
      seats_block: seatsBlock.trim() || null,
      seats_row: seatsRow.trim() || null,
      seats_numbers: seatsNums.trim() || null,
      status: "active",
      expires_at: exp,
    };

    if (editId) {
      const { error } = await supabase
        .from("listings")
        .update(payload)
        .eq("id", editId)
        .eq("user_id", user.id);

      setSubmitting(false);

      if (error) {
        toast.error(isHe ? "עדכון נכשל" : "Update failed");
        return;
      }

      await supabase
        .from("profiles")
        .update({ last_post_at: new Date().toISOString() })
        .eq("id", user.id);

      toast.success(t.listingUpdated);
      router.push(`/matches/${matchId}`);
      return;
    }

    const { data: active } = await supabase
      .from("listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .is("archived_at", null)
      .gt("expires_at", new Date().toISOString());

    const planLimits: Record<string, number> = {
      free: 10,
      premium: 25,
      unlimited: 9999,
    };

    const maxListings = planLimits[userPlan] ?? 10;
    if ((active || []).length >= maxListings) {
      setSubmitting(false);
      toast.error(t.limitReached10);
      return;
    }

    const { data: dup } = await supabase
      .from("listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("match_id", matchId)
      .eq("type", type)
      .eq("category", category)
      .is("archived_at", null)
      .maybeSingle();

    if (dup) {
      setSubmitting(false);
      toast.error(t.alreadySimilarListing);
      return;
    }

    const now = new Date().toISOString();

    const { error } = await supabase.from("listings").insert({
      user_id: user.id,
      first_published_at: now,
      last_bumped_at: now,
      ...payload,
    });

    setSubmitting(false);

    if (error) {
      toast.error(isHe ? "פרסום נכשל" : "Failed to post");
      return;
    }

    await supabase.from("profiles").update({ last_post_at: now }).eq("id", user.id);
    setShowSuccess(true);
  }

  const card: CSSProperties = {
    background: "rgba(255,255,255,0.88)",
    border: `1px solid ${C.border}`,
    borderRadius: "10px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 2px 16px rgba(13,27,62,0.06)",
    padding: "22px",
  };

  const lbl: CSSProperties = {
    display: "block",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.hint,
    marginBottom: "7px",
  };

  const inp: CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(255,255,255,0.9)",
    border: `1px solid ${C.border}`,
    borderRadius: "6px",
    fontSize: "13px",
    color: C.text,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--font-dm),var(--font-he),sans-serif",
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)`,
        }}
      />

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "1rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Link
          href={matchId ? `/matches/${matchId}` : "/"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            fontWeight: 600,
            color: C.hint,
            textDecoration: "none",
            marginBottom: "20px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          ← {isHe ? "חזרה" : "Back"}
        </Link>

        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.usa,
              marginBottom: "10px",
            }}
          >
            STAY IN THE GAME
          </div>

          <h1
            style={{
              fontFamily: "var(--font-syne,'Syne',sans-serif)",
              fontSize: "clamp(22px,3.5vw,34px)",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: C.text,
              lineHeight: 1.1,
            }}
          >
            {editId
              ? isHe
                ? "עריכת מודעה"
                : "Edit listing"
              : type === "sell"
                ? isHe
                  ? "מכירת כרטיסים"
                  : "Sell tickets"
                : isHe
                  ? "חיפוש כרטיסים"
                  : "Looking to buy"}
          </h1>

          <p
            style={{
              fontSize: "13px",
              color: C.muted,
              marginTop: "8px",
              fontWeight: 300,
            }}
          >
            {editId ? t.updateListingDetails : t.postListingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-[1fr_360px]">
          <div style={card}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={lbl}>{t.listingType}</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1px",
                    background: C.border,
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  {["sell", "buy"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setType(v)}
                      style={{
                        padding: "11px",
                        fontSize: "12px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        transition: "all 150ms",
                        background:
                          type === v
                            ? v === "sell"
                              ? C.mexico
                              : C.usa
                            : "rgba(255,255,255,0.9)",
                        color: type === v ? "#fff" : C.hint,
                      }}
                    >
                      {v === "sell"
                        ? isHe
                          ? "🎟️ מכירה"
                          : "🎟️ Sell"
                        : isHe
                          ? "🔍 קנייה"
                          : "🔍 Buy"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={lbl}>{t.match}</label>
                <select
                  dir={isHe ? "rtl" : "ltr"}
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  disabled={loadingM}
                  style={{ ...inp, cursor: "pointer" }}
                >
                  <option value="">{loadingM ? t.loading : t.selectMatch}</option>
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {matchOptionLabel(m, isHe)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>{t.category}</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {["Category 1", "Category 2", "Category 3", "Category 4"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      style={{
                        padding: "9px 4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        border: `1px solid ${category === c ? C.usa : C.border}`,
                        borderRadius: "6px",
                        background:
                          category === c ? "rgba(26,58,107,0.07)" : "rgba(255,255,255,0.9)",
                        color: category === c ? C.usa : C.muted,
                        cursor: "pointer",
                        transition: "all 150ms",
                      }}
                    >
                      {c.replace("Category ", isHe ? "קטג' " : "Cat ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label style={lbl}>{t.quantity}</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    style={inp}
                  />
                </div>

                {quantity > 1 && (
                  <div>
                    <label style={lbl}>{t.seatsTogetherQuestion}</label>
                    <select
                      value={seatedTogether}
                      onChange={(e) => setSeatedTogether(e.target.value)}
                      style={{ ...inp, cursor: "pointer" }}
                    >
                      <option value="yes">{t.yes}</option>
                      <option value="no">{t.no}</option>
                      <option value="unknown">{t.notSure}</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { l: t.blockOptional, v: seatsBlock, set: setSeatsBlock, ph: "A / 101" },
                  { l: t.rowOptional, v: seatsRow, set: setSeatsRow, ph: "12" },
                  { l: t.seatsOptional, v: seatsNums, set: setSeatsNums, ph: "14-15" },
                ].map(({ l, v, set, ph }) => (
                  <div key={l}>
                    <label style={lbl}>{l}</label>
                    <input
                      type="text"
                      value={v}
                      onChange={(e) => set(e.target.value)}
                      placeholder={ph}
                      style={inp}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={lbl}>{t.price}</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      insetInlineStart: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "13px",
                      color: C.hint,
                      pointerEvents: "none",
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="350"
                    style={{ ...inp, paddingInlineStart: "28px" }}
                  />
                </div>
              </div>

              <div>
                <label style={lbl}>{t.notesOptional}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={t.addUsefulDetails}
                  style={{ ...inp, resize: "vertical", lineHeight: 1.7 }}
                />
                <p style={{ fontSize: "10px", color: C.faint, marginTop: "5px" }}>
                  {isHe ? "הערות אלה יופיעו במודעה שלך" : "These notes will appear on your listing"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "13px",
                  background: C.usa,
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "6px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                  letterSpacing: "0.02em",
                }}
              >
                {submitting ? t.loading : editId ? t.saveChanges : t.createListing}
              </button>
            </div>
          </div>

          <div className="relative lg:sticky lg:top-5">
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.hint,
                marginBottom: "10px",
              }}
            >
              {isHe ? "תצוגה מקדימה" : "Live preview"}
            </div>

            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.border}`,
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(13,27,62,0.06)",
              }}
            >
              <div style={{ height: "2px", background: type === "sell" ? C.mexico : C.usa }} />
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "3px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background:
                        type === "sell" ? "rgba(0,104,71,0.08)" : "rgba(26,58,107,0.07)",
                      color: type === "sell" ? C.mexico : C.usa,
                      border: `1px solid ${
                        type === "sell"
                          ? "rgba(0,104,71,0.2)"
                          : "rgba(26,58,107,0.15)"
                      }`,
                    }}
                  >
                    {type === "sell" ? (isHe ? "מכירה" : "Sell") : isHe ? "קנייה" : "Buy"}
                  </span>

                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: "3px",
                      background: "#f1f5f9",
                      color: C.hint,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    {category}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-syne,'Syne',sans-serif)",
                    fontSize: price ? "24px" : "18px",
                    fontWeight: 800,
                    color: price ? C.text : C.faint,
                    letterSpacing: "-0.5px",
                    marginBottom: "6px",
                  }}
                >
                  {price ? `$${price}` : isHe ? "מחיר..." : "Price..."}
                  {price && quantity > 1 && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: C.hint,
                        fontWeight: 400,
                        marginInlineStart: "8px",
                      }}
                    >
                      × {quantity} = ${Number(price) * quantity}
                    </span>
                  )}
                </div>

                {(seatsBlock ||
                  seatsRow ||
                  seatsNums ||
                  (quantity > 1 && seatedTogether === "yes")) && (
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      marginBottom: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {seatsBlock && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          background: "#f1f5f9",
                          borderRadius: "3px",
                          color: C.muted,
                        }}
                      >
                        {isHe ? "בלוק" : "Blk"} {seatsBlock}
                      </span>
                    )}
                    {seatsRow && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          background: "#f1f5f9",
                          borderRadius: "3px",
                          color: C.muted,
                        }}
                      >
                        {isHe ? "שורה" : "Row"} {seatsRow}
                      </span>
                    )}
                    {seatsNums && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          background: "#f1f5f9",
                          borderRadius: "3px",
                          color: C.muted,
                        }}
                      >
                        {seatsNums}
                      </span>
                    )}
                    {quantity > 1 && seatedTogether === "yes" && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          background: "rgba(34,197,94,0.08)",
                          borderRadius: "3px",
                          color: "#15803d",
                        }}
                      >
                        ✓ {isHe ? "יחד" : "Together"}
                      </span>
                    )}
                  </div>
                )}

                {notes && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: C.muted,
                      fontStyle: "italic",
                      lineHeight: 1.55,
                      marginBottom: "10px",
                    }}
                  >
                    "{notes}"
                  </p>
                )}

                {selectedMatch ? (
                  <div
                    style={{
                      fontSize: "11px",
                      color: C.hint,
                      paddingTop: "10px",
                      borderTop: `1px solid ${C.border}`,
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "6px",
                      lineHeight: 1.5,
                    }}
                  >
                    <span>⚽ {isHe ? "משחק" : "Match"} {selectedMatch.fifa_match_number} ·</span>
                    <TeamInline
                      name={selectedMatch.home_team_name}
                      stage={selectedMatch.stage}
                      isHe={isHe}
                    />
                    <span>{isHe ? "נגד" : "vs"}</span>
                    <TeamInline
                      name={selectedMatch.away_team_name}
                      stage={selectedMatch.stage}
                      isHe={isHe}
                    />
                    {selectedMatch.stage ? (
                      <span style={{ flexBasis: "100%" }}>
                        {stageLabel(selectedMatch.stage, isHe)} · {selectedMatch.city} · {selectedMatch.match_date}
                      </span>
                    ) : (
                      <span style={{ flexBasis: "100%" }}>
                        {selectedMatch.city} · {selectedMatch.match_date}
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "11px",
                      color: C.faint,
                      paddingTop: "10px",
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    {isHe ? "בחר משחק..." : "Select a match..."}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "12px",
                padding: "12px 14px",
                background: "rgba(26,58,107,0.04)",
                border: `1px solid rgba(26,58,107,0.1)`,
                borderRadius: "8px",
              }}
            >
              <p style={{ fontSize: "11px", color: C.muted, lineHeight: 1.7 }}>
                {isHe
                  ? "המודעה תהיה פעילה 7 ימים. תוכל לחדש, לערוך או למחוק אותה בכל עת מהאזור האישי."
                  : "Your listing stays live for 7 days. You can renew, edit or delete it anytime from My Listings."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && <SuccessModal matchId={matchId} />}
    </main>
  );
}

export default function PostListingPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh" }} />}>
      <PostListingPageContent />
    </Suspense>
  );
}