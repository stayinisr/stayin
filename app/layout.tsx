import "./globals.css";
import Navbar from "../components/Navbar";
import ToastProvider from "../components/ToastProvider";
import { LanguageProvider } from "../lib/LanguageContext";
import { Heebo, Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import type { Metadata } from "next";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-he",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stayin — Stay in the Game",
  description: "Buy and sell World Cup 2026 tickets. Real listings from real fans.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${jakarta.variable} ${dmSans.variable}`}>
      <body style={{ margin: 0, padding: 0, fontFamily: "var(--font-dm), var(--font-he), sans-serif" }}>
        <LanguageProvider>
          <ToastProvider>
            <Navbar />
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}