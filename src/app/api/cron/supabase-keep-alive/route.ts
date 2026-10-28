import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const headers = { "Cache-Control": "no-store" };

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { error } = await supabaseAdmin
      .from("devices")
      .select("device_id")
      .limit(1)
      .abortSignal(AbortSignal.timeout(10_000));

    if (error) throw error;

    return NextResponse.json({ status: "ok" }, { headers });
  } catch (error) {
    console.error("Supabase keep-alive failed", error);
    return NextResponse.json(
      { error: "Supabase keep-alive failed" },
      { status: 503, headers }
    );
  }
}
