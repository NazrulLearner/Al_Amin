// src/modules/financing/components/InstallmentScheduleModal.tsx

import React, { useState } from 'react';
import { Calendar, DollarSign, AlertCircle, Clock, User } from 'lucide-react';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { getFrequencyLabel } from '../utils/installmentCalculator';
import PrintLayout from '../../../shared/export/PrintLayout';

interface InstallmentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanDetails: {
    amount: number;
    duration: number;
    installmentFrequency: string;
    totalInstallments: number;
    installmentAmount: number;
    totalPayable: number;
    interestRate?: number;
    downPayment?: number;
    latePenalty?: number;
    processingFee?: number;
  };
  memberInfo?: {
    name: string;
    memberId: string;
    phone?: string;
    address?: string;
  };
  loanType: string;
  startDate?: Date;
  purpose?: string;
}

const InstallmentScheduleModal: React.FC<InstallmentScheduleModalProps> = ({
  isOpen,
  onClose,
  loanDetails,
  memberInfo,
  loanType,
  startDate = new Date(),
  purpose
}) => {
  const { formatAmount } = useSomitySettings();
  const [showTable, setShowTable] = useState(true);

  if (!isOpen) return null;

  const {
    amount,
    duration,
    installmentFrequency,
    totalInstallments,
    installmentAmount,
    totalPayable,
    interestRate = 0,
    downPayment = 0,
    latePenalty = 0,
    processingFee = 0
  } = loanDetails;


  // Generate installment schedule
  const generateSchedule = () => {
    const schedule = [];
    let remainingAmount = totalPayable - downPayment;
    const finalInstallmentAmount = Math.round(remainingAmount / totalInstallments);
    let remainingBalance = remainingAmount;
    
    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = new Date(startDate);
      if (installmentFrequency === 'monthly') {
        dueDate.setMonth(startDate.getMonth() + i);
      } else if (installmentFrequency === 'quarterly') {
        dueDate.setMonth(startDate.getMonth() + (i * 3));
      } else if (installmentFrequency === 'halfYearly') {
        dueDate.setMonth(startDate.getMonth() + (i * 6));
      } else if (installmentFrequency === 'yearly') {
        dueDate.setFullYear(startDate.getFullYear() + i);
      } else {
        dueDate.setMonth(startDate.getMonth() + i);
      }

      const isLast = i === totalInstallments;
      const scheduleAmount = isLast 
        ? remainingBalance
        : finalInstallmentAmount;
      
      remainingBalance -= scheduleAmount;

      schedule.push({
        number: i,
        dueDate,
        amount: scheduleAmount,
        status: 'pending',
        remainingBalance: Math.max(0, remainingBalance)
      });
    }
    return schedule;
  };

  const schedule = generateSchedule();

  const getLoanTypeName = (): string => {
    const names: Record<string, string> = {
      murabaha: 'মুরাবাহা',
      musharaka: 'মুশারাকা',
      mudaraba: 'মুদারাবা',
      salam: 'সালাম',
      ijarah: 'ইজারা',
      istisna: 'ইস্তিসনা',
      qardHasanah: 'কারদ হাসানা',
      tawarruq: 'তাওয়ারুক',
      kafalah: 'কাফালা'
    };
    return names[loanType] || loanType;
  };

  // Render content for PrintLayout
  const renderContent = () => (
    <div className="space-y-6">
      {/* Member Information */}
      {memberInfo && memberInfo.name && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 break-inside-avoid">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
            <User className="h-4 w-4" /> ঋণগ্রহীতার তথ্য
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-sm">
            <div>
              <p className="text-gray-500">নাম</p>
              <p className="font-medium text-gray-800">{memberInfo.name}</p>
            </div>
            <div>
              <p className="text-gray-500">সদস্য আইডি</p>
              <p className="font-mono text-gray-800">{memberInfo.memberId}</p>
            </div>
            {memberInfo.phone && (
              <div>
                <p className="text-gray-500">মোবাইল</p>
                <p className="text-gray-800">{memberInfo.phone}</p>
              </div>
            )}
            {memberInfo.address && (
              <div>
                <p className="text-gray-500">ঠিকানা</p>
                <p className="text-gray-800 truncate">{memberInfo.address}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan Information Card */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm break-inside-avoid">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          লোনের বিবরণ
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
          <div>
            <p className="text-xs text-gray-500">লোনের পরিমাণ</p>
            <p className="font-bold text-green-600">{formatAmount(amount)}</p>
          </div>
          {downPayment > 0 && (
            <div>
              <p className="text-xs text-gray-500">ডাউন পেমেন্ট</p>
              <p className="font-medium">{formatAmount(downPayment)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">মেয়াদ</p>
            <p className="font-medium">{duration} মাস</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">কিস্তির ধরণ</p>
            <p className="font-medium">{getFrequencyLabel(installmentFrequency as any)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">মোট কিস্তি</p>
            <p className="font-medium text-blue-600">{totalInstallments} টি</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">প্রতি কিস্তি</p>
            <p className="font-medium">{formatAmount(installmentAmount)}</p>
          </div>
          {interestRate > 0 && (
            <div>
              <p className="text-xs text-gray-500">লাভের হার</p>
              <p className="font-medium">{interestRate}%</p>
            </div>
          )}
          {processingFee > 0 && (
            <div>
              <p className="text-xs text-gray-500">প্রসেসিং ফি</p>
              <p className="font-medium">{formatAmount(processingFee)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">মোট পরিশোধ্য</p>
            <p className="font-bold text-purple-600">{formatAmount(totalPayable)}</p>
          </div>
        </div>
        {purpose && (
          <div className="mt-4 pt-3 border-t border-dashed">
            <p className="text-xs text-gray-500">লোনের উদ্দেশ্য</p>
            <p className="text-sm text-gray-700">{purpose}</p>
          </div>
        )}
      </div>

      {/* Late Payment Warning */}
      {latePenalty > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl p-4 break-inside-avoid">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800">বিলম্ব ফি সংক্রান্ত তথ্য</h4>
              <p className="text-sm text-yellow-700">
                নির্ধারিত সময়ের পরে কিস্তি পরিশোধ করলে <strong>{latePenalty}%</strong> জরিমানা প্রযোজ্য হবে। 
                এই জরিমানা দাতব্য তহবিলে জমা হবে, সোমিটির আয় হিসেবে নেওয়া হবে না।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Installment Table */}
      <div className="break-inside-avoid">
        <div className="flex justify-between items-center mb-4 no-print">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            কিস্তির সময়সূচী
          </h3>
          <button
            onClick={() => setShowTable(!showTable)}
            className="text-sm text-blue-600 hover:text-blue-800 no-print"
          >
            {showTable ? 'লুকান' : 'দেখুন'}
          </button>
        </div>

        {showTable && (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="border border-blue-500 px-4 py-3 text-center">ক্রমিক</th>
                  <th className="border border-blue-500 px-4 py-3 text-center">কিস্তির তারিখ</th>
                  <th className="border border-blue-500 px-4 py-3 text-right">কিস্তির পরিমাণ</th>
                  <th className="border border-blue-500 px-4 py-3 text-right">বাকি থাকবে</th>
                  <th className="border border-blue-500 px-4 py-3 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((inst, idx) => (
                  <tr key={inst.number} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-4 py-3 text-center font-medium">{inst.number}</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      {inst.dueDate.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-right font-medium text-green-600">
                      {formatAmount(inst.amount)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-gray-600">
                      {formatAmount(inst.remainingBalance)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        <Clock className="w-3 h-3" /> pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-green-50 to-emerald-50 font-bold">
                  <td colSpan={2} className="border border-gray-300 px-4 py-3 text-right">সর্বমোট:</td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-green-700">{formatAmount(totalPayable)}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">০.০০</td>
                  <td className="border border-gray-300 px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Islamic Compliance Note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 break-inside-avoid">
        <p className="text-sm text-emerald-800 flex items-start gap-2">
          <span className="text-lg">🕌</span>
          <span>
            <strong>ইসলামিক শরীয়াহ কমপ্লায়েন্স:</strong> এই লোনটি সম্পূর্ণ সুদমুক্ত (Riba-Free) এবং 
            ইসলামী শরীয়াহ নীতি অনুসারে পরিচালিত। বিলম্ব ফি দাতব্য তহবিলে জমা হবে।
          </span>
        </p>
      </div>

       <div className="signature-section grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-4 border-t border-gray-200">
        <div className="text-center">
         <div className="border-t border-gray-400 pt-2 mt-10">
             <p className="text-xs text-gray-500">ঋণগ্রহীতার স্বাক্ষর</p>
        </div>
     </div>
  <div className="text-center">
    <div className="border-t border-gray-400 pt-2 mt-10">
      <p className="text-xs text-gray-500">সোমিটি প্রতিনিধির স্বাক্ষর</p>
    </div>
  </div>
  <div className="text-center">
    <div className="border-t border-gray-400 pt-2 mt-10">
      <p className="text-xs text-gray-500">সাক্ষী - ১</p>
    </div>
  </div>
  <div className="text-center">
    <div className="border-t border-gray-400 pt-2 mt-10">
      <p className="text-xs text-gray-500">সাক্ষী - ২</p>
    </div>
  </div>
</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto no-print">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
        <PrintLayout
          title={`${getLoanTypeName()} - কিস্তির সময়সূচী`}
          subtitle={`${totalInstallments} টি কিস্তি | ${getFrequencyLabel(installmentFrequency as any)} | মোট পরিমাণ ${formatAmount(totalPayable)}`}
          onClose={onClose}
          showPrintButton={true}
          showCloseButton={true}
        >
          {renderContent()}
        </PrintLayout>
      </div>
    </div>
  );
};

export default InstallmentScheduleModal;