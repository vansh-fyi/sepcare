import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DEVICE_ID = "nb-001";
const PAGE_SIZE = 1000;
const MAX_RANGE_MS = 15 * 24 * 60 * 60 * 1000;
const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

type HistoryRisk = {
  status: string;
  breakdown: unknown;
};

type HistoryRow = {
  timestamp: number;
  heartRate: number;
  spo2: number;
  temperature: number;
  activityScore: number;
  risk_scores: HistoryRisk | HistoryRisk[] | null;
};

type ParsedEpoch = { value: number } | { error: NextResponse };

function json(body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...NO_STORE_HEADERS, ...init.headers },
  });
}

function invalidQuery(field: string, reason: string, error: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Invalid reading-history query", { field, reason });
  }

  return json({ error }, { status: 400 });
}

function parseEpochMilliseconds(
  value: string | null,
  field: "from" | "to"
): ParsedEpoch {
  if (value === null) {
    return { error: invalidQuery(field, "missing", `${field} is required`) };
  }

  if (!/^\d+$/.test(value)) {
    return {
      error: invalidQuery(
        field,
        "not-a-whole-decimal",
        `${field} must be a whole epoch-millisecond integer`
      ),
    };
  }

  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || !Number.isSafeInteger(timestamp)) {
    return {
      error: invalidQuery(
        field,
        "not-a-safe-integer",
        `${field} must be a safe epoch-millisecond integer`
      ),
    };
  }

  return { value: timestamp };
}

async function fetchHistory(from: number, to: number): Promise<HistoryRow[]> {
  const rows: HistoryRow[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabaseAdmin
      .from("readings")
      .select(
        "timestamp, heartRate, spo2, temperature, activityScore, risk_scores(status, breakdown)"
      )
      .eq("deviceId", DEVICE_ID)
      .gte("timestamp", from)
      .lte("timestamp", to)
      .order("timestamp", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    const page = (data ?? []) as unknown as HistoryRow[];
    rows.push(...page);

    if (page.length < PAGE_SIZE) return rows;
  }
}

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");
  if (deviceId === null) {
    return invalidQuery("deviceId", "missing", "deviceId is required");
  }

  if (deviceId !== DEVICE_ID) {
    return json({ error: "Device not found" }, { status: 404 });
  }

  const parsedFrom = parseEpochMilliseconds(
    request.nextUrl.searchParams.get("from"),
    "from"
  );
  if ("error" in parsedFrom) return parsedFrom.error;

  const parsedTo = parseEpochMilliseconds(
    request.nextUrl.searchParams.get("to"),
    "to"
  );
  if ("error" in parsedTo) return parsedTo.error;

  const { value: from } = parsedFrom;
  const { value: to } = parsedTo;

  if (from >= to) {
    return invalidQuery("range", "not-chronological", "from must be earlier than to");
  }

  if (to - from > MAX_RANGE_MS) {
    return invalidQuery("range", "exceeds-15-days", "range must not exceed 15 days");
  }

  try {
    const rows = await fetchHistory(from, to);
    const entries = rows.map((row) => {
      const riskScore = Array.isArray(row.risk_scores)
        ? row.risk_scores[0] ?? null
        : row.risk_scores;

      return {
        timestamp: row.timestamp,
        vitals: {
          heartRate: row.heartRate,
          spo2: row.spo2,
          temperature: row.temperature,
          activityScore: row.activityScore,
        },
        risk: riskScore
          ? { status: riskScore.status, breakdown: riskScore.breakdown }
          : null,
      };
    });

    return json({ deviceId: DEVICE_ID, from, to, entries });
  } catch (error) {
    console.error("Reading history query failed", { deviceId: DEVICE_ID, from, to, error });
    return json({ error: "Unable to load reading history" }, { status: 500 });
  }
}
