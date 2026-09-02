export interface AccountType {
  name: string;
  display: string;
  group?: string;
  __typename?: string;
}

export interface AccountSubtype {
  name: string;
  display: string;
  __typename?: string;
}

export interface Credential {
  id: string;
  updateRequired: boolean;
  disconnectedFromDataProviderAt: string | null;
  dataProvider: string;
  institution: {
    id: string;
    plaidInstitutionId: string | null;
    name: string;
    status: string | null;
    __typename?: string;
  };
  __typename?: string;
}

export interface Institution {
  id: string;
  name: string;
  primaryColor: string | null;
  url: string | null;
  __typename?: string;
}

export interface Account {
  id: string;
  displayName: string;
  syncDisabled: boolean;
  deactivatedAt: string | null;
  isHidden: boolean;
  isAsset: boolean;
  mask: string | null;
  createdAt: string;
  updatedAt: string;
  displayLastUpdatedAt: string | null;
  currentBalance: number;
  displayBalance: number;
  includeInNetWorth: boolean;
  hideFromList: boolean;
  hideTransactionsFromReports: boolean;
  includeBalanceInNetWorth: boolean;
  includeInGoalBalance: boolean;
  dataProvider: string;
  dataProviderAccountId: string | null;
  isManual: boolean;
  transactionsCount: number;
  holdingsCount: number;
  manualInvestmentsTrackingMethod: string | null;
  order: number;
  logoUrl: string | null;
  type: AccountType;
  subtype: AccountSubtype;
  credential: Credential | null;
  institution: Institution | null;
  __typename?: string;
}

export interface HouseholdPreferences {
  id: string;
  accountGroupOrder: string[];
  __typename?: string;
}

export interface GetAccountsResponse {
  accounts: Account[];
  householdPreferences: HouseholdPreferences;
}

export interface AccountTypeOption {
  type: AccountType & { possibleSubtypes: AccountSubtype[] };
  subtype: AccountSubtype;
  __typename?: string;
}

export interface GetAccountTypeOptionsResponse {
  accountTypeOptions: AccountTypeOption[];
}

export interface AccountBalance {
  id: string;
  recentBalances: number[];
  __typename?: string;
}

export interface GetRecentAccountBalancesResponse {
  accounts: AccountBalance[];
}

export interface AccountSnapshot {
  accountType: string;
  month: string;
  balance: number;
  __typename?: string;
}

export interface GetSnapshotsByAccountTypeResponse {
  snapshotsByAccountType: AccountSnapshot[];
  accountTypes: { name: string; group: string; __typename?: string }[];
}

export interface AggregateSnapshot {
  date: string;
  balance: number;
  __typename?: string;
}

export interface GetAggregateSnapshotsResponse {
  aggregateSnapshots: AggregateSnapshot[];
}

export interface Security {
  id: string;
  name: string;
  type: string;
  ticker: string | null;
  typeDisplay: string;
  currentPrice: number;
  currentPriceUpdatedAt: string | null;
  closingPrice: number;
  closingPriceUpdatedAt: string | null;
  oneDayChangePercent: number | null;
  oneDayChangeDollars: number | null;
  __typename?: string;
}

export interface Holding {
  id: string;
  type: string;
  typeDisplay: string;
  name: string;
  ticker: string | null;
  closingPrice: number;
  isManual: boolean;
  closingPriceUpdatedAt: string | null;
  __typename?: string;
}

export interface AggregateHolding {
  id: string;
  quantity: number;
  basis: number | null;
  totalValue: number;
  securityPriceChangeDollars: number | null;
  securityPriceChangePercent: number | null;
  lastSyncedAt: string | null;
  holdings: Holding[];
  security: Security;
  __typename?: string;
}

export interface GetAccountHoldingsResponse {
  portfolio: {
    aggregateHoldings: {
      edges: { node: AggregateHolding; __typename?: string }[];
      __typename?: string;
    };
    __typename?: string;
  };
}

export interface AccountHistorySnapshot {
  date: string;
  signedBalance: number;
  accountId: string;
  accountName: string;
}

export interface Merchant {
  id: string;
  name: string;
  transactionsCount?: number;
  logoUrl?: string | null;
  __typename?: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  group?: { id: string; name?: string; type: string; __typename?: string };
  __typename?: string;
}

export interface TransactionTag {
  id: string;
  name: string;
  color: string;
  order: number;
  transactionCount?: number;
  __typename?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  pending: boolean;
  date: string;
  hideFromReports: boolean;
  plaidName: string | null;
  notes: string | null;
  isRecurring: boolean;
  reviewStatus: string | null;
  needsReview: boolean;
  isSplitTransaction: boolean;
  category: TransactionCategory | null;
  merchant: Merchant | null;
  account: { id: string; displayName: string; __typename?: string };
  tags: TransactionTag[];
  attachments?: { id: string; __typename?: string }[];
  __typename?: string;
}

export interface GetTransactionsResponse {
  allTransactions: {
    totalCount: number;
    results: Transaction[];
    __typename?: string;
  };
  transactionRules: { id: string; __typename?: string }[];
}

export interface TransactionsSummary {
  avg: number;
  count: number;
  max: number;
  maxExpense: number;
  sum: number;
  sumIncome: number;
  sumExpense: number;
  first: string | null;
  last: string | null;
  __typename?: string;
}

export interface GetTransactionsSummaryResponse {
  aggregates: {
    summary: TransactionsSummary;
    __typename?: string;
  };
}

export interface Category {
  id: string;
  order: number;
  name: string;
  icon?: string;
  systemCategory: string | null;
  isSystemCategory: boolean;
  isDisabled: boolean;
  updatedAt: string;
  createdAt: string;
  group: { id: string; name: string; type: string; __typename?: string };
  __typename?: string;
}

export interface GetTransactionCategoriesResponse {
  categories: Category[];
}

export interface CategoryGroup {
  id: string;
  name: string;
  order: number;
  type: string;
  updatedAt: string;
  createdAt: string;
  __typename?: string;
}

export interface GetTransactionCategoryGroupsResponse {
  categoryGroups: CategoryGroup[];
}

export interface GetTransactionTagsResponse {
  tags: TransactionTag[];
}

export interface Subscription {
  id: string;
  paymentSource: string;
  referralCode: string;
  isOnFreeTrial: boolean;
  hasPremiumEntitlement: boolean;
  __typename?: string;
}

export interface GetSubscriptionDetailsResponse {
  subscription: Subscription;
}

export interface CashflowAggregate {
  groupBy: {
    category?: TransactionCategory;
    categoryGroup?: { id: string; name: string; type: string; __typename?: string };
    merchant?: Merchant;
    __typename?: string;
  };
  summary: {
    sum?: number;
    sumIncome?: number;
    sumExpense?: number;
    savings?: number;
    savingsRate?: number;
    __typename?: string;
  };
  __typename?: string;
}

export interface GetCashflowResponse {
  byCategory: CashflowAggregate[];
  byCategoryGroup: CashflowAggregate[];
  byMerchant: CashflowAggregate[];
  summary: CashflowAggregate[];
}

export interface GetCashflowSummaryResponse {
  summary: CashflowAggregate[];
}

export interface RecurringTransactionItem {
  stream: {
    id: string;
    frequency: string;
    amount: number;
    isApproximate: boolean;
    merchant: Merchant;
    __typename?: string;
  };
  date: string;
  isPast: boolean;
  transactionId: string | null;
  amount: number;
  amountDiff: number | null;
  category: TransactionCategory | null;
  account: { id: string; displayName: string; logoUrl: string | null; __typename?: string };
  __typename?: string;
}

export interface GetRecurringTransactionsResponse {
  recurringTransactionItems: RecurringTransactionItem[];
}

export interface RuleCriterion {
  operator: "contains" | "eq";
  value: string;
}

export interface RuleAmountCriterion {
  operator: string;
  isExpense?: boolean;
  value?: number;
  valueRange?: { lower?: number; upper?: number };
}

export interface RuleSplit {
  categoryId?: string;
  merchantName?: string;
  amount?: number;
  goalId?: string;
  tags?: string[];
  hideFromReports?: boolean;
  reviewStatus?: string;
}

export interface RuleSplitAction {
  amountType: "ABSOLUTE" | "PERCENTAGE";
  splitsInfo: RuleSplit[];
}

export interface TransactionRuleInput {
  merchantCriteriaUseOriginalStatement?: boolean;
  merchantCriteria?: RuleCriterion[];
  originalStatementCriteria?: RuleCriterion[];
  merchantNameCriteria?: RuleCriterion[];
  amountCriteria?: RuleAmountCriterion;
  categoryIds?: string[];
  accountIds?: string[];
  setMerchantAction?: string;
  setCategoryAction?: string;
  addTagsAction?: string[];
  linkGoalAction?: string;
  reviewStatusAction?: string;
  setHideFromReportsAction?: boolean;
  splitTransactionsAction?: RuleSplitAction;
  applyToExistingTransactions?: boolean;
}

export type TransactionRuleUpdate = {
  [Key in keyof TransactionRuleInput]?: TransactionRuleInput[Key] | null;
};

export interface TransactionRule
  extends Omit<
    TransactionRuleInput,
    "setMerchantAction" | "setCategoryAction" | "addTagsAction" | "linkGoalAction"
  > {
  id: string;
  order: number;
  categories?: Array<{ id: string; name: string }>;
  accounts?: Array<{ id: string; displayName: string }>;
  setMerchantAction?: string | Merchant;
  setCategoryAction?: string | TransactionCategory;
  addTagsAction?: Array<string | TransactionTag>;
  linkGoalAction?: string | { id: string; name: string };
  recentApplicationCount?: number;
  lastAppliedAt?: string | null;
}

export interface GetTransactionRulesResponse {
  transactionRules: TransactionRule[];
}

export interface RecurringMerchantUpdate {
  merchantId: string;
  name: string;
  isRecurring: boolean;
  frequency?: string;
  baseDate?: string;
  amount?: number;
  isActive?: boolean;
}

export interface UpdateRecurringMerchantResponse {
  updateMerchant: {
    merchant: (Merchant & {
      recurringTransactionStream: {
        id: string;
        frequency: string;
        amount: number;
        baseDate: string;
        isActive: boolean;
      } | null;
    }) | null;
    errors: PayloadError[];
  };
}

export interface GetBudgetsResponse {
  budgetSystem: string;
  budgetData: Record<string, unknown>;
  categoryGroups: Array<{
    id: string;
    name: string;
    order: number;
    type: string;
    budgetVariability: string | null;
    updatedAt: string;
    groupLevelBudgetingEnabled: boolean;
    categories: Array<{
      id: string;
      name: string;
      icon: string | null;
      order: number;
      budgetVariability: string | null;
      excludeFromBudget: boolean;
      isSystemCategory: boolean;
      __typename?: string;
    }>;
    __typename?: string;
  }>;
  goalsV2: Array<{
    id: string;
    name: string;
    archivedAt: string | null;
    completedAt: string | null;
    priority: number;
    plannedContributions: Array<{ id: string; month: string; amount: number; __typename?: string }>;
    monthlyContributionSummaries: Array<{ month: string; sum: number; __typename?: string }>;
    __typename?: string;
  }>;
}

export interface GetInstitutionsResponse {
  credentials: Array<{
    id: string;
    updateRequired: boolean;
    disconnectedFromDataProviderAt: string | null;
    institution: { id: string; name: string; url: string | null; __typename?: string };
    __typename?: string;
  }>;
  accounts: Array<{
    id: string;
    displayName: string;
    subtype: { display: string; __typename?: string };
    mask: string | null;
    credential: { id: string; __typename?: string } | null;
    deletedAt: string | null;
    __typename?: string;
  }>;
  subscription: {
    isOnFreeTrial: boolean;
    hasPremiumEntitlement: boolean;
    __typename?: string;
  };
}

export interface CreateManualAccountResponse {
  createManualAccount: {
    account: { id: string; __typename?: string } | null;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface PayloadError {
  fieldErrors: { field: string; messages: string[]; __typename?: string }[];
  message: string | null;
  code: string | null;
  __typename?: string;
}

export interface UpdateAccountResponse {
  updateAccount: {
    account: Account | null;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface DeleteAccountResponse {
  deleteAccount: {
    deleted: boolean;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface CreateTransactionResponse {
  createTransaction: {
    transaction: { id: string; __typename?: string } | null;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface UpdateTransactionResponse {
  updateTransaction: {
    transaction: { id: string; amount: number; date: string; __typename?: string } | null;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface DeleteTransactionResponse {
  deleteTransaction: {
    deleted: boolean;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface CreateCategoryResponse {
  createCategory: {
    category: { id: string; name: string; __typename?: string } | null;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface DeleteCategoryResponse {
  deleteCategory: {
    deleted: boolean;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface CreateTransactionTagResponse {
  createTransactionTag: {
    tag: TransactionTag | null;
    errors: { message: string; __typename?: string }[];
    __typename?: string;
  };
}

export interface DeleteTransactionTagResponse {
  deleteTransactionTag: { __typename?: string } | null;
}

export interface SetTransactionTagsResponse {
  setTransactionTags: {
    transaction: { id: string; tags: TransactionTag[]; __typename?: string } | null;
    errors: { message: string; __typename?: string }[];
    __typename?: string;
  };
}

export interface UpdateTransactionSplitResponse {
  updateTransactionSplit: {
    transaction: {
      id: string;
      hasSplitTransactions: boolean;
      splitTransactions: { id: string; amount: number; __typename?: string }[];
      __typename?: string;
    } | null;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface SetBudgetAmountResponse {
  updateOrCreateBudgetItem: {
    budgetItem: { id: string; budgetAmount: number; __typename?: string } | null;
    __typename?: string;
  };
}

export interface ForceRefreshResponse {
  forceRefreshAccounts: {
    success: boolean;
    errors: PayloadError[];
    __typename?: string;
  };
}

export interface RefreshStatusAccount {
  id: string;
  hasSyncInProgress: boolean;
  __typename?: string;
}
