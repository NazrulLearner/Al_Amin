// src/modules/finance/pages/index.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { financeService } from '../services/financeService';
import { 
  Landmark, Wallet, TrendingUp, TrendingDown,
  Plus, ArrowRight, Loader2, DollarSign,
  RefreshCw, History, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const FinanceDashboard: React.FC = () => {
  useAuth();
  const { formatAmount } = useSomitySettings();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBankBalance: 0,
    totalCashInHand: 0,
    totalAccounts: 0,
    todayCollection: 0,
    todayDeposit: 0,
    todayDisbursement: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [banks, cashStats, todayStats, transactions] = await Promise.all([
        financeService.getAllBankAccounts(),
        financeService.getTotalCashInHand(),
        financeService.getTodayTransactions(),
        financeService.getAllTransactions(5)
      ]);
      
      setStats({
        totalBankBalance: banks.reduce((sum, b) => sum + (b.currentBalance || 0), 0),
        totalCashInHand: cashStats,
        totalAccounts: banks.length,
        todayCollection: todayStats.totalCollection,
        todayDeposit: todayStats.totalDeposit,
        todayDisbursement: todayStats.totalDisbursement
      });
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'ব্যাংক অ্যাকাউন্ট যোগ', icon: <Plus className="h-5 w-5" />, href: '/finance/addaccount', color: 'bg-blue-600', description: 'নতুন ব্যাংক অ্যাকাউন্ট খুলুন' },
    { title: 'ফান্ড ট্রান্সফার', icon: <RefreshCw className="h-5 w-5" />, href: '/finance/transfer', color: 'bg-green-600', description: 'এক অ্যাকাউন্ট থেকে অন্য অ্যাকাউন্টে টাকা স্থানান্তর' },
    { title: 'ট্রানজেকশন হিস্টোরি', icon: <History className="h-5 w-5" />, href: '/finance/history', color: 'bg-purple-600', description: 'সব লেনদেনের ইতিহাস' },
    { title: 'লেজার বুক', icon: <FileText className="h-5 w-5" />, href: '/finance/ledger', color: 'bg-orange-600', description: 'অ্যাকাউন্ট লেজার দেখুন' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ফাইন্যান্স ড্যাশবোর্ড
          </h1>
          <p className="text-gray-500 mt-2">ব্যাংক অ্যাকাউন্ট, ক্যাশ ব্যবস্থাপনা ও লেনদেন ট্র্যাকিং</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট ব্যাংক ব্যালেন্স</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(stats.totalBankBalance)}</p>
                <p className="text-xs text-gray-400 mt-1">{stats.totalAccounts} টি অ্যাকাউন্ট</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Landmark className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">হাতে নগদ</p>
                <p className="text-2xl font-bold text-blue-600">{formatAmount(stats.totalCashInHand)}</p>
                <p className="text-xs text-gray-400 mt-1">ক্যাশিয়ারের কাছে</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">আজকের সংগ্রহ</p>
                <p className="text-2xl font-bold text-purple-600">{formatAmount(stats.todayCollection)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">আজকের বিতরণ</p>
                <p className="text-2xl font-bold text-red-600">{formatAmount(stats.todayDisbursement)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className={`${action.color} rounded-xl p-4 text-white hover:opacity-90 transition-all flex items-center justify-between group shadow-md`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {action.icon}
                </div>
                <div>
                  <p className="font-semibold">{action.title}</p>
                  <p className="text-xs text-white/80">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
            </Link>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <History className="h-5 w-5 text-gray-500" />
              সাম্প্রতিক লেনদেন
            </h3>
            <Link to="/finance/history" className="text-sm text-blue-600 hover:text-blue-800">
              সব দেখুন <ArrowRight className="h-4 w-4 inline" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ট্রানজেকশন আইডি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">থেকে</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">থেকে</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">{tx.transactionId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize">{tx.from?.type}</span>
                      <p className="text-xs text-gray-500">{tx.from?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize">{tx.to?.type}</span>
                      <p className="text-xs text-gray-500">{tx.to?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">{formatAmount(tx.amount)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentTransactions.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">কোনো লেনদেন নেই</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;