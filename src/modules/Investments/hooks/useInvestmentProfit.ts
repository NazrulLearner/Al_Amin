import { useState, useEffect, useCallback } from 'react';
import { investmentService } from '../services/investmentService';
import { investmentCalculator } from '../utils/investmentCalculator';

export const useInvestmentProfit = (investmentId: string) => {
  const [profit, setProfit] = useState<{
    expected: number;
    monthly: number;
    percentage: number;
    annualized: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateProfit = useCallback(async () => {
    try {
      setLoading(true);
      const investment = await investmentService.getById(investmentId);
      if (investment) {
        const totalDays = (investment.maturityDate.getTime() - investment.startDate.getTime()) / (1000 * 60 * 60 * 24);
        
        setProfit({
          expected: investment.expectedProfitAmount,
          monthly: investmentCalculator.calculateMonthlyProfit(
            investment.amount,
            investment.expectedReturnPercent,
            investment.expectedReturnPercent === 12 ? 12 : 1
          ),
          percentage: investment.expectedReturnPercent,
          annualized: investmentCalculator.calculateAnnualizedReturn(
            investment.expectedProfitAmount,
            investment.amount,
            totalDays
          )
        });
      }
    } catch (error) {
      console.error('Error calculating profit:', error);
    } finally {
      setLoading(false);
    }
  }, [investmentId]);

  useEffect(() => {
    calculateProfit();
  }, [calculateProfit]);

  return { profit, loading, recalculate: calculateProfit };
};