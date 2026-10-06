"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  RefreshCw,
  Camera,
  Keyboard,
  Volume2,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { ScheduleWithVenue, Venue } from "@/types/database";

interface ParticipantItem {
  id: string;
  bookingId: string;
  scheduleId: string;
  orderId: string | null;
  name: string;
  quantity: number;
  guestNames: string[];
  checkedIn: boolean;
  checkedInAt?: string;
}

export default function AdminCheckInPage() {
  const [schedules, setSchedules] = useState<ScheduleWithVenue[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanResult, setScanResult] = useState<{
    type: "success" | "warning" | "error";
    message: string;
    details?: string;
  } | null>(null);

  const scannerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sound feedback helper
  const playFeedbackSound = (type: "success" | "warning" | "error") => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "warning") {
        osc.type = "square";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio autoplay policy or not supported
    }

    // Haptic feedback
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      if (type === "success") {
        navigator.vibrate([100, 50, 100]);
      } else {
        navigator.vibrate([250]);
      }
    }
  };

  // Load schedules on mount
  useEffect(() => {
    async function loadSchedules() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("schedules")
        .select("*, venues(*)")
        .order("date", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const formatted = data.map((s: any) => ({
          ...s,
          venues: Array.isArray(s.venues) ? s.venues[0] : s.venues,
        })) as ScheduleWithVenue[];

        setSchedules(formatted);
        setSelectedScheduleId(formatted[0].id);
      }
      setLoading(false);
    }
    loadSchedules();
  }, []);

  // Load participants for selected schedule
  useEffect(() => {
    if (!selectedScheduleId) return;

    async function loadParticipants() {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select("id, order_id, schedule_id, quantity, guest_names, payment_status, profiles(full_name)")
        .eq("schedule_id", selectedScheduleId)
        .eq("payment_status", "paid");

      if (data) {
        // Retrieve cached checkins from localStorage
        const savedKey = `ymb_checkins_${selectedScheduleId}`;
        let checkedInMap: Record<string, string> = {};
        try {
          const cached = localStorage.getItem(savedKey);
          if (cached) checkedInMap = JSON.parse(cached);
        } catch {
          // ignore
        }

        const items: ParticipantItem[] = data.map((b: any) => {
          const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
          const isChecked = !!checkedInMap[b.id];
          return {
            id: b.id,
            bookingId: b.id,
            scheduleId: b.schedule_id,
            orderId: b.order_id,
            name: profile?.full_name || "Pemain",
            quantity: b.quantity || 1,
            guestNames: b.guest_names || [],
            checkedIn: isChecked,
            checkedInAt: checkedInMap[b.id],
          };
        });

        setParticipants(items);
      }
    }
    loadParticipants();
  }, [selectedScheduleId]);

  // Handle Verify QR / Code
  const handleVerifyTicket = (rawText: string) => {
    let bookingId = "";
    let codeStr = rawText.trim();

    // Try parsing JSON format from TicketCard
    try {
      const parsed = JSON.parse(rawText);
      if (parsed.bid) bookingId = parsed.bid;
      if (parsed.code) codeStr = parsed.code;
    } catch {
      // It's a plain string / order_id / booking_id
      bookingId = rawText.trim();
    }

    // Look for matching participant
    const target = participants.find(
      (p) =>
        p.bookingId.toLowerCase() === bookingId.toLowerCase() ||
        (p.orderId && p.orderId.toLowerCase() === codeStr.replace(/^#/, "").toLowerCase()) ||
        p.id.toLowerCase().includes(codeStr.toLowerCase())
    );

    if (!target) {
      playFeedbackSound("error");
      setScanResult({
        type: "error",
        message: "Tiket Tidak Valid / Tidak Terdaftar",
        details: `Kode: "${rawText.slice(0, 30)}". Pastikan jadwal pertandingan yang dipilih sudah sesuai.`,
      });
      return;
    }

    if (target.checkedIn) {
      playFeedbackSound("warning");
      setScanResult({
        type: "warning",
        message: `⚠️ Tiket Sudah Presensi Sebelumnya!`,
        details: `${target.name} (${target.quantity} tiket) tercatat hadir pada ${target.checkedInAt || "hari ini"}.`,
      });
      return;
    }

    // Mark as checked in
    const nowTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updated = participants.map((p) =>
      p.id === target.id ? { ...p, checkedIn: true, checkedInAt: nowTime } : p
    );
    setParticipants(updated);

    // Save to localStorage
    const savedKey = `ymb_checkins_${selectedScheduleId}`;
    try {
      const currentMap: Record<string, string> = {};
      updated.forEach((p) => {
        if (p.checkedIn && p.checkedInAt) currentMap[p.id] = p.checkedInAt;
      });
      localStorage.setItem(savedKey, JSON.stringify(currentMap));
    } catch {
      // ignore
    }

    playFeedbackSound("success");
    setScanResult({
      type: "success",
      message: `✅ Presensi Berhasil: ${target.name}`,
      details: `${target.quantity} Tiket terverifikasi • Masuk pada ${nowTime} WIB`,
    });
  };

  // Toggle manual check in status
  const handleToggleCheckin = (participantId: string) => {
    const target = participants.find((p) => p.id === participantId);
    if (!target) return;

    const nextState = !target.checkedIn;
    const nowTime = nextState
      ? new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      : undefined;

    const updated = participants.map((p) =>
      p.id === participantId
        ? { ...p, checkedIn: nextState, checkedInAt: nowTime }
        : p
    );
    setParticipants(updated);

    // Update localStorage
    const savedKey = `ymb_checkins_${selectedScheduleId}`;
    try {
      const currentMap: Record<string, string> = {};
      updated.forEach((p) => {
        if (p.checkedIn && p.checkedInAt) currentMap[p.id] = p.checkedInAt;
      });
      localStorage.setItem(savedKey, JSON.stringify(currentMap));
    } catch {
      // ignore
    }

    if (nextState) {
      playFeedbackSound("success");
    }
  };

  // Initialize html5-qrcode when in camera mode
  useEffect(() => {
    if (activeMode !== "camera") {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (!isMounted) return;

        const scanner = new Html5QrcodeScanner(
          "qr-reader-container",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            handleVerifyTicket(decodedText);
          },
          () => {
            // scan error (ignore standard frame errors)
          }
        );

        scannerRef.current = scanner;
      } catch {
        // Camera permissions or unsupported browser
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [activeMode, participants, selectedScheduleId]);

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.orderId && p.orderId.toLowerCase().includes(q)) ||
      p.guestNames.some((g) => g.toLowerCase().includes(q))
    );
  });

  const checkedInCount = participants.filter((p) => p.checkedIn).length;
  const totalCount = participants.length;

  const currentSchedule = schedules.find((s) => s.id === selectedScheduleId);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <QrCode size={20} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-text">
              Presensi Lapangan On-Field
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Scan tiket QR pemain atau gunakan checklist manual untuk verifikasi kehadiran di lapangan.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-surface p-1 rounded-xl border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveMode("camera")}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === "camera"
                ? "bg-primary text-background shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Camera size={14} />
            <span>Kamera QR</span>
          </button>
          <button
            onClick={() => setActiveMode("manual")}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === "manual"
                ? "bg-primary text-background shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Keyboard size={14} />
            <span>Input Kode</span>
          </button>
        </div>
      </div>

      {/* Schedule Selector & Overview */}
      <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-border shadow-sm space-y-3">
        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
          Pilih Jadwal Pertandingan Mabar
        </label>
        <select
          value={selectedScheduleId}
          onChange={(e) => {
            setSelectedScheduleId(e.target.value);
            setScanResult(null);
          }}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-text focus:outline-none focus:border-primary transition-colors"
        >
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>
              {formatDate(s.date)} • {s.start_time.substring(0, 5)} WIB — {s.venues?.name}
            </option>
          ))}
        </select>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-background/80 p-3 rounded-xl border border-border text-center">
            <span className="block text-[11px] text-text-muted uppercase font-bold">Terdaftar</span>
            <span className="text-xl font-black text-text tabular-nums">{totalCount}</span>
          </div>
          <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 text-center">
            <span className="block text-[11px] text-primary uppercase font-bold">Hadir</span>
            <span className="text-xl font-black text-primary tabular-nums">{checkedInCount}</span>
          </div>
          <div className="bg-background/80 p-3 rounded-xl border border-border text-center">
            <span className="block text-[11px] text-text-muted uppercase font-bold">Belum Hadir</span>
            <span className="text-xl font-black text-accent tabular-nums">
              {Math.max(0, totalCount - checkedInCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Scan Feedback Banner */}
      {scanResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all shadow-md ${
            scanResult.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-100"
              : scanResult.type === "warning"
              ? "bg-amber-950/80 border-amber-500/50 text-amber-100"
              : "bg-rose-950/80 border-rose-500/50 text-rose-100"
          }`}
        >
          {scanResult.type === "success" && (
            <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
          )}
          {scanResult.type === "warning" && (
            <AlertTriangle size={24} className="text-amber-400 shrink-0 mt-0.5" />
          )}
          {scanResult.type === "error" && (
            <XCircle size={24} className="text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold text-sm sm:text-base">{scanResult.message}</p>
            {scanResult.details && (
              <p className="text-xs opacity-90 mt-0.5">{scanResult.details}</p>
            )}
          </div>
          <button
            onClick={() => setScanResult(null)}
            type="button"
            className="text-xs opacity-70 hover:opacity-100 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scanner Section */}
      {activeMode === "camera" ? (
        <div className="bg-surface rounded-3xl p-5 border border-border shadow-lg text-center space-y-4">
          <div className="max-w-md mx-auto overflow-hidden rounded-2xl border-2 border-primary/40 bg-black">
            <div id="qr-reader-container" className="w-full" />
          </div>
          <p className="text-xs text-text-muted flex items-center justify-center gap-1.5">
            <Volume2 size={14} className="text-primary" />
            Arahkan kamera ke QR Code Tiket pemain untuk verifikasi instan.
          </p>
        </div>
      ) : (
        /* Manual Code Input */
        <div className="bg-surface rounded-3xl p-6 border border-border shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-text">Input Kode Tiket Manual</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) {
                handleVerifyTicket(manualCode.trim());
                setManualCode("");
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Contoh: #YMB-88219 atau ID Pemesan..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-mono text-text focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover transition-all"
            >
              Verifikasi
            </button>
          </form>
        </div>
      )}

      {/* Manual Checklist Roster */}
      <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Checklist Kehadiran Pemain
            </h3>
            <p className="text-xs text-text-muted">
              Gunakan checklist ini jika terdapat pemain tanpa smartphone atau kamera terkendala.
            </p>
          </div>

          {/* Search participant */}
          <div className="relative sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pemain..."
              className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-text focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Participants Table / List */}
        {filteredParticipants.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredParticipants.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  p.checkedIn
                    ? "bg-primary/5 border-primary/30"
                    : "bg-background border-border"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text">{p.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-hover text-text-muted">
                      {p.orderId ? `#${p.orderId}` : `#${p.id.slice(0, 6)}`}
                    </span>
                    {p.quantity > 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                        {p.quantity} Tiket
                      </span>
                    )}
                  </div>
                  {p.guestNames.length > 0 && (
                    <p className="text-xs text-text-muted mt-0.5">
                      Teman: {p.guestNames.join(", ")}
                    </p>
                  )}
                  {p.checkedIn && p.checkedInAt && (
                    <p className="text-[11px] text-primary font-medium mt-0.5">
                      ✓ Hadir pada {p.checkedInAt} WIB
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleToggleCheckin(p.id)}
                  type="button"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    p.checkedIn
                      ? "bg-primary text-background hover:bg-danger hover:text-white"
                      : "bg-surface-hover hover:bg-primary/20 text-text-muted hover:text-primary border border-border"
                  }`}
                >
                  {p.checkedIn ? "Hadir ✓" : "Tandai Hadir"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted text-sm">
            Tidak ada pemain yang ditemukan untuk jadwal ini.
          </div>
        )}
      </div>
    </div>
  );
}
