// src/modules/financing/components/DisbursementModal.tsx

import React, { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { loanService } from '../services/FinancingService';
import { 
  DollarSign, Landmark, Wallet, Clock, Hash, FileText, 
  X, Loader2, Calendar, Building2, CreditCard, 
  CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loanId: string;
  loanAmount: number;
  memberId: string;
  memberName: string;
}

const DisbursementModal: React.FC<DisbursementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loanId,
  loanAmount,
  memberId,
  memberName
}) => {
  const { user, somityInfo, currentMember } = useAuth();
  const { formatAmount } = useSomitySettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    disbursementDate: new Date().toISOString().slice(0, 10),
    disbursementMethod: 'cash' as 'cash' | 'bank' | 'cheque' | 'transfer',
    disbursedFrom: 'cashier_fund' as 'cashier_fund' | 'somity_bank_account' | 'somity_cash',
    bankName: '',
    accountNumber: '',
    chequeNumber: '',
    transactionId: '',
    downPaymentAmount: 0,
    notes: ''
  });
  const netDisbursedAmount = Math.max(0, loanAmount - Number(formData.downPaymentAmount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!somityInfo?.id) {
      toast.error('Somity info not found');
      return;
    }

    if (Number(formData.downPaymentAmount || 0) < 0 || Number(formData.downPaymentAmount || 0) > loanAmount) {
      toast.error('Down payment must be between 0 and the loan amount');
      return;
    }
    
    setLoading(true);
    try {
      await loanService.recordDisbursement(
        loanId,
        {
          amount: loanAmount,
          downPaymentAmount: Number(formData.downPaymentAmount || 0),
          disbursementDate: new Date(formData.disbursementDate),
          disbursementMethod: formData.disbursementMethod,
          disbursedFrom: formData.disbursedFrom,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          chequeNumber: formData.chequeNumber,
          transactionId: formData.transactionId,
          receivedBy: memberId,
          receivedByName: memberName,
          receivedByMemberId: memberId,
          disbursedBy: user?.uid || 'system',
          disbursedByName: currentMember?.fullName || user?.email || 'System',
          notes: formData.notes
        }
      );
      toast.success('✅ Disbursement recorded successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error recording disbursement:', error);
      toast.error(error.message || 'Failed to record disbursement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-5 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Record Loan Disbursement</h2>
              <p className="text-sm text-blue-200">Track how and when the loan amount is given</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loan Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Loan Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-blue-600">Loan Amount</p>
                <p className="text-xl font-bold text-green-600">{formatAmount(loanAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Member Name</p>
                <p className="text-base font-semibold text-gray-800">{memberName}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Member ID</p>
                <p className="text-base font-mono text-gray-800">{memberId || 'N/A'}</p>
              </div>
            </div>
            {Number(formData.downPaymentAmount || 0) > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-blue-600">Down Payment</p>
                  <p className="text-lg font-bold text-blue-700">{formatAmount(Number(formData.downPaymentAmount || 0))}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Net Disbursed</p>
                  <p className="text-lg font-bold text-indigo-700">{formatAmount(netDisbursedAmount)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Down Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              Down Payment (Optional)
            </label>
            <input
              type="number"
              min="0"
              max={loanAmount}
              value={formData.downPaymentAmount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, downPaymentAmount: Number(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Member down payment nile ekhane amount din. Na dile blank/0 rakhlei hobe.</p>
          </div>

          {/* Disbursement Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              Disbursement Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.disbursementDate}
              onChange={(e) => setFormData(prev => ({ ...prev, disbursementDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Disbursement Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              Disbursement Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'cash', label: 'Cash', icon: <DollarSign className="h-5 w-5" />, color: 'bg-green-100 text-green-700 border-green-200' },
                { value: 'bank', label: 'Bank', icon: <Landmark className="h-5 w-5" />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
                { value: 'cheque', label: 'Cheque', icon: <FileText className="h-5 w-5" />, color: 'bg-purple-100 text-purple-700 border-purple-200' },
                { value: 'transfer', label: 'Transfer', icon: <Wallet className="h-5 w-5" />, color: 'bg-orange-100 text-orange-700 border-orange-200' }
              ].map(method => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, disbursementMethod: method.value as any }))}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.disbursementMethod === method.value
                      ? `${method.color} border-current shadow-md`
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {method.icon}
                  <span className="text-sm font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Source of Funds */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              Source of Funds <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'cashier_fund', label: 'Cashier Fund', icon: <Wallet className="h-5 w-5" />, description: 'Cash collected from members' },
                { value: 'somity_bank_account', label: 'Somity Bank', icon: <Landmark className="h-5 w-5" />, description: 'Bank account withdrawal' },
                { value: 'somity_cash', label: 'Somity Cash', icon: <DollarSign className="h-5 w-5" />, description: 'Somity cash reserve' }
              ].map(source => (
                <button
                  key={source.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, disbursedFrom: source.value as any }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.disbursedFrom === source.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${formData.disbursedFrom === source.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {source.icon}
                    </div>
                    <span className="font-semibold text-gray-800">{source.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-12">{source.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Bank/Cheque/Transfer Details */}
          {(formData.disbursementMethod === 'bank' || formData.disbursementMethod === 'transfer') && (
            <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bank / Transfer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Islami Bank, DBBL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    placeholder="Account number"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.disbursementMethod === 'cheque' && (
            <div className="bg-gray-50 rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
              <input
                type="text"
                value={formData.chequeNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, chequeNumber: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                placeholder="e.g., 000123"
              />
            </div>
          )}

          {(formData.disbursementMethod === 'bank' || formData.disbursementMethod === 'transfer') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                <Hash className="h-4 w-4" />
                Transaction ID
              </label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                placeholder="TRX123456789"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about the disbursement..."
            />
          </div>

          {/* Disbursement Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium">Disbursed by:</span>
              <span>{currentMember?.fullName || user?.email || 'System'}</span>
              <span className="text-gray-400">|</span>
              <span className="font-mono text-xs">{currentMember?.memberId || 'SYS'}</span>
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800">Important Note</h4>
              <p className="text-sm text-amber-700">
                Once disbursed, this action cannot be reversed. Please verify all details before confirming.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-5 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              {loading ? 'Processing...' : 'Confirm Disbursement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisbursementModal;
