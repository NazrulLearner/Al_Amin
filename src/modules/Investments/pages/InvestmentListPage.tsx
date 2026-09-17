// src/modules/Investments/pages/InvestmentListPage.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ChevronRight, Eye, TrendingUp, 
  Clock,
  CheckCircle, XCircle, AlertCircle, PlusCircle,
  Grid3x3, List, ArrowUpDown,
  ChevronDown, ChevronUp, 
  Trash2, RefreshCw, CreditCard
} from 'lucide-react';
import { useInvestments } from '../hooks/useInvestments';
import { useAuth } from '../../../app/providers/AuthProvider';
import { formatCurrencyAmount, formatDateString } from '../utils/investmentHelpers';
import { getMaturityStatusText, getMaturityStatusColor } from '../utils/maturityCalculator';
import { toast } from 'sonner';
import type { Investment, InvestmentStatus } from '../types/investment.types';

// Import shared export components
import ExportMenu from '../../../shared/export/ExportMenu';
import { JSX } from 'react/jsx-runtime';

type ViewMode = 'table' | 'grid';
type SortField = 'createdAt' | 'totalAmount' | 'expectedProfit' | 'investmentName';
type SortOrder = 'asc' | 'desc';

// Helper to check if user has delete permission
const hasDeletePermission = (userRole?: string): boolean => {
  return userRole === 'admin' || userRole === 'super_admin';
};

const InvestmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentMember, userData } = useAuth();
  const { investments, loading, refresh, deleteInvestment } = useInvestments();
  
  // Get user role from auth
  const userRole = userData?.role || currentMember?.role;
  const canDelete = hasDeletePermission(userRole);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvestmentStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<Investment | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    investments.forEach(inv => cats.add(inv.category));
    return Array.from(cats);
  }, [investments]);

  // Filter and sort investments
  const filteredInvestments = useMemo(() => {
    let filtered = [...investments];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.investmentName.toLowerCase().includes(term) ||
        inv.investmentId.toLowerCase().includes(term) ||
        inv.investmentPlace?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(inv => inv.category === categoryFilter);
    }
    
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [investments, searchTerm, statusFilter, categoryFilter, sortField, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const totalInvestments = investments.length;
    const totalAmount = investments.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalExpectedProfit = investments.reduce((sum, inv) => sum + inv.expectedProfit, 0);
    const totalActualProfit = investments.reduce((sum, inv) => sum + (inv.actualProfitReceived || 0), 0);
    const activeCount = investments.filter(inv => inv.status === 'active').length;
    const pendingCount = investments.filter(inv => inv.status === 'pending').length;
    const maturedCount = investments.filter(inv => inv.status === 'matured').length;
    
    return {
      totalInvestments,
      totalAmount,
      totalExpectedProfit,
      totalActualProfit,
      activeCount,
      pendingCount,
      maturedCount
    };
  }, [investments]);

  // Prepare export data
  const exportData = useMemo(() => {
    return filteredInvestments.map((inv, index) => ({
      'ক্রমিক নং': index + 1,
      'বিনিয়োগ আইডি': inv.investmentId,
      'বিনিয়োগের নাম': inv.investmentName,
      'বিভাগ': inv.category,
      'মোট পরিমাণ': inv.totalAmount,
      'সমিতির অবদান': inv.somityContribution,
      'প্রত্যাশিত লাভ': inv.expectedProfit,
      'অর্জিত লাভ': inv.actualProfitReceived || 0,
      'মুনাফার হার': inv.profitRate,
      'মেয়াদ (মাস)': inv.durationMonths || 0,
      'শুরুর তারিখ': formatDateString(inv.startDate),
      'মেয়াদ শেষের তারিখ': inv.maturityDate ? formatDateString(inv.maturityDate) : '',
      'স্ট্যাটাস': inv.status,
      'সহ-বিনিয়োগকারী সংখ্যা': inv.coInvestors?.length || 0,
      'তৈরির তারিখ': formatDateString(inv.createdAt),
    }));
  }, [filteredInvestments]);

  const getStatusBadge = (status: InvestmentStatus) => {
    const styles: Record<InvestmentStatus, string> = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      matured: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700',
      withdrawn: 'bg-gray-100 text-gray-700'
    };
    const icons: Record<InvestmentStatus, JSX.Element> = {
      active: <CheckCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      matured: <TrendingUp className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      withdrawn: <AlertCircle className="w-3 h-3" />
    };
    const labels: Record<InvestmentStatus, string> = {
      active: 'সক্রিয়',
      pending: 'পেন্ডিং',
      matured: 'পরিপক্ক',
      rejected: 'বাতিল',
      withdrawn: 'প্রত্যাহার'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${styles[status]}`}>
        {icons[status]} {labels[status]}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      fixed_deposit: '🏦', business: '🏢', real_estate: '🏠',
      agriculture: '🌾', stock_market: '📈', project: '📊',
      savings: '💰', other: '📁'
    };
    return icons[category] || '📁';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      fixed_deposit: 'স্থায়ী আমানত', business: 'ব্যবসায়িক',
      real_estate: 'রিয়েল এস্টেট', agriculture: 'কৃষি',
      stock_market: 'শেয়ার বাজার', project: 'প্রকল্প',
      savings: 'সেভিংস', other: 'অন্যান্য'
    };
    return labels[category] || category;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
  };

  const openDetailModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (investment: Investment) => {
    setInvestmentToDelete(investment);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (investmentToDelete) {
      try {
        await deleteInvestment(investmentToDelete.id);
        toast.success('বিনিয়োগ মুছে ফেলা হয়েছে');
        setShowDeleteConfirm(false);
        setInvestmentToDelete(null);
        refresh();
      } catch (error) {
        toast.error('মুছে ফেলতে ব্যর্থ হয়েছে');
      }
    }
  };

  const handleRepayment = (investment: Investment) => {
    // Navigate to repayment page or open modal
    navigate(`/investments/${investment.id}/repayment`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">বিনিয়োগ তালিকা</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            মোট {stats.totalInvestments}টি বিনিয়োগ · মোট পরিমাণ {formatCurrencyAmount(stats.totalAmount)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu 
            data={exportData} 
            title="বিনিয়োগ রিপোর্ট" 
            subtitle={`মোট ${filteredInvestments.length}টি বিনিয়োগ, ${formatCurrencyAmount(stats.totalAmount)}`}
          />
          <button
            onClick={() => navigate('/investments/create')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" /> নতুন বিনিয়োগ
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-xs text-emerald-600">মোট বিনিয়োগ</p>
          <p className="text-xl font-bold text-emerald-700">{formatCurrencyAmount(stats.totalAmount)}</p>
          <p className="text-xs text-emerald-500 mt-0.5">{stats.totalInvestments}টি প্রকল্প</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-blue-600">প্রত্যাশিত লাভ</p>
          <p className="text-xl font-bold text-blue-700">{formatCurrencyAmount(stats.totalExpectedProfit)}</p>
          <p className="text-xs text-blue-500">ROI: {stats.totalAmount > 0 ? ((stats.totalExpectedProfit / stats.totalAmount) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-3 border border-green-100">
          <p className="text-xs text-green-600">অর্জিত লাভ</p>
          <p className="text-xl font-bold text-green-700">{formatCurrencyAmount(stats.totalActualProfit)}</p>
          <p className="text-xs text-green-500">{stats.maturedCount}টি পরিপক্ক</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 border border-yellow-100">
          <p className="text-xs text-yellow-600">সক্রিয়/পেন্ডিং</p>
          <p className="text-xl font-bold text-yellow-700">{stats.activeCount} / {stats.pendingCount}</p>
          <p className="text-xs text-yellow-500">সক্রিয় / অপেক্ষমাণ</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-3 mb-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="বিনিয়োগের নাম, আইডি বা স্থান দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-400 bg-white"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="active">সক্রিয়</option>
            <option value="pending">পেন্ডিং</option>
            <option value="matured">পরিপক্ক</option>
            <option value="rejected">বাতিল</option>
            <option value="withdrawn">প্রত্যাহার</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-400 bg-white"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
            ))}
          </select>
          
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'table' ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-500'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs text-slate-500">
          {filteredInvestments.length}টি বিনিয়োগ দেখানো হচ্ছে
        </p>
        <button
          onClick={() => refresh()}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600"
        >
          <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
        </button>
      </div>

      {/* Table View - Responsive with horizontal scroll */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
                    <button onClick={() => handleSort('investmentName')} className="flex items-center gap-1">
                      বিনিয়োগের নাম {getSortIcon('investmentName')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">ক্যাটাগরি</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
                    <button onClick={() => handleSort('totalAmount')} className="flex items-center gap-1 justify-end w-full">
                      পরিমাণ {getSortIcon('totalAmount')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
                    <button onClick={() => handleSort('expectedProfit')} className="flex items-center gap-1 justify-end w-full">
                      লাভ {getSortIcon('expectedProfit')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">মেয়াদ বাকি</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvestments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      কোন বিনিয়োগ পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredInvestments.map((investment) => {
                    const maturityText = getMaturityStatusText(investment);
                    const maturityColor = getMaturityStatusColor(investment);
                    
                    return (
                      <tr key={investment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{investment.investmentName}</p>
                            <p className="text-xs text-slate-400">{investment.investmentId}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm flex items-center gap-1">
                            <span>{getCategoryIcon(investment.category)}</span>
                            <span className="text-slate-600">{getCategoryLabel(investment.category)}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-700">{formatCurrencyAmount(investment.totalAmount)}</p>
                          <p className="text-xs text-slate-400">সমিতি: {formatCurrencyAmount(investment.somityContribution)}</p>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <p className="text-sm font-semibold text-emerald-600">{formatCurrencyAmount(investment.expectedProfit)}</p>
                          <p className="text-xs text-slate-400">
                            ROI: {investment.totalAmount > 0 ? ((investment.expectedProfit / investment.totalAmount) * 100).toFixed(1) : 0}%
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {getStatusBadge(investment.status)}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className={`text-xs font-medium ${maturityColor}`}>
                            {maturityText}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openDetailModal(investment)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="বিস্তারিত দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRepayment(investment)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="রিপেমেন্ট/লাভ প্রদান"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                            {canDelete && investment.status === 'pending' && (
                              <button
                                onClick={() => handleDeleteClick(investment)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvestments.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-slate-100 p-8 text-center">
              <p className="text-slate-400">কোন বিনিয়োগ পাওয়া যায়নি</p>
            </div>
          ) : (
            filteredInvestments.map((investment) => {
              const maturityText = getMaturityStatusText(investment);
              const maturityColor = getMaturityStatusColor(investment);
              
              return (
                <div
                  key={investment.id}
                  className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openDetailModal(investment)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(investment.category)}</span>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{investment.investmentName}</h3>
                        <p className="text-xs text-slate-400">{investment.investmentId}</p>
                      </div>
                    </div>
                    {getStatusBadge(investment.status)}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">মোট পরিমাণ:</span>
                      <span className="font-semibold text-slate-700">{formatCurrencyAmount(investment.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">সমিতির অবদান:</span>
                      <span className="font-semibold text-emerald-600">{formatCurrencyAmount(investment.somityContribution)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">প্রত্যাশিত লাভ:</span>
                      <span className="font-semibold text-emerald-600">{formatCurrencyAmount(investment.expectedProfit)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">সহ-বিনিয়োগকারী:</span>
                      <span className="font-semibold text-blue-600">{investment.coInvestors?.length || 0} জন</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">শুরুর তারিখ:</span>
                      <span className="text-slate-600">{formatDateString(investment.startDate)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">মেয়াদ বাকি:</span>
                      <span className={maturityColor}>{maturityText}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                      {investment.investmentPlace || 'স্থান উল্লেখ নেই'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRepayment(investment);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="রিপেমেন্ট"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailModal(investment);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 text-xs flex items-center gap-1"
                      >
                        বিস্তারিত <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(selectedInvestment.category)}</span>
                <div>
                  <h3 className="font-bold text-slate-800">{selectedInvestment.investmentName}</h3>
                  <p className="text-xs text-slate-500">{selectedInvestment.investmentId}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Status Bar */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">স্ট্যাটাস:</span>
                  {getStatusBadge(selectedInvestment.status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">মেয়াদ:</span>
                  <span className={`text-sm font-medium ${getMaturityStatusColor(selectedInvestment)}`}>
                    {getMaturityStatusText(selectedInvestment)}
                  </span>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">বিভাগ</p>
                  <p className="text-sm font-medium">{getCategoryLabel(selectedInvestment.category)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">বিনিয়োগের স্থান</p>
                  <p className="text-sm font-medium">{selectedInvestment.investmentPlace || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">শুরুর তারিখ</p>
                  <p className="text-sm font-medium">{formatDateString(selectedInvestment.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">মেয়াদ শেষের তারিখ</p>
                  <p className="text-sm font-medium">{selectedInvestment.maturityDate ? formatDateString(selectedInvestment.maturityDate) : '-'}</p>
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div>
                  <p className="text-xs text-emerald-600">মোট বিনিয়োগ</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrencyAmount(selectedInvestment.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600">প্রত্যাশিত লাভ</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrencyAmount(selectedInvestment.expectedProfit)}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600">সমিতির অবদান</p>
                  <p className="text-sm font-semibold">{formatCurrencyAmount(selectedInvestment.somityContribution)}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600">সমিতির লাভের অংশ</p>
                  <p className="text-sm font-semibold">{selectedInvestment.somityProfitShare}%</p>
                </div>
              </div>

              {/* Co-investors */}
              {selectedInvestment.coInvestors && selectedInvestment.coInvestors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">সহ-বিনিয়োগকারী ({selectedInvestment.coInvestors.length} জন)</p>
                  <div className="space-y-2">
                    {selectedInvestment.coInvestors.map((ci, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                        <div>
                          <p className="text-sm font-medium">{ci.name}</p>
                          <p className="text-xs text-slate-500">
                            অবদান: {formatCurrencyAmount(ci.contributedAmount)} · মুনাফা: {ci.profitSharePercentage}%
                          </p>
                        </div>
                        <span className="text-xs text-slate-500">{ci.paymentMethod === 'bank' ? 'ব্যাংক' : 'নগদ'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedInvestment.description && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">বিবরণ</p>
                  <p className="text-sm text-slate-600">{selectedInvestment.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {selectedInvestment.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      navigate(`/investments/${selectedInvestment.id}/edit`);
                    }}
                    className="flex-1 py-2 rounded-lg bg-yellow-500 text-white font-medium text-sm"
                  >
                    সম্পাদনা করুন
                  </button>
                )}
                <button
                  onClick={() => navigate(`/investments/${selectedInvestment.id}`)}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm"
                >
                  পূর্ণ বিবরণ দেখুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && investmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-slate-800">বিনিয়োগ মুছে ফেলুন</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                আপনি কি নিশ্চিত যে "{investmentToDelete.investmentName}" বিনিয়োগটি মুছে ফেলতে চান?
                <br />
                <span className="text-xs text-red-500">সতর্কতা: এই কাজটি অপরিবর্তনীয়!</span>
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium text-sm"
                >
                  মুছে ফেলুন
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setInvestmentToDelete(null);
                  }}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm"
                >
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentListPage;