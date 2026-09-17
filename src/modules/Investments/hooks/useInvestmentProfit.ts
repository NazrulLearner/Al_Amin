// src/modules/Investments/hooks/useInvestmentProfit.ts

import { useState, useEffect } from 'react';
import { investmentService } from '../services/investmentService';
import type { Investment } from '../types/investment.types';
import type { ProfitRecord } from '../types/investmentTransaction.types';

export const useInvestmentProfit = (investmentId: string) => {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [profitRecords, setProfitRecords] = useState<ProfitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyProfit] = useState(0);
  const [totalExpectedProfit] = useState(0);
  const [totalReceivedProfit] = useState(0);

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
      
  
      
      // Try to load profit records if the method exists
      try {
        // @ts-ignore - optional method
        const records = await investmentService.getProfitRecords?.(investmentId);
        setProfitRecords(records || []);
      } catch (e) {
        setProfitRecords([]);
      }
    } catch (error) {
      console.error('Error loading investment profit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadData();
  };

  return {
    investment,
    profitRecords,
    loading,
    monthlyProfit,
    totalExpectedProfit,
    totalReceivedProfit,
    remainingProfit: totalExpectedProfit - totalReceivedProfit,
    profitPercentage: totalExpectedProfit > 0 ? (totalReceivedProfit / totalExpectedProfit) * 100 : 0,
    refresh
  };
};

export default useInvestmentProfit;