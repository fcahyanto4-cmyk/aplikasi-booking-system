import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ClientNavbar, ClientFooter } from "@/components/layout/ClientLayoutWrapper";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Yuk Main Bola — Komunitas Minisoccer",
  description:
    "Komunitas minisoccer terbuka untuk semua. Gabung mabar, temukan jadwal, dan mainkan bolamu bersama kami.",
  keywords: ["minisoccer", "futsal", "komunitas", "mabar", "bola"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  // The Midtrans Snap.js SDK URL differs between sandbox and
  // production — it must match MIDTRANS_IS_PRODUCTION / the server
  // key's environment, or payments will fail/mismatch in production.
  const midtransSnapUrl =
    process.env.MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html lang="id" className="dark">
      <head>
        <script 
          type="text/javascript"
          src={midtransSnapUrl}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          async
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-text min-h-screen flex flex-col`}>
        <ClientNavbar user={user} profile={profile} />
        <main>{children}</main>
        <ClientFooter />
        <Toaster />
      </body>
    </html>
  );
}
