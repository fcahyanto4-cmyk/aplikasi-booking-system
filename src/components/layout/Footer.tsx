"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Camera } from "lucide-react";

interface FooterProps {
  isLoggedIn?: boolean;
}

// Guest quick links (landing page anchors)
const guestQuickLinks = [
  { label: "Jadwal", href: "/#jadwal" },
  { label: "Galeri", href: "/#galeri" },
  { label: "Testimoni", href: "/#testimoni" },
  { label: "Venue", href: "/#venue" },
  { label: "Masuk", href: "/login" },
  { label: "Daftar", href: "/register" },
];

// Member quick links (actual pages)
const memberQuickLinks = [
  { label: "Jadwal Mabar", href: "/jadwal" },
  { label: "Event & Turnamen", href: "/event" },
  { label: "Notifikasi", href: "/notifications" },
  { label: "Profil Saya", href: "/profil" },
  { label: "Tiket Saya", href: "/profil#tiket" },
];

const contactLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/6281234567890",
    icon: Phone,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/yukmainbola",
    icon: Camera,
  },
  {
    label: "Email",
    href: "mailto:halo@yukmainbola.id",
    icon: Mail,
  },
];

export default function Footer({ isLoggedIn = false }: FooterProps) {
  const quickLinks = isLoggedIn ? memberQuickLinks : guestQuickLinks;

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image src="/images/YMB.png" alt="Yuk Main Bola Logo" width={56} height={56} className="object-contain" />
              <span className="text-xl font-bold text-text">
                Yuk Main Bola
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              Komunitas minisoccer terbuka untuk semua kalangan. Temukan jadwal
              mabar, gabung tim, dan nikmati serunya bermain bola bersama.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-text font-semibold mb-4">
              {isLoggedIn ? "Menu Member" : "Tautan Cepat"}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-primary text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-text font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3">
              {contactLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-text-muted hover:text-primary text-sm transition-colors duration-200"
                  >
                    <link.icon size={16} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-center text-text-muted text-sm">
            © 2026 Yuk Main Bola. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
