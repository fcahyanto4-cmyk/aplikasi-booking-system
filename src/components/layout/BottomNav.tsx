"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Trophy, Ticket, User } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  match: (pathname: string, hash: string) => boolean;
}

const navItems: NavItem[] = [
  {
    label: "Beranda",
    href: "/",
    icon: Home,
    match: (p, h) => p === "/" && (!h || h === "#"),
  },
  {
    label: "Jadwal",
    href: "/jadwal",
    icon: Calendar,
    match: (p) => p.startsWith("/jadwal"),
  },
  {
    label: "Event",
    href: "/event",
    icon: Trophy,
    match: (p) => p.startsWith("/event"),
  },
  {
    label: "Tiket Saya",
    href: "/profil#tiket",
    icon: Ticket,
    match: (p, h) => p.startsWith("/profil") && h === "#tiket",
  },
  {
    label: "Profil",
    href: "/profil",
    icon: User,
    match: (p, h) => p.startsWith("/profil") && h !== "#tiket",
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Hide when scrolling down fast, show when scrolling up
          if (currentY > lastScrollY + 30 && currentY > 120) {
            setIsVisible(false);
          } else if (currentY < lastScrollY - 15 || currentY < 80) {
            setIsVisible(true);
          }
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Don't show on admin pages or auth pages
  if (
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Navigasi Bawah Seluler"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/92 backdrop-blur-xl border-t border-border/80 transition-transform duration-300 shadow-[0_-8px_24px_rgba(0,0,0,0.25)] ${
        isVisible ? "translate-y-0" : "translate-y-full"
      } pb-[max(0.6rem,env(safe-area-inset-bottom))]`}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname, currentHash);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => {
                if (item.href.includes("#")) {
                  setCurrentHash(item.href.substring(item.href.indexOf("#")));
                } else {
                  setCurrentHash("");
                }
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 transition-colors duration-200 group ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {/* Active Indicator Top Pill */}
              {isActive && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-primary shadow-[0_0_8px_rgba(111,197,164,0.9)] animate-in fade-in duration-200" />
              )}

              <div
                className={`p-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/15 scale-110 shadow-[0_0_12px_rgba(111,197,164,0.2)]"
                    : "group-hover:bg-surface-hover group-active:scale-95"
                }`}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-text-muted"} />
              </div>

              <span className="text-[11px] tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
