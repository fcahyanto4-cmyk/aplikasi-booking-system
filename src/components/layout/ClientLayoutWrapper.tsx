"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

export function ClientNavbar({ user, profile }: { user: User | null; profile: Profile | null }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Navbar user={user} profile={profile} />;
}

export function ClientFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Footer />;
}
