// src/shared/export/ExportMenu.tsx

import React, { useState, useRef } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import type { FeeTransaction } from '../../types';
import PDFExport from './PDFExport';
import ExcelExport from './ExcelExport';

interface ExportMenuProps {
  data: FeeTransaction[];
  title?: string;
  subtitle?: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ data, title = 'Fee Transactions Report', subtitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAmount = data.reduce((sum, t) => sum + (t.feeAmount || 0), 0);

  if (data.length === 0) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        Export
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <h3 className="font-bold text-gray-900">Export Reports</h3>
            <p className="text-sm text-gray-600">{data.length} records • ৳{totalAmount.toLocaleString()}</p>
          </div>
          
          <div className="p-2">
            <PDFExport 
              data={data} 
              filename="fee_transactions"
              title={title}
              subtitle={subtitle}
            />
            
            <div className="mt-2">
              <ExcelExport data={data} filename="fee_transactions" />
            </div>
          </div>

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl text-center text-xs text-gray-500">
            Al-Amin Somity - Fee Management System
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;