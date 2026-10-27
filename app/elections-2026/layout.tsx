import type { Metadata } from "next";
import { Frank_Ruhl_Libre } from "next/font/google";

const ballot = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["900"],
  variable: "--font-ballot",
  display: "swap",
});

export const metadata: Metadata = {
  title: "תחזית הכנסת ה-26 | Stayin",
  description: "חלקו 120 מנדטים לפי ההערכה שלכם וראו את ממוצע כל התחזיות.",
};

export default function ElectionsLayout({ children }: { children: React.ReactNode }) {
  return <div className={ballot.variable}>{children}</div>;
}
