import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  HandCoins,
  Landmark,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  ArrowRight,
  Wallet,
  FileText,
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bgColor }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
            )}
            <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div className={`p-2.5 rounded-xl ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const stats = [
    { title: 'সদস্য সংখ্যা', value: '২৪৫ জন', icon: Users, trend: 'up', trendValue: '+১২ জন', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'সক্রিয় লোন', value: '৮৯ টি', icon: HandCoins, trend: 'up', trendValue: '+৫ টি', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'মোট জমা', value: '৳ ১,২৫,০০০', icon: DollarSign, trend: 'up', trendValue: '+১৫%', color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'ট্রেজারি ব্যালেন্স', value: '৳ ৫,৫০,০০০', icon: Landmark, trend: 'up', trendValue: '+৮%', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const recentActivities = [
    { id: 1, name: 'মোঃ রহিম', type: 'লোন আবেদন', amount: '৫০,০০০', status: 'pending', time: '৫ মিনিট আগে', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 2, name: 'ফাতেমা বেগম', type: 'মাসিক ফি', amount: '৫০০', status: 'completed', time: '১ ঘন্টা আগে', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 3, name: 'আব্দুল করিম', type: 'চাঁদা', amount: '১,০০০', status: 'pending', time: '৩ ঘন্টা আগে', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 4, name: 'নাসিমা আক্তার', type: 'লোন পরিশোধ', amount: '২,৫০০', status: 'completed', time: 'গতকাল', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  const quickActions = [
    { label: 'নতুন সদস্য যোগ', icon: Users, path: '/members/add', color: 'bg-emerald-500' },
    { label: 'চাঁদা গ্রহণ', icon: DollarSign, path: '/contributions/entry', color: 'bg-blue-500' },
    { label: 'লোন আবেদন', icon: FileText, path: '/financing/create', color: 'bg-purple-500' },
    { label: 'রিপোর্ট দেখুন', icon: Eye, path: '/reports', color: 'bg-orange-500' },
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">স্বাগতম, অ্যাডমিন!</h1>
            <p className="text-emerald-100 mt-1">আপনার সোমিটি আজকের আপডেট</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-emerald-200">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <Wallet className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - Left */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">মাসিক জমার হিসাব</h3>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600">এই মাস</button>
              <button className="text-xs px-3 py-1 rounded-lg text-gray-400 hover:bg-gray-50">গত মাস</button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">চার্ট শীঘ্রই যোগ করা হবে</p>
            </div>
          </div>
        </div>

        {/* Recent Activity - Right */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">সাম্প্রতিক কার্যক্রম</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">{activity.name}</p>
                    <p className="text-xs text-gray-400">{activity.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-800">৳ {activity.amount}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              সব দেখুন <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">দ্রুত কর্ম</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
            >
              <div className={`p-2 rounded-lg bg-opacity-10 ${action.color} bg-opacity-10`}>
                <action.icon className={`w-4 h-4 ${action.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;