import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/cron/supabase-keep-alive/route";

const query = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  limit: vi.fn(),
  abortSignal: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: query }));

function request(authorization?: string) {
  return new Request("http://localhost/api/cron/supabase-keep-alive", {
    headers: authorization ? { authorization } : {},
  });
}

describe("Supabase keep-alive cron", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
    query.from.mockReturnValue(query);
    query.select.mockReturnValue(query);
    query.limit.mockReturnValue(query);
    query.abortSignal.mockResolvedValue({ data: [], error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it.each([undefined, "Bearer wrong-secret"])(
    "rejects unauthorized requests (%s) before querying Supabase",
    async (authorization) => {
      expect((await GET(request(authorization))).status).toBe(401);
      expect(query.from).not.toHaveBeenCalled();
    }
  );

  it("rejects requests when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await GET(request("Bearer undefined"))).status).toBe(401);
    expect(query.from).not.toHaveBeenCalled();
  });

  it("executes one bounded read per keep-alive table and succeeds even with empty tables", async () => {
    const response = await GET(request("Bearer test-cron-secret"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ status: "ok" });
    expect(query.from.mock.calls.map(([table]) => table)).toEqual([
      "devices",
      "readings",
      "risk_scores",
    ]);
    expect(query.select).toHaveBeenCalledWith("device_id");
    expect(query.select).toHaveBeenCalledWith("deviceId");
    expect(query.select).toHaveBeenCalledTimes(3);
    expect(query.limit).toHaveBeenCalledWith(1);
    expect(query.abortSignal).toHaveBeenCalledTimes(3);
    expect(query.abortSignal).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it.each(["database error", "network exception"])(
    "reports %s as a failed invocation without exposing details",
    async (failure) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("private database details");
      if (failure === "database error") {
        query.abortSignal.mockResolvedValue({ data: null, error });
      } else {
        query.abortSignal.mockRejectedValue(error);
      }

      const response = await GET(request("Bearer test-cron-secret"));

      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toBe("no-store");
      await expect(response.json()).resolves.toEqual({ error: "Supabase keep-alive failed" });
      expect(console.error).toHaveBeenCalled();
    }
  );

  it("reports failure when only one of the keep-alive queries fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("private database details");
    query.abortSignal
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: null, error });

    const response = await GET(request("Bearer test-cron-secret"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Supabase keep-alive failed" });
  });
});
