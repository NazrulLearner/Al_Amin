// src/types/collector.ts

export interface CollectorAssignment {
  id: string;
  memberId: string;
  memberName: string;
  phone: string;
  email?: string;
  assignedAreas?: string[];
  isActive: boolean;
  joinedAt: Date;
  maxCollectionLimit?: number;
  commissionPercentage?: number;
}

export interface CollectorConfig {
  enabled: boolean;
  collectors: CollectorAssignment[];
}