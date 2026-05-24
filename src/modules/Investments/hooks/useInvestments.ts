import { useState, useEffect, useCallback } from 'react';
import { investmentService } from '../services/investmentService';
import type { Investment, InvestmentFilter } from '../types/investment.types';

export const useInvestments = (initialFilter?: InvestmentFilter) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InvestmentFilter | undefined>(initialFilter);

  const loadInvestments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (filter) {
        data = await investmentService.getFiltered(filter);
      } else {
        data = await investmentService.getAll();
      }
      setInvestments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const createInvestment = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const id = await investmentService.create(data);
      await loadInvestments();
      return id;
    } catch (err: any) {
      setError(err.message || 'Failed to create investment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadInvestments]);

  const updateInvestment = useCallback(async (id: string, data: Partial<Investment>) => {
    try {
      setLoading(true);
      await investmentService.update(id, data);
      await loadInvestments();
    } catch (err: any) {
      setError(err.message || 'Failed to update investment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadInvestments]);

  const deleteInvestment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await investmentService.delete(id);
      await loadInvestments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete investment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadInvestments]);

  const approveInvestment = useCallback(async (id: string, approvedBy: string) => {
    try {
      setLoading(true);
      await investmentService.approveInvestment(id, approvedBy);
      await loadInvestments();
    } catch (err: any) {
      setError(err.message || 'Failed to approve investment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadInvestments]);

  return {
    investments,
    loading,
    error,
    filter,
    setFilter,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    approveInvestment,
    reload: loadInvestments
  };
};