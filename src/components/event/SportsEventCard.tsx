"use client";

import Link from "next/link";
import { Clock, MapPin, Users, Trophy, Flame, ArrowRight, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { EventWithVenue } from "@/types/database";

interface SportsEventCardProps {
  event: EventWithVenue;
}

const INDO_DAYS = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
const INDO_MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MEI", "JUN",
  "JUL", "AGU", "SEP", "OKT", "NOV", "DES"
];

export default function SportsEventCard({ event }: SportsEventCardProps) {
  const venue = event.venues;
  const availableSlots = Math.max(0, event.max_participants - event.current_participants);
  const isFull = availableSlots <= 0 || event.status === "completed" || event.status === "cancelled";
  const percentFilled = Math.min(
    100,
    Math.round((event.current_participants / event.max_participants) * 100)
  );

  // Date parsing
  const eventDate = new Date(`${event.date}T00:00:00`);
  const dayName = INDO_DAYS[eventDate.getDay()] || "HARI";
  const dateNum = eventDate.getDate();
  const monthName = INDO_MONTHS[eventDate.getMonth()] || "BLN";

  // Urgency indicator color
  let progressColor = "bg-primary";
  if (percentFilled > 85 || isFull) {
    progressColor = "bg-danger shadow-[0_0_10px_rgba(239,68,68,0.7)]";
  } else if (percentFilled > 60) {
    progressColor = "bg-accent shadow-[0_0_10px_rgba(255,212,12,0.4)]";
  }

  const isUrgent = availableSlots > 0 && availableSlots <= 3;

  return (
    <div className="group relative bg-surface rounded-2xl p-5 border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between overflow-hidden">
      {/* Top Accent Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header Row: Date badge + Status & Urgency */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Sporty Calendar Box */}
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-background/80 border border-border/80 text-center shadow-inner">
              <span className="text-[10px] font-black tracking-wider text-accent uppercase">
                {dayName}
              </span>
              <span className="text-lg font-black leading-none text-text">
                {dateNum}
              </span>
              <span className="text-[9px] font-semibold text-text-muted">
                {monthName}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Clock size={13} className="text-primary" />
                <span className="font-semibold text-text">
                  {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)} WIB
                </span>
              </div>
              <h3 className="text-base font-bold text-text line-clamp-1 mt-0.5 group-hover:text-primary transition-colors flex items-center gap-1.5">
                <Trophy size={15} className="text-accent shrink-0" />
                <span>{event.title}</span>
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {isFull ? (
              <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full bg-danger/15 text-danger border border-danger/30">
                Penuh
              </span>
            ) : isUrgent ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-accent/15 text-accent border border-accent/40 animate-pulse">
                <Flame size={12} className="text-accent" />
                Sisa {availableSlots}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full bg-primary/15 text-primary border border-primary/30">
                Buka
              </span>
            )}
          </div>
        </div>

        {/* Event Description */}
        {event.description && (
          <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Venue Address & Maps Link */}
        <div className="mb-4">
          <p className="text-xs text-text-muted line-clamp-1 flex items-center gap-1.5">
            <MapPin size={12} className="text-primary shrink-0" />
            <span className="truncate">{venue?.name || "TBA"} • {venue?.address}</span>
            {venue?.maps_url && (
              <a
                href={venue.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka di Google Maps"
                className="text-text-muted hover:text-primary transition-colors shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={11} />
              </a>
            )}
          </p>
        </div>

        {/* Slot Progress Bar & Occupancy Counter */}
        <div className="space-y-1.5 mb-5 bg-background/50 p-3 rounded-xl border border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1">
              <Users size={13} className="text-primary" />
              Slot Peserta / Tim
            </span>
            <span className="font-semibold text-text tabular-nums">
              {event.current_participants} <span className="text-text-muted font-normal">/ {event.max_participants}</span>
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-2 rounded-full bg-surface-hover overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          {/* Urgency Microcopy */}
          <div className="flex items-center justify-between text-[11px] text-text-muted pt-0.5">
            <span>{percentFilled}% kuota terisi</span>
            {isUrgent ? (
              <span className="text-accent font-semibold flex items-center gap-0.5">
                🔥 Slot turnamen hampir habis!
              </span>
            ) : (
              <span>{availableSlots} slot tersisa</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA & Price */}
      <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
        <div>
          <span className="block text-[10px] text-text-muted uppercase font-medium">Biaya Registrasi</span>
          <span className="text-lg font-extrabold text-primary">
            {event.price === 0 ? "Gratis" : formatCurrency(event.price)}
          </span>
        </div>

        <Link
          href={`/event/${event.id}`}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isFull
              ? "bg-surface-hover text-text-muted hover:text-text border border-border"
              : "bg-primary text-background hover:bg-primary-hover shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
          }`}
        >
          <span>{isFull ? "Lihat Detail" : "Daftar Event"}</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
