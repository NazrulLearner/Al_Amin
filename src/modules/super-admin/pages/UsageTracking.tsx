// src/pages/super-admin/UsageTracking.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';

interface SomityUsage {
  somityName: string;
  totalMembers: number;
  totalLoans: number;
  totalFees: number;
  totalReads: number;
  totalWrites: number;
  totalCost: number;
}

const UsageTracking: React.FC = () => {
  const [somityUsage, setSomityUsage] = useState<SomityUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    setLoading(true);
    try {
      const [membersSnap, loansSnap, feesSnap, settingsSnap] = await Promise.all([
        getDocs(collection(db, 'members')),
        getDocs(collection(db, 'loans')),
        getDocs(collection(db, 'contributions')),
        getDocs(collection(db, 'somity_settings')),
      ]);

      const settingsData = settingsSnap.docs[0]?.data();
      const totalReads = membersSnap.size + loansSnap.size + feesSnap.size + settingsSnap.size;
      const totalWrites = Math.floor(totalReads * 0.2);
      const readCost = totalReads * 0.00003;
      const writeCost = totalWrites * 0.00018;
      const total = readCost + writeCost;

      setSomityUsage({
        somityName: settingsData?.general?.somityName || 'Somity',
        totalMembers: membersSnap.size,
        totalLoans: loansSnap.size,
        totalFees: feesSnap.size,
        totalReads,
        totalWrites,
        totalCost: total,
      });
      setTotalCost(total);
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalReads = somityUsage?.totalReads || 0;
  const totalWrites = somityUsage?.totalWrites || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Firebase Usage Tracking</h1>
      
      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Somity</p>
          <p className="text-2xl font-bold">{somityUsage ? 1 : 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Reads</p>
          <p className="text-2xl font-bold">{totalReads.toLocaleString()}</p>
          <p className="text-sm text-green-600">≈ ${(totalReads * 0.00003).toFixed(4)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Writes</p>
          <p className="text-2xl font-bold">{totalWrites.toLocaleString()}</p>
          <p className="text-sm text-yellow-600">≈ ${(totalWrites * 0.00018).toFixed(4)}</p>
        </div>
        <div className="rounded-lg shadow p-6 bg-blue-50">
          <p className="text-sm text-gray-500">Estimated Total Cost</p>
          <p className="text-2xl font-bold text-blue-600">${totalCost.toFixed(4)}</p>
          <p className="text-sm text-gray-500">≈ ৳{(totalCost * 110).toFixed(2)}</p>
        </div>
      </div>
      
      {/* Somity Usage Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Somity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loans</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Writes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {somityUsage && (
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium">{somityUsage.somityName}</div>
                  <div className="text-sm text-gray-500">Root collections</div>
                </td>
                <td className="px-6 py-4">{somityUsage.totalMembers}</td>
                <td className="px-6 py-4">{somityUsage.totalLoans}</td>
                <td className="px-6 py-4">{somityUsage.totalFees}</td>
                <td className="px-6 py-4">{somityUsage.totalReads.toLocaleString()}</td>
                <td className="px-6 py-4">{somityUsage.totalWrites.toLocaleString()}</td>
                <td className="px-6 py-4 font-medium">${somityUsage.totalCost.toFixed(4)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {!somityUsage && (
        <div className="text-center py-8 text-gray-500">
          No somity usage found
        </div>
      )}
    </div>
  );
};

export default UsageTracking;
