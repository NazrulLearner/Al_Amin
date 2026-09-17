// src/modules/Investments/hooks/useInvestmentDetails.ts

import { useState, useEffect } from 'react';
import { investmentService } from '../services/investmentService';
import type { Investment } from '../types/investment.types';
import type { InvestmentTransaction } from '../types/investmentTransaction.types';
import { getDaysToMaturity, getMaturityStatusText } from '../utils/maturityCalculator';
import { formatCurrency } from '../../../utils/formatters/currencyFormatter';  // ✅ Use global
import { formatDate } from '../../../utils/formatters/dateFormatter';  // ✅ Use global

export const useInvestmentDetails = (investmentId: string) => {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysToMaturity, setDaysToMaturity] = useState<number | null>(null);
  const [maturityStatusText, setMaturityStatusText] = useState<string>('');

  useEffect(() => {
    if (investmentId) {
      loadData();
    }
  }, [investmentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const inv = await investmentService.getInvestment(investmentId);
      setInvestment(inv);
      
      const txns = await investmentService.getInvestmentTransactions(investmentId);
      setTransactions(txns);
      
      if (inv) {
        setDaysToMaturity(getDaysToMaturity(inv));
        setMaturityStatusText(getMaturityStatusText(inv));
      }
    } catch (error) {
      console.error('Error loading investment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadData();
  };

  // Helper functions using global formatters
  const formatAmount = (amount: number) => formatCurrency(amount);
  const formatDateStr = (date: any) => formatDate(date, 'DD/MM/YYYY');

  return {
    investment,
    transactions,
    loading,
    daysToMaturity,
    maturityStatusText,
    formatAmount,
    formatDateStr,
    refresh
  };
};

export default useInvestmentDetails;