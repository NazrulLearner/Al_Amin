export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  duties: string[];
  permissions: string[];
}

export interface TeamTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // member id
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Team {
  id: string;
  name: string;
  type: 'core' | 'finance' | 'loan' | 'other';
  description: string;
  formationDate: string;
  status: 'active' | 'inactive';
  members: TeamMember[];
  tasks: TeamTask[];
  responsibilities: string[];
  performanceMetrics: {
    target: number;
    current: number;
    unit: string;
  }[];
}

// Predefined team templates
export const TEAM_TEMPLATES = {
  core: {
    name: 'Core Management Team',
    description: 'Overall society management and decision making',
    defaultMembers: [
      {
        role: 'President',
        duties: ['Meeting management', 'Final decision making', 'Society representation'],
        permissions: ['approve_loans', 'manage_members', 'financial_oversight']
      },
      {
        role: 'Vice President', 
        duties: ['Assist president', 'Project supervision', 'Member grievance handling'],
        permissions: ['approve_loans', 'manage_members']
      },
      {
        role: 'Secretary',
        duties: ['Meeting minutes', 'Official communication', 'Document management'],
        permissions: ['manage_documents', 'send_notifications']
      },
      {
        role: 'Treasurer',
        duties: ['Financial reporting', 'Budget monitoring', 'Cash fund management'],
        permissions: ['financial_management', 'view_reports']
      }
    ]
  },
  finance: {
    name: 'Finance Team',
    description: 'Financial transactions, accounts management and reporting',
    defaultMembers: [
      {
        role: 'Finance Lead',
        duties: ['Daily transaction oversight', 'Financial report verification', 'Bank coordination'],
        permissions: ['financial_management', 'approve_transactions', 'view_reports']
      },
      {
        role: 'Accountant 1',
        duties: ['Member savings accounts', 'Cash deposit/withdrawal records', 'Daily transaction entry'],
        permissions: ['record_transactions', 'view_accounts']
      },
      {
        role: 'Accountant 2', 
        duties: ['Loan transaction records', 'Bank reconciliation', 'Monthly final accounts'],
        permissions: ['record_transactions', 'bank_reconciliation']
      }
    ]
  },
  loan: {
    name: 'Loan Management Team', 
    description: 'Loan application processing, verification and approval',
    defaultMembers: [
      {
        role: 'Loan Coordinator',
        duties: ['Loan application initial verification', 'Applicant data collection', 'Loan committee meeting'],
        permissions: ['process_loans', 'view_applications']
      },
      {
        role: 'Loan Verifier',
        duties: ['Income source verification', 'Savings & previous loan check', 'Collateral evaluation'],
        permissions: ['verify_applications', 'field_verification']
      },
      {
        role: 'Loan Approver',
        duties: ['Final loan approval/rejection', 'Loan terms determination', 'Special case handling'],
        permissions: ['approve_loans', 'set_terms']
      }
    ]
  }
} as const;