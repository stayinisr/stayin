import type { NextConfig } from "next";

// AlfaMath (alfamath.co.il) is served from static files in public/homework.
const ALFAMATH_HOSTS = ["alfamath.co.il", "www.alfamath.co.il"];
const alfamathRoutes: [string, string][] = [
  ["/", "/homework/home.html"],
  ["/app", "/homework/index.html"],
  ["/manifest.json", "/homework/manifest.json"],
  ["/icon-192.png", "/homework/icon-192.png"],
  ["/icon-512.png", "/homework/icon-512.png"],
  ["/robots.txt", "/homework/robots.txt"],
  ["/sitemap.xml", "/homework/sitemap.xml"], ["/sw.js", "/homework/sw.js"],
  ["/terms", "/homework/terms.html"],
  ["/privacy", "/homework/privacy.html"], ["/guide", "/homework/guide.html"],
];

const nextConfig: NextConfig = {
  // short, shareable links on the AlfaMath domain
  async redirects() {
    return ALFAMATH_HOSTS.flatMap((host) => [
      { source: "/teachers", destination: "/", permanent: false, has: [{ type: "host" as const, value: host }] },
      { source: "/join/:code", destination: "/app#/join/:code", permanent: false, has: [{ type: "host" as const, value: host }] },
    ]);
  },
  async rewrites() {
    return {
      beforeFiles: ALFAMATH_HOSTS.flatMap((host) =>
        alfamathRoutes.map(([source, destination]) => ({
          source,
          destination,
          has: [{ type: "host" as const, value: host }],
        })),
      ),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
