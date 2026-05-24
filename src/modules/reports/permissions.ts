export const reportsPermissions = {
  // Basic view (সব রিপোর্টের ওভারভিউ)
  canViewReports: ["admin", "cashier", "super_admin"],
  
  // Specific reports (শুধু admin)
  canViewMemberReport: ["admin", "super_admin"],
  canViewLoanReport: ["admin", "super_admin"],
  canViewFinanceReport: ["admin", "super_admin"],
  
  // Export data (শুধু admin)
  canExportData: ["admin", "super_admin"],
  
  // collector/member কোন রিপোর্ট দেখতে পারবে না
};

export default reportsPermissions;