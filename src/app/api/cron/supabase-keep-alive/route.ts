import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// One bounded read per table so a single daily invocation still produces
// "a few" real PostgREST→Postgres requests, which is what Supabase's
// free-plan inactivity check measures.
const KEEP_ALIVE_QUERIES = [
  { table: "devices", column: "device_id" },
  { table: "readings", column: "deviceId" },
  { table: "risk_scores", column: "deviceId" },
] as const;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const headers = { "Cache-Control": "no-store" };

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const results = await Promise.all(
      KEEP_ALIVE_QUERIES.map(({ table, column }) =>
        supabaseAdmin
          .from(table)
          .select(column)
          .limit(1)
          .abortSignal(AbortSignal.timeout(10_000))
      )
    );

    const failure = results.find((result) => result.error !== null);
    if (failure) throw failure.error;

    return NextResponse.json({ status: "ok" }, { headers });
  } catch (error) {
    console.error("Supabase keep-alive failed", error);
    return NextResponse.json(
      { error: "Supabase keep-alive failed" },
      { status: 503, headers }
    );
  }
}
