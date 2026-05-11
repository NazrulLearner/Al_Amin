// src/modules/financing/utils/installmentCalculator.ts

export type InstallmentFrequency = 'monthly' | 'quarterly' | 'halfYearly' | 'yearly' | 'lumpSum';

export interface Installment {
  number: number;
  dueDate: Date;
  amount: number;
  isPaid?: boolean;
  paidDate?: Date;
}

export interface InstallmentSchedule {
  installments: Installment[];
  totalInstallments: number;
  installmentAmount: number;
  totalPayable: number;
}

/**
 * Get frequency label in Bengali
 */
export const getFrequencyLabel = (frequency: InstallmentFrequency): string => {
  const labels: Record<InstallmentFrequency, string> = {
    monthly: 'মাসিক',
    quarterly: 'ত্রৈমাসিক (৩ মাস)',
    halfYearly: 'অর্ধ-বার্ষিক (৬ মাস)',
    yearly: 'বার্ষিক (১২ মাস)',
    lumpSum: 'এককালীন'
  };
  return labels[frequency];
};

/**
 * Get frequency description in Bengali
 */
export const getFrequencyDescription = (frequency: InstallmentFrequency): string => {
  const descriptions: Record<InstallmentFrequency, string> = {
    monthly: 'প্রতি মাসে একটি কিস্তি পরিশোধ করতে হবে',
    quarterly: 'প্রতি ৩ মাস অন্তর একটি কিস্তি পরিশোধ করতে হবে',
    halfYearly: 'প্রতি ৬ মাস অন্তর একটি কিস্তি পরিশোধ করতে হবে',
    yearly: 'প্রতি ১২ মাস অন্তর একটি কিস্তি পরিশোধ করতে হবে',
    lumpSum: 'মেয়াদ শেষে এককালীন সম্পূর্ণ অর্থ পরিশোধ করতে হবে'
  };
  return descriptions[frequency];
};

/**
 * Calculate installment schedule based on frequency
 */
export const calculateInstallmentSchedule = (
  totalPayable: number,
  durationMonths: number,
  frequency: InstallmentFrequency,
  startDate: Date = new Date()
): InstallmentSchedule => {
  let totalInstallments = 1;
  let installmentAmount = totalPayable;
  const installments: Installment[] = [];

  switch (frequency) {
    case 'monthly':
      totalInstallments = durationMonths;
      installmentAmount = Math.round(totalPayable / durationMonths);
      for (let i = 1; i <= totalInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);
        installments.push({
          number: i,
          dueDate,
          amount: i === totalInstallments 
            ? totalPayable - (installmentAmount * (totalInstallments - 1))
            : installmentAmount
        });
      }
      break;
      
    case 'quarterly':
      totalInstallments = Math.ceil(durationMonths / 3);
      installmentAmount = Math.round(totalPayable / totalInstallments);
      for (let i = 1; i <= totalInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + (i * 3));
        installments.push({
          number: i,
          dueDate,
          amount: i === totalInstallments
            ? totalPayable - (installmentAmount * (totalInstallments - 1))
            : installmentAmount
        });
      }
      break;
      
    case 'halfYearly':
      totalInstallments = Math.ceil(durationMonths / 6);
      installmentAmount = Math.round(totalPayable / totalInstallments);
      for (let i = 1; i <= totalInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + (i * 6));
        installments.push({
          number: i,
          dueDate,
          amount: i === totalInstallments
            ? totalPayable - (installmentAmount * (totalInstallments - 1))
            : installmentAmount
        });
      }
      break;
      
    case 'yearly':
      totalInstallments = Math.ceil(durationMonths / 12);
      installmentAmount = Math.round(totalPayable / totalInstallments);
      for (let i = 1; i <= totalInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setFullYear(startDate.getFullYear() + i);
        installments.push({
          number: i,
          dueDate,
          amount: i === totalInstallments
            ? totalPayable - (installmentAmount * (totalInstallments - 1))
            : installmentAmount
        });
      }
      break;
      
    case 'lumpSum':
    default:
      totalInstallments = 1;
      installmentAmount = totalPayable;
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + durationMonths);
      installments.push({
        number: 1,
        dueDate,
        amount: totalPayable
      });
      break;
  }

  return {
    installments,
    totalInstallments,
    installmentAmount,
    totalPayable
  };
};

/**
 * Get number of installments based on frequency and duration
 */
export const getNumberOfInstallments = (durationMonths: number, frequency: InstallmentFrequency): number => {
  switch (frequency) {
    case 'lumpSum': return 1;
    case 'quarterly': return Math.ceil(durationMonths / 3);
    case 'halfYearly': return Math.ceil(durationMonths / 6);
    case 'yearly': return Math.ceil(durationMonths / 12);
    case 'monthly':
    default: return durationMonths;
  }
};

/**
 * Get installment amount based on frequency
 */
export const getInstallmentAmount = (totalPayable: number, durationMonths: number, frequency: InstallmentFrequency): number => {
  const installments = getNumberOfInstallments(durationMonths, frequency);
  return installments > 0 ? Math.round(totalPayable / installments) : totalPayable;
};