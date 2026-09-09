import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // Verify cron secret (if configured)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Find and expire stale bookings
    const { data: staleBookings, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("id, schedule_id, quantity")
      .eq("payment_status", "pending")
      .lt("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if (fetchError) {
      console.error("Auto-expire fetch error:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!staleBookings || staleBookings.length === 0) {
      return NextResponse.json({ message: "No bookings to expire", count: 0 });
    }

    // Expire bookings
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled", payment_status: "expired" })
      .eq("payment_status", "pending")
      .lt("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if (updateError) {
      console.error("Auto-expire update error:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Bookings expired successfully",
      count: staleBookings.length,
      expired_ids: staleBookings.map((b) => b.id),
    });
  } catch (error: any) {
    console.error("Auto-expire error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
