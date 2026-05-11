// src/utils/loanStatus/loanFlow.ts - FIXED
import type { LoanStatus } from '../../types/financing';

export const canChangeStatus = (currentStatus: LoanStatus, newStatus: LoanStatus): boolean => {
  const allowedTransitions: Record<LoanStatus, LoanStatus[]> = {
    pending: ['approved', 'rejected'],
    approved: ['distributed', 'rejected'],
    distributed: ['active'],
    active: ['completed', 'defaulted'],
    completed: [],
    rejected: [],
    cancelled: [],
    defaulted: []
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};

export const getNextPossibleStatus = (currentStatus: LoanStatus): LoanStatus[] => {
  const transitions: Record<LoanStatus, LoanStatus[]> = {
    pending: ['approved', 'rejected'],
    approved: ['distributed', 'rejected'],
    distributed: ['active'],
    active: ['completed', 'defaulted'],
    completed: [],
    rejected: [],
    cancelled: [],
    defaulted: []
  };

  return transitions[currentStatus] || [];
};