"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, Clock, MapPin, Users, Share2, Timer } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import TicketShareModal from "./TicketShareModal";
import type { BookingWithSchedule } from "@/types/database";

interface TicketCardProps {
  booking: BookingWithSchedule;
  userName?: string;
  payButton?: React.ReactNode;
  cancelButton?: React.ReactNode;
}

export default function TicketCard({
  booking,
  userName = "Pemain",
  payButton,
  cancelButton,
}: TicketCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const schedule = booking.schedules;
  const venue = schedule.venues;
  const isPaid = booking.payment_status === "paid";
  const qty = booking.quantity || 1;
  const guests: string[] = booking.guest_names || [];
  const totalPrice = (schedule.price_per_person || 0) * qty;

  const matchCode = booking.order_id
    ? `#${booking.order_id}`
    : `#YMB-${booking.id.substring(0, 6).toUpperCase()}`;

  // Verification token payload for scanning
  const verificationPayload = JSON.stringify({
    bid: booking.id,
    sid: schedule.id,
    code: matchCode,
    uid: booking.user_id,
    qty: booking.quantity,
  });

  // Calculate live countdown to kickoff
  useEffect(() => {
    const calculateCountdown = () => {
      try {
        const matchDateTime = new Date(`${schedule.date}T${schedule.start_time}`);
        const now = new Date();
        const diffMs = matchDateTime.getTime() - now.getTime();

        if (diffMs <= 0) {
          // Check if match is ongoing or ended (assume ~2 hour duration)
          const endDateTime = new Date(`${schedule.date}T${schedule.end_time}`);
          if (now.getTime() < endDateTime.getTime()) {
            setTimeLeft("⚽ Kickoff Sedang Berlangsung!");
          } else {
            setTimeLeft("🏁 Pertandingan Selesai");
          }
          return;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        if (hours > 48) {
          const days = Math.floor(hours / 24);
          setTimeLeft(`Kickoff dalam ${days} hari lagi`);
        } else {
          const pad = (n: number) => String(n).padStart(2, "0");
          setTimeLeft(`Kickoff dalam ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        }
      } catch {
        setTimeLeft("");
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [schedule.date, schedule.start_time, schedule.end_time]);

  return (
    <>
      <div className="relative bg-surface rounded-3xl border border-border overflow-hidden shadow-xl hover:border-primary/40 transition-all duration-300">
        {/* Ticket Header */}
        <div className="p-5 sm:p-6 bg-surface-hover/60 border-b border-border/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/YMB.png"
              alt="Yuk Main Bola"
              width={32}
              height={32}
              className="object-contain"
            />
            <div>
              <span className="block text-xs font-black tracking-wider uppercase text-primary">
                Match Pass
              </span>
              <span className="text-[11px] font-mono text-text-muted">
                {matchCode}
              </span>
            </div>
          </div>

          <div>
            {isPaid ? (
              <span className="inline-flex items-center px-3 py-1 text-xs font-black rounded-full bg-primary/20 text-primary border border-primary/40 shadow-[0_0_12px_rgba(111,197,164,0.3)]">
                ● LUNAS / CONFIRMED
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-accent/20 text-accent border border-accent/40 animate-pulse">
                MENUNGGU PEMBAYARAN
              </span>
            )}
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-xl font-black text-text hover:text-primary transition-colors">
              <Link href={`/jadwal/${schedule.id}`}>
                Mabar di {venue?.name || "Minisoccer"}
              </Link>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
              <MapPin size={13} className="text-primary shrink-0" />
              <span className="truncate">{venue?.address}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-background/60 p-3.5 rounded-2xl border border-border/60">
            <div>
              <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">
                Tanggal
              </span>
              <span className="text-sm font-bold text-text flex items-center gap-1.5 mt-0.5">
                <Calendar size={13} className="text-primary" />
                {formatDate(schedule.date)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">
                Waktu Kickoff
              </span>
              <span className="text-sm font-bold text-text flex items-center gap-1.5 mt-0.5">
                <Clock size={13} className="text-primary" />
                {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)} WIB
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">
                Peserta
              </span>
              <span className="text-sm font-bold text-text flex items-center gap-1.5 mt-0.5">
                <Users size={13} className="text-primary" />
                {qty} Orang ({userName})
              </span>
            </div>
          </div>

          {guests.length > 0 && (
            <div className="text-xs text-text-muted">
              Teman: <span className="text-text font-medium">{guests.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Aesthetic Perforation Line with Left/Right Circular Cutouts */}
        <div className="relative flex items-center justify-between">
          <div className="w-6 h-6 rounded-full bg-background -ml-3 border-r border-border" />
          <div className="flex-1 border-t-2 border-dashed border-border/80 mx-2" />
          <div className="w-6 h-6 rounded-full bg-background -mr-3 border-l border-border" />
        </div>

        {/* Ticket Footer / Verification & Action Section */}
        <div className="p-5 sm:p-6 bg-surface-hover/30 flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* QR Code and Kickoff Countdown */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
              <QRCodeSVG
                value={verificationPayload}
                size={84}
                level="M"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                QR Presensi Lapangan
              </span>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                <Timer size={13} />
                <span>{timeLeft}</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Tunjukkan QR ini ke admin di lokasi mabar.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:items-end gap-2.5 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
              <span className="text-xs text-text-muted">Total:</span>
              <span className="text-lg font-black text-primary">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowShareModal(true)}
                type="button"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-hover hover:bg-surface text-text hover:text-primary border border-border text-xs font-bold transition-all shadow-sm"
              >
                <Share2 size={14} />
                <span>Bagikan Tiket</span>
              </button>

              {payButton}
              {cancelButton}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <TicketShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        ticketData={{
          matchCode,
          venueName: venue?.name || "Minisoccer",
          dateFormatted: formatDate(schedule.date),
          timeFormatted: `${schedule.start_time.substring(0, 5)} - ${schedule.end_time.substring(0, 5)} WIB`,
          playerName: userName,
          quantity: qty,
          verificationToken: verificationPayload,
        }}
      />
    </>
  );
}
