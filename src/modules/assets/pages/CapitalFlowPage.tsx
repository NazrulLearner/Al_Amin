import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Download,
  RefreshCw,
  Filter,
  ChevronRight,
  Plus,
  Eye
} from 'lucide-react';

interface CapitalTransaction {
  id: string;
  date: string;
  source: string;
  destination: string;
  amount: number;
  type: 'transfer' | 'investment' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

const CapitalFlowPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  const [summary, setSummary] = useState({
    totalInflow: 1250000,
    totalOutflow: 875000,
    netFlow: 375000,
    pendingTransfers: 3,
  });

  const [transactions, setTransactions] = useState<CapitalTransaction[]>([
    {
      id: '1',
      date: '2024-05-25',
      source: 'Member Contribution',
      destination: 'Treasury',
      amount: 50000,
      type: 'transfer',
      status: 'completed',
      reference: 'TRX-001',
    },
    {
      id: '2',
      date: '2024-05-24',
      source: 'Investment Fund',
      destination: 'Bank Account',
      amount: 100000,
      type: 'investment',
      status: 'completed',
      reference: 'INV-001',
    },
    {
      id: '3',
      date: '2024-05-23',
      source: 'Treasury',
      destination: 'Project Fund',
      amount: 75000,
      type: 'withdrawal',
      status: 'pending',
      reference: 'WDL-001',
    },
    {
      id: '4',
      date: '2024-05-22',
      source: 'Loan Repayment',
      destination: 'Cash',
      amount: 25000,
      type: 'transfer',
      status: 'completed',
      reference: 'TRX-002',
    },
    {
      id: '5',
      date: '2024-05-21',
      source: 'Business Profit',
      destination: 'Investment',
      amount: 150000,
      type: 'investment',
      status: 'completed',
      reference: 'INV-002',
    },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'transfer': return 'bg-blue-100 text-blue-700';
      case 'investment': return 'bg-green-100 text-green-700';
      case 'withdrawal': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'transfer': return 'ট্রান্সফার';
      case 'investment': return 'ইনভেস্টমেন্ট';
      case 'withdrawal': return 'উত্তোলন';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'সম্পন্ন';
      case 'pending': return ' pending';
      case 'failed': return 'ব্যর্থ';
      default: return status;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (selectedType !== 'all' && tx.type !== selectedType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Capital Flow Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor money movement across the society</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Inflow</p>
              <p className="text-2xl font-bold text-gray-800">৳ {summary.totalInflow.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Outflow</p>
              <p className="text-2xl font-bold text-gray-800">৳ {summary.totalOutflow.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Net Flow</p>
              <p className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ৳ {summary.netFlow.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-100 rounded-xl">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Transfers</p>
              <p className="text-2xl font-bold text-gray-800">{summary.pendingTransfers}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              selectedType === 'all' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            সব
          </button>
          <button
            onClick={() => setSelectedType('transfer')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              selectedType === 'transfer' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ট্রান্সফার
          </button>
          <button
            onClick={() => setSelectedType('investment')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              selectedType === 'investment' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ইনভেস্টমেন্ট
          </button>
          <button
            onClick={() => setSelectedType('withdrawal')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              selectedType === 'withdrawal' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            উত্তোলন
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600">
            <Filter className="w-3 h-3" />
            ফিল্টার
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm">
            <Plus className="w-3 h-3" />
            নতুন লেনদেন
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">উৎস</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">গন্তব্য</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ধরন</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-gray-600">{tx.date}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{tx.source}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{tx.destination}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(tx.type)}`}>
                      {getTypeLabel(tx.type)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-semibold text-gray-800">
                    ৳ {tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                      {getStatusLabel(tx.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button className="text-emerald-600 hover:text-emerald-700">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm">
          📊 Capital flow shows how money moves between different accounts and funds.
          This helps track investment movements and fund allocations.
        </p>
      </div>
    </div>
  );
};

export default CapitalFlowPage;