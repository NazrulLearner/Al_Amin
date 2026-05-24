export const usersPermissions = {
  // View permissions
  canViewUsers: ["admin", "super_admin"],
  canViewUserProfile: ["admin", "super_admin"],
  
  // Create permissions
  canAddUser: ["admin", "super_admin"],
  canCreateMemberAccount: ["admin", "super_admin"],
  
  // Edit permissions
  canEditUser: ["admin", "super_admin"],
  
  // Delete permissions
  canDeleteUser: ["admin","super_admin"],
  
  // Role management (শুধু super_admin)
  canChangeUserRole: ["admin", "super_admin"],
};

export default usersPermissions;