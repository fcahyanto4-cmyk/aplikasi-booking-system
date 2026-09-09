import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check database connection
    const { data, error } = await supabase.from("profiles").select("id").limit(1);
    
    if (error) {
      return NextResponse.json({
        status: "error",
        database: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      database: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
