import { afterEach, expect, it, vi } from "vitest";
import { MonarchMoney } from "../client.js";

const client = () => new MonarchMoney({ token: "test", retry: { maxRetries: 0 } });
const reply = (data: unknown) => new Response(JSON.stringify({ data }), { status: 200 });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("refreshes each selected account once through the current per-account mutation", async () => {
  const fetch = vi.fn(async () => reply({ forceRefreshAccount: { success: true, errors: null } }));
  vi.stubGlobal("fetch", fetch);
  await expect(client().requestAccountsRefresh(["a", "b", "a"])).resolves.toBe(true);
  expect(fetch).toHaveBeenCalledTimes(2);
  const bodies = fetch.mock.calls.map((call) => JSON.parse((call as unknown as [string, RequestInit])[1].body as string));
  expect(bodies.map((body) => body.variables.input)).toEqual([{ accountId: "a" }, { accountId: "b" }]);
  expect(bodies.every((body) => body.operationName === "Common_ForceRefreshAccountMutation")).toBe(true);
});

it("stops after a rejected refresh instead of submitting later accounts", async () => {
  const fetch = vi.fn(async () => reply({ forceRefreshAccount: { success: false, errors: { code: "UNAVAILABLE" } } }));
  vi.stubGlobal("fetch", fetch);
  await expect(client().requestAccountsRefresh(["a", "b"])).rejects.toThrow("UNAVAILABLE");
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("waits for existing work without sending any mutation", async () => {
  vi.useFakeTimers();
  const fetch = vi.fn(async () => reply({ accounts: [{ id: "a", hasSyncInProgress: false }] }));
  vi.stubGlobal("fetch", fetch);
  const progress = vi.fn();
  const waiting = client().waitForAccountsRefresh({ accountIds: ["a"], timeout: 3, delay: 1, onProgress: progress });
  await vi.advanceTimersByTimeAsync(1000);
  await expect(waiting).resolves.toBe(true);
  expect(fetch).toHaveBeenCalledTimes(1);
  const body = JSON.parse((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
  expect(body.query.trim().startsWith("query")).toBe(true);
  expect(progress).toHaveBeenCalledWith({ completed: 1, total: 1, elapsedMs: 1000 });
});

it("returns incomplete at the wait budget and never starts a refresh", async () => {
  vi.useFakeTimers();
  const fetch = vi.fn(async () => reply({ accounts: [{ id: "a", hasSyncInProgress: true }] }));
  vi.stubGlobal("fetch", fetch);
  const waiting = client().waitForAccountsRefresh({ accountIds: ["a"], timeout: 3, delay: 1 });
  await vi.advanceTimersByTimeAsync(3000);
  await expect(waiting).resolves.toBe(false);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("does not report an absent selected account as completed", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn(async () => reply({ accounts: [] })));
  const waiting = expect(client().waitForAccountsRefresh({ accountIds: ["missing"], timeout: 3, delay: 1 })).rejects.toThrow("missing from refresh status");
  await vi.advanceTimersByTimeAsync(1000);
  await waiting;
});
