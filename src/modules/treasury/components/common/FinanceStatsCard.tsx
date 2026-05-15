// src/modules/finance/components/common/FinanceStatsCard.tsx

import React from 'react';
import { useSomitySettings } from '../../../../app/providers/SomitySettingsProvider';

interface FinanceStatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number;
}

const FinanceStatsCard: React.FC<FinanceStatsCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend
}) => {
  const { formatAmount } = useSomitySettings();

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatAmount(value)}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-gray-100 rounded-xl">
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% গত মাসের তুলনায়
        </div>
      )}
    </div>
  );
};

export default FinanceStatsCard;