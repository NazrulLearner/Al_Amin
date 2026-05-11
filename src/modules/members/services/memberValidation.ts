// src/modules/members/services/memberValidation.ts

/**
 * 🛡️ Member Validation (Light)
 * Basic validation for member operations
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateMemberData = (data: Record<string, any>): ValidationResult => {
  const errors: string[] = [];

  // Required fields
  if (!data.memberId?.trim()) {
    errors.push('Member ID is required');
  }
  
  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }
  
  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }
  
  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  } else if (!/^01[3-9]\d{8}$/.test(data.phone)) {
    errors.push('Invalid phone number format');
  }
  
  if (!data.dateOfBirth) {
    errors.push('Date of birth is required');
  }

  // Membership validation
  if (data.membership) {
    if (!data.membership.shareCount || data.membership.shareCount < 1) {
      errors.push('Share count must be at least 1');
    }
    
    if (!data.membership.monthlyFee || data.membership.monthlyFee < 0) {
      errors.push('Monthly fee cannot be negative');
    }
    
    if (!data.membership.dateOfJoin) {
      errors.push('Join date is required');
    }
  }

  // Address validation
  if (data.address) {
    if (!data.address.presentAddress?.trim()) {
      errors.push('Present address is required');
    }
    
    if (!data.address.district?.trim()) {
      errors.push('District is required');
    }
  }

  // Email format (optional)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Quick validation for simple checks
export const isValidMemberId = (memberId: string): boolean => {
  return /^[A-Z0-9-]+$/.test(memberId) && memberId.length >= 3;
};

export const isValidPhone = (phone: string): boolean => {
  return /^01[3-9]\d{8}$/.test(phone);
};