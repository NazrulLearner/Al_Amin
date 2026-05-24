export const investmentPermissions = {
  // Investment Permissions
  VIEW_INVESTMENTS: 'view_investments',
  CREATE_INVESTMENT: 'create_investment',
  EDIT_INVESTMENT: 'edit_investment',
  DELETE_INVESTMENT: 'delete_investment',
  APPROVE_INVESTMENT: 'approve_investment',
  
  // View Permissions
  VIEW_INVESTMENT_DASHBOARD: 'view_investment_dashboard',
  VIEW_INVESTMENT_DETAILS: 'view_investment_details',
  VIEW_INVESTMENT_HISTORY: 'view_investment_history',
  VIEW_INVESTMENT_REPORTS: 'view_investment_reports',
  
  // Report Permissions
  EXPORT_INVESTMENT_REPORTS: 'export_investment_reports',
  PRINT_INVESTMENT_REPORTS: 'print_investment_reports',
  
  // Cashier Permissions
  MANAGE_INVESTMENT_PLANS: 'manage_investment_plans',
  DISTRIBUTE_PROFITS: 'distribute_profits'
};

export const rolePermissions = {
  admin: [
    investmentPermissions.VIEW_INVESTMENTS,
    investmentPermissions.CREATE_INVESTMENT,
    investmentPermissions.EDIT_INVESTMENT,
    investmentPermissions.DELETE_INVESTMENT,
    investmentPermissions.APPROVE_INVESTMENT,
    investmentPermissions.VIEW_INVESTMENT_DASHBOARD,
    investmentPermissions.VIEW_INVESTMENT_DETAILS,
    investmentPermissions.VIEW_INVESTMENT_HISTORY,
    investmentPermissions.VIEW_INVESTMENT_REPORTS,
    investmentPermissions.EXPORT_INVESTMENT_REPORTS,
    investmentPermissions.PRINT_INVESTMENT_REPORTS,
    investmentPermissions.MANAGE_INVESTMENT_PLANS,
    investmentPermissions.DISTRIBUTE_PROFITS
  ],
  caches: [
    investmentPermissions.VIEW_INVESTMENTS,
    investmentPermissions.CREATE_INVESTMENT,
    investmentPermissions.EDIT_INVESTMENT,
    investmentPermissions.VIEW_INVESTMENT_DASHBOARD,
    investmentPermissions.VIEW_INVESTMENT_DETAILS,
    investmentPermissions.VIEW_INVESTMENT_HISTORY,
    investmentPermissions.VIEW_INVESTMENT_REPORTS,
    investmentPermissions.EXPORT_INVESTMENT_REPORTS
  ],
  member: [
    investmentPermissions.VIEW_INVESTMENTS,
    investmentPermissions.VIEW_INVESTMENT_DETAILS,
    investmentPermissions.VIEW_INVESTMENT_HISTORY
  ]
};