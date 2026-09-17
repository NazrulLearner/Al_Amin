// src/shared/export/ExcelExport.tsx

import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

interface ExcelExportProps {
  data: any[];
  filename?: string;
  title?: string;
}

const ExcelExport: React.FC<ExcelExportProps> = ({ data, filename = 'report', title }) => {
  const exportToExcel = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Prepare CSV content
      const headers = Object.keys(data[0]);
      const csvRows = [];
      
      // Add headers
      csvRows.push(headers.join(','));
      
      // Add data rows
      for (const row of data) {
        const values = headers.map(header => {
          let value = row[header];
          if (value === undefined || value === null) value = '';
          if (typeof value === 'string') {
            value = value.replace(/"/g, '""');
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              value = `"${value}"`;
            }
          }
          if (typeof value === 'number') {
            value = value.toString();
          }
          return value;
        });
        csvRows.push(values.join(','));
      }
      
      // Create download
      const csvContent = csvRows.join('\n');
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Exported ${data.length} records`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
    >
      <FileSpreadsheet className="h-4 w-4 text-green-600" />
      <span>Excel (CSV) Export</span>
    </button>
  );
};

export default ExcelExport;