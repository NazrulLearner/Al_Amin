export const teamsPermissions = {
  // View permissions (শুধু admin)
  canViewTeams: ["admin", "super_admin"],
  canViewTeamHistory: ["admin", "super_admin"],
  canViewTeamPerformance: ["admin", "super_admin"],
  
  // Create/Edit/Delete (শুধু admin)
  canCreateTeam: ["admin", "super_admin"],
  canEditTeam: ["admin", "super_admin"],
  canDeleteTeam: ["super_admin"],  // শুধু super_admin ডিলিট করতে পারে
  
  // Member management
  canManageTeamMembers: ["admin", "super_admin"],
  canAssignRoles: ["admin", "super_admin"],
};

export default teamsPermissions;