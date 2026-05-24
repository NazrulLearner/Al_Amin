import React from 'react';
import type { InvestmentTransaction } from '../../types/investmentTransaction.types';

interface InvestmentTransactionListProps {
  transactions: InvestmentTransaction[];
  loading?: boolean;
}

const InvestmentTransactionList: React.FC<InvestmentTransactionListProps> = ({ 
  transactions, 
  loading 
}) => {
  if (loading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        কোনো লেনদেন পাওয়া যায়নি
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'deposit': return 'জমা';
      case 'profit': return 'মুনাফা';
      case 'withdrawal': return 'উত্তোলন';
      case 'penalty': return 'জরিমানা';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'deposit': return 'text-green-600';
      case 'profit': return 'text-blue-600';
      case 'withdrawal': return 'text-red-600';
      case 'penalty': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ধরন</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">বিবরণ</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map(txn => (
            <tr key={txn.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-600">
                {txn.date.toLocaleDateString('bn-BD')}
              </td>
              <td className={`px-4 py-3 text-sm font-medium ${getTypeColor(txn.type)}`}>
                {getTypeLabel(txn.type)}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                ৳ {txn.amount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{txn.description}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                  txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {txn.status === 'completed' ? 'সম্পন্ন' : txn.status === 'pending' ? ' pending' : 'ব্যর্থ'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvestmentTransactionList;