"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";
import AddToHomeModal from "./AddToHomeModal";
import { canShowAddToHome, dismissAddToHome } from "../lib/addToHome";

export default function SuccessModal({
  matchId,
}: {
  matchId: string;
}) {
  const { t, lang } = useLanguage();
  const isHe = lang === "he";

  const [showAddToHomeAction, setShowAddToHomeAction] = useState(false);
  const [openAddToHomeModal, setOpenAddToHomeModal] = useState(false);

  useEffect(() => {
    setShowAddToHomeAction(canShowAddToHome("a2hs_after_listing_hidden_until"));
  }, []);

  function handleDismissAddToHome() {
    dismissAddToHome("a2hs_after_listing_hidden_until", 10);
    setOpenAddToHomeModal(false);
    setShowAddToHomeAction(false);
  }

  return (
    <>
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

            {showAddToHomeAction && (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setOpenAddToHomeModal(true)}
                style={{ width: "100%" }}
              >
                {isHe ? "הוסף את Stayin למסך הבית" : "Add Stayin to home screen"}
              </button>
            )}
          </div>
        </div>
      </div>

      <AddToHomeModal
        open={openAddToHomeModal}
        onClose={handleDismissAddToHome}
        title={isHe ? "רוצה לחזור מהר למודעה?" : "Want quick access to your listing?"}
        description={
          isHe
            ? "שמור את Stayin במסך הבית ופתח את האתר בלחיצה אחת."
            : "Save Stayin to your home screen and open it in one tap."
        }
      />
    </>
  );
}