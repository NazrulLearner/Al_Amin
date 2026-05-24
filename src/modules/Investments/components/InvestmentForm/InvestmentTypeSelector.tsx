import React from 'react';

interface InvestmentTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
}

const InvestmentTypeSelector: React.FC<InvestmentTypeSelectorProps> = ({ value, onChange }) => {
  const types = [
    { id: 'lumpsum', name: 'এককালীন বিনিয়োগ', description: 'একবারে পুরো টাকা বিনিয়োগ', icon: '💰' },
    { id: 'monthly', name: 'মাসিক সঞ্চয়', description: 'প্রতি মাসে নির্দিষ্ট পরিমাণ জমা', icon: '📅' },
    { id: 'profit_sharing', name: 'মুনাফা ভাগাভাগি', description: 'ব্যবসায় অংশীদারিত্ব', icon: '🤝' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {types.map(type => (
        <button
          key={type.id}
          type="button"
          onClick={() => onChange(type.id)}
          className={`p-4 border-2 rounded-lg text-left transition ${
            value === type.id 
              ? 'border-blue-600 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="text-2xl mb-2">{type.icon}</div>
          <div className="font-semibold text-gray-800">{type.name}</div>
          <div className="text-sm text-gray-500 mt-1">{type.description}</div>
        </button>
      ))}
    </div>
  );
};

export default InvestmentTypeSelector;