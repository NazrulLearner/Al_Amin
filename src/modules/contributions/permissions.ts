export const contributionPermissions = {
  canViewContributions: ["admin", "cashier", "collector", "super_admin"],
  canAddContribution: ["admin", "cashier", "super_admin"],
  canEditContribution: ["admin", "cashier", "super_admin"],
  canViewPending: ["admin", "collector", "super_admin"],
  canApproveContribution: ["admin", "super_admin"],
  canViewReports: ["admin", "super_admin"],
  canViewReceipt: ["admin", "cashier", "collector", "super_admin"],
};