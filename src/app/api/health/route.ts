import { NextResponse } from "next/server";

/**
 * Deployment smoke-check endpoint. Used by Plan 04 to confirm the Vercel
 * deployment is live and serving traffic before wiring the real ingest path.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
