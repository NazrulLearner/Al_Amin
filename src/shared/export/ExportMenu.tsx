// src/shared/export/ExportMenu.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import PDFExport from './PDFExport';
import ExcelExport from './ExcelExport';

interface ExportMenuProps {
  data: any[];
  title?: string;
  subtitle?: string;
  filename?: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ 
  data, 
  title = 'Report', 
  subtitle, 
  filename = 'report' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const totalAmount = data.reduce((sum, item) => {
    const amount = item['মোট পরিমাণ'] || item['amount'] || 0;
    return sum + (typeof amount === 'number' ? amount : 0);
  }, 0);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h3 className="font-bold text-gray-900">Export Reports</h3>
            <p className="text-xs text-gray-500">{data.length} records • ৳{totalAmount.toLocaleString()}</p>
          </div>
          
          <div className="p-2 space-y-1">
            <PDFExport 
              data={data} 
              filename={filename}
              title={title}
              subtitle={subtitle}
            />
            <ExcelExport data={data} filename={filename} />
          </div>

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl text-center text-xs text-gray-400">
            Al-Amin Somity
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;