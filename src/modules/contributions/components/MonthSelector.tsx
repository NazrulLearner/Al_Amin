// src/modules/contributions/components/MonthSelector.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import {
  MONTHS,
  MONTHS_BN,
  getMonthShort,
  getYearOptions,
  MONTH_COUNT_OPTIONS,
  getMonthCountLabel,
} from '../../../utils/calculations/contributionCalculator';

interface MonthSelectorProps {
  startMonth: string;
  startYear: number;
  numberOfMonths: number;
  calculatedMonths: { month: string; year: number; amount: number }[];
  somityStartYear: number;
  currentYear: number;
  onMonthChange: (month: string) => void;
  onYearChange: (year: number) => void;
  onCountChange: (count: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  startMonth,
  startYear,
  numberOfMonths,
  calculatedMonths,
  somityStartYear,
  currentYear,
  onMonthChange,
  onYearChange,
  onCountChange,
}) => {
  const yearOptions = getYearOptions(somityStartYear, currentYear);

  return (
    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
      <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-500" />
        মাস নির্বাচন
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            মাস (থেকে)
          </label>
          <select
            value={startMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">সিলেক্ট করুন</option>
            {MONTHS.map((month, idx) => (
              <option key={month} value={month}>
                {MONTHS_BN[idx]} ({month})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            বছর
          </label>
          <select
            value={startYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {yearOptions.map((year: number) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            কত মাস
          </label>
          <select
            value={numberOfMonths}
            onChange={(e) => onCountChange(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {MONTH_COUNT_OPTIONS.map((n: number) => (
              <option key={n} value={n}>{getMonthCountLabel(n)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calculated Months Preview */}
      {startMonth && numberOfMonths > 0 && calculatedMonths.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>📅 কভার করবে:</strong>{' '}
            {calculatedMonths[0].month} {calculatedMonths[0].year}
            {' → '}
            {calculatedMonths[calculatedMonths.length - 1].month}{' '}
            {calculatedMonths[calculatedMonths.length - 1].year}
          </p>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {calculatedMonths.map((m, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs whitespace-nowrap"
              >
                {getMonthShort(m.month)} {m.year}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthSelector;
