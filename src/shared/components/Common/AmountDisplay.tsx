// src/components/Common/AmountDisplay.tsx - COMPLETE NEW FILE
import React from 'react';

interface AmountDisplayProps {
  amount: number;
  className?: string;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({ amount, className = '' }) => {
  const formattedAmount = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

  return (
    <span className={`flex items-center gap-1 ${className}`}>
      <span>৳</span>
      {formattedAmount.replace('BDT', '')}
    </span>
  );
};

export default AmountDisplay;