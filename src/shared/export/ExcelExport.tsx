// src/components/Export/Excel.tsx - COMPLETE PROFESSIONAL VERSION
import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import type { FeeTransaction } from '../../types';

interface ExcelExportProps {
  data: FeeTransaction[];
  filename?: string;
}

const ExcelExport: React.FC<ExcelExportProps> = ({ data, filename = 'transactions' }) => {
  const exportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = data.map((transaction, index) => ({
        'SL No': index + 1,
        'Receipt ID': transaction.receiptId,
        'Member ID': transaction.memberId,
        'Member Name': transaction.memberName,
        'Amount': transaction.feeAmount,
        'Payment Date': new Date(transaction.paymentDate).toLocaleDateString('en-GB'),
        'Payment Time': new Date(transaction.paymentDate).toLocaleTimeString('en-GB'),
        'Fee Type': transaction.feeType,
        'Payment Type': transaction.payType,
        'Status': transaction.status,
        'Months Paid': transaction.monthsPaid || 1,
        'Payment Period': transaction.paymentPeriod || 'N/A',
        'Reference No': transaction.referenceNo || 'N/A',
        'Receiver': transaction.receiver,
        'Entered By': transaction.enteredBy,
        'Remarks': transaction.remarks || 'N/A'
      }));

      // Create CSV content
      const headers = Object.keys(excelData[0] || {}).join(',');
      const rows = excelData.map(row => 
        Object.values(row).map(value => 
          `"${String(value).replace(/"/g, '""')}"`
        ).join(',')
      ).join('\n');

      const csvContent = `${headers}\n${rows}`;
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Excel/CSV exported: ${data.length} records`);
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  if (data.length === 0) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
        title="No data to export"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </button>
    );
  }

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
      title="Export to Excel/CSV"
    >
      <FileSpreadsheet className="h-4 w-4" />
      Export Excel
    </button>
  );
};

export default ExcelExport;