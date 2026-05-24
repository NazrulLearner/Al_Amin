import { useState, useEffect, useCallback } from 'react';
import { investmentService } from '../services/investmentService';
import type { Investment } from '../types/investment.types';

export const useInvestmentDetails = (id: string | undefined) => {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvestment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await investmentService.getById(id);
      setInvestment(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load investment details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvestment();
  }, [loadInvestment]);

  const updateInvestment = useCallback(async (data: Partial<Investment>) => {
    if (!id) return;
    try {
      setLoading(true);
      await investmentService.update(id, data);
      await loadInvestment();
    } catch (err: any) {
      setError(err.message || 'Failed to update investment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, loadInvestment]);

  const markAsMatured = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      await investmentService.markAsMatured(id);
      await loadInvestment();
    } catch (err: any) {
      setError(err.message || 'Failed to mark as matured');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, loadInvestment]);

  return {
    investment,
    loading,
    error,
    updateInvestment,
    markAsMatured,
    reload: loadInvestment
  };
};