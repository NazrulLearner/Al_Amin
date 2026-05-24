export const settingsPermissions = {
  // General/Somity Settings (শুধু admin)
  canViewGeneralSettings: ["admin", "super_admin"],
  canEditGeneralSettings: ["admin", "super_admin"],
  
  // Account Settings (সবাই নিজেরটা)
  canViewAccountSettings: ["admin", "cashier", "collector", "member", "super_admin"],
  canEditAccountSettings: ["admin", "cashier", "collector", "member", "super_admin"],
  
  // Notification Settings (সবাই)
  canViewNotificationSettings: ["admin", "cashier", "collector", "member", "super_admin"],
  canEditNotificationSettings: ["admin", "cashier", "collector", "member", "super_admin"],
  
  // Roles & Permissions (শুধু admin)
  canViewRoleSettings: ["admin", "super_admin"],
  canEditRoleSettings: ["admin", "super_admin"],
  
  // System Settings (শুধু super_admin)
  canViewSystemSettings: ["super_admin"],
  canEditSystemSettings: ["super_admin"],
  
  // Financial Settings (General settings এর অংশ)
  canAccessFinancialSettings: ["admin", "super_admin"],
  canAccessBankSettings: ["admin", "super_admin"],
  canAccessSecuritySettings: ["admin", "super_admin"],
};

export default settingsPermissions;