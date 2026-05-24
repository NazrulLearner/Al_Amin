// src/pages/fees/FeesReports.tsx
import React, { useState, useEffect } from 'react';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { feesService } from '../services/contributionService';
import { 
  Download, 
  Loader2, Printer, Calendar, Filter, 
  ChevronDown, ChevronUp} from 'lucide-react';
import { toast } from 'sonner';
import type { FeeTransaction } from '../../../types';

const FeesReports: React.FC = () => {
  useSomitySettings();
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Single somity data!
      const data = await feesService.getAllTransactions(1000);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('রিপোর্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (reportType === 'daily' && dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(t => {
        const txDate = new Date(t.createdAt);
        return txDate.toDateString() === fromDate.toDateString();
      });
    } else if (reportType === 'monthly') {
      filtered = filtered.filter(t => {
        const txDate = new Date(t.createdAt);
        return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
      });
    } else if (reportType === 'yearly') {
      filtered = filtered.filter(t => {
        const txDate = new Date(t.createdAt);
        return txDate.getFullYear() === selectedYear;
      });
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.feeAmount, 0);
  const totalTransactions = filteredTransactions.length;
  const avgAmount = totalTransactions > 0 ? Math.round(totalAmount / totalTransactions) : 0;

  const paymentMethodStats = filteredTransactions.reduce((acc, t) => {
    acc[t.payType] = (acc[t.payType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyData = filteredTransactions.reduce((acc, t) => {
    const date = new Date(t.createdAt);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    acc[monthYear] = (acc[monthYear] || 0) + t.feeAmount;
    return acc;
  }, {} as Record<string, number>);

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const handleExportCSV = () => {
    const headers = ['Receipt ID', 'Member Name', 'Member ID', 'Amount', 'Payment Type', 'Date', 'Period'];
    const rows = filteredTransactions.map(t => [
      t.receiptId, t.memberName, t.memberId, t.feeAmount.toString(),
      t.payType, new Date(t.createdAt).toLocaleDateString(), t.paymentPeriod
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('রিপোর্ট এক্সপোর্ট সফল!');
  };

  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      cash: 'নগদ', bank: 'ব্যাংক', bikash: 'বিকাশ', 
      nogod: 'নগদ', rocket: 'রকেট', other: 'অন্যান্য'
    };
    return names[method] || method;
  };

  const getReportTitle = () => {
    if (reportType === 'daily' && dateFrom) return new Date(dateFrom).toLocaleDateString('bn-BD');
    if (reportType === 'monthly') return `${months[selectedMonth]} ${selectedYear}`;
    if (reportType === 'yearly') return `${selectedYear}`;
    return 'সকল লেনদেন';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">ফি রিপোর্ট</h1>
          <p className="text-gray-500 mt-2">ফি জমার বিভিন্ন রিপোর্ট বিশ্লেষণ করুন</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border mb-6">
          <button onClick={() => setShowFilters(!showFilters)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="font-medium">ফিল্টার</span>
            </div>
            {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {showFilters && (
            <div className="px-6 pb-6 pt-2 border-t">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm mb-1">রিপোর্ট টাইপ</label>
                  <div className="flex gap-2">
                    {['daily', 'monthly', 'yearly'].map((type) => (
                      <button key={type} onClick={() => setReportType(type as any)}
                        className={`px-4 py-2 rounded-lg text-sm ${reportType === type ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                        {type === 'daily' ? 'দৈনিক' : type === 'monthly' ? 'মাসিক' : 'বার্ষিক'}
                      </button>
                    ))}
                  </div>
                </div>

                {reportType === 'daily' && (
                  <div>
                    <label className="block text-sm mb-1">তারিখ</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border rounded-lg" />
                  </div>
                )}

                {(reportType === 'monthly' || reportType === 'yearly') && (
                  <>
                    {reportType === 'monthly' && (
                      <div>
                        <label className="block text-sm mb-1">মাস</label>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg">
                          {months.map((month, idx) => <option key={idx} value={idx}>{month}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm mb-1">বছর</label>
                      <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg">
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div className="flex gap-2 ml-auto">
                  <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                    <Download className="h-4 w-4" /> CSV
                  </button>
                  <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2">
                    <Printer className="h-4 w-4" /> প্রিন্ট
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm">
            <Calendar className="h-4 w-4 inline mr-1" /> {getReportTitle()} এর রিপোর্ট
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-gray-500">মোট জমা</p>
            <p className="text-2xl font-bold text-green-600">৳{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-gray-500">মোট লেনদেন</p>
            <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-gray-500">গড় জমা</p>
            <p className="text-2xl font-bold text-purple-600">৳{avgAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-gray-500">অনন্য সদস্য</p>
            <p className="text-2xl font-bold text-amber-600">{new Set(filteredTransactions.map(t => t.memberId)).size}</p>
          </div>
        </div>

        {/* Payment Method Stats */}
        {Object.keys(paymentMethodStats).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
            <h3 className="text-lg font-semibold mb-4">পেমেন্ট পদ্ধতি</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(paymentMethodStats).map(([method, count]) => (
                <div key={method} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <span className="text-sm">{getPaymentMethodName(method)}</span>
                  <span className="text-sm font-bold text-blue-600">{count} টি</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        {Object.keys(monthlyData).length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
            <h3 className="text-lg font-semibold mb-4">মাসিক সংগ্রহ</h3>
            <div className="space-y-3">
              {Object.entries(monthlyData).sort().map(([month, amount]) => {
                const maxAmount = Math.max(...Object.values(monthlyData));
                const percentage = (amount / maxAmount) * 100;
                return (
                  <div key={month} className="flex items-center gap-3">
                    <div className="w-24 text-sm">{month}</div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-end px-3 text-white text-xs"
                        style={{ width: `${percentage}%` }}>
                        {percentage > 15 && `৳${amount.toLocaleString()}`}
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm font-medium">৳{amount.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">রিসিপ্ট নং</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">সদস্য</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">পরিমাণ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">তারিখ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">পদ্ধতি</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">মাস</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.slice(0, 50).map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{t.receiptId}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{t.memberName}</p>
                      <p className="text-xs text-gray-500">{t.memberId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">৳{t.feeAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {getPaymentMethodName(t.payType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{t.paymentPeriod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-16 text-gray-500">কোনো লেনদেন পাওয়া যায়নি</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeesReports;
