// src/utils/loanID.ts
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/firebase';
import type { LoanType } from '../../types';

// Loan Type Code Mapping
const LOAN_TYPE_CODES: Record<LoanType, string> = {
  murabaha: 'MR',
  musharaka: 'MS', 
  salam: 'SL',
  qardHasanah: 'QH',
  istisna: 'IS',
  mudaraba: 'MD',
  tawarruq: 'TW',
  ijarah: 'IJ',
  kafalah: 'KF'
};

// Application ID prefix
const APP_PREFIX = 'AP';

export class LoanIDGenerator {
  // Generate loan ID: {TT}{YY}{MM}{DD}{RR} (e.g., MR26040701)
  static async generateLoanId(loanType: LoanType): Promise<string> {
    try {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      
      const typeCode = LOAN_TYPE_CODES[loanType];
      const serial = await this.getDailySerial(loanType, now);
      
      return `${typeCode}${year}${month}${day}${serial}`;
    } catch (error) {
      console.error('Error generating loan ID:', error);
      return `LN-${Date.now().toString().slice(-8)}`;
    }
  }

  // Generate application ID: AP{YY}{MM}{DD}{RRRR}
  static async generateApplicationId(): Promise<string> {
    try {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      
      const serial = await this.getApplicationDailySerial();
      
      return `${APP_PREFIX}${year}${month}${day}${serial.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating application ID:', error);
      return `APP-${Date.now().toString().slice(-8)}`;
    }
  }

  // Get daily serial for loan
  private static async getDailySerial(loanType: LoanType, date: Date): Promise<string> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Note: collection path should be somity/{somityId}/loans
      // For now using root loans collection
      const q = query(
        collection(db, 'loans'),
        where('loanType', '==', loanType),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      const serial = (querySnapshot.size + 1).toString().padStart(2, '0');
      
      return serial;
    } catch (error) {
      console.error('Error getting daily serial:', error);
      return '01';
    }
  }

  // Get daily serial for applications
  private static async getApplicationDailySerial(): Promise<number> {
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      // Query from loanApplications collection
      const q = query(
        collection(db, 'loanApplications'),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size + 1;
    } catch (error) {
      console.error('Error getting application daily serial:', error);
      return 1;
    }
  }

  static isValidLoanId(loanId: string): boolean {
    const pattern = /^[A-Z]{2}\d{8}$/;
    return pattern.test(loanId);
  }

  static parseLoanId(loanId: string): {
    typeCode: string;
    year: string;
    month: string;
    day: string;
    serial: string;
    loanType?: LoanType;
  } {
    if (!this.isValidLoanId(loanId)) {
      throw new Error('Invalid loan ID format');
    }

    const typeCode = loanId.slice(0, 2);
    const year = loanId.slice(2, 4);
    const month = loanId.slice(4, 6);
    const day = loanId.slice(6, 8);
    const serial = loanId.slice(8, 10);

    const loanType = Object.entries(LOAN_TYPE_CODES).find(
      ([, code]) => code === typeCode
    )?.[0] as LoanType | undefined;

    return {
      typeCode,
      year: `20${year}`,
      month,
      day,
      serial,
      loanType
    };
  }

  static getLoanTypeFromCode(typeCode: string): string {
    const typeMap: Record<string, string> = {
      'QH': 'Qard Hasanah',
      'MR': 'Murabaha', 
      'SL': 'Salam',
      'MD': 'Mudaraba',
      'IS': 'Istisna',
      'IJ': 'Ijarah',
      'MS': 'Musharaka',
      'TW': 'Tawarruq',
      'KF': 'Kafalah'
    };
    
    return typeMap[typeCode] || 'Unknown';
  }
}

export const generateLoanId = async (loanType: LoanType): Promise<string> => {
  return await LoanIDGenerator.generateLoanId(loanType);
};

export const generateApplicationId = async (): Promise<string> => {
  return await LoanIDGenerator.generateApplicationId();
};
