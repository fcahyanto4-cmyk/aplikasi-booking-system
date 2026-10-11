"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

export function ClientNavbar({ user, profile }: { user: User | null; profile: Profile | null }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Navbar user={user} profile={profile} />;
}

export function ClientFooter({ user }: { user: User | null }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Footer isLoggedIn={!!user} />;
}

export function ClientBottomNav({ user }: { user: User | null }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  // Only show bottom nav for logged-in members
  if (!user) return null;
  return <BottomNav />;
}
