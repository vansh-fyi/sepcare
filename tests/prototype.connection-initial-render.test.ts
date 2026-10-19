import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { ConnectionStatus } from "@/components/patterns/connection-status";

afterEach(() => vi.useRealTimers());

it("keeps the initial connection markup stable when hydration crosses the stale threshold", () => {
  vi.useFakeTimers();
  const props = { lastSyncedAt: 1_000_000 };
  vi.setSystemTime(props.lastSyncedAt + 30_000);
  const server = renderToStaticMarkup(createElement(ConnectionStatus, props));
  vi.setSystemTime(props.lastSyncedAt + 120_000);
  const delayedInitialRender = renderToStaticMarkup(createElement(ConnectionStatus, props));
  // Both renders happen before effects: identical serialized props must yield identical initial HTML.
  expect(delayedInitialRender).toBe(server);
});

it("keeps forced stale markup stable while the elapsed minute changes", () => {
  vi.useFakeTimers();
  const props = { lastSyncedAt: 1_000_000, forceState: "stale" as const };
  vi.setSystemTime(props.lastSyncedAt + 30_000);
  const server = renderToStaticMarkup(createElement(ConnectionStatus, props));
  vi.setSystemTime(props.lastSyncedAt + 120_000);
  expect(renderToStaticMarkup(createElement(ConnectionStatus, props))).toBe(server);
  expect(server).toContain('data-state="stale"');
});
