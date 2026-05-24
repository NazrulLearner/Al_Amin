export const memberPermissions = {
  // View permissions
  canViewMembers: ["admin", "cashier", "collector", "super_admin"],  // member অন্য member দেখতে পারবে না
  canViewProfile: ["admin", "cashier", "collector", "member", "super_admin"],  // নিজের প্রোফাইল সবাই দেখতে পারে
  
  // Edit permissions
  canAddMember: ["admin", "super_admin"],  // শুধু admin o super_admin member add করতে পারবে, cashier o collector add করতে পারবে না
  canEditMember: ["admin", "super_admin"],  //  admin o super_admin edit করতে পারবে, cashier o collector edit করতে পারবে না
  canDeleteMember: ["admin", "super_admin"],  // admin o super_admin delete করতে পারবে, cashier o collector delete করতে পারবে না
  
  // Profile edit (one time)
  canEditOwnProfile: ["admin", "cashier", "collector", "super_admin"],  // member excluded (one time only)
};

export default memberPermissions;