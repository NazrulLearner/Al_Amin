// src/modules/Investments/hooks/useInvestments.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { investmentService } from '../services/investmentService';
import { toast } from 'sonner';
import type { Investment, CreateInvestmentRequest, InvestmentSummary } from '../types/investment.types';

export const useInvestments = () => {
  const { user, userData, currentMember } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [pendingInvestments, setPendingInvestments] = useState<Investment[]>([]);
  const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [all, pending, active, summaryData] = await Promise.all([
        investmentService.getAllInvestments(),
        investmentService.getPendingInvestments(),
        investmentService.getActiveInvestments(),
        investmentService.getInvestmentSummary(),
      ]);
      setInvestments(all);
      setPendingInvestments(pending);
      setActiveInvestments(active);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading investments:', error);
      toast.error('বিনিয়োগ লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvestment = useCallback(
    async (request: CreateInvestmentRequest) => {
      try {
        const currentUserId = user?.uid || 'system';
        const currentUserName = currentMember?.fullName || userData?.fullName || 'System';
        const newInvestment = await investmentService.createInvestment(
          request,
          currentUserId,
          currentUserName
        );
        await loadAllData();
        toast.success('বিনিয়োগ আবেদন জমা হয়েছে! অনুমোদনের জন্য অপেক্ষা করুন।');
        return newInvestment;
      } catch (error: any) {
        console.error('Error creating investment:', error);
        toast.error(error.message || 'বিনিয়োগ তৈরি করতে ব্যর্থ হয়েছে');
        throw error;
      }
    },
    [loadAllData, user, userData, currentMember]
  );

  const approveInvestment = useCallback(
    async (id: string, remarks?: string) => {
      try {
        const currentUserId = user?.uid || 'admin';
        const currentUserName = currentMember?.fullName || userData?.fullName || 'Admin';
        await investmentService.approveInvestment(id, currentUserId, currentUserName, remarks);
        await loadAllData();
        toast.success('বিনিয়োগ অনুমোদন করা হয়েছে!');
      } catch (error) {
        console.error('Error approving investment:', error);
        toast.error('বিনিয়োগ অনুমোদন করতে ব্যর্থ হয়েছে');
        throw error;
      }
    },
    [loadAllData, user, userData, currentMember]
  );

  const rejectInvestment = useCallback(
    async (id: string, reason: string) => {
      try {
        const currentUserId = user?.uid || 'admin';
        const currentUserName = currentMember?.fullName || userData?.fullName || 'Admin';
        await investmentService.rejectInvestment(id, currentUserId, currentUserName, reason);
        await loadAllData();
        toast.error('বিনিয়োগ বাতিল করা হয়েছে');
      } catch (error) {
        console.error('Error rejecting investment:', error);
        toast.error('বিনিয়োগ বাতিল করতে ব্যর্থ হয়েছে');
        throw error;
      }
    },
    [loadAllData, user, userData, currentMember]
  );

  const matureInvestment = useCallback(
    async (id: string, actualProfit: number, inTransactionId?: string) => {
      try {
        const currentUserId = user?.uid || 'admin';
        const currentUserName = currentMember?.fullName || userData?.fullName || 'Admin';
        await investmentService.matureInvestment(id, actualProfit, currentUserId, currentUserName, inTransactionId);
        await loadAllData();
        toast.success('বিনিয়োগ ম্যাচিউরিটি সম্পন্ন হয়েছে!');
      } catch (error) {
        console.error('Error maturing investment:', error);
        toast.error('বিনিয়োগ ম্যাচিউর করতে ব্যর্থ হয়েছে');
        throw error;
      }
    },
    [loadAllData, user, userData, currentMember]
  );

  const deleteInvestment = useCallback(
    async (id: string) => {
      try {
        await investmentService.deleteInvestment(id);
        await loadAllData();
        toast.success('বিনিয়োগ মুছে ফেলা হয়েছে!');
      } catch (error) {
        console.error('Error deleting investment:', error);
        toast.error('বিনিয়োগ মুছে ফেলতে ব্যর্থ হয়েছে');
        throw error;
      }
    },
    [loadAllData]
  );

  const getInvestment = useCallback(async (id: string) => {
    return await investmentService.getInvestment(id);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    investments,
    pendingInvestments,
    activeInvestments,
    loading,
    summary,
    createInvestment,
    approveInvestment,
    rejectInvestment,
    matureInvestment,
    deleteInvestment,
    getInvestment,
    refresh: loadAllData,
  };
};