// src/pages/fees/index.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { summaryService } from '../services/summaryService';
import { feesService } from '../services/contributionService';
import { 
  DollarSign, TrendingUp, Users, AlertCircle, 
  PlusCircle, History, BarChart3, Loader2,
  Calendar, ChevronRight, ArrowUpRight,
  ArrowDownRight, Clock, 
  CreditCard, Banknote, Landmark, Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import type { FeeSummary, FeeTransaction } from '../../../types';

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
    {trend !== undefined && (
      <div className="flex items-center gap-1 mt-3">
        {trend >= 0 ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-gray-400">গত মাসের তুলনায়</span>
      </div>
    )}
  </div>
);

// Action Button Component
const ActionButton: React.FC<{
  title: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  description: string;
}> = ({ title, icon, href, color, description }) => (
  <Link
    to={href}
    className={`${color} text-white rounded-xl p-4 hover:opacity-90 transition-all flex items-center justify-between group`}
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/20 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-white/80">{description}</p>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
  </Link>
);

// Recent Transaction Component
const RecentTransaction: React.FC<{ transaction: FeeTransaction }> = ({ transaction }) => {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'bank': return <Landmark className="h-4 w-4" />;
      case 'bikash': return <Smartphone className="h-4 w-4" />;
      case 'nogod': return <Smartphone className="h-4 w-4" />;
      case 'rocket': return <Smartphone className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-600';
      case 'bank': return 'bg-blue-100 text-blue-600';
      case 'bikash': return 'bg-pink-100 text-pink-600';
      case 'nogod': return 'bg-orange-100 text-orange-600';
      case 'rocket': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${getMethodColor(transaction.payType)}`}>
          {getMethodIcon(transaction.payType)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.memberName}</p>
          <p className="text-xs text-gray-500">{transaction.receiptId}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-green-600">৳{transaction.feeAmount.toLocaleString()}</p>
        <p className="text-xs text-gray-400">{new Date(transaction.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

// Payment Method Card
const PaymentMethodCard: React.FC<{
  method: string;
  count: number;
  amount: number;
  icon: React.ReactNode;
  color: string;
}> = ({ method, count, amount, icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <span className="text-xs text-gray-400">{count} টি লেনদেন</span>
    </div>
    <p className="text-sm font-medium text-gray-700">{method}</p>
    <p className="text-lg font-bold text-gray-900">৳{amount.toLocaleString()}</p>
  </div>
);

const FeesDashboard: React.FC = () => {
  const { somityInfo } = useAuth();
  const { settings } = useSomitySettings();
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<FeeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<Record<string, { count: number; amount: number }>>({});

  const fiscalYearStart = settings?.financial?.fiscalYearStart || 'July-2021';
  const somityStartMonth = fiscalYearStart.split('-')[0] || 'July';
  const somityStartYear = parseInt(fiscalYearStart.split('-')[1]) || 2021;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Single somity data!
      const summaryData = await summaryService.getFeeSummary
      (somityStartMonth, somityStartYear);
      setSummary(summaryData);
      
      const transactions = await feesService.getAllTransactions(10);
      setRecentTransactions(transactions);
      
      const methodStats: Record<string, { count: number; amount: number }> = {};
      transactions.forEach(t => {
        if (!methodStats[t.payType]) {
          methodStats[t.payType] = { count: 0, amount: 0 };
        }
        methodStats[t.payType].count++;
        methodStats[t.payType].amount += t.feeAmount;
      });
      setPaymentMethods(methodStats);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      cash: 'নগদ', bank: 'ব্যাংক', bikash: 'বিকাশ', 
      nogod: 'নগদ', rocket: 'রকেট', other: 'অন্যান্য'
    };
    return names[method] || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-5 w-5" />;
      case 'bank': return <Landmark className="h-5 w-5" />;
      case 'bikash': case 'nogod': case 'rocket': return <Smartphone className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-600';
      case 'bank': return 'bg-blue-100 text-blue-600';
      case 'bikash': return 'bg-pink-100 text-pink-600';
      case 'nogod': return 'bg-orange-100 text-orange-600';
      case 'rocket': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                ফি ব্যবস্থাপনা
              </h1>
              <p className="text-gray-500 mt-2">{somityInfo?.name || 'সোমিটি'} - ফি সংগ্রহ ও ব্যবস্থাপনা ড্যাশবোর্ড</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="মোট সংগ্রহ"
            value={`৳${summary?.totalCollected?.toLocaleString() || 0}`}
            icon={<DollarSign className="h-6 w-6 text-white" />}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
            subtitle="সর্বমোট জমা"
          />
          <StatsCard
            title="মোট বকেয়া"
            value={`৳${summary?.totalDue?.toLocaleString() || 0}`}
            icon={<AlertCircle className="h-6 w-6 text-white" />}
            color="bg-gradient-to-r from-red-500 to-rose-600"
            subtitle={`${summary?.pendingMembers || 0} জন সদস্য`}
          />
          <StatsCard
            title="সংগ্রহের হার"
            value={`${summary?.collectionRate || 0}%`}
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            color="bg-gradient-to-r from-blue-500 to-indigo-600"
          />
          <StatsCard
            title="সক্রিয় সদস্য"
            value={summary?.activeMembers || 0}
            icon={<Users className="h-6 w-6 text-white" />}
            color="bg-gradient-to-r from-purple-500 to-pink-600"
          />
        </div>

        {/* Monthly Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">এই মাসের সংগ্রহ</p>
                <p className="text-2xl font-bold">৳{summary?.thisMonthCollection?.toLocaleString() || 0}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">গত মাসে: ৳{summary?.lastMonthCollection?.toLocaleString() || 0}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">বকেয়া সদস্য</p>
                <p className="text-2xl font-bold">{summary?.pendingMembers || 0} জন</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">মোট সদস্যের {summary?.activeMembers ? Math.round((summary.pendingMembers / summary.activeMembers) * 100) : 0}%</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ActionButton title="ফি জমা দিন" icon={<PlusCircle className="h-5 w-5" />} href="/fees/entry" color="bg-gradient-to-r from-green-500 to-emerald-600" description="নতুন ফি জমা" />
          <ActionButton title="বকেয়া ফি" icon={<AlertCircle className="h-5 w-5" />} href="/fees/pending" color="bg-gradient-to-r from-red-500 to-rose-600" description="বকেয়া তালিকা" />
          <ActionButton title="ইতিহাস" icon={<History className="h-5 w-5" />} href="/fees/history" color="bg-gradient-to-r from-blue-500 to-indigo-600" description="সকল লেনদেন" />
          <ActionButton title="রিপোর্ট" icon={<BarChart3 className="h-5 w-5" />} href="/fees/reports" color="bg-gradient-to-r from-purple-500 to-pink-600" description="বিশ্লেষণ" />
        </div>

        {/* Recent Transactions & Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold">সর্বশেষ লেনদেন</h3>
              <Link to="/fees/history" className="text-xs text-blue-600">সব দেখুন</Link>
            </div>
            <div className="p-5">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(t => <RecentTransaction key={t.id} transaction={t} />)
              ) : (
                <div className="text-center py-8 text-gray-500">কোনো লেনদেন নেই</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold">পেমেন্ট পদ্ধতি</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(paymentMethods).map(([method, data]) => (
                  <PaymentMethodCard
                    key={method}
                    method={getPaymentMethodName(method)}
                    count={data.count}
                    amount={data.amount}
                    icon={getPaymentMethodIcon(method)}
                    color={getPaymentMethodColor(method)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesDashboard;
