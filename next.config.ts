import type { NextConfig } from "next";

// Restrict Next/Image loading to only the domains we actually use
// (Supabase Storage) instead of allowing every https host on the
// internet — a broad `hostname: "**"` remote pattern lets your
// server proxy/optimize (and thus fetch) arbitrary attacker-supplied
// image URLs (SSRF-adjacent risk) and defeats the point of an
// allowlist.
//
// If you use a custom Supabase project, replace the hostname below
// with your own `<project-ref>.supabase.co`, or set
// NEXT_PUBLIC_SUPABASE_URL and this config will pick it up.
const supabaseHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const securityHeaders = [
  // Prevent the site from being embedded in an iframe elsewhere (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Force HTTPS for a year, including subdomains.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Stop browsers from MIME-sniffing responses away from the declared Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak the full referring URL to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Limit powerful browser features by default.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
      // Fallback allowlist for local/dev/demo Supabase projects.
      { protocol: "https" as const, hostname: "*.supabase.co" },
      // Unsplash images (used for venues, events, and mock data)
      { protocol: "https" as const, hostname: "images.unsplash.com" },
      // Google avatar images (for OAuth users)
      { protocol: "https" as const, hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
