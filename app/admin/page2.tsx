
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import SkeletonCard from "../../components/SkeletonCard";

type Listing = {
  id: string;
  type: string;
  price: number;
  status: string;
  created_at: string;
  match_id: string | null;
  user_id: string | null;
  category?: string | null;
  quantity?: number | null;
  is_featured?: boolean | null;
  archived_at?: string | null;
};

type Report = {
  id: string;
  listing_id: string | null;
  match_id: string | null;
  reporter_user_id: string | null;
  reason: string;
  status: string;
  created_at: string;
};

type Plan = "free" | "premium" | "unlimited";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  is_admin?: boolean | null;
  is_premium?: boolean | null;
  plan?: Plan | null;
  auto_bump?: boolean | null;
  created_at?: string | null;
};

const PLAN_CONFIG: Record<Plan, { label: string; color: string; bg: string; badge: string }> = {
  free:      { label: "Free",      color: "#94a3b8", bg: "#f1f5f9",              badge: "" },
  premium:   { label: "Premium",   color: "#d4a017", bg: "rgba(212,160,23,0.1)", badge: "⭐" },
  unlimited: { label: "Unlimited", color: "#006847", bg: "rgba(0,104,71,0.08)",  badge: "🚀" },
};

function PlanBadge({ plan }: { plan: Plan }) {
  const cfg = PLAN_CONFIG[plan] ?? PLAN_CONFIG.free;
  return (
    <span
      style={{
        fontSize: "9px",
        fontWeight: 800,
        padding: "3px 8px",
        borderRadius: "999px",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}30`,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {cfg.badge}
      {cfg.badge ? " " : ""}
      {cfg.label}
    </span>
  );
}

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} · ${hours}:${minutes}`;
}

function StatusBadge({
  kind,
  text,
}: {
  kind: "neutral" | "success" | "warning" | "danger" | "highlight";
  text: string;
}) {
  const map = {
    neutral: { bg: "var(--bg-main)", fg: "var(--text-muted)", border: "var(--border-soft)" },
    success: { bg: "rgba(34,197,94,0.08)", fg: "#15803d", border: "rgba(34,197,94,0.2)" },
    warning: { bg: "rgba(245,158,11,0.08)", fg: "#b45309", border: "rgba(245,158,11,0.2)" },
    danger: { bg: "rgba(230,57,70,0.08)", fg: "#e63946", border: "rgba(230,57,70,0.2)" },
    highlight: { bg: "rgba(26,58,107,0.08)", fg: "#1a3a6b", border: "rgba(26,58,107,0.15)" },
  } as const;
  const s = map[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        fontSize: "9px",
        fontWeight: 800,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderRadius: "999px",
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
      }}
    >
      {text}
    </span>
  );
}

function StatCard({
  label,
  value,
  accent = "var(--wc-usa)",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="card-static" style={{ padding: "16px 18px" }}>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-syne), sans-serif",
          fontSize: "26px",
          fontWeight: 800,
          lineHeight: 1,
          color: accent,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, Profile>>({});
  const [tab, setTab] = useState<"listings" | "reports" | "users">("listings");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error || !data?.is_admin) {
      router.push("/");
      return;
    }

    loadData();
  }

  async function loadData() {
    setLoading(true);

    const { data: listingsData, error: listingsError } = await supabase
      .from("listings")
      .select("id, type, price, status, created_at, match_id, user_id, category, quantity, is_featured, archived_at")
      .order("created_at", { ascending: false });

    if (listingsError) console.error(listingsError);

    const { data: reportsData, error: reportsError } = await supabase
      .from("reports")
      .select("id, listing_id, match_id, reporter_user_id, reason, status, created_at")
      .order("created_at", { ascending: false });

    if (reportsError) console.error(reportsError);

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, country, is_admin, is_premium, plan, auto_bump, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) console.error(profilesError);

    const safeListings = (listingsData || []) as Listing[];
    const safeReports = (reportsData || []) as Report[];
    const safeProfiles = (profilesData || []) as Profile[];

    setListings(safeListings);
    setReports(safeReports);
    setProfiles(safeProfiles);
    setProfilesMap(Object.fromEntries(safeProfiles.map((p) => [p.id, p])));

    setLoading(false);
  }

  async function deleteListing(id: string) {
    const confirmDelete = confirm(isHe ? "למחוק את המודעה?" : "Delete this listing?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }

    await loadData();
  }

  async function deleteReport(id: string) {
    const confirmDelete = confirm(isHe ? "למחוק את הדיווח?" : "Delete this report?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }

    await loadData();
  }

  async function updatePlan(userId: string, plan: Plan) {
    const { error } = await supabase
      .from("profiles")
      .update({
        plan,
        is_premium: plan !== "free",
        auto_bump: plan === "unlimited",
      })
      .eq("id", userId);

    if (error) {
      console.error(error);
      return;
    }
    await loadData();
  }

  async function toggleAdmin(userId: string, current: boolean) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !current })
      .eq("id", userId);
    if (!error) await loadData();
  }

  const listingsById = useMemo(() => {
    return Object.fromEntries(listings.map((l) => [l.id, l]));
  }, [listings]);

  function getUploaderProfileByListing(listingId: string | null) {
    if (!listingId) return null;
    const listing = listingsById[listingId];
    if (!listing?.user_id) return null;
    return profilesMap[listing.user_id] || null;
  }

  const q = search.trim().toLowerCase();

  const filteredListings = useMemo(() => {
    if (!q) return listings;

    return listings.filter((l) => {
      const uploader = l.user_id ? profilesMap[l.user_id] : null;
      const text = [
        l.id,
        l.type,
        l.status,
        l.category,
        l.match_id,
        l.user_id,
        String(l.price ?? ""),
        String(l.quantity ?? ""),
        uploader?.full_name || "",
        uploader?.email || "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [listings, profilesMap, q]);

  const filteredReports = useMemo(() => {
    if (!q) return reports;

    return reports.filter((r) => {
      const reporter = r.reporter_user_id ? profilesMap[r.reporter_user_id] : null;
      const uploader = getUploaderProfileByListing(r.listing_id);

      const text = [
        r.id,
        r.listing_id,
        r.match_id,
        r.reason,
        r.status,
        reporter?.full_name || "",
        reporter?.email || "",
        uploader?.full_name || "",
        uploader?.email || "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [reports, profilesMap, q, listingsById]);

  const filteredUsers = useMemo(() => {
    if (!q) return profiles;

    return profiles.filter((p) => {
      const text = [
        p.id,
        p.full_name || "",
        p.email || "",
        p.phone || "",
        p.country || "",
        p.is_admin ? "admin" : "",
        p.is_premium ? "premium" : "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [profiles, q]);

  if (loading) {
    return (
      <main className="app-shell">
        <section className="page-container">
          <div className="grid gap-4">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        </section>
      </main>
    );
  }

  const tabButtonClass = (name: typeof tab) =>
    tab === name ? "primary-btn" : "secondary-btn";

  return (
    <main className="app-shell">
      <section className="page-container">
        <div
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg,var(--wc-usa) 33.3%,var(--wc-canada) 33.3% 66.6%,var(--wc-mexico) 66.6%)",
            borderRadius: "999px",
            marginBottom: "18px",
          }}
        />

        <div className="fade-up">
          <div
            className="card-static"
            style={{
              padding: "22px 24px",
              marginBottom: "16px",
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--wc-usa)",
                marginBottom: "8px",
              }}
            >
              STAY IN THE GAME
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="page-title" style={{ marginBottom: "6px" }}>
                  {isHe ? "פאנל ניהול" : "Admin Panel"}
                </h1>
                <p className="page-subtitle">
                  {isHe
                    ? "ניהול מודעות, דיווחים ומשתמשים באותו קו עיצובי של האתר."
                    : "Manage listings, reports, and users with the same product style."}
                </p>
              </div>

              <div className="w-full md:max-w-sm">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    isHe
                      ? "חפש מודעות / דיווחים / משתמשים"
                      : "Search listings / reports / users"
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="fade-up-delay-1"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <StatCard
            label={isHe ? "מודעות" : "Listings"}
            value={listings.length}
            accent="var(--wc-usa)"
          />
          <StatCard
            label={isHe ? "דיווחים" : "Reports"}
            value={reports.length}
            accent="var(--wc-canada)"
          />
          <StatCard
            label={isHe ? "משתמשים" : "Users"}
            value={profiles.length}
            accent="var(--wc-mexico)"
          />
          <StatCard
            label={isHe ? "אדמינים" : "Admins"}
            value={profiles.filter((p) => !!p.is_admin).length}
            accent="var(--text-primary)"
          />
        </div>

        <div
          className="fade-up-delay-2"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <button onClick={() => setTab("listings")} className={tabButtonClass("listings")}>
            {isHe ? "מודעות" : "Listings"}
          </button>
          <button onClick={() => setTab("reports")} className={tabButtonClass("reports")}>
            {isHe ? "דיווחים" : "Reports"}
          </button>
          <button onClick={() => setTab("users")} className={tabButtonClass("users")}>
            {isHe ? "משתמשים" : "Users"}
          </button>
        </div>

        {tab === "listings" && (
          <div className="grid gap-4">
            {filteredListings.length === 0 ? (
              <div className="card-static">{isHe ? "אין מודעות" : "No listings"}</div>
            ) : (
              filteredListings.map((l) => {
                const uploader = l.user_id ? profilesMap[l.user_id] : null;
                const typeLabel =
                  l.type === "sell" ? (isHe ? "מכירה" : "Sell") : isHe ? "קנייה" : "Buy";
                const statusKind =
                  l.archived_at ? "danger" : l.status === "active" ? "success" : "neutral";

                return (
                  <div key={l.id} className="card-static" style={{ padding: "18px 20px" }}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            flexWrap: "wrap",
                            marginBottom: "8px",
                          }}
                        >
                          <StatusBadge kind="highlight" text={typeLabel} />
                          <StatusBadge
                            kind={statusKind}
                            text={
                              l.archived_at
                                ? isHe
                                  ? "Archived"
                                  : "Archived"
                                : l.status || "-"
                            }
                          />
                          {l.is_featured ? (
                            <StatusBadge kind="warning" text="Gold" />
                          ) : null}
                          {l.category ? (
                            <StatusBadge kind="neutral" text={l.category} />
                          ) : null}
                        </div>

                        <div
                          style={{
                            fontFamily: "var(--font-syne), sans-serif",
                            fontSize: "28px",
                            fontWeight: 800,
                            lineHeight: 1,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.04em",
                            marginBottom: "8px",
                          }}
                        >
                          ${l.price}
                          <span
                            style={{
                              fontFamily: "var(--font-dm), var(--font-he), sans-serif",
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "var(--text-muted)",
                              marginInlineStart: "10px",
                            }}
                          >
                            × {l.quantity || 0} {isHe ? "כרטיסים" : "tickets"}
                          </span>
                        </div>

                        <div className="text-sm text-[var(--text-secondary)]">
                          {isHe ? "שם המעלה" : "Uploader"}: {uploader?.full_name || "-"}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          {isHe ? "מייל" : "Email"}: {uploader?.email || "-"}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            flexWrap: "wrap",
                            marginTop: "10px",
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          <span>listing: {l.id}</span>
                          <span>match: {l.match_id || "-"}</span>
                          <span>{fmtDate(l.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:min-w-[190px]">
                        {l.match_id && (
                          <Link href={`/matches/${l.match_id}`} className="secondary-btn text-center">
                            {isHe ? "צפייה במודעה" : "View listing"}
                          </Link>
                        )}

                        <button onClick={() => deleteListing(l.id)} className="danger-btn">
                          {isHe ? "מחק מודעה" : "Delete listing"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "reports" && (
          <div className="grid gap-4">
            {filteredReports.length === 0 ? (
              <div className="card-static">{isHe ? "אין דיווחים" : "No reports"}</div>
            ) : (
              filteredReports.map((r) => {
                const reporter = r.reporter_user_id ? profilesMap[r.reporter_user_id] : null;
                const uploader = getUploaderProfileByListing(r.listing_id);

                return (
                  <div key={r.id} className="card-static" style={{ padding: "18px 20px" }}>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <StatusBadge
                        kind={r.status === "open" ? "warning" : "neutral"}
                        text={r.status === "open" ? (isHe ? "פתוח" : "Open") : isHe ? "סגור" : "Closed"}
                      />
                      <StatusBadge kind="neutral" text={`listing: ${r.listing_id || "-"}`} />
                      <StatusBadge kind="neutral" text={`match: ${r.match_id || "-"}`} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                      <div>
                        <div className="text-sm text-[var(--text-secondary)] mb-1">
                          {isHe ? "מדווח" : "Reporter"}: {reporter?.full_name || "-"} · {reporter?.email || "-"}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] mb-1">
                          {isHe ? "מעלה" : "Uploader"}: {uploader?.full_name || "-"} · {uploader?.email || "-"}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mb-3">{fmtDate(r.created_at)}</div>

                        <div
                          style={{
                            border: "1px solid var(--border-soft)",
                            background: "var(--bg-main)",
                            borderRadius: "6px",
                            padding: "14px",
                            color: "var(--text-primary)",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.7,
                            fontSize: "14px",
                          }}
                        >
                          {r.reason}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:min-w-[190px]">
                        {r.match_id && (
                          <Link href={`/matches/${r.match_id}`} className="secondary-btn text-center">
                            {isHe ? "צפייה במודעה" : "View listing"}
                          </Link>
                        )}
                        {r.listing_id && (
                          <button onClick={() => deleteListing(r.listing_id!)} className="danger-btn">
                            {isHe ? "הסר מודעה" : "Remove listing"}
                          </button>
                        )}
                        <button onClick={() => deleteReport(r.id)} className="secondary-btn">
                          {isHe ? "מחק דיווח" : "Delete report"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="grid gap-4">
            {filteredUsers.length === 0 ? (
              <div className="card-static">{isHe ? "אין משתמשים" : "No users"}</div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="card-static" style={{ padding: "18px 20px" }}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-syne), sans-serif",
                          fontSize: "24px",
                          fontWeight: 800,
                          lineHeight: 1.05,
                          color: "var(--text-primary)",
                          letterSpacing: "-0.03em",
                          marginBottom: "8px",
                        }}
                      >
                        {u.full_name || "-"}
                      </div>

                      <div className="text-sm text-[var(--text-secondary)]">{u.email || "-"}</div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {u.phone || "-"} · {u.country || "-"}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                          marginTop: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <PlanBadge plan={(u.plan ?? "free") as Plan} />
                        {u.is_admin ? <StatusBadge kind="highlight" text="Admin" /> : null}
                        {u.auto_bump ? <StatusBadge kind="success" text="Auto-bump" /> : null}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          flexWrap: "wrap",
                          marginTop: "10px",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        <span>user: {u.id}</span>
                        <span>{fmtDate(u.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:min-w-[280px]">
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {(["free", "premium", "unlimited"] as Plan[]).map((plan) => {
                          const activePlan = (u.plan ?? "free") === plan;
                          return (
                            <button
                              key={plan}
                              onClick={() => updatePlan(u.id, plan)}
                              disabled={activePlan}
                              style={{
                                padding: "7px 12px",
                                fontSize: "11px",
                                fontWeight: 700,
                                border: `1px solid ${activePlan ? PLAN_CONFIG[plan].color : "#e8edf5"}`,
                                borderRadius: "6px",
                                background: activePlan ? PLAN_CONFIG[plan].bg : "transparent",
                                color: activePlan ? PLAN_CONFIG[plan].color : "#94a3b8",
                                cursor: activePlan ? "default" : "pointer",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {PLAN_CONFIG[plan].badge}
                              {PLAN_CONFIG[plan].badge ? " " : ""}
                              {PLAN_CONFIG[plan].label}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => toggleAdmin(u.id, !!u.is_admin)}
                        style={{
                          padding: "8px 12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          border: `1px solid ${u.is_admin ? "#e63946" : "#e8edf5"}`,
                          borderRadius: "6px",
                          background: u.is_admin ? "rgba(230,57,70,0.07)" : "transparent",
                          color: u.is_admin ? "#e63946" : "#94a3b8",
                          cursor: "pointer",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {u.is_admin
                          ? isHe
                            ? "− הסר אדמין"
                            : "− Remove admin"
                          : isHe
                          ? "+ הפוך אדמין"
                          : "+ Make admin"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
