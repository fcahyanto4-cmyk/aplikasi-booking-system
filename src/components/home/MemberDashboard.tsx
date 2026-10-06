"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Ticket,
  Coins,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { formatDate, formatCurrency, formatTime, formatShortDate } from "@/lib/utils/format";
import type { ScheduleWithVenue, EventWithVenue, Profile, BookingWithSchedule } from "@/types/database";

interface MemberDashboardProps {
  profile: Profile | null;
  email: string;
  upcomingBooking: BookingWithSchedule | null;
  activeBookingsCount: number;
  activeEventsCount: number;
  schedules: ScheduleWithVenue[];
  events: EventWithVenue[];
}

export default function MemberDashboard({
  profile,
  email,
  upcomingBooking,
  activeBookingsCount,
  activeEventsCount,
  schedules,
  events,
}: MemberDashboardProps) {
  const points = profile?.points_balance || 0;
  const fullName = profile?.full_name || "Member";

  // Compute event date range if any
  const eventDateRange = events.length > 0
    ? events.length === 1
      ? `Tgl ${formatShortDate(events[0].date)}`
      : `Tgl ${formatShortDate(events[0].date)} s/d ${formatShortDate(events[events.length - 1].date)}`
    : null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* 1. Welcome & Status Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface to-primary/10 border border-border p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck size={14} />
                <span>Member Komunitas Resmi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text tracking-tight">
                Halo, {fullName}! ⚽
              </h1>
              <p className="text-text-muted text-sm sm:text-base mt-1 max-w-xl">
                Selamat datang kembali. Cek jadwal mabar terdekat, amankan slot posisimu, dan kumpulkan poin loyalitas setiap bermain.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
              <Link
                href="/profil"
                className="flex items-center gap-3 bg-background/80 hover:bg-background border border-border/80 hover:border-primary/40 px-4 py-3 rounded-2xl transition-all shadow-sm group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold">
                  <Coins size={20} />
                </div>
                <div>
                  <div className="text-[11px] text-text-muted font-medium">Saldo Poin</div>
                  <div className="text-base font-black text-text group-hover:text-accent transition-colors">
                    {points.toLocaleString("id-ID")} <span className="text-xs font-normal text-text-muted">pts</span>
                  </div>
                </div>
              </Link>

              <Link
                href="/profil#tiket"
                className="flex items-center gap-3 bg-background/80 hover:bg-background border border-border/80 hover:border-primary/40 px-4 py-3 rounded-2xl transition-all shadow-sm group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                  <Ticket size={20} />
                </div>
                <div>
                  <div className="text-[11px] text-text-muted font-medium">Tiket Aktif</div>
                  <div className="text-base font-black text-text group-hover:text-primary transition-colors">
                    {activeBookingsCount} <span className="text-xs font-normal text-text-muted">tiket</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Next Match Spotlight (if user has active booked match) */}
        {upcomingBooking && upcomingBooking.schedules && (
          <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-surface p-5 sm:p-6 shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <Sparkles size={14} className="text-primary animate-pulse" />
                  <span>Pertandingan Terdekat Kamu</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-text">
                  {upcomingBooking.schedules.venues?.name || "Minisoccer Venue"}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted pt-1">
                  <span className="flex items-center gap-1 font-semibold text-text">
                    <Calendar size={13} className="text-primary" />
                    {formatDate(upcomingBooking.schedules.date)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-text">
                    <Clock size={13} className="text-primary" />
                    {formatTime(upcomingBooking.schedules.start_time)} - {formatTime(upcomingBooking.schedules.end_time)} WIB
                  </span>
                  <span>•</span>
                  <span className="text-primary font-bold">
                    {upcomingBooking.quantity} Slot Dipesan
                  </span>
                </div>
              </div>

              <Link
                href="/profil#tiket"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs sm:text-sm hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
              >
                <Ticket size={16} />
                <span>Lihat Barcode Tiket</span>
              </Link>
            </div>
          </div>
        )}

        {/* 3. Quick Action Hub (3 Pillars) */}
        <div>
          <h2 className="text-lg font-black text-text mb-4 flex items-center gap-2">
            <span>Akses Menu Member</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Jadwal Mabar */}
            <Link
              href="/jadwal"
              className="group bg-surface hover:bg-surface-hover rounded-2xl p-5 border border-border hover:border-primary/50 transition-all duration-200 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Calendar size={24} />
                </div>
                <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">
                  Katalog Jadwal Mabar
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Cari sesi mabar harian, pilih venue dan jam kickoff, lalu amankan slot posisimu.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                <span>Lihat Semua Jadwal</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Action 2: Event & Turnamen */}
            <Link
              href="/event"
              className="group bg-surface hover:bg-surface-hover rounded-2xl p-5 border border-border hover:border-accent/50 transition-all duration-200 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Trophy size={24} />
                </div>
                <h3 className="text-base font-bold text-text group-hover:text-accent transition-colors">
                  Event & Turnamen
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Ikuti liga resmi musim ini, turnamen piala, atau ikuti coaching clinic bersama pro.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-accent">
                <span>Jelajahi Turnamen</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Action 3: Tiket & Profil */}
            <Link
              href="/profil"
              className="group bg-surface hover:bg-surface-hover rounded-2xl p-5 border border-border hover:border-primary/50 transition-all duration-200 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Ticket size={24} />
                </div>
                <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">
                  Tiket & Riwayat Saya
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Akses barcode tiket check-in di venue, pantau riwayat pertandingan, dan tukar poin.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                <span>Buka Tiket & Profil</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* 4. Rekomendasi Jadwal Mabar Terdekat */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-text flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <span>Rekomendasi Mabar Terdekat</span>
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Slot mabar terdekat yang masih tersedia untuk kamu ikuti
              </p>
            </div>
            <Link
              href="/jadwal"
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Buka Katalog Jadwal</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {schedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {schedules.slice(0, 3).map((schedule) => {
                const slotsLeft = Math.max(0, schedule.max_players - schedule.current_players);
                const isFull = slotsLeft <= 0;

                return (
                  <div
                    key={schedule.id}
                    className="bg-surface rounded-2xl p-5 border border-border hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-text text-base group-hover:text-primary transition-colors line-clamp-1">
                          {schedule.venues?.name || "Minisoccer Venue"}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                            isFull
                              ? "bg-danger/10 text-danger border-danger/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {isFull ? "Penuh" : `${slotsLeft} slot`}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-text-muted mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-primary shrink-0" />
                          <span className="font-semibold text-text">{formatDate(schedule.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-primary shrink-0" />
                          <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)} WIB</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-primary shrink-0" />
                          <span className="truncate">{schedule.venues?.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-text-muted">Biaya / orang</div>
                        <div className="font-bold text-text text-sm">
                          {formatCurrency(schedule.price_per_person)}
                        </div>
                      </div>
                      <Link
                        href={`/jadwal/${schedule.id}`}
                        className="px-4 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover transition-all"
                      >
                        {isFull ? "Lihat Jadwal" : "Amankan Slot"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface rounded-2xl p-6 border border-border text-center text-sm text-text-muted">
              Belum ada jadwal mabar aktif saat ini.
            </div>
          )}
        </div>

        {/* 5. Agenda & Rekapan Event Terdekat */}
        {events.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-text flex items-center gap-2">
                  <Trophy size={18} className="text-accent" />
                  <span>Agenda Event & Turnamen</span>
                  {eventDateRange && (
                    <span className="text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                      {eventDateRange}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Turnamen dan kompetisi bergengsi komunitas Yuk Main Bola
                </p>
              </div>
              <Link
                href="/event"
                className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Semua Event</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="bg-surface rounded-2xl p-5 border border-border hover:border-accent/40 transition-all flex flex-col justify-between shadow-sm group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                      <span className="text-accent font-bold uppercase tracking-wider text-[10px]">
                        Event Resmi
                      </span>
                      <span>
                        {event.current_participants}/{event.max_participants} tim/peserta
                      </span>
                    </div>

                    <h3 className="font-bold text-text text-base group-hover:text-accent transition-colors line-clamp-1 mb-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-xs text-text-muted mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-accent shrink-0" />
                        <span className="font-semibold text-text">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-accent shrink-0" />
                        <span>{formatTime(event.start_time)} - {formatTime(event.end_time)} WIB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-accent shrink-0" />
                        <span className="truncate">{event.venues?.name || "Venue TBA"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-3">
                    <div className="font-bold text-accent text-sm">
                      {event.price === 0 ? "Gratis" : formatCurrency(event.price)}
                    </div>
                    <Link
                      href={`/event/${event.id}`}
                      className="px-4 py-2 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/90 transition-all"
                    >
                      Daftar Event
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
