export const supportPermissions = {
  canViewSupport: ["admin", "cashier", "member", "collector", "super_admin"],
  canViewFAQ: ["admin", "cashier", "member", "collector", "super_admin"],
  canViewAbout: ["admin", "cashier", "member", "collector", "super_admin"],
  
  // যদি টিকেট সিস্টেম যোগ করো
  canCreateTicket: ["admin", "cashier", "member", "collector"],
  canViewAllTickets: ["admin", "super_admin"],
  canReplyTicket: ["admin", "super_admin"],
};

export default supportPermissions;