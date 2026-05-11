// src/modules/contributions/components/PaymentMethodSelector.tsx
import React, { type JSX } from 'react';
import { CreditCard, Building, Wallet, Banknote } from 'lucide-react';
import { getPaymentMethodConfig } from '../../../utils/calculations/contributionCalculator';

interface PaymentMethodSelectorProps {
  allowedMethods: string[];
  selectedMethod: string;
  onSelect: (method: string) => void;
}

const ICON_MAP: Record<string, JSX.Element> = {
  cash: <Banknote className="h-4 w-4" />,
  bank: <Building className="h-4 w-4" />,
  bikash: <Wallet className="h-4 w-4" />,
  nogod: <Wallet className="h-4 w-4" />,
  rocket: <Wallet className="h-4 w-4" />,
  other: <CreditCard className="h-4 w-4" />,
};

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  allowedMethods,
  selectedMethod,
  onSelect,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <CreditCard className="h-4 w-4 inline mr-1" />
        পেমেন্ট পদ্ধতি
      </label>
      <div className="flex flex-wrap gap-2">
        {allowedMethods.map((method: string) => {
          const config = getPaymentMethodConfig(method);
          return (
            <button
              key={method}
              type="button"
              onClick={() => onSelect(method)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMethod === method
                  ? `${config.color} text-white shadow-md scale-105`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {ICON_MAP[method] || ICON_MAP.other}
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;