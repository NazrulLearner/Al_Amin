import React from 'react';
import { Building2, Plus, Eye } from 'lucide-react';

const BankAccounts = () => {
  const banks = [
    { name: 'Islami Bank', account: '****1234', balance: 250000, branch: 'Motijheel' },
    { name: 'DBBL', account: '****5678', balance: 180000, branch: 'Uttara' },
    { name: 'City Bank', account: '****9012', balance: 120000, branch: 'Gulshan' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bank Accounts</h1>
          <p className="text-gray-500 mt-1">Manage all bank accounts and balances</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl">
          <Plus size={18} />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {banks.map((bank, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">{bank.name}</h3>
                <p className="text-xs text-gray-400">{bank.branch}</p>
              </div>
            </div>
            <p className="text-2xl font-bold">৳ {bank.balance.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Account: {bank.account}</p>
            <button className="mt-3 text-emerald-600 text-sm flex items-center gap-1">
              <Eye size={14} /> View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BankAccounts;