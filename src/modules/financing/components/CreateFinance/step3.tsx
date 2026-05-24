// src/modules/financing/components/CreateFinance/step3.tsx

import React, { useState } from 'react';
import { useSomitySettings } from '../../../../app/context/SomitySettingsProvider';
import { 
  CheckCircle, FileText, Upload, X, User, Users, TrendingUp, 
  Shield, Heart, Home, Building2, Package, Sprout, CreditCard,
  AlertCircle, Calendar
} from 'lucide-react';
import type { LoanFormData } from '../../pages/CreateFinancingPage';
import TermsModal from '../TermsModal';
import { getFrequencyLabel, getNumberOfInstallments, type InstallmentFrequency } from '../../utils/installmentCalculator';
import InstallmentScheduleModal from '../InstallmentScheduleModal';

interface Step3FinalizationProps {
  onSubmit: (data: { remarks?: string; documents: any[] }) => void;
  formData: LoanFormData;
  onBack: () => void;
  loading: boolean;
}

const Step3Finalization: React.FC<Step3FinalizationProps> = ({ onSubmit, formData, onBack, loading }) => {
  const { settings, formatAmount } = useSomitySettings();
  const [remarks, setRemarks] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const loanSettings = settings?.loan;
  const islamicConfig = settings?.islamicLoanConfig;
  
  // Get installment frequency from formData
  const installmentFrequency = (formData.loanDetails?.installmentFrequency || 'monthly') as InstallmentFrequency;
  
  // Get interest/profit rate based on loan type from settings
  const getInterestRate = (): number => {
    const loanType = formData.loanType;
    
    if (loanType === 'qardHasanah') return 0;
    if (loanType === 'musharaka' || loanType === 'mudaraba') return 0;
    if (loanType === 'ijarah') return 0;
    
    const config = islamicConfig?.[loanType as keyof typeof islamicConfig];
    if (config && typeof config === 'object' && 'profitRate' in config) {
      return (config as any).profitRate;
    }
    
    return loanSettings?.defaultInterestRate || 10;
  };

  const interestRate = getInterestRate();

  const getLoanTypeDetails = () => {
    const types: Record<string, { name: string; icon: any; color: string; bg: string; border: string }> = {
      murabaha: { name: 'Murabaha', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      musharaka: { name: 'Musharaka', icon: Users, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      mudaraba: { name: 'Mudaraba', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
      salam: { name: 'Salam', icon: Sprout, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
      ijarah: { name: 'Ijarah', icon: Home, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
      istisna: { name: 'Istisna', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
      kafalah: { name: 'Kafalah', icon: Shield, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
      qardHasanah: { name: 'Qard Hasanah', icon: Heart, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
      tawarruq: { name: 'Tawarruq', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    };
    return types[formData.loanType] || { name: formData.loanType || 'Loan', icon: CreditCard, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
  };

  const loanTypeDetails = getLoanTypeDetails();
  const LoanIcon = loanTypeDetails.icon;

  // Calculate amount based on loan type
  const calculateAmount = (): number => {
    const details = formData.loanDetails || {};
    switch (formData.loanType) {
      case 'murabaha': return Number(details.assetCost || 0);
      case 'musharaka':
      case 'mudaraba': return Number(details.totalCapital || 0);
      case 'qardHasanah': return Number(details.loanAmount || 0);
      case 'salam': return Number(details.totalPrice || 0);
      case 'ijarah': return Number(details.assetValue || 0);
      case 'kafalah': return Number(details.guaranteeAmount || 0);
      case 'istisna':
      case 'tawarruq': return Number(details.totalCost || 0);
      default: return Number(details.amount || 0);
    }
  };

  const amount = calculateAmount();
  const duration = formData.loanDetails?.durationMonths || 
                   formData.loanDetails?.leasePeriod || 
                   formData.loanDetails?.deliveryPeriod || 12;
  const scheduleInterestRate = formData.loanType === 'murabaha'
    ? formData.loanDetails?.profitInputType === 'amount'
      ? amount > 0 ? (Number(formData.loanDetails?.profitAmount || formData.loanDetails?.profitRate || 0) / amount) * 100 : 0
      : Number(formData.loanDetails?.profitRate || interestRate)
    : getInterestRate();
  
  // Calculate total payable based on loan type
  const getTotalPayable = (): number => {
    const details = formData.loanDetails || {};
    
    switch (formData.loanType) {
      case 'qardHasanah':
        const serviceChargePercent = details.serviceChargePercent || 0;
        return amount + (amount * serviceChargePercent / 100);
      case 'musharaka':
      case 'mudaraba':
        return amount;
      case 'ijarah':
        const rentalAmount = details.rentalAmount || 0;
        return rentalAmount * duration;
      case 'murabaha':
        if (Number(details.totalPayable || 0) > 0) return Number(details.totalPayable);
        if (details.profitInputType === 'amount') return amount + Number(details.profitAmount || details.profitRate || 0);
        if (Number(details.profitAmount || 0) > 0) return amount + Number(details.profitAmount);
        return amount * (1 + interestRate / 100);
      case 'istisna':
      case 'tawarruq':
        return amount * (1 + interestRate / 100);
      default:
        return amount * (1 + interestRate / 100);
    }
  };

  const totalPayable = getTotalPayable();
  const totalInstallments = getNumberOfInstallments(duration, installmentFrequency);
  const installmentAmount = totalInstallments > 0 ? Math.round(totalPayable / totalInstallments) : totalPayable;
  const monthlyInstallment = duration > 0 ? Math.round(totalPayable / duration) : 0;

  const monthlyIncome = formData.applicant?.monthlyIncome || 0;
  const installmentToIncomeRatio = monthlyIncome > 0 ? (monthlyInstallment / monthlyIncome) * 100 : 0;
  const highPaymentWarning = installmentToIncomeRatio > 50;

  const getRateLabel = (): string => {
    switch (formData.loanType) {
      case 'qardHasanah': return 'Service Charge';
      case 'musharaka':
      case 'mudaraba': return 'Profit Sharing';
      case 'ijarah': return 'Rental Rate';
      case 'murabaha': return formData.loanDetails?.profitInputType === 'amount' ? 'Profit Amount' : 'Profit Rate';
      default: return 'Interest/Profit Rate';
    }
  };

  const getRateValue = (): string => {
    const details = formData.loanDetails || {};
    switch (formData.loanType) {
      case 'qardHasanah': return `${details.serviceChargePercent || 0}%`;
      case 'musharaka': return `${details.profitSharingRatio || islamicConfig?.musharaka?.profitSharingRatio || 50}%`;
      case 'mudaraba': return `${details.rabulMalShare || 50}% / ${details.mudaribShare || 50}%`;
      case 'ijarah': return `${islamicConfig?.ijarah?.rentalRate || 5}%`;
      case 'murabaha':
        return details.profitInputType === 'amount'
          ? formatAmount(Number(details.profitAmount || details.profitRate || 0))
          : `${details.profitRate || interestRate}%`;
      default: return `${interestRate}%`;
    }
  };

  const handleSubmit = () => {
    if (!termsAccepted) {
      alert('Please accept the Terms & Conditions to proceed.');
      return;
    }
    onSubmit({ remarks: remarks.trim() || undefined, documents });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setUploading(true);
    setTimeout(() => {
      const newDocuments = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }));
      setDocuments(prev => [...prev, ...newDocuments]);
      setUploading(false);
      event.target.value = '';
    }, 500);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Step 3: Review & Submit</h2>
        <p className="text-gray-600">Review all information, upload documents, and submit your application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Review Summary */}
        <div className="space-y-4">
          {/* Applicant Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4" /> Applicant Information
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{formData.applicant?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Type</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${formData.applicant?.isMember ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {formData.applicant?.isMember ? 'Member' : 'Non-Member'}
                </span>
              </div>
              {formData.applicant?.memberID && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Member ID</span>
                  <span className="font-mono text-sm">{formData.applicant.memberID}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Phone</span>
                <span>{formData.applicant?.phone || 'N/A'}</span>
              </div>
              {monthlyIncome > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Monthly Income</span>
                  <span className="font-medium text-green-600">{formatAmount(monthlyIncome)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guarantor Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4" /> Guarantor Information
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{formData.grantor?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Member ID</span>
                <span className="font-mono text-sm">{formData.grantor?.memberID || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Phone</span>
                <span>{formData.grantor?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Relation</span>
                <span className="capitalize">{formData.grantor?.relation || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Loan Summary Card */}
          <div className={`bg-white border-2 ${loanTypeDetails.border} rounded-xl overflow-hidden shadow-sm`}>
            <div className={`${loanTypeDetails.bg} px-4 py-3 border-b ${loanTypeDetails.border}`}>
              <h3 className={`font-semibold ${loanTypeDetails.color} flex items-center gap-2`}>
                <LoanIcon className="w-4 h-4" /> Loan Details - {loanTypeDetails.name}
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Principal Amount</span>
                <span className="font-bold text-green-600 text-lg">{formatAmount(amount)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Duration</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {duration} months
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">{getRateLabel()}</span>
                <span className="font-medium">{getRateValue()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Monthly Installment</span>
                <span className="font-medium text-blue-600">{formatAmount(monthlyInstallment)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Payable</span>
                <span className="font-bold text-purple-600">{formatAmount(totalPayable)}</span>
              </div>

              {/* 🔥 Installment Schedule Preview with Button */}
<div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
  <div className="flex justify-between items-center">
    <div>
      <h4 className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
        <Calendar className="w-3 h-3" /> কিস্তির তথ্য
      </h4>
      <div className="text-xs text-green-700 space-y-0.5">
        <p>মোট কিস্তি: {totalInstallments} টি</p>
        <p>প্রতি কিস্তি: {formatAmount(installmentAmount)}</p>
        <p>কিস্তির ধরণ: {getFrequencyLabel(installmentFrequency)}</p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => setShowScheduleModal(true)}
      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1"
    >
      <Calendar className="w-3 h-3" /> কিস্তির সময়সূচী দেখুন
    </button>
  </div>
</div>


<InstallmentScheduleModal
  isOpen={showScheduleModal}
  onClose={() => setShowScheduleModal(false)}
  loanDetails={{
    amount,
    duration,
    installmentFrequency,
    totalInstallments,
    installmentAmount,
    totalPayable,
    interestRate: scheduleInterestRate,
    downPayment: 0,
    latePenalty: loanSettings?.latePaymentPenalty || 0
  }}
  memberInfo={{
    name: formData.applicant?.name || '',
    memberId: formData.applicant?.memberID || ''
  }}
  loanType={formData.loanType || ''}
  startDate={new Date()}
/>
              
              {/* Warning for high payment to income ratio */}
              {highPaymentWarning && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Monthly payment is {installmentToIncomeRatio.toFixed(1)}% of monthly income. 
                    This may affect repayment ability.
                  </p>
                </div>
              )}
              
              {/* Special note for Qard Hasanah */}
              {formData.loanType === 'qardHasanah' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Interest-free benevolent loan - only service charge applies
                  </p>
                </div>
              )}
              
              {/* Purpose */}
              {formData.loanDetails?.purpose && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Purpose</span>
                  <p className="text-sm text-gray-700 mt-1">{formData.loanDetails.purpose}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Remarks & Documents */}
        <div className="space-y-4">
          {/* Remarks */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="font-semibold text-gray-800">Remarks (Optional)</h3>
            </div>
            <div className="p-4">
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional comments or special instructions..."
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Document Upload
              </h3>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Upload Required Documents</p>
                <p className="text-sm text-gray-500 mb-4">NID, Photo, Income Certificate, Bank Statement</p>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload} 
                  disabled={uploading} 
                  className="hidden" 
                  id="doc-upload" 
                />
                <label 
                  htmlFor="doc-upload" 
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-white ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} transition-colors`}
                >
                  {uploading ? 'Uploading...' : 'Select Files'}
                </label>
              </div>

              {documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Uploaded Documents ({documents.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-800">{doc.name}</div>
                            <div className="text-xs text-gray-500">{formatFileSize(doc.size)}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeDocument(doc.id)} 
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" /> Application Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Documents</span>
                <span className="font-medium">{documents.length} files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remarks</span>
                <span className="font-medium">{remarks ? 'Provided' : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-medium">{formatAmount(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment</span>
                <span className="font-medium text-green-600">{formatAmount(monthlyInstallment)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I confirm that all information provided is true and accurate. I agree to the{' '}
                <button 
                  type="button" 
                  onClick={() => setShowTermsModal(true)} 
                  className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Terms & Conditions
                </button>
                {' '}and understand that this is an Islamic Shariah-compliant financing.
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
        <button 
          onClick={onBack} 
          disabled={loading} 
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {documents.length > 0 && `${documents.length} document(s) uploaded`}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !termsAccepted}
            className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Submit Application</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        loanType={formData.loanType as any}
        installmentFrequency={installmentFrequency}
        amount={amount}
        duration={duration}
      />

      {/* Installment Schedule Modal */}
      <InstallmentScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        loanDetails={{
          amount,
          duration,
          installmentFrequency,
          totalInstallments,
          installmentAmount,
          totalPayable,
          interestRate: scheduleInterestRate,
          downPayment: 0,
          latePenalty: loanSettings?.latePaymentPenalty || 0
        }}
        memberInfo={{
          name: formData.applicant?.name || '',
          memberId: formData.applicant?.memberID || ''
        }}
        loanType={formData.loanType || ''}
        startDate={new Date()}
      />
    </div>
  );
};

export default Step3Finalization;
