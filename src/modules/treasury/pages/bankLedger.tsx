// src/modules/finance/pages/ledger.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { financeService } from '../services/financeService';
import { 
  Loader2, ArrowLeft, Landmark} from 'lucide-react';
import { toast } from 'sonner';

const Ledger: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatAmount, formatDate } = useSomitySettings();
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    if (id) {
      fetchLedger();
    }
  }, [id, dateRange]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const [accountData, txData] = await Promise.all([
        financeService.getBankAccountById(id!),
        financeService.getTransactionsByBank(id!)
      ]);
      setAccount(accountData);
      setTransactions(txData);
    } catch (error) {
      console.error('Error fetching ledger:', error);
      toast.error('লেজার লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
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

  const filteredTxs = getFilteredTransactions();
  const totalCredit = filteredTxs.reduce((sum, tx) => {
    if (tx.to?.id === id) return sum + tx.amount;
    return sum;
  }, 0);
  const totalDebit = filteredTxs.reduce((sum, tx) => {
    if (tx.from?.id === id) return sum + tx.amount;
    return sum;
  }, 0);
  const closingBalance = (account?.currentBalance || 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">অ্যাকাউন্ট পাওয়া যায়নি</p>
        <button onClick={() => navigate('/finance')} className="mt-2 text-blue-600">ফিরে যান</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/finance')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            ফিরে যান
          </button>
          
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Landmark className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{account.accountName}</h1>
                <p className="text-gray-500">{account.bankName} - {account.accountNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">বর্তমান ব্যালেন্স</p>
              <p className="text-2xl font-bold text-green-600">{formatAmount(closingBalance)}</p>
            </div>
          </div>
        </div>

        {/* Account Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">অ্যাকাউন্ট টাইপ</p>
            <p className="font-semibold capitalize">{account.accountType}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">শাখা</p>
            <p className="font-semibold">{account.branchName || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">খোলার তারিখ</p>
            <p className="font-semibold">{formatDate(account.createdAt)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">স্ট্যাটাস</p>
            <span className={`px-2 py-1 rounded-full text-xs ${account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {account.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </span>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">শুরুর তারিখ</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">শেষের তারিখ</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={() => setDateRange({ from: '', to: '' })}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              রিসেট
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800">লেজার বুক</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ট্রানজেকশন আইডি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">বিবরণ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ডেবিট (জমা)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ক্রেডিট (উত্তোলন)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ব্যালেন্স</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTxs.map((tx, idx) => {
                  const isCredit = tx.to?.id === id;
                  const runningBalance = filteredTxs.slice(0, idx + 1).reduce((sum, t) => {
                    if (t.to?.id === id) return sum + t.amount;
                    if (t.from?.id === id) return sum - t.amount;
                    return sum;
                  }, 0);
                  
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm">{formatDate(tx.createdAt)}</td>
                      <td className="px-6 py-3">
                        <span className="font-mono text-sm">{tx.transactionId}</span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {tx.type === 'transfer' && `ট্রান্সফার ${tx.from?.type === 'bank' ? 'থেকে' : 'থেকে'} ${tx.to?.type === 'bank' ? 'ব্যাংকে' : 'ক্যাশে'}`}
                        {tx.type === 'collection' && 'সংগ্রহ'}
                        {tx.type === 'deposit' && 'জমা'}
                        {tx.type === 'disbursement' && 'বিতরণ'}
                      </td>
                      <td className="px-6 py-3 text-right text-green-600">
                        {isCredit ? formatAmount(tx.amount) : '-'}
                      </td>
                      <td className="px-6 py-3 text-right text-red-600">
                        {!isCredit ? formatAmount(tx.amount) : '-'}
                      </td>
                      <td className="px-6 py-3 text-right font-medium">
                        {formatAmount(runningBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right font-semibold">মোট:</td>
                  <td className="px-6 py-3 text-right font-semibold text-green-600">{formatAmount(totalCredit)}</td>
                  <td className="px-6 py-3 text-right font-semibold text-red-600">{formatAmount(totalDebit)}</td>
                  <td className="px-6 py-3 text-right font-semibold text-blue-600">{formatAmount(closingBalance)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {filteredTxs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">এই অ্যাকাউন্টে কোনো লেনদেন নেই</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;