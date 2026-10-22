"use server";

import { coreApi } from "@/lib/midtrans";
import { processPaymentStatus } from "@/lib/payment-sync";
import { revalidatePath } from "next/cache";

export async function syncPaymentStatus(orderId: string): Promise<{
  success: boolean;
  paymentStatus: string;
  message: string;
}> {
  if (!orderId) {
    return {
      success: false,
      paymentStatus: "unknown",
      message: "Order ID tidak valid.",
    };
  }

  try {
    // Query Midtrans API directly for the current transaction status
    const statusResponse = await coreApi.transaction.status(orderId);

    const result = await processPaymentStatus({
      orderId: statusResponse.order_id,
      transactionStatus: statusResponse.transaction_status,
      fraudStatus: statusResponse.fraud_status,
      grossAmount: statusResponse.gross_amount,
    });

    revalidatePath("/profil");
    revalidatePath("/admin");
    return result;
  } catch (err: unknown) {
    // If Midtrans returns 404, it means payment method has not yet been selected in Snap
    const message = err instanceof Error ? err.message : "Gagal sinkronisasi status pembayaran.";
    console.warn(`[Payment Sync] Order ${orderId}:`, message);
    return {
      success: false,
      paymentStatus: "pending",
      message: "Transaksi belum diproses atau masih menunggu pembayaran di Midtrans.",
    };
  }
}
