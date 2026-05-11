// src/utils/schemaValidator.ts - Complete Fixed Version
import baseSchema from '../../modules/financing/schemas/base.json';
import murabahaSchema from '../../modules/financing/schemas/murabaha.json';
import musharakaSchema from '../../modules/financing/schemas/musharaka.json';
import salamSchema from '../../modules/financing/schemas/salam.json';
import qardHasanahSchema from '../../modules/financing/schemas/qardHasanah.json';
import istisnaSchema from '../../modules/financing/schemas/istisna.json';
import mudarabaSchema from '../../modules/financing/schemas/mudaraba.json';
import tawarruqSchema from '../../modules/financing/schemas/tawarruq.json';
import ijarahSchema from '../../modules/financing/schemas/ijarah.json';
import kafalahSchema from '../../modules/financing/schemas/kafalah.json';
import type { LoanType, BaseLoan } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SchemaValidator {
  private static schemas: { [key: string]: any } = {
    base: baseSchema,
    murabaha: murabahaSchema,
    musharaka: musharakaSchema,
    salam: salamSchema,
    qardHasanah: qardHasanahSchema,
    istisna: istisnaSchema,
    mudaraba: mudarabaSchema,
    tawarruq: tawarruqSchema,
    ijarah: ijarahSchema,
    kafalah: kafalahSchema
  };

  // Validate base loan data (applicant, grantor, etc.) - FIXED for step 1
  static validateBaseLoan(data: any): ValidationResult {
    // Create temporary schema for step 1 validation (only applicant and grantor)
    const step1Schema = {
      ...baseSchema,
      required: ['applicant', 'grantor'] // Only these two are required for step 1
    };
    
    return this.validateAgainstSchema(data, step1Schema, 'base');
  }

  // Validate loan details based on loan type
  static validateLoanDetails(loanType: LoanType, data: any): ValidationResult {
    const schema = this.schemas[loanType];
    if (!schema) {
      return {
        isValid: false,
        errors: [`Unknown loan type: ${loanType}`],
        warnings: []
      };
    }

    return this.validateAgainstSchema(data, schema, loanType);
  }

  // Validate complete loan application
  static validateCompleteLoan(data: any): ValidationResult {
    // First validate base data with full schema
    const baseValidation = this.validateAgainstSchema(data, baseSchema, 'base');
    if (!baseValidation.isValid) {
      return baseValidation;
    }

    // Then validate loan details
    if (!data.loanType || !data.loanDetails) {
      return {
        isValid: false,
        errors: ['Loan type and loan details are required'],
        warnings: []
      };
    }

    return this.validateLoanDetails(data.loanType, data.loanDetails);
  }

  // Validate loan before submission
  static validateLoanSubmission(loanData: Omit<BaseLoan, 'id' | 'loanId' | 'createdAt' | 'updatedAt'>): ValidationResult {
    return this.validateCompleteLoan(loanData);
  }

  private static validateAgainstSchema(data: any, schema: any, schemaName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check required fields
      if (schema.required && Array.isArray(schema.required)) {
        schema.required.forEach((field: string) => {
          if (data[field] === undefined || data[field] === null || data[field] === '') {
            errors.push(this.getFieldLabel(field, schemaName) + ' আবশ্যক');
          }
        });
      }

      // Validate fields against schema properties
      if (schema.properties) {
        Object.keys(schema.properties).forEach(field => {
          const fieldSchema = schema.properties[field];
          const value = data[field];

          // Skip validation if field is not present (optional fields)
          if (value === undefined || value === null) {
            return;
          }

          // Type checking
          if (fieldSchema.type) {
            const typeError = this.validateType(field, value, fieldSchema.type, schemaName);
            if (typeError) errors.push(typeError);
          }

          // Minimum value check
          if (fieldSchema.minimum !== undefined && typeof value === 'number') {
            if (value < fieldSchema.minimum) {
              errors.push(
                `${this.getFieldLabel(field, schemaName)} কমপক্ষে ${fieldSchema.minimum} হতে হবে`
              );
            }
          }

          // Maximum value check
          if (fieldSchema.maximum !== undefined && typeof value === 'number') {
            if (value > fieldSchema.maximum) {
              errors.push(
                `${this.getFieldLabel(field, schemaName)} সর্বোচ্চ ${fieldSchema.maximum} হতে হবে`
              );
            }
          }

          // Minimum length check for strings
          if (fieldSchema.minLength && typeof value === 'string') {
            if (value.length < fieldSchema.minLength) {
              errors.push(
                `${this.getFieldLabel(field, schemaName)} কমপক্ষে ${fieldSchema.minLength} অক্ষর হতে হবে`
              );
            }
          }

          // Maximum length check for strings
          if (fieldSchema.maxLength && typeof value === 'string') {
            if (value.length > fieldSchema.maxLength) {
              warnings.push(
                `${this.getFieldLabel(field, schemaName)} ${fieldSchema.maxLength} অক্ষরের বেশি হওয়া উচিত নয়`
              );
            }
          }

          // Pattern validation (for phone, email etc.)
          if (fieldSchema.pattern && typeof value === 'string') {
            if (!new RegExp(fieldSchema.pattern).test(value)) {
              errors.push(
                `${this.getFieldLabel(field, schemaName)} এর ফরম্যাট সঠিক নয়`
              );
            }
          }

          // Enum validation
          if (fieldSchema.enum && Array.isArray(fieldSchema.enum)) {
            if (!fieldSchema.enum.includes(value)) {
              errors.push(
                `${this.getFieldLabel(field, schemaName)} অবশ্যই এই মানগুলোর মধ্যে একটি হতে হবে: ${fieldSchema.enum.join(', ')}`
              );
            }
          }

          // Custom validation for specific fields
          const customValidation = this.customFieldValidation(field, value, schemaName);
          if (customValidation) {
            if (customValidation.type === 'error') {
              errors.push(customValidation.message);
            } else {
              warnings.push(customValidation.message);
            }
          }
        });
      }

      // Cross-field validation
      const crossFieldErrors = this.validateCrossFields(data, schemaName);
      errors.push(...crossFieldErrors);
    } catch (error) {
      console.error('Validation error:', error);
      errors.push('ডেটা ভ্যালিডেশনে সমস্যা হয়েছে');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static validateType(field: string, value: any, expectedType: string, schemaName: string): string | null {
    const fieldLabel = this.getFieldLabel(field, schemaName);

    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          return `${fieldLabel} টেক্সট হতে হবে`;
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `${fieldLabel} সংখ্যা হতে হবে`;
        }
        break;

      case 'integer':
        if (!Number.isInteger(value)) {
          return `${fieldLabel} পূর্ণ সংখ্যা হতে হবে`;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return `${fieldLabel} সত্য বা মিথ্যা হতে হবে`;
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          return `${fieldLabel} তালিকা হতে হবে`;
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return `${fieldLabel} অবজেক্ট হতে হবে`;
        }
        break;
    }

    return null;
  }

  private static validateCrossFields(data: any, schemaName: string): string[] {
    const errors: string[] = [];

    // Example cross-field validations
    if (schemaName === 'murabaha') {
      if (data.assetCost && data.profitRate && data.durationMonths) {
        const profitAmount = (data.assetCost * data.profitRate * data.durationMonths) / 1200;
        const totalPayable = data.assetCost + profitAmount;
        
        if (totalPayable > data.assetCost * 2) {
          errors.push('মোট পরিশোধযোগ্য অর্থ ক্রয় মূল্যের দ্বিগুণের বেশি। দয়া করে পর্যালোচনা করুন।');
        }
      }
    }

    if (schemaName === 'musharaka') {
      if (data.bankShare && data.clientShare) {
        const totalShare = data.bankShare + data.clientShare;
        if (Math.abs(totalShare - 100) > 0.01) {
          errors.push('ব্যাংক এবং ক্লায়েন্টের শেয়ারের যোগফল ১০০% হতে হবে');
        }
      }
    }

    if (schemaName === 'mudaraba') {
      if (data.rabulMalShare && data.mudaribShare) {
        const totalShare = data.rabulMalShare + data.mudaribShare;
        if (Math.abs(totalShare - 100) > 0.01) {
          errors.push('রাবুল মাল এবং মুদারিবের শেয়ারের যোগফল ১০০% হতে হবে');
        }
      }
    }

    if (schemaName === 'qardHasanah') {
      if (data.serviceChargePercent && data.serviceChargePercent > 5) {
        errors.push('সেবা চার্জ ৫% এর বেশি হওয়া উচিত নয় (ইসলামিক নিয়ম অনুযায়ী)');
      }
    }

    return errors;
  }

  private static customFieldValidation(field: string, value: any, _schemaName: string): { type: 'error' | 'warning'; message: string } | null {
    // Phone number validation
    if (field === 'phone' && typeof value === 'string') {
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(value)) {
        return {
          type: 'error',
          message: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)'
        };
      }
    }

    // Email validation
    if (field === 'email' && typeof value === 'string' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return {
          type: 'error',
          message: 'সঠিক ইমেইল ঠিকানা দিন'
        };
      }
    }

    // NID validation (Bangladesh)
    if (field === 'nid' && typeof value === 'string' && value) {
      const nidRegex = /^\d{10,17}$/;
      if (!nidRegex.test(value)) {
        return {
          type: 'warning',
          message: 'জাতীয় আইডি নম্বর ১০-১৭ ডিজিটের হতে হবে'
        };
      }
    }

    // Profit rate validation for Islamic compliance
    if ((field === 'profitRate' || field === 'interestRate') && typeof value === 'number') {
      if (value > 100) {
        return {
          type: 'warning',
          message: 'লাভের হার ১০০% এর বেশি হওয়া ইসলামিক নীতির সাথে সাংঘর্ষিক'
        };
      }
    }

    return null;
  }

  private static getFieldLabel(field: string, schemaName: string): string {
    const fieldLabels: { [key: string]: { [key: string]: string } } = {
      base: {
        applicant: 'আবেদনকারী',
        grantor: 'গ্যারান্টর',
        loanType: 'লোনের ধরন',
        status: 'স্ট্যাটাস',
        createdBy: 'তৈরি করেছেন',
        remarks: 'মন্তব্য',
        documents: 'ডকুমেন্টস'
      },
      murabaha: {
        assetCost: 'পণ্যের মূল্য',
        profitRate: 'লাভের হার',
        durationMonths: 'মেয়াদ',
        purpose: 'উদ্দেশ্য',
        assetName: 'পণ্যের নাম',
        sellerName: 'বিক্রেতার নাম',
        sellerAddress: 'বিক্রেতার ঠিকানা',
        deliveryDate: 'ডেলিভারি তারিখ'
      },
      musharaka: {
        totalCapital: 'মোট মূলধন',
        bankShare: 'ব্যাংকের শেয়ার',
        clientShare: 'ক্লায়েন্টের শেয়ার',
        profitSharingRatio: 'লাভ বণ্টনের অনুপাত',
        businessType: 'ব্যবসার ধরন',
        durationMonths: 'মেয়াদ'
      },
      mudaraba: {
        totalCapital: 'মোট মূলধন',
        rabulMalShare: 'রাবুল মালের শেয়ার',
        mudaribShare: 'মুদারিবের শেয়ার',
        businessType: 'ব্যবসার ধরন',
        durationMonths: 'মেয়াদ',
        expectedProfit: 'প্রত্যাশিত লাভ',
        managementFee: 'ব্যবস্থাপনা ফি',
        lossAbsorption: 'ক্ষতি বহনের নিয়ম',
        auditRequired: 'অডিট প্রয়োজন'
      },
      salam: {
        productName: 'পণ্যের নাম',
        quantity: 'পরিমাণ',
        unitType: 'এককের ধরন',
        totalPrice: 'মোট মূল্য',
        deliveryDate: 'ডেলিভারি তারিখ',
        deliveryLocation: 'ডেলিভারি স্থান'
      },
      qardHasanah: {
        loanAmount: 'লোনের পরিমাণ',
        durationMonths: 'মেয়াদ',
        purpose: 'উদ্দেশ্য',
        serviceChargePercent: 'সেবা চার্জ'
      },
      istisna: {
        projectName: 'প্রকল্পের নাম',
        totalCost: 'মোট খরচ',
        durationMonths: 'মেয়াদ',
        specifications: 'স্পেসিফিকেশন',
        deliveryDate: 'ডেলিভারি তারিখ',
        milestones: 'মাইলফলক'
      },
      tawarruq: {
        totalCost: 'মোট খরচ',
        profitRate: 'লাভের হার',
        durationMonths: 'মেয়াদ',
        commodityType: 'পণ্যের ধরন',
        sellerName: 'বিক্রেতার নাম',
        buyerName: 'ক্রেতার নাম'
      },
      ijarah: {
        assetValue: 'সম্পদের মূল্য',
        rentalAmount: 'ভাড়ার পরিমাণ',
        durationMonths: 'মেয়াদ',
        assetDescription: 'সম্পদের বিবরণ',
        lessorName: 'ভাড়াদাতার নাম',
        lesseeName: 'ভাড়াগ্রহীতার নাম'
      },
      kafalah: {
        guaranteeAmount: 'গ্যারান্টির পরিমাণ',
        durationMonths: 'মেয়াদ',
        principalDebtor: 'প্রধান ঋণগ্রহীতা',
        beneficiary: 'সুবিধাভোগী',
        guaranteeFee: 'গ্যারান্টি ফি'
      }
    };

    return fieldLabels[schemaName]?.[field] || this.formatFieldName(field);
  }

  private static formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Helper method to get field description from schema
  static getFieldDescription(loanType: LoanType, field: string): string {
    const schema = this.schemas[loanType];
    if (schema?.properties?.[field]?.description) {
      return schema.properties[field].description;
    }
    return '';
  }

  // Helper method to get field options from schema (for enums)
  static getFieldOptions(loanType: LoanType, field: string): string[] {
    const schema = this.schemas[loanType];
    if (schema?.properties?.[field]?.enum) {
      return schema.properties[field].enum;
    }
    return [];
  }

  // Helper method to check if field is required
  static isFieldRequired(loanType: LoanType, field: string): boolean {
    const schema = this.schemas[loanType];
    return schema?.required?.includes(field) || false;
  }

  // Helper method to get field constraints
  static getFieldConstraints(loanType: LoanType, field: string): {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  } {
    const schema = this.schemas[loanType];
    const fieldSchema = schema?.properties?.[field];
    
    if (!fieldSchema) return {};

    return {
      min: fieldSchema.minimum,
      max: fieldSchema.maximum,
      minLength: fieldSchema.minLength,
      maxLength: fieldSchema.maxLength,
      pattern: fieldSchema.pattern
    };
  }

  // Get all loan types with their schemas
  static getAvailableLoanTypes(): { type: LoanType; name: string; schema: any }[] {
    const loanTypes: LoanType[] = ['murabaha', 'musharaka', 'salam', 'qardHasanah', 'istisna', 'mudaraba', 'tawarruq', 'ijarah', 'kafalah'];
    
    return loanTypes.map(type => ({
      type,
      name: this.getLoanTypeName(type),
      schema: this.schemas[type]
    }));
  }

  // Get loan type name in Bengali
  static getLoanTypeName(loanType: LoanType): string {
    const typeNames: Record<LoanType, string> = {
      murabaha: 'মুরাবাহা',
      musharaka: 'মুশারাকা',
      salam: 'সালাম',
      qardHasanah: 'কারদ হাসানা',
      istisna: 'ইস্তিসনা',
      mudaraba: 'মুদারাবা',
      tawarruq: 'তাওয়ারুক',
      ijarah: 'ইজারা',
      kafalah: 'কাফালা'
    };
    
    return typeNames[loanType];
  }
}

// Utility function for real-time validation in forms
export const validateField = (loanType: LoanType, field: string, value: any): { isValid: boolean; message: string } => {
  const constraints = SchemaValidator.getFieldConstraints(loanType, field);
  
  if (SchemaValidator.isFieldRequired(loanType, field) && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      message: 'এই ফিল্ডটি আবশ্যক'
    };
  }

  if (value === undefined || value === null || value === '') {
    return { isValid: true, message: '' };
  }

  // Type validation
  if (constraints.min !== undefined && typeof value === 'number' && value < constraints.min) {
    return {
      isValid: false,
      message: `মান ${constraints.min} এর কম হতে পারবে না`
    };
  }

  if (constraints.max !== undefined && typeof value === 'number' && value > constraints.max) {
    return {
      isValid: false,
      message: `মান ${constraints.max} এর বেশি হতে পারবে না`
    };
  }

  if (constraints.minLength && typeof value === 'string' && value.length < constraints.minLength) {
    return {
      isValid: false,
      message: `কমপক্ষে ${constraints.minLength} অক্ষর প্রয়োজন`
    };
  }

  if (constraints.pattern && typeof value === 'string' && !new RegExp(constraints.pattern).test(value)) {
    return {
      isValid: false,
      message: 'সঠিক ফরম্যাট দিন'
    };
  }

  return { isValid: true, message: '' };
};