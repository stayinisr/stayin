"use client";

import { motion } from "framer-motion";
import {
  Search,
  Ticket,
  ShieldCheck,
  MessageCircle,
  MapPin,
  CalendarDays,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const listings = [
  {
    match: "Argentina vs Netherlands",
    city: "Los Angeles",
    date: "Jul 11",
    price: "$420",
    tag: "2 Tickets",
  },
  {
    match: "Brazil vs Spain",
    city: "Miami",
    date: "Jul 14",
    price: "$510",
    tag: "Great View",
  },
  {
    match: "England vs France",
    city: "Dallas",
    date: "Jul 18",
    price: "$380",
    tag: "Last Chance",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: "easeOut" },
};

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen bg-[#06131f] text-white overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.18),transparent_30%),linear-gradient(to_bottom,#06131f,#081826,#0a1d2d)]" />
        <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute top-40 right-0 h-[320px] w-[320px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-0 top-[420px] h-[240px] w-[240px] rounded-full bg-teal-300/10 blur-3xl" />

        <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-24 md:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-200 backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Smarter ticket marketplace for real fans
              </div>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                Buy and sell tickets
                <span className="block bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 bg-clip-text text-transparent">
                  without the chaos
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Stayin makes it easy to find the right match, compare listings,
                and connect directly with sellers in one clean and trusted place.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
                  Explore Tickets
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10">
                  Sell Your Ticket
                </button>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { label: "Active Listings", value: "12.4K+" },
                  { label: "Host Cities", value: "16" },
                  { label: "Direct Deals", value: "No Fees" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="text-xl font-semibold text-white">
                      {item.value}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="relative"
            >
              <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-cyan-900/20 backdrop-blur-2xl">
                <div className="rounded-[28px] border border-white/10 bg-[#0b1724]/90 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Live marketplace</p>
                      <h2 className="text-lg font-semibold">Trending matches</h2>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      Updated now
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {["Final", "Semi Final", "New York", "Miami", "Best Value"].map(
                      (chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                        >
                          {chip}
                        </span>
                      )
                    )}
                  </div>

                  <div className="space-y-3">
                    {listings.map((listing, i) => (
                      <motion.div
                        key={listing.match}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
                        className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-cyan-200">
                              <TrendingUp className="h-3.5 w-3.5" />
                              Popular listing
                            </div>
                            <h3 className="mt-2 text-sm font-semibold text-white sm:text-base">
                              {listing.match}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {listing.city}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {listing.date}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-semibold text-white">
                              {listing.price}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              {listing.tag}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">
                          Need a specific match?
                        </div>
                        <div className="mt-1 text-xs text-slate-300">
                          Filter by city, stage, teams, and budget in seconds.
                        </div>
                      </div>
                      <button className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-950">
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-10 top-10 hidden w-44 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl xl:block">
                  <div className="text-xs text-slate-300">Fast contact</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                    <MessageCircle className="h-4 w-4 text-cyan-300" />
                    Chat directly
                  </div>
                </div>

                <div className="absolute -bottom-8 right-6 hidden w-48 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl xl:block">
                  <div className="text-xs text-slate-300">Verified feel</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    Cleaner buying flow
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <section className="relative mx-auto max-w-7xl px-6 pb-8 md:px-10">
        <motion.div
          {...fadeUp}
          className="grid gap-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl md:grid-cols-3"
        >
          {[
            {
              icon: Search,
              title: "Find faster",
              text: "Search by match, city, teams, or stage without endless scrolling in chats.",
            },
            {
              icon: Ticket,
              title: "List easily",
              text: "Post your tickets clearly with price, quantity, and match details in minutes.",
            },
            {
              icon: ShieldCheck,
              title: "Feel safer",
              text: "A cleaner flow gives buyers and sellers more clarity and less confusion.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/8 bg-[#0b1724]/80 p-5"
            >
              <item.icon className="h-5 w-5 text-cyan-300" />
              <h3 className="mt-4 text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <motion.div {...fadeUp} className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
            Built for modern ticket trading
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A cleaner way to connect buyers and sellers
          </h2>
          <p className="mt-4 text-slate-400">
            Instead of repeated posts, messy chats, and missed messages, Stayin
            brings everything into one structured and simple experience.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            {...fadeUp}
            className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-6"
          >
            <div className="mb-5 inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
              For buyers
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li>Find relevant listings faster</li>
              <li>Compare price and quantity clearly</li>
              <li>Contact sellers directly without noise</li>
              <li>Feel like you are using a real platform, not a random group</li>
            </ul>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-6"
          >
            <div className="mb-5 inline-flex rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
              For sellers
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li>Post once instead of publishing again and again</li>
              <li>Show your ticket details in a clean way</li>
              <li>Get more serious buyers with less friction</li>
              <li>Look more trustworthy from the first interaction</li>
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-r from-cyan-400/10 via-white/[0.04] to-blue-400/10 p-8 md:p-10"
        >
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
                Design direction preview
              </div>
              <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                Modern, lighter, sharper, and more alive
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                This direction pushes Stayin away from a classic landing page and
                closer to a real product experience with depth, motion, clarity,
                and stronger visual confidence.
              </p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
              Use this direction
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}