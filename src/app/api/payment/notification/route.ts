import { NextResponse } from "next/server";
import { coreApi } from "@/lib/midtrans";
import { processPaymentStatus } from "@/lib/payment-sync";

export async function POST(req: Request) {
  try {
    const notificationJson = await req.json();

    // Verify notification authenticity using Midtrans CoreApi
    const statusResponse = await coreApi.transaction.notification(notificationJson);

    const result = await processPaymentStatus({
      orderId: statusResponse.order_id,
      transactionStatus: statusResponse.transaction_status,
      fraudStatus: statusResponse.fraud_status,
      grossAmount: statusResponse.gross_amount,
    });

    return NextResponse.json({
      status: "success",
      message: "Notification processed",
      data: result,
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
