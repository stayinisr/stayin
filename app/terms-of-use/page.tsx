"use client";

import { useLanguage } from "../../lib/LanguageContext";

const heSections = [
  {
    title: "1. כללי",
    body: [
      "האתר Stayin הינו פלטפורמה טכנולוגית לחיבור בין משתמשים המעוניינים לפרסם, לאתר, לקנות או למכור כרטיסים לאירועים.",
      "האתר אינו מוכר כרטיסים, אינו רוכש כרטיסים, אינו מחזיק בכרטיסים ואינו צד לכל עסקה בין המשתמשים.",
    ],
  },
  {
    title: "2. אחריות המשתמשים",
    body: [
      "האחריות הבלעדית לכל מודעה, למחיר המוצג בה, לנכונות המידע, לחוקיות הפרסום ולביצוע העסקה חלה על המשתמש שפרסם את המודעה ועל המשתמש שבחר להתקשר עמו.",
      "כל משתמש אחראי לוודא כי פעולותיו עומדות בכל דין רלוונטי, לרבות דיני הגנת הצרכן, דיני מסחר ודינים הנוגעים למכירה או העברה של כרטיסים.",
    ],
  },
  {
    title: "3. היעדר אחריות מצד האתר",
    body: [
      "Stayin אינו צד לעסקה, אינו מתווך, אינו גובה תשלום עבור עסקאות בין המשתמשים ואינו אחראי לתשלום, למסירה, להעברה, לביטול, לאמיתות הכרטיסים, לזהות המשתמשים או לתוכן המודעות.",
      "האתר אינו בודק ואינו יכול לאמת את נכונות המידע המפורסם, את סבירות המחירים או את חוקיות העסקה, ולכן כל שימוש באתר נעשה באחריות המשתמש בלבד.",
    ],
  },
  {
    title: "4. הסרת מודעות ושימוש אסור",
    body: [
      "האתר רשאי, לפי שיקול דעתו הבלעדי, להסיר מודעות, לחסום משתמשים או להגביל שימוש באתר במקרה של חשד להטעיה, הונאה, הפרת דין, שימוש פסול או פגיעה במשתמשים אחרים.",
      "חל איסור להשתמש באתר באופן לא חוקי, מטעה, פוגעני או כזה העלול לחשוף את האתר לאחריות.",
    ],
  },
  {
    title: "5. הגבלת אחריות",
    body: [
      "במידה המרבית המותרת לפי דין, האתר, בעליו, מנהליו ומפעיליו לא יישאו באחריות לכל נזק ישיר או עקיף הנובע מהשימוש באתר או מהסתמכות על מודעה שפורסמה בו.",
    ],
  },
];

const enSections = [
  {
    title: "1. General",
    body: [
      "Stayin is a technology platform that helps users publish, find, buy, and sell event tickets.",
      "The platform does not sell tickets, buy tickets, hold tickets, or act as a party to any transaction between users.",
    ],
  },
  {
    title: "2. User Responsibility",
    body: [
      "Each user is solely responsible for the content of their listing, the listed price, the accuracy of the information, the legality of the listing, and the transaction itself.",
      "Users are responsible for ensuring that their actions comply with all applicable laws and regulations.",
    ],
  },
  {
    title: "3. No Responsibility by the Platform",
    body: [
      "Stayin is not a party to any transaction, is not a broker, does not process payments between users, and is not responsible for payment, delivery, transfer, cancellation, authenticity of tickets, user identity, or the content of listings.",
      "The platform does not verify and cannot guarantee the accuracy of listings, the reasonableness of prices, or the legality of any transaction. Use of the platform is entirely at your own risk.",
    ],
  },
  {
    title: "4. Listing Removal and Prohibited Use",
    body: [
      "Stayin may remove listings, block users, or restrict access to the platform at its sole discretion, including in cases of suspected fraud, misleading content, unlawful activity, abuse, or harm to other users.",
      "Users may not use the platform in any unlawful, misleading, abusive, or harmful way.",
    ],
  },
  {
    title: "5. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, Stayin and its owners, operators, and administrators shall not be liable for any direct or indirect damage resulting from the use of the platform or reliance on any listing published on it.",
    ],
  },
];

export default function TermsOfUsePage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const sections = isHe ? heSections : enSections;

  return (
    <main style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 20px 72px" }}>
        <div style={{ background: "rgba(255,255,255,0.92)", border: "1px solid #e8edf5", borderRadius: "18px", boxShadow: "0 8px 30px rgba(13,27,62,0.06)", padding: "28px 24px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0d1b3e", marginBottom: "10px" }}>{isHe ? "תנאי שימוש" : "Terms of Use"}</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "26px", lineHeight: 1.8 }}>
            {isHe ? "מסמך זה מסדיר את השימוש באתר Stayin. השימוש באתר מהווה הסכמה לתנאים המפורטים להלן." : "This document governs the use of Stayin. By using the platform, you agree to the terms below."}
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
