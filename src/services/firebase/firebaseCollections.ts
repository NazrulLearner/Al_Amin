import { collection, doc } from 'firebase/firestore';
import { db } from './firebase';

// Single somity - Single somity data anywhere!
// Collections are at ROOT level

export const collections = {
  // Users
  users: () => collection(db, 'users'),
  user: (userId: string) => doc(db, 'users', userId),
  /* fetch ba get user kibabe use korbe
  * 
  */

  // Members (root level)
  members: () => collection(db, 'members'),
  member: (memberId: string) => doc(db, 'members', memberId),

  // Contributions (root level)
  contributions: () => collection(db, 'contributions'),
  contribution: (contributionId: string) => doc(db, 'contributions', contributionId),

  // Collector Balances (root level)
  collectorBalances: () => collection(db, 'collector_balances'),
  collectorBalance: (collectorId: string) => doc(db, 'collector_balances', collectorId),

  // Deposits (root level)
  deposits: () => collection(db, 'deposits'),
  deposit: (depositId: string) => doc(db, 'deposits', depositId),

  // Somity Settings (single document - config)
  somitySettings: () => doc(db, 'somity_settings', 'config'),

  // Audit Logs (root level)
  auditLogs: () => collection(db, 'audit_logs'),

  // Roles (root level)
  roles: () => collection(db, 'roles'),
  role: (roleId: string) => doc(db, 'roles', roleId),
};
