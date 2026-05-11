// src/modules/dashboards/pages/CollectorDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { 
  Wallet, TrendingUp, TrendingDown, 
  DollarSign, Clock, CheckCircle,
  Banknote, CreditCard, Smartphone, Landmark,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ExportMenu from '../../../shared/export/ExportMenu';

interface CollectionStats {
  totalCollected: number;
  totalDeposited: number;
  totalInHand: number;
  pendingDeposit: number;
  collectionCount: number;
  depositCount: number;
  avgCollectionAmount: number;
}

interface PaymentMethodStats {
  cash: { count: number; amount: number };
  bank: { count: number; amount: number };
  bikash: { count: number; amount: number };
  nogod: { count: number; amount: number };
  rocket: { count: number; amount: number };
  other: { count: number; amount: number };
}

interface CollectionRecord {
  id: string;
  receiptId: string;
  memberName: string;
  memberId: string;
  amount: number;
  paymentType: string;
  collectionStatus: 'collected' | 'deposited' | 'transferred';
  createdAt: Date;
  bankName?: string;
  bankReference?: string;
  referenceNo?: string;
  remarks?: string;
  collectedAt: Date;
  depositedAt?: Date;
}

const CollectorDashboard: React.FC = () => {
  const { user, userData, currentMember } = useAuth();
  const { formatAmount } = useSomitySettings();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CollectionStats>({
    totalCollected: 0,
    totalDeposited: 0,
    totalInHand: 0,
    pendingDeposit: 0,
    collectionCount: 0,
    depositCount: 0,
    avgCollectionAmount: 0
  });
  const [paymentMethodStats, setPaymentMethodStats] = useState<PaymentMethodStats>({
    cash: { count: 0, amount: 0 },
    bank: { count: 0, amount: 0 },
    bikash: { count: 0, amount: 0 },
    nogod: { count: 0, amount: 0 },
    rocket: { count: 0, amount: 0 },
    other: { count: 0, amount: 0 }
  });
  const [collectedRecords, setCollectedRecords] = useState<CollectionRecord[]>([]);
  const [depositedRecords, setDepositedRecords] = useState<CollectionRecord[]>([]);
  const [pendingRecords, setPendingRecords] = useState<CollectionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'collected' | 'deposited' | 'pending'>('pending');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [refreshing, setRefreshing] = useState(false);

  const collectorId = currentMember?.memberId || userData?.memberId || user?.uid;

  useEffect(() => {
    if (collectorId) {
      loadDashboardData();
    }
  }, [collectorId, dateRange]);

  const loadDashboardData = async () => {
    if (!collectorId) return;
    
    setLoading(true);
    try {
      // Get date filter
      const now = new Date();
      let startDate: Date | null = null;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'all':
          startDate = null;
          break;
      }

      // Query contributions where collector is this collector
      const contributionsRef = collection(db, 'contributions');
      let q = query(
        contributionsRef,
        where('collectorId', '==', collectorId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      let allRecords: CollectionRecord[] = [];
      let totalCollected = 0;
      let totalDeposited = 0;
      let methodStats = {
        cash: { count: 0, amount: 0 },
        bank: { count: 0, amount: 0 },
        bikash: { count: 0, amount: 0 },
        nogod: { count: 0, amount: 0 },
        rocket: { count: 0, amount: 0 },
        other: { count: 0, amount: 0 }
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
        
        // Apply date filter
        if (startDate && createdAt < startDate) return;
        
        const amount = data.feeAmount || 0;
        const collectionStatus = data.collectionStatus || 'collected';
        const paymentType = data.payType || 'cash';
        
        const record: CollectionRecord = {
          id: doc.id,
          receiptId: data.receiptId,
          memberName: data.memberName,
          memberId: data.memberId,
          amount,
          paymentType,
          collectionStatus,
          createdAt,
          bankName: data.bankName,
          bankReference: data.bankReference,
          referenceNo: data.referenceNo,
          remarks: data.remarks,
          collectedAt: data.collectedAt?.toDate?.() || createdAt,
          depositedAt: data.depositedAt?.toDate?.()
        };
        
        allRecords.push(record);
        totalCollected += amount;
        
        if (collectionStatus === 'deposited') {
          totalDeposited += amount;
        }
        
        // Update method stats
        const method = paymentType as keyof PaymentMethodStats;
        if (methodStats[method]) {
          methodStats[method].count++;
          methodStats[method].amount += amount;
        } else {
          methodStats.other.count++;
          methodStats.other.amount += amount;
        }
      });
      
      const totalInHand = totalCollected - totalDeposited;
      const pendingDeposit = allRecords.filter(r => r.collectionStatus === 'collected').length;
      
      setStats({
        totalCollected,
        totalDeposited,
        totalInHand,
        pendingDeposit,
        collectionCount: allRecords.length,
        depositCount: allRecords.filter(r => r.collectionStatus === 'deposited').length,
        avgCollectionAmount: allRecords.length > 0 ? totalCollected / allRecords.length : 0
      });
      
      setPaymentMethodStats(methodStats);
      setCollectedRecords(allRecords.filter(r => r.collectionStatus === 'collected'));
      setDepositedRecords(allRecords.filter(r => r.collectionStatus === 'deposited'));
      setPendingRecords(allRecords.filter(r => r.collectionStatus === 'collected'));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'bank': return <Landmark className="h-4 w-4" />;
      case 'bikash': return <Smartphone className="h-4 w-4" />;
      case 'nogod': return <Smartphone className="h-4 w-4" />;
      case 'rocket': return <Smartphone className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-700';
      case 'bank': return 'bg-blue-100 text-blue-700';
      case 'bikash': return 'bg-pink-100 text-pink-700';
      case 'nogod': return 'bg-orange-100 text-orange-700';
      case 'rocket': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'collected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="h-3 w-3" /> সংগৃহীত</span>;
      case 'deposited':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="h-3 w-3" /> জমা হয়েছে</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const currentRecords = activeTab === 'collected' ? collectedRecords : activeTab === 'deposited' ? depositedRecords : pendingRecords;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">কালেক্টর ড্যাশবোর্ড</h1>
            <p className="text-gray-500 mt-1">স্বাগতম, {currentMember?.fullName || userData?.fullName || 'Collector'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm border border-gray-200"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </button>
            <ExportMenu data={currentRecords.map(r => ({
              receiptId: r.receiptId,
              memberName: r.memberName,
              memberId: r.memberId,
              feeAmount: r.amount,
              payType: r.paymentType,
              collectionStatus: r.collectionStatus,
              createdAt: r.createdAt,
              bankName: r.bankName,
              bankReference: r.bankReference,
              referenceNo: r.referenceNo
            } as any))} title="কালেক্টর রিপোর্ট" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">মোট সংগৃহীত</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalCollected)}</p>
                <p className="text-xs text-gray-400 mt-1">{stats.collectionCount} টি লেনদেন</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">জমা হয়েছে</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(stats.totalDeposited)}</p>
                <p className="text-xs text-gray-400 mt-1">{stats.depositCount} টি জমা</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">হাতে আছে</p>
                <p className="text-2xl font-bold text-yellow-600">{formatAmount(stats.totalInHand)}</p>
                <p className="text-xs text-gray-400 mt-1">জমা বাকি: {stats.pendingDeposit} টি</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">গড় সংগ্রহের পরিমাণ</p>
                <p className="text-2xl font-bold text-purple-600">{formatAmount(stats.avgCollectionAmount)}</p>
                <p className="text-xs text-gray-400 mt-1">প্রতি লেনদেন</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Stats */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-600" />
            পেমেন্ট পদ্ধতি অনুযায়ী জমা
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(paymentMethodStats).map(([method, data]) => (
              <div key={method} className={`p-3 rounded-lg text-center ${getPaymentMethodColor(method)}`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {getPaymentMethodIcon(method)}
                  <span className="text-sm font-medium capitalize">{method}</span>
                </div>
                <p className="text-lg font-bold">{formatAmount(data.amount)}</p>
                <p className="text-xs">{data.count} টি লেনদেন</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs and Records */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ⏳ জমা বাকি ({pendingRecords.length})
              </button>
              <button
                onClick={() => setActiveTab('collected')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'collected'
                    ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📥 সংগৃহীত ({collectedRecords.length})
              </button>
              <button
                onClick={() => setActiveTab('deposited')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'deposited'
                    ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ✅ জমা হয়েছে ({depositedRecords.length})
              </button>
            </div>
          </div>

          {/* Date Filter */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-2">
            {['today', 'week', 'month', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {range === 'today' ? 'আজ' : range === 'week' ? 'সপ্তাহ' : range === 'month' ? 'মাস' : 'সব'}
              </button>
            ))}
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">রসিদ নং</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">সদস্য</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">পদ্ধতি</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">রেফারেন্স</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>কোনো লেনদেন পাওয়া যায়নি</p>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.createdAt.toLocaleDateString('bn-BD')}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">
                        {record.receiptId}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{record.memberName}</p>
                        <p className="text-xs text-gray-500">{record.memberId}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                        {formatAmount(record.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${getPaymentMethodColor(record.paymentType)}`}>
                          {getPaymentMethodIcon(record.paymentType)}
                          <span className="capitalize">{record.paymentType}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(record.collectionStatus)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {record.referenceNo || record.bankReference || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          {currentRecords.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  মোট {currentRecords.length} টি লেনদেন
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  মোট পরিমাণ: {formatAmount(currentRecords.reduce((sum, r) => sum + r.amount, 0))}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800">দ্রষ্টব্য</h4>
              <p className="text-xs text-blue-700 mt-1">
                • <strong>সংগৃহীত:</strong> আপনি সদস্যদের কাছ থেকে যে টাকা সংগ্রহ করেছেন, কিন্তু এখনো সোমিটি অ্যাকাউন্টে জমা দেননি।<br />
                • <strong>জমা হয়েছে:</strong> আপনি সোমিটি অ্যাকাউন্টে যে টাকা জমা দিয়েছেন।<br />
                • <strong>হাতে আছে:</strong> আপনার কাছে এখনো যে টাকা জমা আছে (সংগৃহীত - জমা হয়েছে)।<br />
                • সময়মতো টাকা জমা দিন এবং জমা করার সময় ব্যাংকের ট্রানজেকশন আইডি সংরক্ষণ করুন।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;