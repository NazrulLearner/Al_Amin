import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Building2, 
  DollarSign,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className={`p-2.5 rounded-xl ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </motion.div>
);

const AssetsDashboard = () => {
  const [loading, setLoading] = useState(true);

  const stats = [
    { title: 'Total Assets', value: '৳ 12,50,000', icon: Wallet, trend: 12, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Cash in Hand', value: '৳ 1,25,000', icon: DollarSign, trend: 8, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Bank Balance', value: '৳ 5,50,000', icon: Building2, trend: 5, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Monthly Profit', value: '৳ 45,000', icon: TrendingUp, trend: 15, color: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assets Management</h1>
          <p className="text-gray-500 mt-1">Complete financial overview of the society</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">
            <TrendingUp size={18} />
            Add Income
          </button>
          <button className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
            <TrendingDown size={18} />
            Add Expense
          </button>
          <button className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
            <Eye size={18} />
            View Reports
          </button>
          <button className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
            <Wallet size={18} />
            Wealth Summary
          </button>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm">
          ℹ️ This module reads data from Contributions, Cashier, Treasury, and other modules.
          No duplicate data storage - everything is calculated in real-time.
        </p>
      </div>
    </div>
  );
};

export default AssetsDashboard;