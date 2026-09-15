export const GET_ACCOUNTS = `
  query GetAccounts {
    accounts {
      id
      displayName
      syncDisabled
      canBeForceRefreshed
      deactivatedAt
      isHidden
      isAsset
      mask
      createdAt
      updatedAt
      displayLastUpdatedAt
      currentBalance
      displayBalance
      useAvailableBalance
      canUseAvailableBalance
      availableBalance: displayBalancePreview(useAvailableBalance: true, invertSyncedBalance: false)
      includeInNetWorth
      hideFromList
      hideTransactionsFromReports
      includeBalanceInNetWorth
      includeInGoalBalance
      dataProvider
      dataProviderAccountId
      isManual
      transactionsCount
      holdingsCount
      manualInvestmentsTrackingMethod
      order
      logoUrl
      type { name display __typename }
      subtype { name display __typename }
      credential {
        id
        updateRequired
        disconnectedFromDataProviderAt
        dataProvider
        institution { id plaidInstitutionId name status __typename }
        __typename
      }
      institution { id name primaryColor url __typename }
      __typename
    }
    householdPreferences { id accountGroupOrder __typename }
  }
`;

export const GET_ACCOUNT_TYPE_OPTIONS = `
  query GetAccountTypeOptions {
    accountTypeOptions {
      type { name display group possibleSubtypes { display name __typename } __typename }
      subtype { name display __typename }
      __typename
    }
  }
`;

export const GET_RECENT_ACCOUNT_BALANCES = `
  query GetAccountRecentBalances($startDate: Date!) {
    accounts { id recentBalances(startDate: $startDate) __typename }
  }
`;

export const GET_SNAPSHOTS_BY_ACCOUNT_TYPE = `
  query GetSnapshotsByAccountType($startDate: Date!, $timeframe: Timeframe!) {
    snapshotsByAccountType(startDate: $startDate, timeframe: $timeframe) {
      accountType month balance __typename
    }
    accountTypes { name group __typename }
  }
`;

export const GET_AGGREGATE_SNAPSHOTS = `
  query GetAggregateSnapshots($filters: AggregateSnapshotFilters) {
    aggregateSnapshots(filters: $filters) { date balance __typename }
  }
`;

export const GET_HOLDINGS = `
  query Web_GetHoldings($input: PortfolioInput) {
    portfolio(input: $input) {
      aggregateHoldings {
        edges {
          node {
            id quantity basis totalValue
            securityPriceChangeDollars securityPriceChangePercent lastSyncedAt
            holdings {
              id type typeDisplay name ticker closingPrice isManual
              closingPriceUpdatedAt __typename
            }
            security {
              id name type ticker typeDisplay currentPrice currentPriceUpdatedAt
              closingPrice closingPriceUpdatedAt oneDayChangePercent oneDayChangeDollars
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export const GET_ACCOUNT_HISTORY = `
  query AccountDetails_getAccount($id: UUID!) {
    account(id: $id) { id displayName __typename }
    snapshots: snapshotsForAccount(accountId: $id) { date signedBalance __typename }
  }
`;

export const GET_INSTITUTIONS = `
  query Web_GetInstitutionSettings {
    credentials {
      id updateRequired disconnectedFromDataProviderAt
      institution { id name url __typename }
      __typename
    }
    accounts(filters: { includeDeleted: true }) {
      id displayName subtype { display __typename } mask
      credential { id __typename } deletedAt __typename
    }
    subscription { isOnFreeTrial hasPremiumEntitlement __typename }
  }
`;

export const GET_BUDGETS = `
  query Common_GetJointPlanningData($startDate: Date!, $endDate: Date!) {
    budgetSystem
    budgetData(startMonth: $startDate, endMonth: $endDate) {
      monthlyAmountsByCategory {
        category { id __typename }
        monthlyAmounts {
          month plannedCashFlowAmount plannedSetAsideAmount actualAmount
          remainingAmount previousMonthRolloverAmount rolloverType
          cumulativeActualAmount rolloverTargetAmount __typename
        }
        __typename
      }
      monthlyAmountsByCategoryGroup {
        categoryGroup { id __typename }
        monthlyAmounts {
          month plannedCashFlowAmount plannedSetAsideAmount actualAmount
          remainingAmount previousMonthRolloverAmount rolloverType
          cumulativeActualAmount rolloverTargetAmount __typename
        }
        __typename
      }
      monthlyAmountsForFlexExpense {
        budgetVariability
        monthlyAmounts {
          month plannedCashFlowAmount plannedSetAsideAmount actualAmount
          remainingAmount previousMonthRolloverAmount rolloverType
          cumulativeActualAmount rolloverTargetAmount __typename
        }
        __typename
      }
      totalsByMonth {
        month
        totalIncome { actualAmount plannedAmount previousMonthRolloverAmount remainingAmount __typename }
        totalExpenses { actualAmount plannedAmount previousMonthRolloverAmount remainingAmount __typename }
        totalFixedExpenses { actualAmount plannedAmount previousMonthRolloverAmount remainingAmount __typename }
        totalNonMonthlyExpenses { actualAmount plannedAmount previousMonthRolloverAmount remainingAmount __typename }
        totalFlexibleExpenses { actualAmount plannedAmount previousMonthRolloverAmount remainingAmount __typename }
        __typename
      }
      __typename
    }
    categoryGroups {
      id name order type budgetVariability updatedAt groupLevelBudgetingEnabled
      categories {
        id name icon order budgetVariability excludeFromBudget isSystemCategory
        updatedAt
        group { id type budgetVariability groupLevelBudgetingEnabled __typename }
        rolloverPeriod {
          id startMonth endMonth startingBalance targetAmount frequency type __typename
        }
        __typename
      }
      rolloverPeriod {
        id type startMonth endMonth startingBalance frequency targetAmount __typename
      }
      __typename
    }
    goalsV2 {
      id name archivedAt completedAt priority imageStorageProvider imageStorageProviderId
      plannedContributions(startMonth: $startDate, endMonth: $endDate) {
        id month amount __typename
      }
      monthlyContributionSummaries(startMonth: $startDate, endMonth: $endDate) {
        month sum __typename
      }
      __typename
    }
  }
`;

export const GET_SUBSCRIPTION_DETAILS = `
  query GetSubscriptionDetails {
    subscription { id paymentSource referralCode isOnFreeTrial hasPremiumEntitlement __typename }
  }
`;

export const GET_TRANSACTIONS_SUMMARY = `
  query GetTransactionsPage($filters: TransactionFilterInput) {
    aggregates(filters: $filters) {
      summary { avg count max maxExpense sum sumIncome sumExpense first last __typename }
      __typename
    }
  }
`;

export const GET_TRANSACTIONS_LIST = `
  query GetTransactionsList($offset: Int, $limit: Int, $filters: TransactionFilterInput, $orderBy: TransactionOrdering) {
    allTransactions(filters: $filters) {
      totalCount
      results(offset: $offset, limit: $limit, orderBy: $orderBy) {
        id amount pending date hideFromReports plaidName notes isRecurring
        reviewStatus needsReview isSplitTransaction createdAt updatedAt
        attachments { id extension filename originalAssetUrl publicId sizeBytes __typename }
        category { id name __typename }
        merchant { name id transactionsCount __typename }
        account { id displayName __typename }
        tags { id name color order __typename }
        __typename
      }
      __typename
    }
    transactionRules { id __typename }
  }
`;

export const GET_CATEGORIES = `
  query GetCategories {
    categories {
      id order name systemCategory isSystemCategory isDisabled
      updatedAt createdAt
      group { id name type __typename }
      __typename
    }
  }
`;

export const GET_CATEGORY_GROUPS = `
  query ManageGetCategoryGroups {
    categoryGroups { id name order type updatedAt createdAt __typename }
  }
`;

export const GET_TRANSACTION_DETAILS = `
  query GetTransactionDrawer($id: UUID!, $redirectPosted: Boolean) {
    transaction: getTransaction(id: $id, redirectPosted: $redirectPosted) {
      id amount pending date originalDate hideFromReports plaidName notes isRecurring
      needsReview reviewedAt hasSplitTransactions isSplitTransaction isManual
      category { id name __typename }
      goal { id __typename }
      merchant {
        id name transactionCount logoUrl
        recurringTransactionStream {
          id frequency amount baseDate isActive __typename
        }
        __typename
      }
      account { id displayName logoUrl mask subtype { display __typename } __typename }
      tags { id name color order __typename }
      attachments {
        id publicId extension sizeBytes filename originalAssetUrl __typename
      }
      splitTransactions {
        id amount
        merchant { id name __typename }
        category { id name __typename }
        __typename
      }
      __typename
    }
  }
`;

export const GET_TRANSACTION_SPLITS = `
  query TransactionSplitQuery($id: UUID!) {
    transaction: getTransaction(id: $id) {
      id amount
      category { id name __typename }
      merchant { id name __typename }
      splitTransactions {
        id amount notes
        merchant { id name __typename }
        category { id name __typename }
        __typename
      }
      __typename
    }
  }
`;

export const GET_TRANSACTION_TAGS = `
  query GetHouseholdTransactionTags($search: String, $limit: Int, $bulkParams: BulkTransactionDataParams) {
    tags: householdTransactionTags(search: $search, limit: $limit, bulkParams: $bulkParams) {
      id name color order transactionCount __typename
    }
  }
`;

export const GET_CASHFLOW = `
  query Web_GetCashFlowPage($filters: TransactionFilterInput) {
    byCategory: aggregates(filters: $filters, groupBy: ["category"]) {
      groupBy {
        category { id name group { id type __typename } __typename }
        __typename
      }
      summary { sum __typename }
      __typename
    }
    byCategoryGroup: aggregates(filters: $filters, groupBy: ["categoryGroup"]) {
      groupBy {
        categoryGroup { id name type __typename }
        __typename
      }
      summary { sum __typename }
      __typename
    }
    byMerchant: aggregates(filters: $filters, groupBy: ["merchant"]) {
      groupBy {
        merchant { id name logoUrl __typename }
        __typename
      }
      summary { sumIncome sumExpense __typename }
      __typename
    }
    summary: aggregates(filters: $filters, fillEmptyValues: true) {
      summary { sumIncome sumExpense savings savingsRate __typename }
      __typename
    }
  }
`;

export const GET_CASHFLOW_SUMMARY = `
  query Web_GetCashFlowPage($filters: TransactionFilterInput) {
    summary: aggregates(filters: $filters, fillEmptyValues: true) {
      summary { sumIncome sumExpense savings savingsRate __typename }
      __typename
    }
  }
`;

export const GET_RECURRING_TRANSACTIONS = `
  query Web_GetUpcomingRecurringTransactionItems($startDate: Date!, $endDate: Date!, $filters: RecurringTransactionFilter) {
    recurringTransactionItems(startDate: $startDate, endDate: $endDate, filters: $filters) {
      stream {
        id frequency amount isApproximate
        merchant { id name logoUrl __typename }
        __typename
      }
      date isPast transactionId amount amountDiff
      category { id name __typename }
      account { id displayName logoUrl __typename }
      __typename
    }
  }
`;

export const GET_TRANSACTION_RULES = `
  query GetTransactionRules {
    transactionRules {
      id order merchantCriteriaUseOriginalStatement
      merchantCriteria { operator value __typename }
      originalStatementCriteria { operator value __typename }
      merchantNameCriteria { operator value __typename }
      amountCriteria {
        operator isExpense value
        valueRange { lower upper __typename }
        __typename
      }
      categoryIds accountIds
      categories { id name __typename }
      accounts { id displayName __typename }
      setMerchantAction { id name __typename }
      setCategoryAction { id name __typename }
      addTagsAction { id name color order __typename }
      linkGoalAction { id name __typename }
      reviewStatusAction setHideFromReportsAction
      recentApplicationCount lastAppliedAt
      splitTransactionsAction {
        amountType
        splitsInfo {
          categoryId merchantName amount goalId tags hideFromReports reviewStatus
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export const GET_REFRESH_STATUS = `
  query ForceRefreshAccountsQuery {
    accounts { id hasSyncInProgress __typename }
  }
`;

// ---------- Mutations ----------

export const CREATE_MANUAL_ACCOUNT = `
  mutation Web_CreateManualAccount($input: CreateManualAccountMutationInput!) {
    createManualAccount(input: $input) {
      account { id __typename }
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;

export const UPDATE_ACCOUNT = `
  mutation Common_UpdateAccount($input: UpdateAccountMutationInput!) {
    updateAccount(input: $input) {
      account { id displayName __typename }
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;

export const DELETE_ACCOUNT = `
  mutation Common_DeleteAccount($id: UUID!) {
    deleteAccount(id: $id) {
      deleted
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;

export const FORCE_REFRESH_ACCOUNT = `
  mutation Common_ForceRefreshAccountMutation($input: ForceRefreshAccountInput!) {
    forceRefreshAccount(input: $input) {
      success
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;

export const CREATE_TRANSACTION = `
  mutation Common_CreateTransactionMutation($input: CreateTransactionMutationInput!) {
    createTransaction(input: $input) {
      errors { fieldErrors { field messages __typename } message code __typename }
      transaction { id __typename }
      __typename
    }
  }
`;

export const UPDATE_TRANSACTION = `
  mutation Web_TransactionDrawerUpdateTransaction($input: UpdateTransactionMutationInput!) {
    updateTransaction(input: $input) {
      transaction {
        id amount pending date hideFromReports needsReview reviewedAt
        reviewedByUser { id name __typename }
        plaidName notes isRecurring
        category { id __typename }
        goal { id __typename }
        merchant { id name __typename }
        __typename
      }
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;

export const DELETE_TRANSACTION = `
  mutation Common_DeleteTransactionMutation($input: DeleteTransactionMutationInput!) {
    deleteTransaction(input: $input) {
      deleted
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;

export const DELETE_CATEGORY = `
  mutation Web_DeleteCategory($id: UUID!, $moveToCategoryId: UUID) {
    deleteCategory(id: $id, moveToCategoryId: $moveToCategoryId) {
      errors { fieldErrors { field messages __typename } message code __typename }
      deleted
      __typename
    }
  }
`;

export const CREATE_CATEGORY = `
  mutation Web_CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      errors { message code __typename }
      category { id name __typename }
      __typename
    }
  }
`;

export const CREATE_TRANSACTION_TAG = `
  mutation Common_CreateTransactionTag($input: CreateTransactionTagInput!) {
    createTransactionTag(input: $input) {
      tag { id name color order transactionCount __typename }
      errors { message __typename }
      __typename
    }
  }
`;

export const DELETE_TRANSACTION_TAG = `
  mutation Common_DeleteTransactionTag($tagId: ID!) {
    deleteTransactionTag(tagId: $tagId) { __typename }
  }
`;

export const SET_TRANSACTION_TAGS = `
  mutation Web_SetTransactionTags($input: SetTransactionTagsInput!) {
    setTransactionTags(input: $input) {
      transaction { id tags { id name __typename } __typename }
      errors { message __typename }
      __typename
    }
  }
`;

export const SPLIT_TRANSACTION = `
  mutation Common_SplitTransactionMutation($input: UpdateTransactionSplitMutationInput!) {
    updateTransactionSplit(input: $input) {
      errors { fieldErrors { field messages __typename } message code __typename }
      transaction {
        id hasSplitTransactions
        splitTransactions {
          id amount
          merchant { id name __typename }
          category { id name __typename }
          notes
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export const UPDATE_BUDGET_ITEM = `
  mutation Common_UpdateBudgetItem($input: UpdateOrCreateBudgetItemMutationInput!) {
    updateOrCreateBudgetItem(input: $input) {
      budgetItem { id budgetAmount __typename }
      __typename
    }
  }
`;

export const UPDATE_RECURRING_MERCHANT = `
  mutation Common_UpdateMerchant($input: UpdateMerchantInput!) {
    updateMerchant(input: $input) {
      merchant {
        id name
        recurringTransactionStream {
          id frequency amount baseDate isActive __typename
        }
        __typename
      }
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;

export const CREATE_TRANSACTION_RULE = `
  mutation Common_CreateTransactionRuleMutationV2($input: CreateTransactionRuleInput!) {
    createTransactionRuleV2(input: $input) {
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;

export const UPDATE_TRANSACTION_RULE = `
  mutation Common_UpdateTransactionRuleMutationV2($input: UpdateTransactionRuleInput!) {
    updateTransactionRuleV2(input: $input) {
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;

export const DELETE_TRANSACTION_RULE = `
  mutation Common_DeleteTransactionRule($id: ID!) {
    deleteTransactionRule(id: $id) {
      deleted
      errors { fieldErrors { field messages __typename } message code __typename }
      __typename
    }
  }
`;
