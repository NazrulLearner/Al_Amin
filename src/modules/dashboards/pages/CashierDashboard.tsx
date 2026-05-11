import React from "react";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";

const CashierDashboard: React.FC = () => {
  // 🔹 dummy data (replace later with Firestore data)
  const summary = {
    cashIn: 25400,
    cashOut: 12800,
    bankDeposit: 8000,
    heldBalance: 4600,
  };

  const recentTransactions = [
    { id: 1, type: "Cash In", member: "Rahim", amount: 1200, date: "2025-10-14" },
    { id: 2, type: "Cash Out", member: "Bank Deposit", amount: 3000, date: "2025-10-13" },
    { id: 3, type: "Cash In", member: "Karim", amount: 500, date: "2025-10-13" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">💵 Cashier Dashboard</h1>
      <p className="text-gray-500">Your current financial summary and recent transactions</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md border-l-4 border-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Cash In</p>
            <h2 className="text-xl font-bold text-green-600">{summary.cashIn.toLocaleString()}৳</h2>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-red-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Cash Out</p>
            <h2 className="text-xl font-bold text-red-600">{summary.cashOut.toLocaleString()}৳</h2>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-blue-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Bank Deposit</p>
            <h2 className="text-xl font-bold text-blue-600">{summary.bankDeposit.toLocaleString()}৳</h2>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Held Balance</p>
            <h2 className="text-xl font-bold text-yellow-600">{summary.heldBalance.toLocaleString()}৳</h2>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <ArrowUpCircle size={18} /> Cash In
        </Button>
        <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
          <ArrowDownCircle size={18} /> Cash Out
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <RefreshCcw size={18} /> Transfer
        </Button>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Member / To</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, i) => (
                <tr key={tx.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{tx.type}</td>
                  <td className="px-4 py-2">{tx.member}</td>
                  <td className="px-4 py-2 font-semibold">{tx.amount.toLocaleString()}৳</td>
                  <td className="px-4 py-2 text-gray-500">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
