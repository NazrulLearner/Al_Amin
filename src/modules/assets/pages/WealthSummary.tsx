import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Building2,
  Landmark,
  Car,
  Home,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  PieChart,
  Eye
} from 'lucide-react';

interface WealthData {
  category: string;
  amount: number;
  icon: React.ReactElement;
  color: string;
  bgColor: string;
}

const WealthSummary = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const [wealthData, setWealthData] = useState({
    totalAssets: 18500000,
    totalLiabilities: 3500000,
    netWorth: 15000000,
    cashInHand: 125000,
    bankBalance: 5500000,
    investments: 4500000,
    fixedAssets: 6500000,
    loansGiven: 1850000,
  });

  const assetBreakdown: WealthData[] = [
    { category: 'ক্যাশ ইন হ্যান্ড', amount: wealthData.cashInHand, icon: <Wallet size={18} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { category: 'ব্যাংক ব্যালেন্স', amount: wealthData.bankBalance, icon: <Building2 size={18} />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { category: 'ইনভেস্টমেন্ট', amount: wealthData.investments, icon: <TrendingUp size={18} />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { category: 'স্থায়ী সম্পদ', amount: wealthData.fixedAssets, icon: <Home size={18} />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { category: 'লোন প্রদত্ত', amount: wealthData.loansGiven, icon: <Landmark size={18} />, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  ];

  const [recentChanges, setRecentChanges] = useState([
    { date: '2024-05-25', type: 'আয়', amount: 50000, source: 'মাসিক ফি', change: '+5%' },
    { date: '2024-05-24', type: 'ব্যয়', amount: 25000, source: 'রক্ষণাবেক্ষণ', change: '-2%' },
    { date: '2024-05-23', type: 'ইনভেস্টমেন্ট', amount: 100000, source: 'ব্যবসায়িক লভ্যাংশ', change: '+10%' },
    { date: '2024-05-22', type: 'লোন প্রদান', amount: 50000, source: 'সদস্য লোন', change: '+8%' },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD').format(amount);
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Wealth Summary</h1>
          <p className="text-gray-500 mt-1">Complete financial position of the society</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Wealth Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-emerald-100 text-sm">Net Worth</p>
            <p className="text-4xl font-bold mt-1">৳ {formatCurrency(wealthData.netWorth)}</p>
            <p className="text-emerald-100 text-sm mt-2">Total Assets - Total Liabilities</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <Wallet className="w-8 h-8" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
          <div>
            <p className="text-emerald-100 text-xs">Total Assets</p>
            <p className="text-xl font-semibold">৳ {formatCurrency(wealthData.totalAssets)}</p>
          </div>
          <div>
            <p className="text-emerald-100 text-xs">Total Liabilities</p>
            <p className="text-xl font-semibold">৳ {formatCurrency(wealthData.totalLiabilities)}</p>
          </div>
        </div>
      </motion.div>

      {/* Asset Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Breakdown</h3>
          <div className="space-y-4">
            {assetBreakdown.map((asset, index) => (
              <motion.div
                key={asset.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${asset.bgColor}`}>
                    <div className={asset.color}>{asset.icon}</div>
                  </div>
                  <span className="text-gray-700">{asset.category}</span>
                </div>
                <span className="font-semibold text-gray-800">
                  ৳ {formatCurrency(asset.amount)}
                </span>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between font-semibold">
              <span>Total Assets</span>
              <span className="text-emerald-600">৳ {formatCurrency(wealthData.totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* Recent Changes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Changes</h3>
          <div className="space-y-3">
            {recentChanges.map((change, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{change.source}</p>
                  <p className="text-xs text-gray-400">{change.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${change.type === 'আয়' ? 'text-green-600' : change.type === 'ব্যয়' ? 'text-red-600' : 'text-blue-600'}`}>
                    {change.type === 'আয়' ? '+' : '-'} ৳ {formatCurrency(change.amount)}
                  </p>
                  <p className={`text-xs ${change.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {change.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wealth Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Wealth Growth</p>
              <p className="text-xl font-bold text-green-600">+15.5%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Compared to last quarter</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Liquidity Ratio</p>
              <p className="text-xl font-bold text-blue-600">32.5%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Cash & Bank / Total Assets</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <Landmark className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Debt to Asset</p>
              <p className="text-xl font-bold text-purple-600">18.9%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Total Liabilities / Total Assets</p>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm">
          🏆 Wealth summary provides a complete picture of the society's financial health.
          Regular monitoring helps in better financial planning and decision making.
        </p>
      </div>
    </div>
  );
};

export default WealthSummary;