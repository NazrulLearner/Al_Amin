// src/shared/export/PDFExport.tsx

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import PrintLayout from './PrintLayout';

interface PDFExportProps {
  data: any[];
  filename?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PDFExport: React.FC<PDFExportProps> = ({ 
  data, 
  title = 'Report',
  subtitle,
  children 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderContent = () => {
    if (children) return children;

    const totalAmount = data.reduce((sum, item) => {
      const amount = item['মোট পরিমাণ'] || item['amount'] || item['পরিমাণ'] || 0;
      return sum + (typeof amount === 'number' ? amount : 0);
    }, 0);

    return (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{data.length}</div>
            <div className="text-sm text-gray-600">মোট রেকর্ড</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">৳{totalAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">মোট পরিমাণ</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{new Date().toLocaleDateString('bn-BD')}</div>
            <div className="text-sm text-gray-600">তারিখ</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">আল-আমিন সমিতি</div>
            <div className="text-sm text-gray-600">প্রতিষ্ঠান</div>
          </div>
        </div>

        {/* Data Table */}
        {data.length > 0 && (
          <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {Object.keys(data[0]).map((key, idx) => (
                  <th key={idx} style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {Object.values(row).map((val: any, colIdx) => (
                    <td key={colIdx} style={{ border: '1px solid #d1d5db', padding: '6px 12px', fontSize: '11px' }}>
                      {typeof val === 'number' ? `৳${val.toLocaleString()}` : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Signature Section */}
        <div className="signature-section" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          <div className="signature-item" style={{ textAlign: 'center', width: '180px' }}>
            <div className="signature-line" style={{ borderTop: '1px solid #999', marginTop: '50px', paddingTop: '8px', fontSize: '10px' }}>
              প্রস্তুতকারীর স্বাক্ষর
            </div>
          </div>
          <div className="signature-item" style={{ textAlign: 'center', width: '180px' }}>
            <div className="signature-line" style={{ borderTop: '1px solid #999', marginTop: '50px', paddingTop: '8px', fontSize: '10px' }}>
              যাচাইকারীর স্বাক্ষর
            </div>
          </div>
          <div className="signature-item" style={{ textAlign: 'center', width: '180px' }}>
            <div className="signature-line" style={{ borderTop: '1px solid #999', marginTop: '50px', paddingTop: '8px', fontSize: '10px' }}>
              অনুমোদনকারীর স্বাক্ষর
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
      >
        <FileText className="h-4 w-4 text-red-600" />
        <span>PDF Export</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
            <PrintLayout
              title={title}
              subtitle={subtitle || `মোট ${data.length} টি রেকর্ড`}
              onClose={() => setIsModalOpen(false)}
              showPrintButton={true}
              showCloseButton={true}
            >
              {renderContent()}
            </PrintLayout>
          </div>
        </div>
      )}
    </>
  );
};

export default PDFExport;