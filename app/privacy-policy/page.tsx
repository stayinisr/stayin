"use client";

import { useLanguage } from "../../lib/LanguageContext";

const heSections = [
  { title: "1. מידע שנאסף", body: ["בעת השימוש באתר ייתכן שייאסף מידע כגון שם, כתובת אימייל, מספר טלפון, פרטי פרופיל, פרטי מודעות ונתוני שימוש בסיסיים באתר."] },
  { title: "2. מטרות השימוש במידע", body: ["המידע נאסף לצורך תפעול האתר, ניהול חשבונות משתמשים, הצגת מודעות, יצירת קשר בין משתמשים, שיפור השירות ואכיפת תנאי השימוש."] },
  { title: "3. מסירת מידע לצדדים שלישיים", body: ["האתר אינו מוכר מידע אישי לצדדים שלישיים. עם זאת, ייתכן שמידע ייחשף אם הדבר נדרש לפי דין, לצורך אכיפת תנאי השימוש או לשם הגנה על זכויות האתר ומשתמשיו."] },
  { title: "4. אבטחת מידע", body: ["האתר נוקט אמצעים סבירים לשמירה על המידע, אך אינו יכול להבטיח אבטחה מוחלטת."] },
  { title: "5. יצירת קשר", body: ["לשאלות בנוגע לפרטיות או לבקשות בקשר למידע אישי, ניתן לפנות דרך עמוד יצירת הקשר באתר."] },
];

const enSections = [
  { title: "1. Information We Collect", body: ["While using the platform, we may collect information such as your name, email address, phone number, profile details, listing details, and basic usage information."] },
  { title: "2. Why We Use the Information", body: ["We use this information to operate the platform, manage user accounts, display listings, connect users, improve the service, and enforce our Terms of Use."] },
  { title: "3. Sharing Information with Third Parties", body: ["We do not sell personal information to third parties. However, information may be disclosed if required by law, for enforcement of the Terms of Use, or to protect the rights of the platform and its users."] },
  { title: "4. Data Security", body: ["We take reasonable measures to protect your information, but cannot guarantee absolute security."] },
  { title: "5. Contact", body: ["If you have questions about privacy or requests regarding personal information, please contact us through the Contact page on the platform."] },
];

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const sections = isHe ? heSections : enSections;

  return (
    <main style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 20px 72px" }}>
        <div style={{ background: "rgba(255,255,255,0.92)", border: "1px solid #e8edf5", borderRadius: "18px", boxShadow: "0 8px 30px rgba(13,27,62,0.06)", padding: "28px 24px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0d1b3e", marginBottom: "10px" }}>{isHe ? "מדיניות פרטיות" : "Privacy Policy"}</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "26px", lineHeight: 1.8 }}>
            {isHe ? "מסמך זה מסביר איזה מידע נאסף באתר Stayin, כיצד הוא משמש ומהן זכויות המשתמשים בקשר אליו." : "This document explains what information is collected by Stayin, how it is used, and what rights users have regarding that information."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {sections.map((section) => (
              <section key={section.title}>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0d1b3e", marginBottom: "8px" }}>{section.title}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {section.body.map((paragraph) => (
                    <p key={paragraph} style={{ fontSize: "14px", color: "#334155", lineHeight: 1.9 }}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
