// src/pages/Members/profile/tabs/FinanceTab.tsx
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '../../../../app/providers/AuthProvider';
import { feesService } from '../../../contributions/services/contributionService';
import { loanService } from '../../../financing/services/FinancingService';
import type { Member, FeeTransaction } from '../../../../types';
import type { LoanApplication } from '../../../../types/financing';

interface FinanceTabProps {
  member: Member;
}

const FinanceTab: React.FC<FinanceTabProps> = ({ member }) => {
  useAuth();
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'fees' | 'loans'>('fees');

  useEffect(() => {
    if (member.memberId) {
      loadData();
    }
  }, [member.memberId]);

  const loadData = async () => {
    if (!member.memberId) return;
    
    setLoading(true);
    try {
      // ✅ FIX: Use services (single somity data, no manual collection paths)
      const [allTransactions, memberLoans] = await Promise.all([
        feesService.getAllTransactions(500),
        loanService.getLoansByMember(member.memberId)
      ]);
      
      // Filter transactions for this member
      const memberTransactions = allTransactions.filter(
        t => t.memberId === member.memberId
      );
      setTransactions(memberTransactions);
      setLoans(memberLoans);
      
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      if (date.toDate) return date.toDate().toLocaleDateString('bn-BD');
      return new Date(date).toLocaleDateString('bn-BD');
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount?.toLocaleString() || 0}`;
  };

  const getLoanStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'defaulted': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLoanStatusText = (status: string) => {
    const labels: Record<string, string> = {
      active: 'সক্রিয়',
      pending: 'অপেক্ষমান',
      approved: 'অনুমোদিত',
      completed: 'সম্পন্ন',
      rejected: 'বাতিল',
      defaulted: 'খেলাপি'
    };
    return labels[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'নগদ',
      bank: 'ব্যাংক',
      bikash: 'বিকাশ',
      nogod: 'নগদ',
      rocket: 'রকেট'
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">আর্থিক তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  // Calculate stats
  const feeStats = {
    totalPaid: member.financials?.totalFeesPaid || 0,
    pendingAmount: member.financials?.totalPendingAmount || 0,
    monthlyDue: member.financials?.monthlyDueAmount || 0,
    pendingMonths: member.financials?.totalPendingMonths || 0,
    totalTransactions: transactions.length,
    lastPayment: transactions[0],
  };

  const loanStats = {
    active: loans.filter(l => l.status === 'active').length,
    total: loans.length,
    totalAmount: loans.reduce((sum, l) => sum + (l.amount || 0), 0),
    totalPaid: loans.reduce((sum, l) => sum + (l.paidAmount || 0), 0),
    totalDue: loans.reduce((sum, l) => sum + (l.dueAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">মোট ফি জমা</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(feeStats.totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-1">{feeStats.totalTransactions} টি লেনদেন</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-sm text-gray-500">বাকি ফি</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(feeStats.pendingAmount)}</p>
          <p className="text-xs text-gray-400 mt-1">{feeStats.pendingMonths} মাস বাকি</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">মোট লোন</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{loanStats.total}</p>
          <p className="text-xs text-gray-400 mt-1">{loanStats.active} টি সক্রিয়</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">লোন বাকি</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(loanStats.totalDue)}</p>
          <p className="text-xs text-gray-400 mt-1">মোট: {formatCurrency(loanStats.totalAmount)}</p>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('fees')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeSection === 'fees'
              ? 'text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          💰 ফি ইতিহাস
          {activeSection === 'fees' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveSection('loans')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeSection === 'loans'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          💵 লোন ইতিহাস
          {activeSection === 'loans' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Fee History Section */}
      {activeSection === 'fees' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">কোনো ফি লেনদেন পাওয়া যায়নি</p>
              <p className="text-sm text-gray-400 mt-1">এই সদস্যের এখনো কোনো ফি জমা হয়নি</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">রসিদ নং</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">সময়কাল</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">পদ্ধতি</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(tx.paymentDate)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {tx.receiptId}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                        {formatCurrency(tx.feeAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {tx.paymentPeriod || `${tx.feeMonthFrom} ${tx.feeYearFrom} - ${tx.feeMonthTo} ${tx.feeYearTo}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {getPaymentMethodText(tx.payType)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.status === 'paid' ? 'পরিশোধিত' : 'আংশিক'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-green-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">
                      মোট ({transactions.length} টি লেনদেন)
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                      {formatCurrency(feeStats.totalPaid)}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Loan History Section */}
      {activeSection === 'loans' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loans.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">কোনো লোন পাওয়া যায়নি</p>
              <p className="text-sm text-gray-400 mt-1">এই সদস্যের কোনো লোন রেকর্ড নেই</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">লোন আইডি</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ধরন</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">জমা</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">বাকি</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">শুরুর তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loans.map(loan => (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{loan.loanId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{loan.loanType}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-right">
                        {formatCurrency(loan.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right">
                        {formatCurrency(loan.paidAmount || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 text-right">
                        {formatCurrency(loan.dueAmount || 0)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getLoanStatusColor(loan.status)}`}>
                          {getLoanStatusText(loan.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(loan.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-blue-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">
                      মোট ({loans.length} টি লোন)
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                      {formatCurrency(loanStats.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                      {formatCurrency(loanStats.totalPaid)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">
                      {formatCurrency(loanStats.totalDue)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceTab;
