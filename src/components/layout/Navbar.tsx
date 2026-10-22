"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, LogOut, User, Shield } from "lucide-react";
import type { Profile } from "@/types/database";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavbarProps {
  user: SupabaseUser | null;
  profile: Profile | null;
}

// Navigation links for guests (landing page sections)
const guestNavLinks = [
  { label: "Jadwal", href: "/#jadwal" },
  { label: "Galeri", href: "/#galeri" },
  { label: "Testimoni", href: "/#testimoni" },
  { label: "Venue", href: "/#venue" },
];

// Navigation links for logged-in members
const memberNavLinks = [
  { label: "Beranda", href: "/" },
  { label: "Jadwal Mabar", href: "/jadwal" },
  { label: "Event", href: "/event" },
  { label: "Notifikasi", href: "/notifications" },
];

export default function Navbar({ user, profile }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = !!(user && profile);
  const navLinks = isLoggedIn ? memberNavLinks : guestNavLinks;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);

    // Handle hash links (e.g., "/#jadwal")
    if (href.includes("#")) {
      const hashPart = href.substring(href.indexOf("#"));
      const pathPart = href.substring(0, href.indexOf("#")) || "/";

      if (pathname === pathPart || (pathPart === "/" && pathname === "/")) {
        // Same page – smooth scroll
        const element = document.querySelector(hashPart);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      // Different page – navigate then scroll
      router.push(href);
    } else {
      router.push(href);
    }
  };

  const isActiveLink = (href: string) => {
    // Hash links (e.g., /#jadwal) should never show as "active" in the navbar
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) ?? false;
  };

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/images/YMB.png" alt="Yuk Main Bola Logo" width={48} height={48} className="object-contain group-hover:opacity-80 transition-opacity" />
            <span className="text-xl font-bold text-text group-hover:opacity-80 transition-opacity hidden sm:block">
              Yuk Main Bola
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  isActiveLink(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-text-muted hover:text-primary hover:bg-surface/60"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary-muted text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-text text-sm font-medium">
                    {profile.full_name}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-surface border-border"
                >
                  <DropdownMenuItem
                    onClick={() => router.push("/profil")}
                    className="flex items-center gap-2 text-text cursor-pointer"
                  >
                    <User size={16} />
                    Profil
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin")}
                      className="flex items-center gap-2 text-text cursor-pointer"
                    >
                      <Shield size={16} />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-danger cursor-pointer"
                  >
                    <LogOut size={16} />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="border-accent/40 text-accent hover:bg-accent/15 text-xs font-semibold rounded-lg shadow-sm"
                >
                  ✨ Akun Tamu
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/login")}
                  className="text-text-muted hover:text-text hover:bg-surface"
                >
                  Masuk
                </Button>
                <Button
                  onClick={() => router.push("/register")}
                  className="bg-primary hover:bg-primary-hover text-background font-semibold rounded-lg transition-all duration-300"
                >
                  Daftar
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger className="md:hidden">
              <div className="inline-flex items-center justify-center h-10 w-10 text-text hover:bg-surface rounded-md transition-colors">
                <Menu size={24} />
              </div>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-surface border-border w-[280px]"
            >
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <div className="flex flex-col h-full pt-8">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className={`text-left text-lg py-2.5 px-3 rounded-lg font-medium transition-all duration-200 ${
                        isActiveLink(link.href)
                          ? "text-primary bg-primary/10"
                          : "text-text hover:text-primary hover:bg-surface-hover"
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>

                <div className="mt-auto pb-8 space-y-3">
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary-muted text-primary text-sm font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-text font-medium text-sm">
                            {profile.full_name}
                          </p>
                          <p className="text-text-muted text-xs capitalize">
                            {profile.role}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/profil"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-text hover:text-primary py-2 transition-colors"
                      >
                        <User size={18} />
                        Profil
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 text-text hover:text-primary py-2 transition-colors"
                        >
                          <Shield size={18} />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-danger hover:text-danger-hover py-2 transition-colors w-full text-left"
                      >
                        <LogOut size={18} />
                        Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push("/login");
                        }}
                        className="w-full justify-center border-accent/40 text-accent hover:bg-accent/15 font-semibold rounded-lg text-sm"
                      >
                        ✨ Coba Akun Tamu
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push("/login");
                        }}
                        className="w-full justify-center text-text-muted hover:text-text hover:bg-background"
                      >
                        Masuk
                      </Button>
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push("/register");
                        }}
                        className="w-full justify-center bg-primary hover:bg-primary-hover text-background font-semibold rounded-lg"
                      >
                        Daftar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
