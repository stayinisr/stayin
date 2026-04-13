"use client";

import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";

export default function SuccessModal({
  matchId,
}: {
  matchId: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="modal-overlay">
      <div className="modal-card text-center">
        <h2 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">
          🎉 {t.createListingSuccess}
        </h2>

        <p className="text-[var(--text-secondary)] mb-6">
          {t.listingLive}
        </p>

        <div className="flex flex-col gap-3">
          <Link href={`/matches/${matchId}`} className="primary-btn">
            {t.viewListing}
          </Link>

          <Link href="/" className="secondary-btn">
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}