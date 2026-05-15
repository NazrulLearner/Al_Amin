// src/modules/contributions/components/PaymentMethodSelector.tsx
import React from 'react';
import { CreditCard } from 'lucide-react';
import { getPaymentMethodConfig } from '../../../utils/calculations/contributionCalculator';

interface PaymentMethodSelectorProps {
  allowedMethods: string[];
  selectedMethod: string;
  onSelect: (method: string) => void;
}

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
      <select
        value={selectedMethod}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {allowedMethods.map((method: string) => {
          const config = getPaymentMethodConfig(method);
          return (
            <option key={method} value={method}>
              {config.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default PaymentMethodSelector;