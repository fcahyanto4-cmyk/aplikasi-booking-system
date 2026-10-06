"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface TicketShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: {
    matchCode: string;
    venueName: string;
    dateFormatted: string;
    timeFormatted: string;
    playerName: string;
    quantity: number;
    verificationToken: string;
  };
}

export default function TicketShareModal({
  isOpen,
  onClose,
  ticketData,
}: TicketShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `⚽ Gue mabar di ${ticketData.venueName}!\n📅 ${ticketData.dateFormatted} | ⏰ ${ticketData.timeFormatted}\n🎟️ Match Pass: ${ticketData.matchCode}\nYuk gabung main bola bareng di Yuk Main Bola!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      toast.success("Detail tiket berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Match Pass - ${ticketData.venueName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText}\n\nCek di sini: ${shareUrl}`
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm bg-surface border-border p-6 rounded-3xl">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-xl font-bold text-text flex items-center justify-center gap-2">
            <Share2 size={20} className="text-primary" />
            Bagikan Match Pass
          </DialogTitle>
          <p className="text-xs text-text-muted">
            Ajak teman nongkrong atau pamerkan tiket mabarmu ke media sosial!
          </p>
        </DialogHeader>

        {/* Shareable Card Preview */}
        <div className="bg-gradient-to-b from-surface-hover to-background rounded-2xl p-4 border border-primary/20 shadow-lg text-center my-3 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-2">
            Yuk Main Bola • Match Pass
          </div>

          <h4 className="text-lg font-black text-text line-clamp-1">
            {ticketData.venueName}
          </h4>

          <p className="text-xs text-primary font-semibold mt-0.5">
            {ticketData.dateFormatted} • {ticketData.timeFormatted}
          </p>

          <div className="flex justify-center my-3 p-2 bg-white rounded-xl w-fit mx-auto shadow-inner">
            <QRCodeSVG
              value={ticketData.verificationToken}
              size={110}
              level="M"
            />
          </div>

          <div className="text-[11px] text-text-muted">
            <span>Pemesan: <strong className="text-text">{ticketData.playerName}</strong></span>
            {ticketData.quantity > 1 && (
              <span> (+{ticketData.quantity - 1} teman)</span>
            )}
          </div>
          <div className="text-[10px] font-mono text-primary/80 mt-1">
            {ticketData.matchCode}
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleWhatsAppShare}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <MessageCircle size={16} />
            <span>Bagikan ke WhatsApp</span>
          </button>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={handleNativeShare}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-md transition-all"
            >
              <Share2 size={16} />
              <span>Bagikan (Instagram / Lainnya)</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-surface-hover text-text hover:text-primary font-semibold text-xs border border-border transition-all"
          >
            {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
            <span>{copied ? "Berhasil Disalin!" : "Salin Pesan & Tautan Tiket"}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
