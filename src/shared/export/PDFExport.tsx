// src/shared/export/PDFExport.tsx

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import type { FeeTransaction } from '../../types';
import PrintLayout from './PrintLayout';

interface PDFExportProps {
  data: FeeTransaction[];
  filename?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PDFExport: React.FC<PDFExportProps> = ({ 
  data, 
  title = 'Fee Transactions Report',
  subtitle,
  children 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalAmount = data.reduce((sum, t) => sum + (t.feeAmount || 0), 0);

  const renderContent = () => {
    if (children) {
      return children;
    }

    return (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{data.length}</div>
            <div className="text-sm text-blue-600">মোট লেনদেন</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">৳{totalAmount.toLocaleString()}</div>
            <div className="text-sm text-green-600">মোট পরিমাণ</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">
              {new Set(data.map(t => t.memberId)).size}
            </div>
            <div className="text-sm text-purple-600">সদস্য সংখ্যা</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-700">
              {new Date().toLocaleDateString('bn-BD')}
            </div>
            <div className="text-sm text-orange-600">তারিখ</div>
          </div>
        </div>

        {/* Transactions Table */}
        <table className="print-table">
          <thead>
            <tr>
              <th>ক্রমিক</th>
              <th>রসিদ নং</th>
              <th>সদস্যের নাম</th>
              <th>সদস্য আইডি</th>
              <th>পরিমাণ</th>
              <th>তারিখ</th>
              <th>পদ্ধতি</th>
            </tr>
          </thead>
          <tbody>
            {data.map((transaction, index) => (
              <tr key={transaction.id}>
                <td>{index + 1}</td>
                <td>{transaction.receiptId}</td>
                <td>{transaction.memberName}</td>
                <td>{transaction.memberId}</td>
                <td style={{ textAlign: 'right' }}>৳{transaction.feeAmount.toLocaleString()}</td>
                <td>{new Date(transaction.createdAt).toLocaleDateString('bn-BD')}</td>
                <td>
                  <span className="capitalize">{transaction.payType}</span>
                </td>
               </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f0fdf4', fontWeight: 'bold' }}>
              <td colSpan={4} style={{ textAlign: 'right' }}>সর্বমোট:</td>
              <td style={{ textAlign: 'right' }}>৳{totalAmount.toLocaleString()}</td>
              <td colSpan={2}></td>
             </tr>
          </tfoot>
        </table>

        {/* Signature Section */}
        <div className="signature-section">
          <div className="signature-item">
            <div className="signature-line">প্রস্তুতকারীর স্বাক্ষর</div>
          </div>
          <div className="signature-item">
            <div className="signature-line">যাচাইকারীর স্বাক্ষর</div>
          </div>
          <div className="signature-item">
            <div className="signature-line">অনুমোদনকারীর স্বাক্ষর</div>
          </div>
        </div>
      </>
    );
  };

  if (data.length === 0) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
      >
        <FileText className="h-4 w-4" />
        Export PDF
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
      >
        <FileText className="h-4 w-4" />
        Export PDF
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
            <PrintLayout
              title={title}
              subtitle={subtitle || `${data.length} টি লেনদেন, মোট পরিমাণ ৳${totalAmount.toLocaleString()}`}
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