// src/pages/Loans/index.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { loanService } from '../services/FinancingService';
import { 
  Plus, Eye, Clock, DollarSign, 
  TrendingUp, Loader2,
  ArrowRight, CreditCard, Target, Wallet} from 'lucide-react';
import { toast } from 'sonner';

const LoansDashboard: React.FC = () => {
  const { somityInfo } = useAuth();
  const { formatDate, formatAmount } = useSomitySettings();
  const [stats, setStats] = useState({
    totalLoans: 0, totalAmount: 0, activeLoans: 0,
    pendingApproval: 0, completedLoans: 0, defaultedLoans: 0, totalCollected: 0, totalOutstanding: 0
  });
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [somityInfo]);

  const fetchDashboardData = async () => {
    if (!somityInfo?.id) return;
    
    try {
      setLoading(true);
      // Single somity data!
      const [loanStats, allLoans] = await Promise.all([
        loanService.getLoanStats(),
        loanService.getAllLoans()
      ]);
      setStats(loanStats);
      setRecentLoans(allLoans.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: 'Total Loans', value: stats.totalLoans, icon: <CreditCard className="h-6 w-6" />, color: 'bg-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { title: 'Total Disbursed', value: formatAmount(stats.totalAmount), icon: <DollarSign className="h-6 w-6" />, color: 'bg-green-500', bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { title: 'Total Collected', value: formatAmount(stats.totalCollected), icon: <Wallet className="h-6 w-6" />, color: 'bg-emerald-500', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
    { title: 'Outstanding', value: formatAmount(stats.totalOutstanding), icon: <Target className="h-6 w-6" />, color: 'bg-orange-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
    { title: 'Active Loans', value: stats.activeLoans, icon: <TrendingUp className="h-6 w-6" />, color: 'bg-indigo-500', bgColor: 'bg-indigo-100', textColor: 'text-indigo-600' },
    { title: 'Pending Approval', value: stats.pendingApproval, icon: <Clock className="h-6 w-6" />, color: 'bg-yellow-500', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' }
  ];
  const collectionRate = stats.totalAmount > 0 ? Math.round((stats.totalCollected / stats.totalAmount) * 100) : 0;

  const quickActions = [
    { title: 'New Loan Application', icon: <Plus className="h-5 w-5" />, href: '/loans/add', color: 'bg-blue-600' },
    { title: 'Pending Applications', icon: <Clock className="h-5 w-5" />, href: '/loans/pending', color: 'bg-yellow-600' },
    { title: 'Active Loans', icon: <TrendingUp className="h-5 w-5" />, href: '/loans/ActiveLoan', color: 'bg-green-600' },
    { title: 'Loan Reports', icon: <Eye className="h-5 w-5" />, href: '/loans/reports', color: 'bg-purple-600' }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loan Management Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Manage Islamic financing products and applications</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <div className={stat.textColor}>{stat.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">{collectionRate}%</p>
            </div>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(collectionRate, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}
              className={`${action.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition-all flex flex-col items-center gap-2 shadow-md`}>
              {action.icon}
              <span className="font-medium text-sm">{action.title}</span>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Recent Loan Applications</h3>
            <Link to="/loans/history" className="text-sm text-blue-600">View All <ArrowRight className="h-4 w-4 inline" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLoans.map((loan) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-blue-100 text-blue-700',
                    active: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-700', rejected: 'bg-red-100 text-red-700'
                  };
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">{loan.loanId}</td>
                      <td className="px-6 py-4"><p className="font-medium">{loan.memberName}</p><p className="text-xs text-gray-500">{loan.memberId}</p></td>
                      <td className="px-6 py-4 text-sm capitalize">{loan.loanType}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{formatAmount(loan.amount)}</td>
                      <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100'}`}>{loan.status}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(loan.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {recentLoans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No loan applications yet</p>
              <Link to="/loans/add" className="mt-2 inline-block text-blue-600">Apply for a loan</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoansDashboard;
