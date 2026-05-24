// src/modules/finance/pages/history.tsx

import React, { useState, useEffect } from 'react';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { financeService } from '../services/financeService';
import { 
  Search, 
  Loader2, Download} from 'lucide-react';
import { toast } from 'sonner';

const TransactionHistory: React.FC = () => {
  const { formatAmount } = useSomitySettings();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await financeService.getAllTransactions(500);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('ট্রানজেকশন লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }
    
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      filtered = filtered.filter(tx => new Date(tx.createdAt) >= fromDate);
    }
    
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59);
      filtered = filtered.filter(tx => new Date(tx.createdAt) <= toDate);
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const handleExport = () => {
    const headers = ['Transaction ID', 'Type', 'From', 'To', 'Amount', 'Date', 'Status'];
    const rows = filteredTransactions.map(tx => [
      tx.transactionId,
      tx.type,
      `${tx.from?.type} - ${tx.from?.name}`,
      `${tx.to?.type} - ${tx.to?.name}`,
      tx.amount,
      new Date(tx.createdAt).toLocaleDateString(),
      tx.status
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ট্রানজেকশন ইতিহাস</h1>
            <p className="text-gray-500 mt-1">সকল আর্থিক লেনদেনের বিস্তারিত ইতিহাস</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            এক্সপোর্ট CSV
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="আইডি বা নাম দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="all">সব ধরন</option>
                <option value="collection">সংগ্রহ</option>
                <option value="deposit">জমা</option>
                <option value="transfer">ট্রান্সফার</option>
                <option value="disbursement">বিতরণ</option>
              </select>
            </div>
            
            <div>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="শুরুর তারিখ"
              />
            </div>
            
            <div>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="শেষের তারিখ"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">মোট লেনদেন</p>
            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">মোট পরিমাণ</p>
            <p className="text-2xl font-bold text-green-600">{formatAmount(totalAmount)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">গড় লেনদেন</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatAmount(filteredTransactions.length ? totalAmount / filteredTransactions.length : 0)}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ট্রানজেকশন আইডি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ধরন</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">থেকে</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">থেকে</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">{tx.transactionId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize">{tx.from?.type}</span>
                      <p className="text-xs text-gray-500">{tx.from?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize">{tx.to?.type}</span>
                      <p className="text-xs text-gray-500">{tx.to?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">কোনো লেনদেন পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;