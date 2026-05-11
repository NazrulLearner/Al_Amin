// src/types/superAdmin.ts
// Only super admin uses this, not exposed to members/somity

export interface SuperAdminDashboard {
  totalSomities?: number;
  totalMembers: number;
  totalCollections: number;
  totalLoans: number;
  activeLoans: number;
  firebaseUsage: {
    reads: number;
    writes: number;
    deletes: number;
    estimatedBill: number;
  };
}

export interface FirebaseUsageLog {
  id: string;
  operation: 'read' | 'write' | 'delete';
  collection: string;
  documentId: string;
  timestamp: Date;
  cost: number;
}