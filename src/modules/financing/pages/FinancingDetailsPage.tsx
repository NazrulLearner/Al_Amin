// src/pages/Loans/LoanDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { loanService } from '../services/FinancingService';
import { formatDate } from '../../../utils/formatters/dateFormatter';
import { formatAmount } from '../../../utils/formatters/amountFormatter';
import RepaymentModal from '../components/RepaymentModal';
import { ArrowLeft, Loader2, CheckCircle, XCircle, User, Clock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const LoanDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { somityInfo, user } = useAuth();
  const { settings } = useSomitySettings();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);

  const currencySymbol = settings?.financial?.currencySymbol || '৳';

  useEffect(() => {
    if (id) { fetchLoan(); fetchRepayments(); }
  }, [id]);

  const fetchLoan = async () => {
    if (!somityInfo?.id || !id) return;
    try {
      setLoading(true);
      // Single somity data!
      const data = await loanService.getLoanById(id);
      setLoan(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepayments = async () => {
    if (!somityInfo?.id || !id) return;
    try {
      // Single somity data!
      const data = await loanService.getRepaymentsByLoanId(id);
      setRepayments(data);
    } catch (error) { console.error(error); }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!somityInfo?.id || !loan) return;
    setUpdating(true);
    try {
      // Single somity data!
      await loanService.updateLoanStatus(loan.id, newStatus as any, user?.uid);
      toast.success(`Loan status updated to ${newStatus}`);
      fetchLoan();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleRepaymentSuccess = () => {
    fetchLoan();
    fetchRepayments();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-700', icon: Clock },
      active: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      completed: { color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
      defaulted: { color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    const s = styles[status] || styles.pending;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>
        <Icon className="h-4 w-4" /> {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!loan) return <div className="p-6 text-center"><p className="text-gray-500">Loan not found</p><button onClick={() => navigate('/loans/list')} className="mt-2 text-blue-600">Back to Loan List</button></div>;

  const progress = ((loan.paidAmount || 0) / loan.totalPayable) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </button>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
            <div className="flex justify-between items-start">
              <div><h1 className="text-2xl font-bold">Loan Details</h1><p className="text-blue-100 text-sm mt-1">Loan ID: {loan.loanId}</p></div>
              {getStatusBadge(loan.status)}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b">
              <div className="flex items-center gap-2"><User className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Member Name</p><p className="font-semibold">{loan.memberName}</p></div></div>
              <div><p className="text-xs text-gray-500">Member ID</p><p className="font-mono text-sm">{loan.memberId}</p></div>
              <div><p className="text-xs text-gray-500">Loan Type</p><p className="capitalize font-medium">{loan.loanType}</p></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-500">Loan Amount</p><p className="text-xl font-bold text-green-600">{formatAmount(loan.amount, currencySymbol)}</p></div>
              <div><p className="text-xs text-gray-500">Paid Amount</p><p className="text-lg font-semibold text-blue-600">{formatAmount(loan.paidAmount, currencySymbol)}</p></div>
              <div><p className="text-xs text-gray-500">Due Amount</p><p className="text-lg font-semibold text-red-600">{formatAmount(loan.dueAmount, currencySymbol)}</p></div>
              <div><p className="text-xs text-gray-500">Total Payable</p><p className="text-lg font-semibold">{formatAmount(loan.totalPayable, currencySymbol)}</p></div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2"><span>Payment Progress</span><span className="font-semibold">{Math.round(progress)}%</span></div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Monthly: {formatAmount(loan.monthlyInstallment, currencySymbol)}</span>
                <span>Duration: {loan.durationMonths} months</span>
              </div>
            </div>

            {loan.status === 'active' && (
              <button onClick={() => setShowRepaymentModal(true)} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" /> Make a Payment
              </button>
            )}

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Repayment History</h3>
              {repayments.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No repayments yet</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr><th className="px-4 py-2 text-left">#</th><th className="px-4 py-2 text-left">Due Date</th><th className="px-4 py-2 text-left">Due Amount</th><th className="px-4 py-2 text-left">Paid Amount</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Payment Date</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {repayments.map((repay, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{repay.installmentNo}</td>
                          <td className="px-4 py-2">{formatDate(repay.dueDate)}</td>
                          <td className="px-4 py-2">{formatAmount(repay.dueAmount, currencySymbol)}</td>
                          <td className="px-4 py-2 text-green-600">{formatAmount(repay.paidAmount, currencySymbol)}</td>
                          <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs ${repay.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{repay.status}</span></td>
                          <td className="px-4 py-2">{formatDate(repay.paidDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {loan.status === 'active' && (
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => handleStatusChange('completed')} disabled={updating} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Mark as Completed
                </button>
                <button onClick={() => handleStatusChange('defaulted')} disabled={updating} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                  <XCircle className="h-4 w-4" /> Mark as Defaulted
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <RepaymentModal isOpen={showRepaymentModal} onClose={() => setShowRepaymentModal(false)} onSuccess={handleRepaymentSuccess}
        loanId={loan.id} memberId={loan.memberId} dueAmount={loan.dueAmount} monthlyInstallment={loan.monthlyInstallment}
        installmentFrequency={(loan as any).installmentFrequency || 'monthly'} totalInstallments={(loan as any).totalInstallments || (loan as any).numberOfInstallments || loan.durationMonths}
        paidInstallments={loan.paidInstallments || 0} nextDueDate={loan.nextDueDate} installmentSchedule={(loan as any).installmentSchedule || []} />
    </div>
  );
};

export default LoanDetails;
