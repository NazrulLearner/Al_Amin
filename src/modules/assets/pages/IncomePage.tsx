import React from 'react';
import { TrendingUp, Plus, Calendar } from 'lucide-react';

const IncomePage = () => {
  const incomes = [
    { source: 'Monthly Fee', amount: 50000, date: '2024-05-01', status: 'Received' },
    { source: 'Loan Interest', amount: 12500, date: '2024-05-05', status: 'Received' },
    { source: 'Donation', amount: 25000, date: '2024-05-10', status: 'Received' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Income</h1>
          <p className="text-gray-500 mt-1">Track all income sources</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl">
          <Plus size={18} />
          Add Income
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500">Source</th>
              <th className="px-6 py-3 text-right text-xs text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">Date</th>
              <th className="px-6 py-3 text-center text-xs text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {incomes.map((inc, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{inc.source}</td>
                <td className="px-6 py-3 text-right text-green-600 font-semibold">৳ {inc.amount}</td>
                <td className="px-6 py-3 text-gray-500">{inc.date}</td>
                <td className="px-6 py-3 text-center">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{inc.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomePage;