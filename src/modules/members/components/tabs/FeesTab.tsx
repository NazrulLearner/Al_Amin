import { CheckCircle2, Clock } from 'lucide-react';

const FeesTab = () => {
  // ডাটাবেস থেকে ডাটা ফেচ করার লজিক এখানে হবে
  const mockFees = [
    { id: 1, month: 'জানুয়ারি ২০২৪', amount: 500, date: '2024-01-05', status: 'paid' },
    { id: 2, month: 'ফেব্রুয়ারি ২০২৪', amount: 500, date: '-', status: 'pending' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-slate-400 text-sm uppercase">
            <th className="pb-4 font-medium">মাস</th>
            <th className="pb-4 font-medium">পরিমাণ</th>
            <th className="pb-4 font-medium">তারিখ</th>
            <th className="pb-4 font-medium text-right">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {mockFees.map((fee) => (
            <tr key={fee.id} className="text-slate-700">
              <td className="py-4 font-medium">{fee.month}</td>
              <td className="py-4 font-bold">৳{fee.amount}</td>
              <td className="py-4 text-sm text-slate-500">{fee.date}</td>
              <td className="py-4 text-right">
                {fee.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded text-xs"><CheckCircle2 size={12}/> পরিশোধিত</span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs"><Clock size={12}/> বকেয়া</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeesTab;