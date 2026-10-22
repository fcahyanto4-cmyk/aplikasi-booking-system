import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/config";

interface ProcessPaymentParams {
  orderId: string;
  transactionStatus: string;
  fraudStatus?: string;
  grossAmount?: string;
}

export async function processPaymentStatus({
  orderId,
  transactionStatus,
  fraudStatus,
  grossAmount,
}: ProcessPaymentParams) {
  const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  console.log(
    `[Midtrans Payment Sync] Order: ${orderId} | Status: ${transactionStatus} | Fraud: ${fraudStatus}`
  );

  let newPaymentStatus = "pending";
  let newBookingStatus = "booked";

  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    if (fraudStatus === "challenge") {
      newPaymentStatus = "pending";
    } else {
      newPaymentStatus = "paid";
    }
  } else if (
    transactionStatus === "cancel" ||
    transactionStatus === "deny" ||
    transactionStatus === "expire"
  ) {
    newPaymentStatus = transactionStatus === "expire" ? "expired" : "failed";
    newBookingStatus = "cancelled";
  }

  if (newPaymentStatus !== "pending") {
    const isEvent = orderId.startsWith("EVT-");
    const table = isEvent ? "event_participants" : "bookings";
    const actualBookingStatus =
      isEvent && newBookingStatus === "cancelled"
        ? "cancelled"
        : isEvent
        ? "registered"
        : newBookingStatus;

    // Check existing status to prevent duplicate processing
    const { data: currentRecord } = await supabaseAdmin
      .from(table)
      .select("payment_status, user_id")
      .eq("order_id", orderId)
      .single();

    if (currentRecord?.payment_status === "paid" && newPaymentStatus === "paid") {
      return {
        success: true,
        paymentStatus: "paid",
        message: "Pembayaran sudah diverifikasi sebelumnya.",
      };
    }

    await supabaseAdmin
      .from(table)
      .update({
        payment_status: newPaymentStatus,
        status: actualBookingStatus,
      })
      .eq("order_id", orderId);

    if (newPaymentStatus === "paid") {
      // Award loyalty points (10% of gross amount)
      const amount = grossAmount ? parseFloat(grossAmount) : 0;
      const pointsEarned = Math.floor(amount * 0.1);
      if (pointsEarned > 0 && currentRecord?.user_id) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("points_balance")
          .eq("id", currentRecord.user_id)
          .single();

        await supabaseAdmin
          .from("profiles")
          .update({
            points_balance: (profile?.points_balance || 0) + pointsEarned,
          })
          .eq("id", currentRecord.user_id);

        await supabaseAdmin.from("point_transactions").insert({
          user_id: currentRecord.user_id,
          amount: pointsEarned,
          type: "earned",
          reference_id: orderId,
          description: "Points earned from booking",
        });
      }

      await sendBookingConfirmationEmail(
        supabaseAdmin,
        orderId,
        isEvent ? "event" : "schedule"
      );
    } else if (newBookingStatus === "cancelled") {
      // Refund points if any were redeemed
      const { data: txs } = await supabaseAdmin
        .from("point_transactions")
        .select("*")
        .eq("reference_id", orderId)
        .eq("type", "redeemed");

      if (txs && txs.length > 0 && currentRecord?.user_id) {
        const tx = txs[0];
        const pointsToRefund = Math.abs(tx.amount);
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("points_balance")
          .eq("id", currentRecord.user_id)
          .single();

        await supabaseAdmin
          .from("profiles")
          .update({
            points_balance: (profile?.points_balance || 0) + pointsToRefund,
          })
          .eq("id", currentRecord.user_id);

        await supabaseAdmin.from("point_transactions").insert({
          user_id: currentRecord.user_id,
          amount: pointsToRefund,
          type: "refunded",
          reference_id: orderId,
          description: "Points refunded due to cancellation/expiry",
        });
      }
    }
  }

  return {
    success: true,
    paymentStatus: newPaymentStatus,
    message: `Status pembayaran: ${newPaymentStatus}`,
  };
}

async function sendBookingConfirmationEmail(
  supabase: SupabaseClient,
  orderId: string,
  type: "event" | "schedule"
) {
  try {
    let userId: string;
    let venueName: string | undefined;
    let date: string;
    let startTime: string;
    let endTime: string;

    if (type === "schedule") {
      const { data } = await supabase
        .from("bookings")
        .select("user_id, schedules(*, venues(*))")
        .eq("order_id", orderId)
        .single();
      if (!data || !data.schedules) return;
      const schedule = Array.isArray(data.schedules)
        ? data.schedules[0]
        : data.schedules;
      if (!schedule) return;
      const venue = Array.isArray(schedule.venues)
        ? schedule.venues[0]
        : schedule.venues;
      userId = data.user_id;
      venueName = venue?.name;
      date = schedule.date;
      startTime = schedule.start_time;
      endTime = schedule.end_time;
    } else {
      const { data } = await supabase
        .from("event_participants")
        .select("user_id, events(*, venues(*))")
        .eq("order_id", orderId)
        .single();
      if (!data || !data.events) return;
      const event = Array.isArray(data.events) ? data.events[0] : data.events;
      if (!event) return;
      const venue = Array.isArray(event.venues) ? event.venues[0] : event.venues;
      userId = data.user_id;
      venueName = venue?.name;
      date = event.date;
      startTime = event.start_time;
      endTime = event.end_time;
    }

    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) return;

    const userEmail = userData.user.email;
    const title = type === "schedule" ? "Jadwal Mabar" : "Event";
    const time = `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;

    console.log(`\n======================================================`);
    console.log(`[MOCK EMAIL SENT] To: ${userEmail}`);
    console.log(`Subject: Booking Confirmed - ${title}`);
    console.log(`Body:`);
    console.log(`  Venue: ${venueName}`);
    console.log(`  Date: ${date}`);
    console.log(`  Time: ${time}`);
    console.log(`  Booking ID: ${orderId}`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error("Failed to send mock email:", err);
  }
}
