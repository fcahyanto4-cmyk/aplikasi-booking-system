"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { syncPaymentStatus } from "@/app/actions/payment";

export default function PayButton({
  token,
  orderId,
}: {
  token: string;
  orderId?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const handlePay = () => {
    if (!token || !window.snap) return;

    setIsLoading(true);
    window.snap.pay(token, {
      onSuccess: async function (result) {
        const targetOrderId = result?.order_id || orderId;
        if (targetOrderId) {
          await syncPaymentStatus(targetOrderId);
        }
        alert("Pembayaran berhasil!");
        router.refresh();
        setIsLoading(false);
      },
      onPending: function () {
        alert(
          "Menunggu pembayaran Anda diselesaikan. Anda dapat melakukan simulasi pembayaran melalui Midtrans Simulator."
        );
        setIsLoading(false);
      },
      onError: function () {
        alert("Pembayaran gagal. Silakan coba lagi.");
        setIsLoading(false);
      },
      onClose: function () {
        setIsLoading(false);
      },
    });
  };

  const handleCheckStatus = async () => {
    if (!orderId) return;
    setIsChecking(true);
    try {
      const res = await syncPaymentStatus(orderId);
      if (res.success && res.paymentStatus === "paid") {
        alert("Pembayaran terkonfirmasi! Status telah diperbarui menjadi Lunas.");
      } else {
        alert(res.message || "Pembayaran masih belum selesai di Midtrans.");
      }
      router.refresh();
    } catch {
      alert("Gagal memeriksa status pembayaran.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <Button
        size="sm"
        onClick={handlePay}
        disabled={isLoading || isChecking || !token}
        className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-background font-semibold"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <CreditCard size={16} className="mr-2" />
        )}
        Bayar Sekarang
      </Button>

      {orderId && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCheckStatus}
          disabled={isLoading || isChecking}
          className="w-full sm:w-auto text-xs border-primary/30 text-primary hover:bg-primary/10"
          title="Sinkronisasi status dari Midtrans Sandbox"
        >
          {isChecking ? (
            <Loader2 size={14} className="animate-spin mr-1.5" />
          ) : (
            <RefreshCw size={14} className="mr-1.5" />
          )}
          Cek Status
        </Button>
      )}
    </div>
  );
}
