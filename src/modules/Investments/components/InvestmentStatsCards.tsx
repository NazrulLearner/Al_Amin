import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

interface InvestmentStatsCardsProps {
  stats: {
    totalAmount: number;
    totalInvestments: number;
    totalExpectedProfit: number;
    activeCount: number;
    maturedCount: number;
  };
  loading?: boolean;
}

const InvestmentStatsCards: React.FC<InvestmentStatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="মোট বিনিয়োগ"
        value={`৳ ${stats.totalAmount.toLocaleString()}`}
        icon="💰"
        color="border-blue-600"
        subtitle={`${stats.totalInvestments} টি প্রকল্প`}
      />
      <StatsCard
        title="প্রত্যাশিত মুনাফা"
        value={`৳ ${stats.totalExpectedProfit.toLocaleString()}`}
        icon="📈"
        color="border-green-600"
      />
      <StatsCard
        title="সক্রিয় বিনিয়োগ"
        value={`${stats.activeCount} টি`}
        icon="🟢"
        color="border-yellow-600"
      />
      <StatsCard
        title="পরিপক্ক বিনিয়োগ"
        value={`${stats.maturedCount} টি`}
        icon="🔵"
        color="border-purple-600"
      />
    </div>
  );
};

export default InvestmentStatsCards;