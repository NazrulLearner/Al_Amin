// src/pages/fees/CollectionStatusReport.tsx
import React, { useState, useEffect } from 'react';
import { summaryService } from '../services/summaryService';
import { 
  Wallet, Banknote, Landmark, RefreshCw, 
  CheckCircle, Clock, Loader2, Download
} from 'lucide-react';
import { toast } from 'sonner';

const CollectionStatusReport: React.FC = () => {
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [depositedAmount, setDepositedAmount] = useState(0);
  const [transferredAmount, setTransferredAmount] = useState(0);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Single somity data!
      const summary = await summaryService.getCollectionStatusSummary();
      setCollectedAmount(summary.collectedAmount);
      setDepositedAmount(summary.depositedAmount);
      setTransferredAmount(summary.transferredAmount);
      setPendingTransactions(summary.pendingTransactions);
    } catch (error) {
      console.error('Error fetching collection status:', error);
      toast.error('ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['তারিখ', 'সদস্য', 'সদস্য আইডি', 'পরিমাণ', 'পদ্ধতি', 'স্ট্যাটাস', 'সংগ্রাহক'];
    const rows = pendingTransactions.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      t.memberName, t.memberId, t.feeAmount.toString(),
      t.payType, t.collectionStatus === 'collected' ? 'সংগৃহীত' : 'জমা', t.collectedBy
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collection_status_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('রিপোর্ট এক্সপোর্ট সফল!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">কলেকশন স্ট্যাটাস রিপোর্ট</h1>
          <p className="text-gray-500 mt-1">ক্যাশিয়ারের কাছে সংগৃহীত ও ব্যাংকে জমাকৃত টাকার রিপোর্ট</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">ক্যাশিয়ারের কাছে</p>
                <p className="text-3xl font-bold mt-1">৳{collectedAmount.toLocaleString()}</p>
              </div>
              <Wallet className="h-10 w-10 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">ব্যাংকে জমা</p>
                <p className="text-3xl font-bold mt-1">৳{depositedAmount.toLocaleString()}</p>
              </div>
              <Landmark className="h-10 w-10 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">ট্রান্সফার্ড</p>
                <p className="text-3xl font-bold mt-1">৳{transferredAmount.toLocaleString()}</p>
              </div>
              <RefreshCw className="h-10 w-10 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">মোট সংগৃহীত</p>
                <p className="text-3xl font-bold mt-1">৳{(collectedAmount + depositedAmount + transferredAmount).toLocaleString()}</p>
              </div>
              <Banknote className="h-10 w-10 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Pending Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              ক্যাশিয়ারের কাছে থাকা লেনদেন ({pendingTransactions.length})
            </h3>
            <button onClick={handleExport} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2">
              <Download className="h-4 w-4" /> এক্সপোর্ট
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">সদস্য</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">পরিমাণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">পদ্ধতি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">সংগ্রাহক</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{t.memberName}</p>
                      <p className="text-xs text-gray-500">{t.memberId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">৳{t.feeAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{t.payType}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">{t.collectedBy}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">সংগৃহীত</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pendingTransactions.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <p className="text-gray-500">কোনো পেন্ডিং লেনদেন নেই</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionStatusReport;
