// src/pages/settings/components/FinancialSettings.tsx
import React, { useState, useMemo } from 'react';
import type { SomitySettings } from '../../../types/settings';

interface FinancialSettingsProps {
  settings: SomitySettings;
  updateSettings: (updates: Partial<SomitySettings>) => void;
}

const FinancialSettings: React.FC<FinancialSettingsProps> = ({ settings, updateSettings }) => {
  const handleFinancialChange = (field: keyof typeof settings.financial, value: any) => {
    updateSettings({
      financial: { ...settings.financial, [field]: value }
    });
  };

  // Get start date from settings or default to July 2021
  const getStartDate = () => {
    if (settings.financial?.fiscalYearStart) {
      const [month, year] = settings.financial.fiscalYearStart.split('-');
      return { month: month || 'July', year: parseInt(year) || 2021 };
    }
    return { month: 'July', year: 2021 };
  };

  const startDate = getStartDate();
  
  const [selectedMonth, setSelectedMonth] = useState(startDate.month);
  const [selectedYear, setSelectedYear] = useState(startDate.year);

  const updateFiscalYear = (month: string, year: number) => {
    const fiscalYearString = `${month}-${year}`;
    handleFinancialChange('fiscalYearStart', fiscalYearString);
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const months = [
    { value: 'January', name: 'Jan', fullName: 'January', days: 31 },
    { value: 'February', name: 'Feb', fullName: 'February', days: 28 },
    { value: 'March', name: 'Mar', fullName: 'March', days: 31 },
    { value: 'April', name: 'Apr', fullName: 'April', days: 30 },
    { value: 'May', name: 'May', fullName: 'May', days: 31 },
    { value: 'June', name: 'Jun', fullName: 'June', days: 30 },
    { value: 'July', name: 'Jul', fullName: 'July', days: 31 },
    { value: 'August', name: 'Aug', fullName: 'August', days: 31 },
    { value: 'September', name: 'Sep', fullName: 'September', days: 30 },
    { value: 'October', name: 'Oct', fullName: 'October', days: 31 },
    { value: 'November', name: 'Nov', fullName: 'November', days: 30 },
    { value: 'December', name: 'Dec', fullName: 'December', days: 31 }
  ];

  // Generate years from 2021 to current year + 5
  const currentYear = new Date().getFullYear();
  const startYearRange = 2021;
  const years = useMemo(() => {
    const yrs = [];
    for (let i = startYearRange; i <= currentYear + 5; i++) {
      yrs.push(i);
    }
    return yrs;
  }, [currentYear]);

  // Get current date
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentMonthObj = months[currentMonthIndex];
  const currentYearNum = now.getFullYear();
  const currentDay = now.getDate();

  // Get start month index
  const getStartMonthIndex = (monthName: string) => {
    return months.findIndex(m => m.value === monthName);
  };

  const startMonthIndex = getStartMonthIndex(selectedMonth);
  const startYearNum = selectedYear;

  // Calculate total months using DATEDIF style: =DATEDIF(startDate, currentDate, "M") + 1
  const totalMonths = useMemo(() => {
    let monthsDiff = (currentYearNum - startYearNum) * 12;
    monthsDiff += (currentMonthIndex - startMonthIndex);
    const total = monthsDiff + 1;
    return total > 0 ? total : 1;
  }, [startYearNum, startMonthIndex, currentYearNum, currentMonthIndex]);

  // Format start date display
  const startDateDisplay = useMemo(() => {
    const monthObj = months.find(m => m.value === selectedMonth);
    const startDay = 2;
    return `${startDay}-${monthObj?.name || 'Jul'}-${startYearNum}`;
  }, [selectedMonth, startYearNum]);

  // Format current date display
  const currentDateDisplay = useMemo(() => {
    return `${currentDay}-${currentMonthObj?.name || 'Apr'}-${currentYearNum}`;
  }, [currentDay, currentMonthObj, currentYearNum]);

  // Get current settings with defaults
  const decimalPlaces = settings.financial?.decimalPlaces ?? 2;
  const thousandSeparator = settings.financial?.thousandSeparator || ',';
  const decimalSeparator = settings.financial?.decimalSeparator || '.';
  const currencySymbol = settings.financial?.currencySymbol || '৳';
  const currencyPosition = settings.financial?.currencyPosition || 'after';
  const dateFormat = settings.financial?.dateFormat || 'DD/MM/YYYY';

  // Helper function to format number with current settings
  const formatPreviewNumber = (num: number): string => {
    // Format with proper decimal places
    let formatted: string;
    if (decimalPlaces === 0) {
      formatted = Math.floor(num).toString();
    } else {
      formatted = num.toFixed(decimalPlaces);
    }
    
    // Add thousand separators
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    
    // Use decimal separator
    if (parts.length > 1 && decimalPlaces > 0) {
      return parts[0] + decimalSeparator + parts[1];
    }
    return parts[0];
  };

  // Format currency preview
  const getCurrencyPreview = (): string => {
    const numberPart = formatPreviewNumber(1234567);
    if (currencyPosition === 'before') {
      return `${currencySymbol}${numberPart}`;
    }
    return `${numberPart} ${currencySymbol}`;
  };

  // Format date preview
  const getDatePreview = (): string => {
    const day = '01';
    const month = '04';
    const year = '2026';
    const monthName = 'Apr';
    
    switch (dateFormat) {
      case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
      case 'DD-MMM-YYYY': return `${day}-${monthName}-${year}`;
      default: return `${day}/${month}/${year}`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Financial Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure currency, fiscal year, and financial preferences
        </p>
      </div>

      <div className="p-6">
        {/* Fiscal Year Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-indigo-600">📅</span> Somity Start Date
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="flex gap-3">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={selectedMonth}
                  onChange={(e) => updateFiscalYear(e.target.value, selectedYear)}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.fullName} ({month.name})
                    </option>
                  ))}
                </select>
                <select
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={selectedYear}
                  onChange={(e) => updateFiscalYear(selectedMonth, parseInt(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When did your Somity start its operations?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Date
              </label>
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-700 font-medium">
                  {currentDateDisplay}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Automatically detected from system date</p>
            </div>
          </div>

          {/* Somity Timeline Summary */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
            <h4 className="text-sm font-semibold text-indigo-800 mb-4 flex items-center gap-2">
              <span>📘</span> Somity Timeline
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Start Date:</span>{' '}
                  <strong className="text-indigo-700">{startDateDisplay}</strong>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Current Date:</span>{' '}
                  <strong className="text-green-700">{currentDateDisplay}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Total Months Completed:</span>{' '}
                  <strong className="text-blue-700 text-xl">{totalMonths}</strong>
                  <span className="text-gray-500 text-xs ml-1">months</span>
                </p>
                <p className="text-xs text-gray-500">
                  Formula: DATEDIF(Start, Current, "M") + 1 (including current month)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Number Format Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-600">💰</span> Currency & Number Format Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Symbol
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={currencySymbol}
                onChange={(e) => handleFinancialChange('currencySymbol', e.target.value)}
                placeholder="e.g., ৳, $, ₹"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={settings.financial?.currencyCode || 'BDT'}
                onChange={(e) => handleFinancialChange('currencyCode', e.target.value)}
                placeholder="e.g., BDT, USD, INR"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decimal Places
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={decimalPlaces}
                onChange={(e) => handleFinancialChange('decimalPlaces', parseInt(e.target.value))}
              >
                <option value="0">0 (No decimals - e.g., 1,000)</option>
                <option value="1">1 (e.g., 1,234.5)</option>
                <option value="2">2 (e.g., 1,234.56)</option>
                <option value="3">3 (e.g., 1,234.567)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {decimalPlaces === 0 ? 'No decimal places will be shown' : `${decimalPlaces} decimal place(s) will be shown`}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Position
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={currencyPosition}
                onChange={(e) => handleFinancialChange('currencyPosition', e.target.value as 'before' | 'after')}
              >
                <option value="after">After (1,000 ৳)</option>
                <option value="before">Before (৳ 1,000)</option>
              </select>
            </div>
          </div>

          {/* Separator Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thousand Separator
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={thousandSeparator}
                onChange={(e) => handleFinancialChange('thousandSeparator', e.target.value)}
              >
                <option value=",">, (Comma)</option>
                <option value=" "> (Space)</option>
                <option value="">None</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decimal Separator
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={decimalSeparator}
                onChange={(e) => handleFinancialChange('decimalSeparator', e.target.value)}
              >
                <option value=".">Dot (.)</option>
                <option value=",">Comma (,)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={dateFormat}
                onChange={(e) => handleFinancialChange('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (01/04/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (04/01/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-04-01)</option>
                <option value="DD-MMM-YYYY">DD-MMM-YYYY (01-Apr-2026)</option>
              </select>
            </div>
          </div>

          {/* Format Preview */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
            <p className="text-sm font-semibold text-gray-700 mb-4">📐 Format Preview:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                <span className="text-xs text-gray-500 block mb-1">Currency Format:</span>
                <div className="text-xl font-mono font-bold text-indigo-600">
                  {getCurrencyPreview()}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Decimal: {decimalPlaces} place(s) | Separator: {thousandSeparator === ',' ? 'Comma' : thousandSeparator === ' ' ? 'Space' : 'None'}
                </div>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                <span className="text-xs text-gray-500 block mb-1">Date Format:</span>
                <div className="text-xl font-mono font-bold text-green-600">
                  {getDatePreview()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">🔔</span> Notification Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enable Email Notifications</label>
                <p className="text-xs text-gray-500">Send email alerts for financial transactions</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.financial?.enableNotifications || false}
                onChange={(e) => handleFinancialChange('enableNotifications', e.target.checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enable SMS Notifications</label>
                <p className="text-xs text-gray-500">Send SMS alerts for financial transactions</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.financial?.enableSmsNotifications || false}
                onChange={(e) => handleFinancialChange('enableSmsNotifications', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">📋 Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Somity Start:</span>
                <span className="font-medium">{startDateDisplay}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Total Months Running:</span>
                <span className="font-medium text-blue-600">{totalMonths} months</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Current Date:</span>
                <span className="font-medium text-green-600">{currentDateDisplay}</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{currencySymbol} ({settings.financial?.currencyCode || 'BDT'})</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Email Notifications:</span>
                <span className="font-medium">{settings.financial?.enableNotifications ? '✅ Enabled' : '❌ Disabled'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">SMS Notifications:</span>
                <span className="font-medium">{settings.financial?.enableSmsNotifications ? '✅ Enabled' : '❌ Disabled'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSettings;