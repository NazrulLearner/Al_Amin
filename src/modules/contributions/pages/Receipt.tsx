// src/modules/contributions/pages/Receipt.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { feesService } from '../services/contributionService';
import { 
  Printer, Download, ArrowLeft, CheckCircle, 
  CreditCard, User, FileText, Building, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { FeeTransaction } from '../../../types';
import { getMonthShort } from '../../../utils/calculations/contributionCalculator';
import { convertToBengaliWords } from '../../../utils/convert/bengaliNumberToWords';
import { formatCurrencyWithSettings } from '../../../utils/formatters/currencyFormatter';
import { formatDateWithSettings, formatDateTime } from '../../../utils/formatters/dateFormatter';

const Receipt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { somityInfo } = useAuth();
  const { settings } = useSomitySettings();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<FeeTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Organization Settings ---
  const generalSettings = settings?.general;
  const financialSettings = settings?.financial;
  
  const orgName = generalSettings?.somityName || generalSettings?.organizationName || somityInfo?.name || 'Organization';
  const orgAddress = generalSettings?.somityAddress || generalSettings?.organizationAddress || somityInfo?.address || '';
  const orgPhone = generalSettings?.somityPhone || generalSettings?.organizationPhone || somityInfo?.phone || '';
  const orgEmail = generalSettings?.somityEmail || generalSettings?.organizationEmail || somityInfo?.email || '';
  const orgLogo = generalSettings?.logo || '';
  
  const dateFormat = financialSettings?.dateFormat || 'DD/MM/YYYY';

  // --- Watermark Settings ---
  const watermarkEnabled = generalSettings?.watermarkEnabled !== false;
  const watermarkText = generalSettings?.watermarkText || 'স্মৃতি চিরন্তন';
  const watermarkOpacity = generalSettings?.watermarkOpacity ?? 0.1;
  const watermarkRotation = generalSettings?.watermarkRotation ?? -12;

  useEffect(() => {
    if (id) fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const transactions = await feesService.getAllTransactions(500);
      const found = transactions.find(t => t.receiptId === id);
      if (found) setTransaction(found);
      else toast.error('রসিদ পাওয়া যায়নি');
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast.error('রসিদ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => setTimeout(() => window.print(), 100);
  const handleGoBack = () => navigate('/fees/history');

  const getPaymentMethodName = (method: string): string => {
    const names: Record<string, string> = {
      cash: 'নগদ',
      bank: 'ব্যাংক',
      bikash: 'বিকাশ',
      nogod: 'নগদ',
      rocket: 'রকেট',
      other: 'অন্যান্য',
    };
    return names[method] || method;
  };

  // ✅ Fixed: Flat structure অনুযায়ী collector name বের করা
  const getCollectorName = (transaction: FeeTransaction): string => {
    if (transaction.collectorName) return transaction.collectorName;
    if (transaction.collectorId) {
      // collectorId থেকে name বের করা (যদি আলাদা relation থাকে)
      return 'Collector';
    }
    return 'System';
  };

  // ✅ Fixed: Flat structure অনুযায়ী entered by name বের করা
  const getEnteredByName = (transaction: FeeTransaction): string => {
    if (transaction.enteredByName) return transaction.enteredByName;
    if (transaction.enteredById) return 'System User';
    return 'System';
  };

  // ✅ Fixed: Deposit fields থেকে bank info বের করা
  const getDepositBankName = (transaction: FeeTransaction): string => {
    return transaction.depositBankName || '';
  };

  const getDepositReference = (transaction: FeeTransaction): string => {
    return transaction.depositReference || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">রসিদ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">রসিদ পাওয়া যায়নি</h2>
          <p className="text-gray-500 mb-6">আপনার অনুরোধ করা রসিদটি খুঁজে পাওয়া যায়নি।</p>
          <button
            onClick={handleGoBack}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ইতিহাসে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-container, .receipt-container * { visibility: visible; }
          .receipt-container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            margin: 0;
            padding: 16px;
            width: 100%;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 0.5cm; }
          .receipt-container .shadow-lg { box-shadow: none !important; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto">
        {/* Action Buttons - Hidden in Print */}
        <div className="flex justify-between items-center mb-5 no-print">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-100 shadow-md transition-all border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            পেছনে ফিরুন
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md transition-all"
            >
              <Printer className="h-4 w-4" />
              প্রিন্ট করুন
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 shadow-md transition-all"
            >
              <Download className="h-4 w-4" />
              পিডিএফ ডাউনলোড
            </button>
          </div>
        </div>

        {/* Receipt Container */}
        <div className="receipt-container bg-white rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Watermark */}
          {watermarkEnabled && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
              style={{ opacity: watermarkOpacity }}
            >
              <div style={{ transform: `rotate(${watermarkRotation}deg)` }}>
                {orgLogo ? (
                  <img
                    src={orgLogo}
                    alt="Watermark"
                    className="w-48 h-48 mx-auto opacity-30"
                    style={{ filter: 'grayscale(100%)' }}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-8xl font-bold text-gray-300">🏢</div>
                  </div>
                )}
                <div className="text-2xl font-bold text-gray-300 mt-2 whitespace-nowrap">
                  {watermarkText}
                </div>
                <div className="text-sm text-gray-300 mt-1">{orgName}</div>
              </div>
            </div>
          )}

          {/* Top Decorative Bar */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500" />

          {/* Receipt Content */}
          <div className="p-6 relative z-10 bg-white">
            {/* Header Section */}
            <div className="text-center border-b-2 border-dashed border-gray-200 pb-5 mb-5">
              {orgLogo && (
                <img
                  src={orgLogo}
                  alt="Logo"
                  className="h-20 w-20 mx-auto mb-2 object-contain rounded-full shadow-md"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{orgName}</h1>
              {orgAddress && (
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  {orgAddress}
                </p>
              )}
              <div className="flex justify-center gap-3 text-xs text-gray-500 mt-2">
                {orgPhone && <span>📞 {orgPhone}</span>}
                {orgEmail && <span>✉️ {orgEmail}</span>}
              </div>
            </div>

            {/* Receipt Title Badge */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-5 py-1.5 rounded-full shadow-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-semibold text-sm">অবদান রসিদ</span>
              </div>
            </div>

            {/* Receipt Number & Date Row */}
            <div className="grid grid-cols-2 gap-4 mb-5 pb-3 border-b border-gray-200">
              <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-emerald-500">
                <p className="text-xs text-gray-500 uppercase tracking-wide">রসিদ নম্বর</p>
                <p className="text-lg font-mono font-bold text-gray-800 mt-1">
                  {transaction.receiptId}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500 text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">তারিখ</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {formatDateWithSettings(transaction.createdAt, dateFormat)}
                </p>
              </div>
            </div>

            {/* Member Information Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200">
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                সদস্যের তথ্য
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-blue-600">সদস্যের নাম</p>
                  <p className="text-base font-semibold text-gray-800 mt-0.5">
                    {transaction.memberName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">সদস্য আইডি</p>
                  <p className="text-base font-mono font-semibold text-gray-800 mt-0.5">
                    {transaction.memberId}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 border border-emerald-200">
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" />
                পেমেন্টের বিবরণ
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-emerald-600">পরিশোধিত মাস</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {transaction.paymentPeriod}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600">মাসের সংখ্যা</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {transaction.monthsPaid} মাস
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600">পেমেন্ট পদ্ধতি</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {getPaymentMethodName(transaction.payType)}
                  </p>
                </div>
                {transaction.referenceNo && (
                  <div>
                    <p className="text-xs text-emerald-600">ট্রানজেকশন আইডি</p>
                    <p className="text-xs font-mono text-gray-700 break-all mt-0.5">
                      {transaction.referenceNo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Info - Using deposit fields */}
            {(getDepositBankName(transaction) || getDepositReference(transaction)) && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-purple-200">
                <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Building className="h-3.5 w-3.5" />
                  ব্যাংকের তথ্য
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {getDepositBankName(transaction) && (
                    <div>
                      <p className="text-xs text-purple-600">ব্যাংকের নাম</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        {getDepositBankName(transaction)}
                      </p>
                    </div>
                  )}
                  {getDepositReference(transaction) && (
                    <div>
                      <p className="text-xs text-purple-600">রেফারেন্স</p>
                      <p className="text-xs font-mono text-gray-700 break-all mt-0.5">
                        {getDepositReference(transaction)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amount Section - Highlighted */}
            <div className="text-center py-4 mb-4 border-y-2 border-dashed border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-2">
                মোট পরিশোধিত পরিমাণ
              </p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrencyWithSettings(transaction.feeAmount, financialSettings)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                কথায়: {convertToBengaliWords(transaction.feeAmount)}
              </p>
            </div>

            {/* Paid Months Tags */}
            {transaction.paidMonthsDetails && transaction.paidMonthsDetails.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">পরিশোধিত মাস:</p>
                <div className="flex flex-wrap gap-1.5">
                  {transaction.paidMonthsDetails.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                    >
                      {getMonthShort(m.month)} {m.year}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collector & Entry Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 pt-3 border-t border-gray-200">
              <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-lg p-3 border border-cyan-200">
                <p className="text-xs text-cyan-600 font-semibold">সংগ্রাহক</p>
                <p className="text-base font-medium text-gray-800 mt-1">
                  {getCollectorName(transaction)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-orange-600 font-semibold text-right">প্রবেশকারী</p>
                <p className="text-base font-medium text-gray-800 mt-1 text-right">
                  {getEnteredByName(transaction)}
                </p>
              </div>
            </div>

            {/* Remarks */}
            {transaction.remarks && (
              <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
                <p className="text-xs text-yellow-700 font-semibold mb-1">মন্তব্য</p>
                <p className="text-sm text-gray-700">{transaction.remarks}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t-2 border-gray-200 mt-2">
              {(transaction.receiptFooter || settings?.collection?.receiptFooter) && (
                <p className="text-xs text-gray-500 italic mb-2">
                  {transaction.receiptFooter || settings?.collection?.receiptFooter}
                </p>
              )}
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} {orgName} | সফটওয়্যার জেনারেটেড রসিদ
              </p>
              <p className="text-xs text-gray-400 mt-1">
                প্রিন্ট: {formatDateTime(new Date())}
              </p>
            </div>
          </div>

          {/* Bottom Decorative Bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500" />
        </div>
      </div>
    </div>
  );
};

export default Receipt;