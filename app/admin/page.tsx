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

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  is_admin?: boolean | null;
  is_premium?: boolean | null;
  created_at?: string | null;
};

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
      .select("id, full_name, email, phone, country, is_admin, is_premium, created_at")
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
    const confirmDelete = confirm(
      isHe ? "למחוק את המודעה?" : "Delete this listing?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }

    await loadData();
  }

  async function deleteReport(id: string) {
    const confirmDelete = confirm(
      isHe ? "למחוק את הדיווח?" : "Delete this report?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }

    await loadData();
  }

  async function togglePremium(userId: string, currentValue: boolean) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: !currentValue })
      .eq("id", userId);

    if (error) {
      console.error(error);
      return;
    }

    await loadData();
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

  return (
    <main className="app-shell">
      <section className="page-container">
        <h1 className="page-title mb-6">
          {isHe ? "פאנל ניהול" : "Admin Panel"}
        </h1>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setTab("listings")}
              className={tab === "listings" ? "primary-btn" : "secondary-btn"}
            >
              {isHe ? "מודעות" : "Listings"}
            </button>

            <button
              onClick={() => setTab("reports")}
              className={tab === "reports" ? "primary-btn" : "secondary-btn"}
            >
              {isHe ? "דיווחים" : "Reports"}
            </button>

            <button
              onClick={() => setTab("users")}
              className={tab === "users" ? "primary-btn" : "secondary-btn"}
            >
              {isHe ? "משתמשים" : "Users"}
            </button>
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

        {tab === "listings" && (
          <div className="grid gap-4">
            {filteredListings.length === 0 ? (
              <div className="card-static">
                {isHe ? "אין מודעות" : "No listings"}
              </div>
            ) : (
              filteredListings.map((l) => {
                const uploader = l.user_id ? profilesMap[l.user_id] : null;

                return (
                  <div
                    key={l.id}
                    className="card-static flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">
                        {l.type} · ${l.price} · {l.quantity || 0} {isHe ? "כרטיסים" : "tickets"}
                      </div>

                      <div className="text-sm text-[var(--text-secondary)]">
                        {l.category || "-"} · {l.status}
                        {l.is_featured ? " · GOLD" : ""}
                        {l.archived_at ? " · ARCHIVED" : ""}
                      </div>

                      <div className="text-sm text-[var(--text-secondary)] mt-2">
                        {isHe ? "שם המעלה" : "Uploader name"}: {uploader?.full_name || "-"}
                      </div>

                      <div className="text-sm text-[var(--text-secondary)]">
                        {isHe ? "מייל המעלה" : "Uploader email"}: {uploader?.email || "-"}
                      </div>

                      <div className="text-xs text-[var(--text-muted)] mt-2">
                        listing: {l.id}
                      </div>

                      <div className="text-xs text-[var(--text-muted)]">
                        {new Date(l.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:min-w-[180px]">
                      {l.match_id && (
                        <Link
                          href={`/matches/${l.match_id}`}
                          className="secondary-btn text-center"
                        >
                          {isHe ? "צפייה במודעה" : "View listing"}
                        </Link>
                      )}

                      <button
                        onClick={() => deleteListing(l.id)}
                        className="danger-btn"
                      >
                        {isHe ? "מחק מודעה" : "Delete listing"}
                      </button>
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
              <div className="card-static">
                {isHe ? "אין דיווחים" : "No reports"}
              </div>
            ) : (
              filteredReports.map((r) => {
                const reporter = r.reporter_user_id ? profilesMap[r.reporter_user_id] : null;
                const uploader = getUploaderProfileByListing(r.listing_id);

                return (
                  <div key={r.id} className="card-static">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="badge badge-warning">
                        {r.status === "open"
                          ? isHe
                            ? "פתוח"
                            : "Open"
                          : isHe
                          ? "סגור"
                          : "Closed"}
                      </span>
                    </div>

                    <div className="text-sm text-[var(--text-secondary)] mb-1">
                      {isHe ? "שם המדווח" : "Reporter name"}: {reporter?.full_name || "-"}
                    </div>

                    <div className="text-sm text-[var(--text-secondary)] mb-1">
                      {isHe ? "מייל המדווח" : "Reporter email"}: {reporter?.email || "-"}
                    </div>

                    <div className="text-sm text-[var(--text-secondary)] mb-1">
                      {isHe ? "שם המעלה" : "Uploader name"}: {uploader?.full_name || "-"}
                    </div>

                    <div className="text-sm text-[var(--text-secondary)] mb-1">
                      {isHe ? "מייל המעלה" : "Uploader email"}: {uploader?.email || "-"}
                    </div>

                    <div className="text-sm text-[var(--text-secondary)] mb-1">
                      listing: {r.listing_id || "-"} · match: {r.match_id || "-"}
                    </div>

                    <div className="text-sm text-[var(--text-muted)] mb-3">
                      {new Date(r.created_at).toLocaleString()}
                    </div>

                    <div className="rounded-xl bg-[var(--bg-main)] p-4 text-[var(--text-primary)] whitespace-pre-wrap mb-4">
                      {r.reason}
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row">
                      {r.match_id && (
                        <Link
                          href={`/matches/${r.match_id}`}
                          className="secondary-btn text-center"
                        >
                          {isHe ? "צפייה במודעה" : "View listing"}
                        </Link>
                      )}

                      {r.listing_id && (
                        <button
                          onClick={() => deleteListing(r.listing_id!)}
                          className="danger-btn"
                        >
                          {isHe ? "הסר מודעה" : "Remove listing"}
                        </button>
                      )}

                      <button
                        onClick={() => deleteReport(r.id)}
                        className="secondary-btn"
                      >
                        {isHe ? "מחק דיווח" : "Delete report"}
                      </button>
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
              <div className="card-static">
                {isHe ? "אין משתמשים" : "No users"}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="card-static flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">
                      {u.full_name || "-"}
                    </div>

                    <div className="text-sm text-[var(--text-secondary)]">
                      {u.email || "-"}
                    </div>

                    <div className="text-sm text-[var(--text-secondary)]">
                      {u.phone || "-"} · {u.country || "-"}
                    </div>

                    <div className="text-sm text-[var(--text-secondary)] mt-2">
                      {u.is_admin ? "ADMIN" : "USER"} · {u.is_premium ? "PREMIUM" : "REGULAR"}
                    </div>

                    <div className="text-xs text-[var(--text-muted)] mt-2">
                      user: {u.id}
                    </div>

                    {u.created_at && (
                      <div className="text-xs text-[var(--text-muted)]">
                        {new Date(u.created_at).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 md:min-w-[180px]">
                    <button
                      onClick={() => togglePremium(u.id, !!u.is_premium)}
                      className={u.is_premium ? "secondary-btn" : "primary-btn"}
                    >
                      {u.is_premium
                        ? isHe
                          ? "הסר פרימיום"
                          : "Remove premium"
                        : isHe
                        ? "הפוך לפרימיום"
                        : "Make premium"}
                    </button>
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