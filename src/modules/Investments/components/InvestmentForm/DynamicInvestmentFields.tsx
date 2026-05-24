import React from 'react';

interface DynamicInvestmentFieldsProps {
  planType: string;
  formData: any;
  onChange: (field: string, value: any) => void;
}

const DynamicInvestmentFields: React.FC<DynamicInvestmentFieldsProps> = ({
  planType,
  formData,
  onChange
}) => {
  if (planType === 'monthly') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            কিস্তির পরিমাণ (টাকা)
          </label>
          <input
            type="number"
            value={formData.installmentAmount || ''}
            onChange={(e) => onChange('installmentAmount', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="মাসিক কিস্তির পরিমাণ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            কিস্তির সংখ্যা
          </label>
          <input
            type="number"
            value={formData.numberOfInstallments || ''}
            onChange={(e) => onChange('numberOfInstallments', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="মোট কিস্তির সংখ্যা"
          />
        </div>
      </div>
    );
  }

  if (planType === 'lumpsum') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          এককালীন বিনিয়োগের পরিমাণ (টাকা)
        </label>
        <input
          type="number"
          value={formData.lumpsumAmount || ''}
          onChange={(e) => onChange('lumpsumAmount', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="মোট বিনিয়োগের পরিমাণ"
        />
      </div>
    );
  }

  return null;
};

export default DynamicInvestmentFields;