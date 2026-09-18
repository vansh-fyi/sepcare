import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { IngestSchema } from "@/lib/validation/ingest-schema";
import { computeAndPersistRiskScore } from "@/lib/risk/compute";

/**
 * POST /api/ingest — single vitals reading from an ESP32 device.
 *
 * Auth-before-validate ordering (D-05, D-10, Pitfall: timing side-channel):
 * the X-API-Key header is checked against the devices table BEFORE the body
 * is parsed or validated, so an unauthenticated caller learns nothing about
 * payload shape from the response.
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  // request.json() throws (rejects) on a non-JSON body — this must not
  // become an unhandled 500 (Pitfall 4). Read the raw body once; keep it
  // around for the auth lookup's deviceId, then re-validate with zod below.
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid payload", details: [{ message: "Body is not valid JSON" }] },
      { status: 400 }
    );
  }

  const bodyDeviceId =
    raw && typeof raw === "object" && "deviceId" in raw
      ? String((raw as Record<string, unknown>).deviceId ?? "")
      : "";

  const { data: device } = await supabaseAdmin
    .from("devices")
    .select("device_id")
    .eq("device_id", bodyDeviceId)
    .eq("api_key", apiKey)
    .maybeSingle();

  if (!device) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  const parsed = IngestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { deviceId, timestamp, vitals } = parsed.data;

  const { data: insertedReading, error: insertError } = await supabaseAdmin
    .from("readings")
    .insert({
      deviceId,
      timestamp,
      heartRate: vitals.heartRate,
      spo2: vitals.spo2,
      temperature: vitals.temperature,
      activityScore: vitals.activityScore,
    })
    .select("id, deviceId, timestamp, heartRate, temperature, activityScore")
    .single();

  if (insertError || !insertedReading) {
    return NextResponse.json(
      { error: "Failed to store reading" },
      { status: 500 }
    );
  }

  // D-23/D-24: score synchronously, but never let a scoring bug turn a
  // successful readings insert into a failed request — log and continue.
  try {
    await computeAndPersistRiskScore(insertedReading);
  } catch (scoringError) {
    console.error(
      "Risk scoring failed for reading",
      insertedReading.id,
      scoringError
    );
  }

  return NextResponse.json({ status: "ok" }, { status: 201 });
}
