// src/pages/Loans/ActiveLoan.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { loanService } from '../services/FinancingService';
import { 
  Eye, Loader2, Search, CreditCard, TrendingUp, Users,
  DollarSign, AlertCircle, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { LoanApplication } from '../../../types';
import RepaymentModal from '../components/RepaymentModal';

const ActiveLoan: React.FC = () => {
  const navigate = useNavigate();
  const { somityInfo } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔥 NEW: Repayment modal state
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<LoanApplication | null>(null);

  useEffect(() => {
    fetchActiveLoans();
  }, [somityInfo]);

  const fetchActiveLoans = async () => {
    if (!somityInfo?.id) return;
    
    try {
      setLoading(true);
      const data = await loanService.getLoansByStatus('active');
      setLoans(data);
      setFilteredLoans(data);
    } catch (error) {
      console.error('Error fetching active loans:', error);
      toast.error('Failed to load active loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = loans.filter(loan =>
        loan.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loanId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLoans(filtered);
    } else {
      setFilteredLoans(loans);
    }
  }, [searchTerm, loans]);

  const { formatAmount } = useSomitySettings();

  const toAmount = (value: any): number => {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount : 0;
  };

  const getProgressPercentage = (loan: LoanApplication) => {
    const paid = toAmount(loan.paidAmount);
    const total = toAmount(loan.totalPayable);
    return total > 0 ? (paid / total) * 100 : 0;
  };

  // 🔥 NEW: Handle payment button click
  const handlePaymentClick = (loan: LoanApplication) => {
    setSelectedLoanForPayment(loan);
    setShowRepaymentModal(true);
  };

  // 🔥 NEW: Handle repayment success
  const handleRepaymentSuccess = () => {
    setShowRepaymentModal(false);
    setSelectedLoanForPayment(null);
    fetchActiveLoans();
    toast.success('✅ Payment recorded successfully!');
  };

  // 🔥 NEW: Get loan type icon
  const getLoanTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      murabaha: TrendingUp,
      musharaka: Users,
      qardHasanah: Heart,
      default: DollarSign
    };
    return icons[type] || icons.default;
  };

  // Heart icon for Qard Hasanah
  const Heart = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Active Loans</h1>
          <p className="text-gray-500 mt-1">Currently running loans - Record payments or view details</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Active</p>
            <p className="text-2xl font-bold text-blue-600">{loans.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatAmount(loans.reduce((sum, l) => sum + toAmount(l.dueAmount), 0))}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              {formatAmount(loans.reduce((sum, l) => sum + toAmount(l.paidAmount), 0))}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Avg Progress</p>
            <p className="text-2xl font-bold text-purple-600">
              {loans.length > 0 
                ? Math.round(loans.reduce((sum, l) => sum + getProgressPercentage(l), 0) / loans.length)
                : 0}%
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by Member Name or Loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Loans Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Loan ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Remaining</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLoans.map((loan) => {
                  const progress = getProgressPercentage(loan);
                  const TypeIcon = getLoanTypeIcon(loan.loanType);
                  const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date();
                  
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm">{loan.loanId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{loan.memberName}</p>
                        <p className="text-xs text-gray-500">{loan.memberId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm capitalize">{loan.loanType}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{formatAmount(loan.amount)}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">{formatAmount(loan.paidAmount || 0)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                            {formatAmount(loan.dueAmount || 0)}
                          </span>
                          {isOverdue && <AlertCircle className="h-3 w-3 text-red-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min(progress, 100)}%` }} 
                            />
                          </div>
                          <span className="text-xs font-medium w-10">{Math.round(progress)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* 🔥 NEW: Payment Button */}
                          <button
                            onClick={() => handlePaymentClick(loan)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="h-5 w-5" />
                          </button>
                          
                          {/* View Details Button */}
                          <button
                            onClick={() => navigate(`/loans/details/${loan.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredLoans.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">No active loans</p>
              <p className="text-sm text-gray-500 mt-1">All loans have been completed</p>
              <button
                onClick={() => navigate('/loans/add')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Create New Loan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 NEW: Repayment Modal */}
      {showRepaymentModal && selectedLoanForPayment && (
        <RepaymentModal
          isOpen={showRepaymentModal}
          onClose={() => {
            setShowRepaymentModal(false);
            setSelectedLoanForPayment(null);
          }}
          onSuccess={handleRepaymentSuccess}
          loanId={selectedLoanForPayment.id}
          memberId={selectedLoanForPayment.memberId}
          dueAmount={selectedLoanForPayment.dueAmount || 0}
          monthlyInstallment={selectedLoanForPayment.monthlyInstallment || 0}
          // 🔥 NEW: Pass frequency-related props
          installmentFrequency={(selectedLoanForPayment as any).installmentFrequency || 'monthly'}
          totalInstallments={(selectedLoanForPayment as any).totalInstallments || (selectedLoanForPayment as any).numberOfInstallments || selectedLoanForPayment.durationMonths}
          paidInstallments={selectedLoanForPayment.paidInstallments || 0}
          nextDueDate={selectedLoanForPayment.nextDueDate}
          installmentSchedule={(selectedLoanForPayment as any).installmentSchedule || []}
        />
      )}
    </div>
  );
};

export default ActiveLoan;
