"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Trophy, Users, ArrowRight, Sparkles } from "lucide-react";
import { formatCurrency, formatTime, formatShortDate } from "@/lib/utils/format";
import type { EventWithVenue } from "@/types/database";

interface EventRecapSectionProps {
  events: EventWithVenue[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

const INDO_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const INDO_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export default function EventRecapSection({
  events,
  title = "Rekapan Jadwal & Agenda Event",
  subtitle = "Rangkuman turnamen, liga, dan agenda kompetisi komunitas Yuk Main Bola.",
  compact = false,
}: EventRecapSectionProps) {
  // Sort events by date ascending
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  // Calculate recap date range: "Tgl 07 Okt s/d 28 Okt 2026"
  const dateRangeText = useMemo(() => {
    if (sortedEvents.length === 0) return null;
    const firstDate = sortedEvents[0].date;
    const lastDate = sortedEvents[sortedEvents.length - 1].date;

    if (firstDate === lastDate) {
      return `Tgl ${formatShortDate(firstDate)}`;
    }
    return `Tgl ${formatShortDate(firstDate)} s/d ${formatShortDate(lastDate)}`;
  }, [sortedEvents]);

  if (sortedEvents.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-surface via-surface to-accent/5 rounded-2xl border border-accent/20 p-5 sm:p-6 mb-8 shadow-sm">
      {/* Header section with Date Range Recap */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/70">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-accent" />
            <span>Rekapan Event Terjadwal</span>
            {dateRangeText && (
              <span className="bg-background/80 px-2 py-0.5 rounded-full text-text font-black ml-1 text-[11px] border border-border">
                {dateRangeText}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text tracking-tight flex items-center gap-2">
            <Trophy size={22} className="text-accent shrink-0" />
            <span>{title}</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-text-muted font-medium">Total Agenda</div>
            <div className="text-lg font-black text-accent">{sortedEvents.length} Event Aktif</div>
          </div>
          <Link
            href="/event"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/90 transition-all shadow-md shadow-accent/20"
          >
            <span>Semua Event</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recap Cards Grid */}
      <div className={`grid gap-4 mt-5 ${compact ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
        {sortedEvents.map((event) => {
          const d = new Date(`${event.date}T00:00:00`);
          const dayName = INDO_DAYS[d.getDay()] || "Hari";
          const dateNum = d.getDate();
          const monthName = INDO_MONTHS_SHORT[d.getMonth()] || "Bln";
          const year = d.getFullYear();

          const venue = event.venues;
          const slotsLeft = Math.max(0, event.max_participants - event.current_participants);
          const isFull = slotsLeft <= 0 || event.status === "completed";

          return (
            <div
              key={event.id}
              className="bg-background/90 rounded-xl p-4 border border-border hover:border-accent/50 transition-all duration-200 hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                {/* Date highlight bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-surface border border-accent/30 text-center">
                      <span className="text-[10px] font-bold text-accent uppercase leading-tight">
                        {monthName}
                      </span>
                      <span className="text-base font-black text-text leading-none">
                        {dateNum}
                      </span>
                      <span className="text-[9px] text-text-muted">
                        {year}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text flex items-center gap-1">
                        <Calendar size={12} className="text-accent" />
                        <span>{dayName}, {dateNum} {monthName} {year}</span>
                      </div>
                      <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-primary" />
                        <span>{formatTime(event.start_time)} - {formatTime(event.end_time)} WIB</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                      isFull
                        ? "bg-danger/10 text-danger border-danger/20"
                        : "bg-accent/10 text-accent border-accent/30"
                    }`}
                  >
                    {isFull ? "Penuh" : `Sisa ${slotsLeft}`}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="font-bold text-sm text-text line-clamp-1 group-hover:text-accent transition-colors">
                  {event.title}
                </h3>

                {/* Venue */}
                <div className="flex items-center gap-1.5 text-xs text-text-muted mt-2">
                  <MapPin size={12} className="text-primary shrink-0" />
                  <span className="truncate">{venue?.name || "Venue TBA"}</span>
                </div>

                {/* Participants & Fee */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1 text-text-muted">
                    <Users size={12} className="text-primary" />
                    <span>{event.current_participants}/{event.max_participants} tim/peserta</span>
                  </div>
                  <div className="font-bold text-accent">
                    {event.price === 0 ? "Gratis" : formatCurrency(event.price)}
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-4 pt-3 border-t border-border/40">
                <Link
                  href={`/event/${event.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg bg-surface hover:bg-accent hover:text-background text-text border border-border hover:border-accent transition-all"
                >
                  <span>Daftar / Lihat Detail</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
