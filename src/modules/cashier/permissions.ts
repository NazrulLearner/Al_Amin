export const cashierPermissions = {
  // View permissions
  view: "cashier.view",
  viewDashboard: "cashier.dashboard.view",
  viewLedger: "cashier.ledger.view",
  viewReport: "cashier.report.view",
  
  // Action permissions
  cashIn: "cashier.cashin",
  cashOut: "cashier.cashout",
  transfer: "cashier.transfer",
  
  // Special permissions
  approveCash: "cashier.approve",  // শুধু admin
};

export default cashierPermissions;