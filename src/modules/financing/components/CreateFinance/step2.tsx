// src/modules/financing/components/CreateFinance/step2.tsx

import React, { useState } from 'react';
import { useSomitySettings } from '../../../../app/providers/SomitySettingsProvider';
import { Calendar, Clock, AlertCircle, FileText } from 'lucide-react';
import LoanTypeSelection from '../Application/FinancingTypeSelection';
import MurabahaForm from '../FinancingDetails/MurabahaForm';
import MusharakaForm from '../FinancingDetails/MusharakaForm';
import MudarabaForm from '../FinancingDetails/MudarabaForm';
import SalamForm from '../FinancingDetails/SalamForm';
import IjarahForm from '../FinancingDetails/IjarahForm';
import IstisnaForm from '../FinancingDetails/IstisnaForm';
import KafalahForm from '../FinancingDetails/KafalahForm';
import QardHasanahForm from '../FinancingDetails/QardHasanahForm';
import TawarruqForm from '../FinancingDetails/TawarruqForm';
import TermsModal from '../TermsModal';
import { getFrequencyLabel, getFrequencyDescription } from '../../utils/installmentCalculator';
import type { LoanType } from '../../../../types';

interface Step2LoanTypeProps {
  onSubmit: (loanType: string, loanDetails: any) => void;
  initialData?: { loanType?: string; loanDetails?: any };
  onBack: () => void;
}

const Step2LoanType: React.FC<Step2LoanTypeProps> = ({ onSubmit, initialData, onBack }) => {
  useSomitySettings();
  const [selectedLoanType, setSelectedLoanType] = useState<string | undefined>(initialData?.loanType);
  const [loanDetails, setLoanDetails] = useState<any>(initialData?.loanDetails || {});
  const [installmentFrequency, setInstallmentFrequency] = useState<'monthly' | 'quarterly' | 'halfYearly' | 'yearly' | 'lumpSum'>(
    initialData?.loanDetails?.installmentFrequency || 'monthly'
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleLoanTypeSelect = (loanType: string) => {
    setSelectedLoanType(loanType);
    setLoanDetails({});
    setTermsAccepted(false);
  };

  const handleLoanDetailsSubmit = (details: any) => {
    if (selectedLoanType) {
      if (!termsAccepted) {
        setShowTermsModal(true);
        return;
      }
      onSubmit(selectedLoanType, {
        ...details,
        installmentFrequency
      });
    }
  };

  const handleBackToTypeSelection = () => {
    setSelectedLoanType(undefined);
    setTermsAccepted(false);
  };

  const getFrequencyWarning = (): string | null => {
    if (!loanDetails.durationMonths) return null;
    const duration = loanDetails.durationMonths;
    
    switch (installmentFrequency) {
      case 'quarterly':
        if (duration % 3 !== 0) {
          return 'ত্রৈমাসিক কিস্তির জন্য লোনের মেয়াদ ৩ মাসের গুণিতক হতে হবে।';
        }
        break;
      case 'halfYearly':
        if (duration % 6 !== 0) {
          return 'অর্ধ-বার্ষিক কিস্তির জন্য লোনের মেয়াদ ৬ মাসের গুণিতক হতে হবে।';
        }
        break;
      case 'yearly':
        if (duration % 12 !== 0) {
          return 'বার্ষিক কিস্তির জন্য লোনের মেয়াদ ১২ মাসের গুণিতক হতে হবে।';
        }
        break;
      default:
        break;
    }
    return null;
  };

  const renderLoanForm = () => {
    if (!selectedLoanType) return null;
    
    const commonProps = { 
      onSubmit: handleLoanDetailsSubmit, 
      onBack: handleBackToTypeSelection,
      initialData: loanDetails 
    };
    
    switch (selectedLoanType) {
      case 'murabaha': return <MurabahaForm {...commonProps} />;
      case 'musharaka': return <MusharakaForm {...commonProps} />;
      case 'mudaraba': return <MudarabaForm {...commonProps} />;
      case 'salam': return <SalamForm {...commonProps} />;
      case 'ijarah': return <IjarahForm {...commonProps} />;
      case 'istisna': return <IstisnaForm {...commonProps} />;
      case 'kafalah': return <KafalahForm {...commonProps} />;
      case 'qardHasanah': return <QardHasanahForm {...commonProps} />;
      case 'tawarruq': return <TawarruqForm {...commonProps} />;
      default: return null;
    }
  };

  const frequencyWarning = getFrequencyWarning();

  return (
    <div className="p-6">
      {!selectedLoanType ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Step 2: লোনের ধরন নির্বাচন</h2>
            <p className="text-gray-600">আপনার প্রয়োজন অনুযায়ী ইসলামিক লোনের ধরন নির্বাচন করুন</p>
          </div>
          
          {/* 🔥 Installment Frequency Selection */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              কিস্তির ধরন নির্বাচন করুন
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(['monthly', 'quarterly', 'halfYearly', 'yearly', 'lumpSum'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setInstallmentFrequency(freq)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    installmentFrequency === freq
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {getFrequencyLabel(freq)}
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 flex items-start gap-2">
                <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{getFrequencyDescription(installmentFrequency)}</span>
              </p>
            </div>
          </div>
          
          <LoanTypeSelection onSelect={handleLoanTypeSelect} selectedType={selectedLoanType} />
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              পেছনে ফিরুন
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">লোনের বিস্তারিত তথ্য</h2>
              <p className="text-gray-600">আপনার নির্বাচিত লোনের ধরন অনুযায়ী তথ্য দিন</p>
            </div>
            <button
              onClick={handleBackToTypeSelection}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              ← লোনের ধরন পরিবর্তন
            </button>
          </div>

          {/* Frequency Warning */}
          {frequencyWarning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">{frequencyWarning}</p>
            </div>
          )}

          {/* Terms & Conditions Checkbox */}
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <div className="text-sm text-gray-700">
                <span className="font-medium">শর্তাবলীতে সম্মতি: </span>
                আমি এই লোনের সকল শর্তাবলী পড়েছি এবং বুঝেছি।
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:underline ml-1 inline-flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  বিস্তারিত দেখুন
                </button>
              </div>
            </label>
          </div>

          {renderLoanForm()}

          {/* Terms Modal */}
          <TermsModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
            loanType={selectedLoanType as LoanType}
            installmentFrequency={installmentFrequency}
            amount={loanDetails?.assetCost || loanDetails?.loanAmount || loanDetails?.totalCapital || 0}
            duration={loanDetails?.durationMonths}
          />
        </>
      )}
    </div>
  );
};

export default Step2LoanType;