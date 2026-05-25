import React from 'react';
import { TrendingDown, Plus } from 'lucide-react';

const ExpensePage = () => {
  const expenses = [
    { category: 'Salary', amount: 30000, date: '2024-05-05', status: 'Paid' },
    { category: 'Maintenance', amount: 15000, date: '2024-05-10', status: 'Paid' },
    { category: 'Electricity Bill', amount: 5000, date: '2024-05-15', status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expense</h1>
          <p className="text-gray-500 mt-1">Track all expenses</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl">
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500">Category</th>
              <th className="px-6 py-3 text-right text-xs text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">Date</th>
              <th className="px-6 py-3 text-center text-xs text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.map((exp, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{exp.category}</td>
                <td className="px-6 py-3 text-right text-red-600 font-semibold">৳ {exp.amount}</td>
                <td className="px-6 py-3 text-gray-500">{exp.date}</td>
                <td className="px-6 py-3 text-center">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">{exp.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensePage;