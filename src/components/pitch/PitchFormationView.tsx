"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, LayoutGrid, Plus, Shield, Sparkles, CheckCircle2 } from "lucide-react";

export interface ParticipantPublic {
  user_id: string;
  quantity: number;
  guest_names: string[] | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface PitchFormationViewProps {
  participants: ParticipantPublic[];
  maxPlayers: number;
  onSlotClick?: () => void;
}

interface PitchPosition {
  id: string;
  role: "GK" | "DF" | "MF" | "FW";
  label: string;
  xPercent: number; // 0 to 100 horizontal
  yPercent: number; // 0 to 100 vertical (0 = goal top, 100 = goal bottom)
}

// 7-a-side Minisoccer formation positions on pitch (Vertical field)
const PITCH_SLOTS: PitchPosition[] = [
  // Forward Line (Top)
  { id: "fw-1", role: "FW", label: "Penyerang Kiri", xPercent: 32, yPercent: 20 },
  { id: "fw-2", role: "FW", label: "Penyerang Kanan", xPercent: 68, yPercent: 20 },
  // Midfield Line (Center)
  { id: "mf-1", role: "MF", label: "Gelandang Sayap Kiri", xPercent: 20, yPercent: 42 },
  { id: "mf-2", role: "MF", label: "Gelandang Tengah", xPercent: 50, yPercent: 46 },
  { id: "mf-3", role: "MF", label: "Gelandang Sayap Kanan", xPercent: 80, yPercent: 42 },
  // Defense Line (Bottom)
  { id: "df-1", role: "DF", label: "Bek Kiri", xPercent: 28, yPercent: 68 },
  { id: "df-2", role: "DF", label: "Bek Kanan", xPercent: 72, yPercent: 68 },
  // Goalkeeper (Goal area)
  { id: "gk-1", role: "GK", label: "Kiper (GK)", xPercent: 50, yPercent: 88 },
];

export default function PitchFormationView({
  participants,
  maxPlayers,
  onSlotClick,
}: PitchFormationViewProps) {
  const [activeTab, setActiveTab] = useState<"pitch" | "list">("pitch");

  // Flatten all registered players (including guests)
  const flattenedPlayers: { name: string; avatarUrl?: string | null; isGuest: boolean }[] = [];
  participants.forEach((p) => {
    flattenedPlayers.push({
      name: p.full_name || "Member",
      avatarUrl: p.avatar_url,
      isGuest: false,
    });
    if (p.guest_names && p.guest_names.length > 0) {
      p.guest_names.forEach((guest) => {
        flattenedPlayers.push({
          name: guest || "Teman",
          avatarUrl: null,
          isGuest: true,
        });
      });
    }
  });

  const totalRegistered = flattenedPlayers.length;

  return (
    <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header & View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-text">
              Komposisi Skuad Mabar
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold tabular-nums">
              {totalRegistered} / {maxPlayers} Pemain
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Lihat susunan formasi lapangan atau daftar peserta yang telah terdaftar.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-background p-1 rounded-xl border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("pitch")}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "pitch"
                ? "bg-primary text-background shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <LayoutGrid size={14} />
            <span>Formasi Lapangan</span>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "list"
                ? "bg-primary text-background shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Users size={14} />
            <span>Daftar Nama ({totalRegistered})</span>
          </button>
        </div>
      </div>

      {activeTab === "pitch" ? (
        <div className="space-y-4">
          {/* Visual Soccer Pitch Canvas */}
          <div className="relative w-full max-w-lg mx-auto aspect-[3/4] bg-[#0c2f1f] rounded-2xl border-4 border-white/20 overflow-hidden shadow-2xl p-4 select-none">
            {/* Pitch Grass Stripes (Alternating green shades) */}
            <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(0deg,#000,#000_30px,transparent_30px,transparent_60px)] pointer-events-none" />

            {/* Pitch Markings */}
            {/* Outer Boundary */}
            <div className="absolute inset-3 border-2 border-white/40 rounded-lg pointer-events-none" />
            {/* Halfway Line */}
            <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-white/40 -translate-y-1/2 pointer-events-none" />
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 border-2 border-white/40 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-white/50 rounded-full pointer-events-none" />

            {/* Top Penalty Box & Goal */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-white/40 rounded-b-lg pointer-events-none" />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-10 border-2 border-t-0 border-white/40 pointer-events-none" />
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-2 bg-white/60 rounded-sm pointer-events-none" />

            {/* Bottom Penalty Box & Goal */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-white/40 rounded-t-lg pointer-events-none" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-10 border-2 border-b-0 border-white/40 pointer-events-none" />
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-2 bg-white/60 rounded-sm pointer-events-none" />

            {/* Formation Node Pins */}
            {PITCH_SLOTS.map((slot, index) => {
              const assignedPlayer = flattenedPlayers[index];
              const isOccupied = !!assignedPlayer;

              return (
                <div
                  key={slot.id}
                  style={{
                    left: `${slot.xPercent}%`,
                    top: `${slot.yPercent}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  onClick={onSlotClick}
                >
                  {isOccupied ? (
                    /* Occupied Node */
                    <div className="relative flex flex-col items-center">
                      <div className="relative p-0.5 rounded-full bg-primary shadow-[0_0_12px_rgba(111,197,164,0.6)] group-hover:scale-110 transition-transform">
                        <Avatar className="w-10 h-10 border-2 border-background">
                          <AvatarImage src={assignedPlayer.avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary text-[11px] font-bold">
                            {assignedPlayer.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-1 -right-1 bg-primary text-background font-black text-[9px] px-1 rounded-full">
                          {slot.role}
                        </span>
                      </div>
                      <span className="mt-1 px-2 py-0.5 rounded-md bg-background/90 text-text font-bold text-[10px] whitespace-nowrap shadow-md border border-white/10 max-w-[80px] truncate">
                        {assignedPlayer.name}
                      </span>
                    </div>
                  ) : (
                    /* Empty Slot Node */
                    <div className="relative flex flex-col items-center">
                      <button
                        type="button"
                        className="w-10 h-10 rounded-full border-2 border-dashed border-white/60 bg-black/30 hover:bg-primary/20 hover:border-primary flex items-center justify-center text-white/80 hover:text-primary transition-all group-hover:scale-110 shadow-sm animate-pulse"
                        title={`Pilih Posisi ${slot.label}`}
                      >
                        <Plus size={16} />
                      </button>
                      <span className="mt-1 px-1.5 py-0.5 rounded bg-black/60 text-white/80 font-bold text-[9px] whitespace-nowrap">
                        {slot.role} • Kosong
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend and Bench information */}
          <div className="flex flex-wrap items-center justify-between text-xs text-text-muted px-2 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Terisi ({Math.min(totalRegistered, PITCH_SLOTS.length)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-white/60" />
                Kosong ({Math.max(0, PITCH_SLOTS.length - totalRegistered)})
              </span>
            </div>
            {totalRegistered > PITCH_SLOTS.length && (
              <span className="text-accent font-semibold flex items-center gap-1">
                <Sparkles size={13} />
                +{totalRegistered - PITCH_SLOTS.length} Pemain di bangku cadangan
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Player List Tab */
        <div className="space-y-3">
          {flattenedPlayers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {flattenedPlayers.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-background border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="w-6 text-center font-mono text-xs text-text-muted font-semibold">
                    #{idx + 1}
                  </span>
                  <Avatar className="w-9 h-9 border border-border">
                    <AvatarImage src={player.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {player.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text truncate">
                      {player.name}
                    </p>
                    <span className="text-[11px] text-text-muted">
                      {player.isGuest ? "Teman Peserta" : "Member Terdaftar"}
                    </span>
                  </div>
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-background rounded-2xl p-8 border border-border text-center">
              <Users size={32} className="mx-auto text-text-muted mb-2 opacity-50" />
              <p className="text-text-muted text-sm">
                Belum ada pemain yang bergabung. Jadilah pemain pertama!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
