import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

const FinancialReports = () => {
  const reports = [
    { name: 'Monthly Report - May 2024', date: '2024-05-31', size: '2.4 MB' },
    { name: 'Quarterly Report - Q1 2024', date: '2024-03-31', size: '5.1 MB' },
    { name: 'Annual Report - 2023', date: '2023-12-31', size: '8.7 MB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
          <p className="text-gray-500 mt-1">Download monthly and annual reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl">
          <Calendar size={18} />
          Generate Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {reports.map((report, i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <FileText className="text-emerald-600" size={20} />
              <div>
                <p className="font-medium">{report.name}</p>
                <p className="text-xs text-gray-400">{report.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{report.size}</span>
              <button className="text-emerald-600 hover:text-emerald-700">
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialReports;