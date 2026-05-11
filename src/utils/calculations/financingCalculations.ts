// src/utils/loanCalculations/common.ts
export const calculateInstallments = (
  amount: number,
  duration: number,
  profitRate?: number
): { installmentAmount: number; totalPayable: number } => {
  if (profitRate && profitRate > 0) {
    const profit = (amount * profitRate * duration) / 1200;
    const totalPayable = amount + profit;
    const installmentAmount = totalPayable / duration;
    
    return {
      installmentAmount: Math.round(installmentAmount),
      totalPayable: Math.round(totalPayable)
    };
  } else {
    // For Qard Hasanah (no profit)
    const installmentAmount = amount / duration;
    return {
      installmentAmount: Math.round(installmentAmount),
      totalPayable: amount
    };
  }
};

export const calculateLateFee = (dueAmount: number, overdueDays: number): number => {
  // Late fee goes to charity (Islamic rule)
  const dailyFee = dueAmount * 0.0005; // 0.05% per day
  return Math.round(dailyFee * overdueDays);
};