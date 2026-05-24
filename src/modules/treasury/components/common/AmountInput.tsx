// src/modules/finance/components/common/AmountInput.tsx

import React from 'react';
import { DollarSign } from 'lucide-react';
import { useSomitySettings } from '../../../../app/context/SomitySettingsProvider';

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
  error?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  required,
  min = 1,
  max,
  disabled,
  error
}) => {
  useSomitySettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      onChange(0);
    } else if (max && val > max) {
      onChange(max);
    } else if (val < min && val !== 0) {
      onChange(min);
    } else {
      onChange(val);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="number"
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder || 'পরিমাণ লিখুন'}
          disabled={disabled}
          min={min}
          max={max}
          className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {value > 0 && (
        <p className="text-xs text-gray-400 mt-1">
          কথায়: {convertToBengaliNumber(value)}
        </p>
      )}
    </div>
  );
};

const convertToBengaliNumber = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
};

export default AmountInput;