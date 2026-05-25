export const assetsPermissions = {
  // View permissions
  canViewAssets: ["admin", "cashier", "super_admin"],
  canViewDashboard: ["admin", "cashier", "super_admin"],
  canViewIncome: ["admin", "cashier", "super_admin"],
  canViewExpense: ["admin", "cashier", "super_admin"],
  canViewCashManagement: ["admin", "cashier", "super_admin"],
  canViewBankAccounts: ["admin", "super_admin"],
  canViewAssetsRegister: ["admin", "super_admin"],
  canViewProfitLoss: ["admin", "super_admin"],
  canViewCapitalFlow: ["admin", "super_admin"],
  canViewReports: ["admin", "super_admin"],
  canViewWealthSummary: ["admin", "super_admin"],
  
  // Create permissions
  canAddIncome: ["admin", "cashier", "super_admin"],
  canAddExpense: ["admin", "cashier", "super_admin"],
  canAddBankAccount: ["admin", "super_admin"],
  canAddAsset: ["admin", "super_admin"],
  
  // Edit/Delete permissions
  canEditIncome: ["admin", "super_admin"],
  canEditExpense: ["admin", "super_admin"],
  canDeleteIncome: ["admin", "super_admin"],
  canDeleteExpense: ["admin", "super_admin"],
};

export default assetsPermissions;