import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";

const effects = vi.hoisted(() => [] as Array<() => void | (() => void)>);
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useEffect: (effect: () => void | (() => void)) => effects.push(effect),
}));

afterEach(() => vi.useRealTimers());

describe("connection status", () => {
  it("provides the shared connection indicator", () => {
    expect(existsSync("src/components/patterns/connection-status.tsx")).toBe(true);
  });

  it("derives live and stale with a strict configurable threshold", async () => {
    const { getConnectionState } = await import("@/lib/fixtures/connection-status");
    const now = 180_000;
    expect(getConnectionState(now - 30_000, now)).toBe("live");
    expect(getConnectionState(now - 120_000, now)).toBe("stale");
    expect(getConnectionState(now - 60_000, now)).toBe("stale");
    expect(getConnectionState(now - 30_000, now, 30_000)).toBe("stale");
  });

  it("renders an icon, state word, and color for every state", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(180_000);
    const { ConnectionStatus } = await import("@/components/patterns/connection-status");
    for (const [props, label, color, icon] of [
      [{ lastSyncedAt: 170_000 }, "Live", "text-safe", "connected"],
      [{ lastSyncedAt: 90_000 }, "Last synced 2m ago", "text-text-muted", "sync"],
      [{ lastSyncedAt: 180_000, forceState: "reconnecting" as const }, "Reconnecting…", "text-caution-dark", "syncing"],
      [{ lastSyncedAt: 180_000, forceState: "stale" as const }, "Last synced just now", "text-text-muted", "sync"],
    ] as const) {
      const html = renderToStaticMarkup(createElement(ConnectionStatus, props));
      expect(html).toContain(label);
      expect(html).toContain(color);
      expect(html).toContain(`data-icon="${icon}"`);
    }
  });

  it("clears its 15-second clock when the effect is unmounted", async () => {
    vi.useFakeTimers();
    effects.length = 0;
    const { ConnectionStatus } = await import("@/components/patterns/connection-status");
    renderToStaticMarkup(createElement(ConnectionStatus, { lastSyncedAt: Date.now() }));
    const cleanup = effects[0]();
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(15_000);
    expect(typeof cleanup).toBe("function");
    if (cleanup) cleanup();
    expect(vi.getTimerCount()).toBe(0);
  });
});
