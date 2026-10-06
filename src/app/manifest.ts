import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yuk Main Bola — Komunitas Minisoccer",
    short_name: "YukMainBola",
    description:
      "Komunitas minisoccer terbuka untuk semua. Gabung mabar, temukan jadwal, dan mainkan bolamu bersama kami.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1c15",
    theme_color: "#0a1c15",
    orientation: "portrait",
    icons: [
      {
        src: "/images/YMB.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/YMB.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
