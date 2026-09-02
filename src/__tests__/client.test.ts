import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { MonarchMoney } from "../client.js";
import { LoginFailedException, RequestFailedException } from "../errors.js";

describe("MonarchMoney", () => {
  describe("constructor", () => {
    it("uses default session file and timeout when no options", () => {
      const mm = new MonarchMoney();
      expect(mm.timeout).toBe(10);
      expect(mm.token).toBeNull();
      expect(path.basename(mm["_sessionFile"])).toBe("mm_session.json");
    });

    it("sets token and Authorization header when token option provided", () => {
      const mm = new MonarchMoney({ token: "abc123" });
      expect(mm.token).toBe("abc123");
      expect(mm["_headers"]["Authorization"]).toBe("Token abc123");
    });

    it("respects custom timeout and session file", () => {
      const mm = new MonarchMoney({
        timeout: 30,
        sessionFile: "/absolute/custom/session.json",
      });
      expect(mm.timeout).toBe(30);
      expect(mm["_sessionFile"]).toBe("/absolute/custom/session.json");
    });

    it("resolves relative session file against cwd", () => {
      const mm = new MonarchMoney({ sessionFile: "custom.json" });
      expect(mm["_sessionFile"]).toBe(path.resolve(process.cwd(), "custom.json"));
    });
  });

  describe("setTimeout / setToken", () => {
    it("setTimeout updates internal timeout", () => {
      const mm = new MonarchMoney();
      mm.setTimeout(20);
      expect(mm.timeout).toBe(20);
      expect(mm["_timeout"]).toBe(20_000);
    });

    it("setToken updates token and Authorization header", () => {
      const mm = new MonarchMoney();
      mm.setToken("new-token");
      expect(mm.token).toBe("new-token");
      expect(mm["_headers"]["Authorization"]).toBe("Token new-token");
    });
  });

  describe("session", () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "monarchmoney-test-"));
    });

    afterEach(() => {
      try {
        fs.rmSync(tmpDir, { recursive: true });
      } catch {
        // ignore
      }
    });

    it("saveSession writes token to file with restricted permissions", () => {
      const sessionFile = path.join(tmpDir, "session.json");
      const mm = new MonarchMoney({ sessionFile, token: "saved-token" });
      mm.saveSession();
      expect(fs.existsSync(sessionFile)).toBe(true);
      const data = JSON.parse(fs.readFileSync(sessionFile, "utf8"));
      expect(data.token).toBe("saved-token");
      if (process.platform !== "win32") {
        const mode = fs.statSync(sessionFile).mode & 0o777;
        expect(mode).toBe(0o600);
      }
    });

    it("loadSession reads token and sets it on client", () => {
      const sessionFile = path.join(tmpDir, "session.json");
      fs.writeFileSync(sessionFile, JSON.stringify({ token: "loaded-token" }), "utf8");
      const mm = new MonarchMoney({ sessionFile });
      mm.loadSession();
      expect(mm.token).toBe("loaded-token");
    });

    it("loadSession throws when file has no token", () => {
      const sessionFile = path.join(tmpDir, "bad.json");
      fs.writeFileSync(sessionFile, "{}", "utf8");
      const mm = new MonarchMoney({ sessionFile });
      expect(() => mm.loadSession()).toThrow(LoginFailedException);
      expect(() => mm.loadSession()).toThrow("valid token");
    });

    it("deleteSession removes file", () => {
      const sessionFile = path.join(tmpDir, "session.json");
      fs.writeFileSync(sessionFile, "{}", "utf8");
      const mm = new MonarchMoney({ sessionFile });
      mm.deleteSession();
      expect(fs.existsSync(sessionFile)).toBe(false);
    });
  });

  describe("login", () => {
    it("throws LoginFailedException when no email/password and no saved session", async () => {
      const mm = new MonarchMoney({
        sessionFile: path.join(os.tmpdir(), "nonexistent-session-12345.json"),
        useSavedSession: true,
      });
      await expect(
        mm.login(undefined, undefined, { useSavedSession: true })
      ).rejects.toThrow(LoginFailedException);
      await expect(
        mm.login("", "pass", { useSavedSession: false })
      ).rejects.toThrow(LoginFailedException);
      await expect(
        mm.login("a@b.com", "  ", { useSavedSession: false })
      ).rejects.toThrow(LoginFailedException);
    });
  });

  describe("getAccounts (no token)", () => {
    it("throws LoginFailedException when not authenticated", async () => {
      const mm = new MonarchMoney();
      await expect(mm.getAccounts()).rejects.toThrow(LoginFailedException);
      await expect(mm.getAccounts()).rejects.toThrow("login");
    });
  });

  describe("getAccounts (mocked fetch)", () => {
    const mockAccountsResponse = {
      data: {
        accounts: [
          {
            id: "acc-1",
            displayName: "Checking",
            currentBalance: 1000,
            __typename: "Account",
          },
        ],
        householdPreferences: { id: "pref-1", accountGroupOrder: [], __typename: "HouseholdPreferences" },
      },
    };

    beforeEach(() => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockAccountsResponse),
          } as Response)
        )
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("returns accounts when authenticated and API returns data", async () => {
      const mm = new MonarchMoney({ token: "test-token" });
      const result = await mm.getAccounts();
      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0].id).toBe("acc-1");
      expect(result.accounts[0].displayName).toBe("Checking");
      expect(result.accounts[0].currentBalance).toBe(1000);
      expect(result.householdPreferences).toBeDefined();
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAccounts (mocked fetch GraphQL errors)", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              errors: [{ message: "Unauthorized" }],
            }),
        } as Response)
      ));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("throws RequestFailedException when GraphQL returns errors", async () => {
      const mm = new MonarchMoney({ token: "bad-token" });
      await expect(mm.getAccounts()).rejects.toThrow(RequestFailedException);
      await expect(mm.getAccounts()).rejects.toThrow("Unauthorized");
    });
  });

  describe("retry with backoff", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("retries on 500 and succeeds on subsequent attempt", async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          headers: new Headers(),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          headers: new Headers(),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: { accounts: [], householdPreferences: { id: "p", accountGroupOrder: [] } },
          }),
        } as unknown as Response);

      vi.stubGlobal("fetch", mockFetch);

      const mm = new MonarchMoney({
        token: "test-token",
        retry: { maxRetries: 3, baseDelayMs: 1 },
      });
      const result = await mm.getAccounts();
      expect(result.accounts).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("gives up after maxRetries and returns the error response", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        headers: new Headers(),
      } as unknown as Response);

      vi.stubGlobal("fetch", mockFetch);

      const mm = new MonarchMoney({
        token: "test-token",
        retry: { maxRetries: 2, baseDelayMs: 1 },
      });
      await expect(mm.getAccounts()).rejects.toThrow(RequestFailedException);
      expect(mockFetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it("does not retry on non-retryable status codes", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
      } as unknown as Response);

      vi.stubGlobal("fetch", mockFetch);

      const mm = new MonarchMoney({
        token: "test-token",
        retry: { maxRetries: 3, baseDelayMs: 1 },
      });
      await expect(mm.getAccounts()).rejects.toThrow(RequestFailedException);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("retries disabled when maxRetries is 0", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
      } as unknown as Response);

      vi.stubGlobal("fetch", mockFetch);

      const mm = new MonarchMoney({
        token: "test-token",
        retry: { maxRetries: 0 },
      });
      await expect(mm.getAccounts()).rejects.toThrow(RequestFailedException);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("rate limiter", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("completes requests with rate limiting enabled", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: { accounts: [], householdPreferences: { id: "p", accountGroupOrder: [] } },
        }),
      } as unknown as Response);

      vi.stubGlobal("fetch", mockFetch);

      const mm = new MonarchMoney({
        token: "test-token",
        rateLimit: { requestsPerSecond: 50 },
        retry: { maxRetries: 0 },
      });

      await Promise.all([mm.getAccounts(), mm.getAccounts(), mm.getAccounts()]);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("does not throttle when rate limiting is disabled", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: { accounts: [], householdPreferences: { id: "p", accountGroupOrder: [] } },
        }),
      } as unknown as Response);

      vi.stubGlobal("fetch", mockFetch);

      const mm = new MonarchMoney({
        token: "test-token",
        retry: { maxRetries: 0 },
      });

      const start = Date.now();
      await Promise.all([mm.getAccounts(), mm.getAccounts()]);
      expect(Date.now() - start).toBeLessThan(1000);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("auto-pagination", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    function makeTxPage(ids: string[], totalCount: number) {
      return {
        ok: true,
        json: () => Promise.resolve({
          data: {
            allTransactions: {
              totalCount,
              results: ids.map((id) => ({
                id,
                amount: 10,
                pending: false,
                date: "2025-01-01",
                hideFromReports: false,
                plaidName: null,
                notes: null,
                isRecurring: false,
                reviewStatus: null,
                needsReview: false,
                isSplitTransaction: false,
                category: null,
                merchant: { id: "m1", name: "Store" },
                account: { id: "a1", displayName: "Checking" },
                tags: [],
              })),
            },
            transactionRules: [],
          },
        }),
      } as unknown as Response;
    }

    it("getAllTransactions fetches all pages", async () => {
      const page1Ids = Array.from({ length: 100 }, (_, i) => `tx-${i}`);
      const page2Ids = Array.from({ length: 100 }, (_, i) => `tx-${100 + i}`);
      const page3Ids = Array.from({ length: 50 }, (_, i) => `tx-${200 + i}`);

      const mockFetch = vi.fn()
        .mockResolvedValueOnce(makeTxPage(page1Ids, 250))
        .mockResolvedValueOnce(makeTxPage(page2Ids, 250))
        .mockResolvedValueOnce(makeTxPage(page3Ids, 250));

      vi.stubGlobal("fetch", mockFetch);

      const mm = new MonarchMoney({
        token: "test-token",
        retry: { maxRetries: 0 },
      });
      const all = await mm.getAllTransactions({
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        pageSize: 100,
      });
      expect(all).toHaveLength(250);
      expect(all[0].id).toBe("tx-0");
      expect(all[249].id).toBe("tx-249");
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("getTransactionPages yields pages as async generator", async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce(makeTxPage(["a", "b"], 3))
        .mockResolvedValueOnce(makeTxPage(["c"], 3));

      vi.stubGlobal("fetch", mockFetch);

      const mm = new MonarchMoney({
        token: "test-token",
        retry: { maxRetries: 0 },
      });

      const pages: string[][] = [];
      for await (const page of mm.getTransactionPages({
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        pageSize: 2,
      })) {
        pages.push(page.map((tx) => tx.id));
      }
      expect(pages).toEqual([["a", "b"], ["c"]]);
    });

    it("returns empty array when no transactions exist", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce(makeTxPage([], 0));

      vi.stubGlobal("fetch", mockFetch);

      const mm = new MonarchMoney({
        token: "test-token",
        retry: { maxRetries: 0 },
      });
      const all = await mm.getAllTransactions();
      expect(all).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("requestAccountsRefreshAndWait onProgress", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("calls onProgress with correct completed/total on each poll", async () => {
      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // getAccounts call
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                accounts: [
                  { id: "a1", displayName: "Checking" },
                  { id: "a2", displayName: "Savings" },
                ],
                householdPreferences: { id: "p", accountGroupOrder: [] },
              },
            }),
          } as unknown as Response);
        }
        if (callCount === 2) {
          // requestAccountsRefresh (ForceRefreshMutation)
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { forceRefreshAccounts: { success: true, errors: [] } },
            }),
          } as unknown as Response);
        }
        if (callCount === 3) {
          // first poll — a1 done, a2 still syncing
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                accounts: [
                  { id: "a1", hasSyncInProgress: false },
                  { id: "a2", hasSyncInProgress: true },
                ],
              },
            }),
          } as unknown as Response);
        }
        // second poll — both done
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              accounts: [
                { id: "a1", hasSyncInProgress: false },
                { id: "a2", hasSyncInProgress: false },
              ],
            },
          }),
        } as unknown as Response);
      });

      vi.stubGlobal("fetch", mockFetch);

      const progressCalls: Array<{ completed: number; total: number }> = [];
      const mm = new MonarchMoney({
        token: "test-token",
        retry: { maxRetries: 0 },
      });
      const result = await mm.requestAccountsRefreshAndWait({
        delay: 0.01,
        timeout: 5,
        onProgress: (p) => progressCalls.push({ completed: p.completed, total: p.total }),
      });

      expect(result).toBe(true);
      expect(progressCalls).toHaveLength(2);
      expect(progressCalls[0]).toEqual({ completed: 1, total: 2 });
      expect(progressCalls[1]).toEqual({ completed: 2, total: 2 });
    });
  });

  describe("current transaction GraphQL operations", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it.each([
      {
        call: (client: MonarchMoney) => client.getTransactionDetails("txn-1"),
        operation: "GetTransactionDrawer",
        rootField: "transaction: getTransaction",
        variables: { id: "txn-1", redirectPosted: true },
        data: { transaction: { id: "txn-1" } },
      },
      {
        call: (client: MonarchMoney) => client.getTransactionSplits("txn-1"),
        operation: "TransactionSplitQuery",
        rootField: "transaction: getTransaction",
        variables: { id: "txn-1" },
        data: { transaction: { id: "txn-1", splitTransactions: [] } },
      },
      {
        call: (client: MonarchMoney) => client.getTransactionTags(),
        operation: "GetHouseholdTransactionTags",
        rootField: "tags: householdTransactionTags",
        variables: {},
        data: { tags: [] },
      },
      {
        call: (client: MonarchMoney) => client.deleteTransactionTag("tag-1"),
        operation: "Common_DeleteTransactionTag",
        rootField: "deleteTransactionTag",
        variables: { tagId: "tag-1" },
        data: { deleteTransactionTag: { __typename: "DeleteTransactionTagPayload" } },
      },
      {
        call: (client: MonarchMoney) => client.createTransactionCategory({
          groupId: "group-1",
          name: "Category",
        }),
        operation: "Web_CreateCategory",
        rootField: "createCategory",
        variables: {
          input: expect.objectContaining({ group: "group-1", name: "Category" }),
        },
        data: { createCategory: { category: { id: "category-1", name: "Category" }, errors: [] } },
      },
      {
        call: (client: MonarchMoney) => client.deleteTransaction("txn-1"),
        operation: "Common_DeleteTransactionMutation",
        rootField: "deleteTransaction",
        variables: { input: { transactionId: "txn-1" } },
        data: { deleteTransaction: { deleted: true, errors: [] } },
      },
      {
        call: (client: MonarchMoney) => client.setTransactionTags("txn-1", ["tag-1"]),
        operation: "Web_SetTransactionTags",
        rootField: "SetTransactionTagsInput!",
        variables: { input: { transactionId: "txn-1", tagIds: ["tag-1"] } },
        data: { setTransactionTags: { transaction: { id: "txn-1", tags: [] }, errors: [] } },
      },
    ])("uses $operation", async ({ call, operation, rootField, variables, data }) => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data }),
      } as unknown as Response);
      vi.stubGlobal("fetch", mockFetch);

      await call(new MonarchMoney({ token: "test-token", retry: { maxRetries: 0 } }));

      const request = mockFetch.mock.calls[0]?.[1] as RequestInit;
      const body = JSON.parse(String(request.body)) as {
        operationName: string;
        query: string;
        variables: Record<string, unknown>;
      };
      expect(body.operationName).toBe(operation);
      expect(body.query).toContain(rootField);
      expect(body.variables).toEqual(variables);
    });
  });
});
