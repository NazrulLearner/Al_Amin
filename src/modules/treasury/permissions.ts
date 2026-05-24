export const treasuryPermissions = {
  // View permissions
  canViewTreasury: ["admin", "cashier", "super_admin"],
  canViewBankAccounts: ["admin", "super_admin"],
  canViewLedger: ["admin", "super_admin"],
  canViewTransactions: ["admin", "cashier", "super_admin"],
  
  // Action permissions
  canCashInOut: ["admin", "cashier", "super_admin"],
  canTransferFunds: ["admin", "super_admin"],
  
  // Management permissions (শুধু admin)
  canManageBankAccounts: ["admin", "super_admin"],
  canDeleteTransactions: ["super_admin"],  // শুধু super_admin
};

export default treasuryPermissions;