# Monarch Money (Node.js)

Node.js/TypeScript library for accessing [Monarch Money](https://www.monarchmoney.com) data.

> **Disclaimer:** This project is unofficial and not affiliated with Monarch Money.

## Installation

```bash
npm install @hakimelek/monarchmoney
```

Requires **Node.js 18+** (uses native `fetch` and `AbortSignal.timeout`).

## Quick Start

```ts
import {
  MonarchMoney,
  EmailOtpRequiredException,
  RequireMFAException,
} from "@hakimelek/monarchmoney";

const mm = new MonarchMoney();

try {
  await mm.login("your@email.com", "password");
} catch (e) {
  if (e instanceof EmailOtpRequiredException) {
    // Monarch sent a verification code to your email
    const code = await promptUser("Enter the code from your email:");
    await mm.submitEmailOtp("your@email.com", "password", code);
  } else if (e instanceof RequireMFAException) {
    // TOTP-based MFA is enabled on the account
    await mm.multiFactorAuthenticate("your@email.com", "password", "123456");
  }
}

// Fetch data — fully typed responses
const { accounts } = await mm.getAccounts();
console.log(accounts[0].displayName, accounts[0].currentBalance);
```

## Authentication

Monarch's API requires email verification (OTP) for new devices/sessions, even when MFA is disabled. The library handles this with distinct exception types so your app can respond appropriately.

### Login with email OTP handling

```ts
try {
  await mm.login(email, password);
} catch (e) {
  if (e instanceof EmailOtpRequiredException) {
    // A code was sent to the user's email — prompt them for it
    const code = await yourApp.promptForEmailCode();
    await mm.submitEmailOtp(email, password, code);
  }
}
```

### With MFA secret key (automatic TOTP)

```ts
await mm.login("email", "password", {
  mfaSecretKey: "YOUR_BASE32_SECRET",
});
```

The MFA secret is the "Two-factor text code" from **Settings > Security > Enable MFA** in Monarch Money.

### Session persistence & token reuse

After a successful login (including email OTP), you can save the token to avoid re-authenticating on every run:

```ts
// Save token after login
mm.saveSession(); // writes to .mm/mm_session.json (mode 0o600)

// Next time, login() loads the saved session automatically
await mm.login(email, password); // uses saved token, no network call

// Or pass the token directly (skip login entirely)
const mm = new MonarchMoney({ token: "your-saved-token" });
```

```ts
mm.saveSession();          // save to disk
mm.loadSession();          // load from disk
mm.deleteSession();        // remove the file
mm.setToken("...");        // set token programmatically
```

### Interactive CLI

```ts
await mm.interactiveLogin(); // prompts for email, password, email OTP or MFA code
```

## API

All methods return **typed responses**. Hover over any method in your editor for full JSDoc and type information.

### Read Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getAccounts()` | `GetAccountsResponse` | All linked accounts |
| `getAccountTypeOptions()` | `GetAccountTypeOptionsResponse` | Available account types/subtypes |
| `getRecentAccountBalances(startDate?)` | `GetRecentAccountBalancesResponse` | Daily balances (default: last 31 days) |
| `getAccountSnapshotsByType(startDate, timeframe)` | `GetSnapshotsByAccountTypeResponse` | Snapshots by type (`"year"` / `"month"`) |
| `getAggregateSnapshots(options?)` | `GetAggregateSnapshotsResponse` | Aggregate net value over time |
| `getAccountHoldings(accountId)` | `GetAccountHoldingsResponse` | Securities in a brokerage account |
| `getAccountHistory(accountId)` | `AccountHistorySnapshot[]` | Daily balance history |
| `getInstitutions()` | `GetInstitutionsResponse` | Linked institutions |
| `getBudgets(startDate?, endDate?)` | `GetBudgetsResponse` | Budgets with actuals (default: last month → next month) |
| `getSubscriptionDetails()` | `GetSubscriptionDetailsResponse` | Plan status (trial, premium, etc.) |
| `getTransactionsSummary()` | `GetTransactionsSummaryResponse` | Aggregate summary |
| `getTransactions(options?)` | `GetTransactionsResponse` | Transactions with full filtering |
| `getAllTransactions(options?)` | `Transaction[]` | All matching transactions (auto-paginates) |
| `getTransactionPages(options?)` | `AsyncGenerator<Transaction[]>` | Async generator yielding pages |
| `getTransactionCategories()` | `GetTransactionCategoriesResponse` | All categories |
| `getTransactionCategoryGroups()` | `GetTransactionCategoryGroupsResponse` | Category groups |
| `getTransactionDetails(id)` | typed response | Single transaction detail |
| `getTransactionSplits(id)` | typed response | Splits for a transaction |
| `getTransactionTags()` | `GetTransactionTagsResponse` | All tags |
| `getCashflow(options?)` | `GetCashflowResponse` | Cashflow by category, group, merchant |
| `getCashflowSummary(options?)` | `GetCashflowSummaryResponse` | Income, expense, savings, savings rate |
| `getRecurringTransactions(start?, end?)` | `GetRecurringTransactionsResponse` | Upcoming recurring transactions |
| `getTransactionRules()` | `GetTransactionRulesResponse` | Automatic rule criteria, actions, and application counts |
| `isAccountsRefreshComplete(ids?)` | `boolean` | Check refresh status |

### Write Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `createManualAccount(params)` | `CreateManualAccountResponse` | Create manual account |
| `updateAccount(id, updates)` | `UpdateAccountResponse` | Update account settings/balance |
| `deleteAccount(id)` | `DeleteAccountResponse` | Delete account |
| `requestAccountsRefresh(ids)` | `boolean` | Start refresh (non-blocking) |
| `requestAccountsRefreshAndWait(opts?)` | `boolean` | Refresh and poll until done |
| `createTransaction(params)` | `CreateTransactionResponse` | Create transaction |
| `updateTransaction(id, updates)` | `UpdateTransactionResponse` | Update transaction |
| `updateRecurringMerchant(params)` | `UpdateRecurringMerchantResponse` | Correct a merchant's recurring schedule |
| `createTransactionRule(input)` | `TransactionRule` | Create a rule and return its persisted ID |
| `updateTransactionRule(id, updates)` | `TransactionRule` | Partially update a rule; use explicit `null` to clear a field |
| `deleteTransactionRule(id)` | `boolean` | Delete a transaction rule |
| `deleteTransaction(id)` | `boolean` | Delete transaction |
| `updateTransactionSplits(id, splits)` | `UpdateTransactionSplitResponse` | Manage splits |
| `createTransactionCategory(params)` | `CreateCategoryResponse` | Create category |
| `deleteTransactionCategory(id, moveTo?)` | `boolean` | Delete category |
| `deleteTransactionCategories(ids)` | `(boolean \| Error)[]` | Bulk delete |
| `createTransactionTag(name, color)` | `CreateTransactionTagResponse` | Create tag |
| `setTransactionTags(txId, tagIds)` | `SetTransactionTagsResponse` | Set tags on transaction |
| `setBudgetAmount(params)` | `SetBudgetAmountResponse` | Set/clear budget |
| `uploadAccountBalanceHistory(id, csv)` | `void` | Upload balance history CSV |

## Error Handling

```ts
import {
  MonarchMoneyError,          // base class for all errors
  EmailOtpRequiredException,  // email verification code needed — call submitEmailOtp()
  RequireMFAException,        // TOTP MFA required — call multiFactorAuthenticate()
  LoginFailedException,       // bad credentials or auth error (includes .statusCode)
  RequestFailedException,     // API/GraphQL failure (includes .statusCode, .graphQLErrors)
} from "@hakimelek/monarchmoney";

try {
  await mm.login(email, password);
} catch (e) {
  if (e instanceof EmailOtpRequiredException) {
    // e.code === "EMAIL_OTP_REQUIRED"
    // Prompt user for the code sent to their email
    const code = await getCodeFromUser();
    await mm.submitEmailOtp(email, password, code);
  } else if (e instanceof RequireMFAException) {
    // e.code === "MFA_REQUIRED"
    // Prompt for TOTP code or use mfaSecretKey
  } else if (e instanceof LoginFailedException) {
    // e.code === "LOGIN_FAILED", e.statusCode
    console.error("Login failed:", e.message);
  }
}

try {
  await mm.getAccounts();
} catch (e) {
  if (e instanceof RequestFailedException) {
    console.error(e.statusCode);     // HTTP status, if applicable
    console.error(e.graphQLErrors);  // GraphQL errors array, if applicable
    console.error(e.code);           // "HTTP_ERROR" | "REQUEST_FAILED"
  }
}
```

## Configuration

```ts
const mm = new MonarchMoney({
  sessionFile: ".mm/mm_session.json", // session file path
  timeout: 10,                        // API timeout in seconds
  token: "pre-existing-token",        // skip login
  retry: {
    maxRetries: 3,                    // retry on 429/5xx (default: 3, set 0 to disable)
    baseDelayMs: 500,                 // base delay with exponential backoff + jitter
  },
  rateLimit: {
    requestsPerSecond: 10,            // token-bucket throttle (default: 0 = unlimited)
  },
});

mm.setTimeout(30); // change timeout later
```

Retry automatically handles transient failures (429 Too Many Requests, 500, 502, 503, 504) with exponential backoff and jitter. The `Retry-After` header is respected on 429 responses.

## Auto-Pagination

`getTransactions()` returns a single page. For large datasets, use the auto-pagination helpers:

```ts
// Async generator — yields one page at a time (memory-efficient)
for await (const page of mm.getTransactionPages({ startDate: "2025-01-01", endDate: "2025-12-31" })) {
  for (const tx of page) {
    console.log(tx.merchant?.name, tx.amount);
  }
}

// Or collect everything into a flat array
const all = await mm.getAllTransactions({
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  pageSize: 100, // transactions per page (default: 100)
});
console.log(`${all.length} total transactions`);
```

Both methods accept the same filter options as `getTransactions()` (date range, category, account, tags, etc.).

## Refresh Progress

Track account refresh progress with the `onProgress` callback:

```ts
await mm.requestAccountsRefreshAndWait({
  timeout: 300,
  delay: 10,
  onProgress: ({ completed, total, elapsedMs }) => {
    console.log(`${completed}/${total} accounts refreshed (${(elapsedMs / 1000).toFixed(0)}s)`);
  },
});
```

## MCP Server (AI Agent Integration)

This package includes a built-in [Model Context Protocol](https://modelcontextprotocol.io) server with **30 tools**, making your Monarch Money data accessible to AI assistants like Claude Desktop, Cursor, and any MCP-compatible client.

### Setup

1. Get your Monarch Money auth token by logging in with the library (see [Authentication](#authentication)) and saving `mm.token`.

2. Add to your MCP client config (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "monarch-money": {
      "command": "npx",
      "args": ["@hakimelek/monarchmoney"],
      "env": {
        "MONARCH_TOKEN": "your-token-here"
      }
    }
  }
}
```

Or run it directly:

```bash
MONARCH_TOKEN=your-token npx @hakimelek/monarchmoney
```

### Available Tools

**Read (18 tools):** `get_accounts`, `get_account_holdings`, `get_account_history`, `get_account_type_options`, `get_recent_account_balances`, `get_aggregate_snapshots`, `get_institutions`, `get_budgets`, `get_subscription_details`, `get_transactions`, `get_transactions_summary`, `get_transaction_details`, `get_transaction_categories`, `get_transaction_category_groups`, `get_transaction_tags`, `get_cashflow`, `get_cashflow_summary`, `get_recurring_transactions`

**Write (12 tools):** `create_transaction`, `update_transaction`, `delete_transaction`, `create_manual_account`, `update_account`, `delete_account`, `refresh_accounts`, `is_refresh_complete`, `set_budget_amount`, `create_transaction_tag`, `set_transaction_tags`, `create_transaction_category`

Every tool has typed parameters with descriptions, so AI agents know exactly what arguments to pass.

## Project Structure

```
src/
  index.ts      — public exports
  client.ts     — MonarchMoney class with all API methods
  mcp.ts        — MCP server (30 tools for AI agents)
  errors.ts     — error classes (MonarchMoneyError hierarchy)
  endpoints.ts  — API URL constants
  queries.ts    — all GraphQL query/mutation strings
  types.ts      — TypeScript interfaces for all API responses
```

## Testing

```bash
npm test              # run tests once
npm run test:watch    # run tests in watch mode
npm run test:coverage # run with coverage report
```

Tests use [Vitest](https://vitest.dev) and do not require real API credentials (fetch is mocked where needed).

**Test the API connection** (against the live api.monarch.com):

```bash
npm run build

# Login with email + password (will prompt for email OTP code if required)
MONARCH_EMAIL=your@email.com MONARCH_PASSWORD=yourpassword npm run test:connection

# Use a saved token (skips login)
MONARCH_TOKEN=your-token npm run test:connection -- --token
```

Set these in a `.env` file for convenience (see `.env.example`).

## FAQ

**How do I use this if I login to Monarch via Google?**

Set a password on your Monarch account at [Settings > Security](https://app.monarchmoney.com/settings/security), then use that password with this library.

**Why does Monarch ask for an email code every time I login?**

Monarch requires email verification for new/unrecognized devices. After login, save the session token with `mm.saveSession()` or store `mm.token` — subsequent runs will reuse it without re-authenticating.

## How This Library Compares

There are several unofficial Monarch Money integrations. Here's how `@hakimelek/monarchmoney` stacks up.

### Landscape

| | **@hakimelek/monarchmoney** | **monarch-money-api** (pbassham) | **monarchmoney** (keithah) | **monarchmoney** (hammem) |
|---|---|---|---|---|
| **Platform** | Node.js / TypeScript | Node.js / JavaScript | Node.js / TypeScript | Python |
| **npm weekly downloads** | — | ~440 | ~130 | N/A (pip: ~103K/mo) |
| **Runtime deps** | **1** (speakeasy) | 5 | 7 | 3 |
| **TypeScript types** | Full (every response) | None | Yes | N/A |
| **Email OTP flow** | Yes | No | No | No |
| **MFA / TOTP** | Yes | Yes | Yes | Yes |
| **Session persistence** | Yes (0o600 perms) | Yes | Yes (AES-256) | Yes |
| **Interactive CLI login** | Yes | Yes | Yes | Yes |
| **HTTP client** | Native `fetch` | node-fetch | node-fetch + graphql-request | aiohttp |
| **Error hierarchy** | 4 typed exceptions | Generic throws | Generic throws | 1 exception |
| **Read methods** | 20 | 15 | ~20 | ~16 |
| **Write methods** | 14 | 9 | ~12 | ~10 |
| **Rate limiting** | Yes | No | Yes | No |
| **Retry with backoff** | Yes | No | Yes | No |
| **Auto-pagination** | Yes | No | No | No |
| **Dual CJS + ESM** | Yes | No | Yes | No |
| **Refresh progress events** | Yes | No | No | No |
| **Built-in MCP server** | Yes (30 tools) | No | No | No |

### Where this library wins

**Minimal footprint.** One runtime dependency vs 5-7 in the JS/TS alternatives. Native `fetch` means zero HTTP polyfills on Node 18+.

**Email OTP support.** Monarch now requires email verification for unrecognized devices, even when MFA is off. This is the only Node.js library that handles the full `EmailOtpRequiredException` → `submitEmailOtp()` flow. Without it, automated scripts break on first login from a new environment.

**Typed everything.** Every API response has a dedicated TypeScript interface — 50+ exported types covering accounts, transactions, holdings, cashflow, budgets, recurring items, and mutations. The `monarch-money-api` package has no types at all.

**Structured error handling.** Four distinct exception classes (`LoginFailedException`, `RequireMFAException`, `EmailOtpRequiredException`, `RequestFailedException`) with error codes and status codes. Competitors throw generic errors or strings.

**Broader write coverage.** Includes `updateTransaction()`, `setBudgetAmount()`, `uploadAccountBalanceHistory()`, `getCashflow()`, `getCashflowSummary()`, and `getRecurringTransactions()` — all missing from `monarch-money-api`.

**Clean, flat API.** One class, direct methods, no sub-objects or verbosity levels to learn. Import `MonarchMoney`, call methods, get typed results.

## Contributing

Contributions welcome. Please ensure TypeScript compiles cleanly (`npm run build`) and tests pass (`npm test`).

## License

MIT
