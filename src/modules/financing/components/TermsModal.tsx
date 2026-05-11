// src/modules/financing/components/TermsModal.tsx

import React from 'react';
import { X, CheckCircle, AlertCircle, FileText, Heart, ShoppingCart, Handshake, Home, Shield } from 'lucide-react';
import type { LoanType } from '../../../types';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  loanType?: LoanType;
  installmentFrequency?: string;
  amount?: number;
  duration?: number;
}

const TermsModal: React.FC<TermsModalProps> = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  loanType, 
  installmentFrequency, 
  amount, 
  duration 
}) => {
  if (!isOpen) return null;

  const getLoanTypeIcon = () => {
    switch (loanType) {
      case 'qardHasanah': return <Heart className="h-5 w-5 text-red-600" />;
      case 'murabaha': return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'musharaka': return <Handshake className="h-5 w-5 text-green-600" />;
      case 'ijarah': return <Home className="h-5 w-5 text-pink-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getLoanTypeSpecificTerms = () => {
    switch (loanType) {
      case 'qardHasanah':
        return (
          <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">কারদ হাসানার বিশেষ শর্ত</h3>
            </div>
            <ul className="space-y-1 text-sm text-red-700 list-disc list-inside">
              <li>এই লোন সম্পূর্ণ সুদমুক্ত (0% interest)</li>
              <li>শুধুমাত্র নূন্যতম সার্ভিস চার্জ প্রযোজ্য</li>
              <li>জরুরি প্রয়োজনে (চিকিৎসা, শিক্ষা, বিবাহ) প্রদান করা হয়</li>
              <li>সেবা চার্জ ৫% এর বেশি হতে পারবে না</li>
            </ul>
          </div>
        );
      case 'murabaha':
        return (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">মুরাবাহার বিশেষ শর্ত</h3>
            </div>
            <ul className="space-y-1 text-sm text-blue-700 list-disc list-inside">
              <li>পণ্যের মূল্য ও লাভের হার আগে থেকেই নির্ধারিত</li>
              <li>পণ্য হস্তান্তরের আগে চুক্তি সম্পন্ন করতে হবে</li>
              <li>পণ্যের স্পেসিফিকেশন স্পষ্টভাবে উল্লেখ করতে হবে</li>
              <li>লোনের টাকা শুধুমাত্র উল্লেখিত পণ্য ক্রয়ে ব্যবহার করতে হবে</li>
            </ul>
          </div>
        );
      case 'musharaka':
        return (
          <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Handshake className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">মুশারাকার বিশেষ শর্ত</h3>
            </div>
            <ul className="space-y-1 text-sm text-green-700 list-disc list-inside">
              <li>ব্যাংক ও ক্লায়েন্ট যৌথ বিনিয়োগ করে</li>
              <li>লাভ ও লোকসান উভয়েই নির্ধারিত অনুপাতে ভাগ করতে হবে</li>
              <li>প্রকল্প ব্যবস্থাপনায় উভয় পক্ষ অংশগ্রহণ করতে পারে</li>
              <li>লাভ বণ্টনের অনুপাত আগে থেকে নির্ধারিত</li>
            </ul>
          </div>
        );
      case 'ijarah':
        return (
          <div className="bg-pink-50 p-4 rounded-lg mb-4 border border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-5 w-5 text-pink-600" />
              <h3 className="font-semibold text-pink-800">ইজারার বিশেষ শর্ত</h3>
            </div>
            <ul className="space-y-1 text-sm text-pink-700 list-disc list-inside">
              <li>সম্পদের মালিকানা ব্যাংকের কাছে থাকে</li>
              <li>নির্দিষ্ট সময়ের জন্য লিজ প্রদান করা হয়</li>
              <li>ভাড়ার পরিমাণ ও সময়সূচী আগে থেকে নির্ধারিত</li>
              <li>লিজ শেষে সম্পদ ক্রয়ের সুযোগ থাকতে পারে</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  const getFrequencySpecificTerms = () => {
    switch (installmentFrequency) {
      case 'monthly':
        return 'প্রতি মাসের নির্ধারিত তারিখে কিস্তি পরিশোধ করতে হবে। ৩০ দিনের বেশি বিলম্বে জরিমানা প্রযোজ্য হবে।';
      case 'quarterly':
        return 'প্রতি ৩ মাস অন্তর কিস্তি পরিশোধ করতে হবে। নির্ধারিত তারিখের ১৫ দিনের বেশি বিলম্বে জরিমানা প্রযোজ্য হবে।';
      case 'halfYearly':
        return 'প্রতি ৬ মাস অন্তর কিস্তি পরিশোধ করতে হবে। নির্ধারিত তারিখের ৩০ দিনের বেশি বিলম্বে জরিমানা প্রযোজ্য হবে।';
      case 'yearly':
        return 'প্রতি বছর নির্ধারিত তারিখে কিস্তি পরিশোধ করতে হবে। ৬০ দিনের বেশি বিলম্বে জরিমানা প্রযোজ্য হবে।';
      case 'lumpSum':
        return 'মেয়াদ শেষে সম্পূর্ণ অর্থ একসাথে পরিশোধ করতে হবে। নির্ধারিত তারিখের পরে পরিশোধ করলে জরিমানা প্রযোজ্য হবে।';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            {getLoanTypeIcon()}
            <h2 className="text-lg font-semibold text-gray-900">লোনের শর্তাবলী ও বিস্তারিত তথ্য</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Loan Summary */}
          {(amount || duration) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">লোনের সারসংক্ষেপ</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {amount && (
                  <div>
                    <span className="text-gray-500">লোনের পরিমাণ:</span>
                    <p className="font-bold text-green-600">৳{amount.toLocaleString()}</p>
                  </div>
                )}
                {duration && (
                  <div>
                    <span className="text-gray-500">মেয়াদ:</span>
                    <p className="font-medium">{duration} মাস</p>
                  </div>
                )}
                {installmentFrequency && (
                  <div className="col-span-2">
                    <span className="text-gray-500">কিস্তির ধরন:</span>
                    <p className="font-medium">{getFrequencyLabel(installmentFrequency as any)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loan Type Specific Terms */}
          {getLoanTypeSpecificTerms()}

          {/* General Terms */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">সাধারণ শর্তাবলী</h3>
            </div>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>লোনের কিস্তি নির্ধারিত সময়ে পরিশোধ করতে হবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>কিস্তি পরিশোধে বিলম্ব হলে নির্ধারিত জরিমানা প্রযোজ্য হবে (যা দাতব্য তহবিলে জমা হবে)।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>লোনের টাকা শুধুমাত্র উল্লেখিত উদ্দেশ্যে ব্যবহার করতে হবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>ঋণগ্রহীতা যেকোনো সময় সম্পূর্ণ বকেয়া পরিশোধ করতে পারবেন (পূর্ব-পরিশোধ)।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>সকল তথ্য সঠিক ও সত্য বলে ঘোষণা করা হচ্ছে। মিথ্যা তথ্য প্রদান করলে লোন বাতিল হতে পারে।</span>
              </li>
            </ul>
          </div>

          {/* Installment Schedule Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">📅 কিস্তির তথ্য</h3>
            <p className="text-sm text-blue-700">{getFrequencySpecificTerms()}</p>
            <p className="text-xs text-blue-600 mt-2">
              <strong>দ্রষ্টব্য:</strong> কিস্তির পরিমাণ ও তারিখ লোন অনুমোদনের পর চূড়ান্ত করা হবে।
            </p>
          </div>

          {/* Late Payment Info */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ বিলম্ব ফি সংক্রান্ত তথ্য</h3>
            <p className="text-sm text-red-700">
              নির্ধারিত সময়ের পরে কিস্তি পরিশোধ করলে বিলম্ব ফি প্রযোজ্য হবে। এই বিলম্ব ফি সোমিটির আয় হিসেবে না নিয়ে 
              দাতব্য তহবিলে (সদকা/চ্যারিটি) জমা করা হবে, যা ইসলামী শরীয়াহ নীতি অনুসারে।
            </p>
          </div>

          {/* Islamic Compliance Note */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-emerald-800">🕌 ইসলামিক কমপ্লায়েন্স সার্টিফিকেট</h3>
            </div>
            <p className="text-sm text-emerald-700">
              এই লোনটি সম্পূর্ণ ইসলামী শরীয়াহ নীতি অনুসারে পরিচালিত হবে। 
              কোন প্রকার সুদ (রিবা), অনিশ্চয়তা (ঘরার), বা জুয়া (মাইসির) থাকবে না। 
              সকল লেনদেন স্বচ্ছ এবং শরীয়াহ বোর্ড দ্বারা অনুমোদিত।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            বন্ধ করুন
          </button>
          {onAccept && (
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              আমি সম্মতি দিচ্ছি
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function
const getFrequencyLabel = (frequency: string): string => {
  const labels: Record<string, string> = {
    monthly: 'মাসিক',
    quarterly: 'ত্রৈমাসিক (৩ মাস)',
    halfYearly: 'অর্ধ-বার্ষিক (৬ মাস)',
    yearly: 'বার্ষিক (১২ মাস)',
    lumpSum: 'এককালীন'
  };
  return labels[frequency] || frequency;
};

export default TermsModal;