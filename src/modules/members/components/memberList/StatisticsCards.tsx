import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';

interface StatisticsCardsProps {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalShares: number;
}

const StatisticsCards = ({
  totalMembers,
  activeMembers,
  inactiveMembers,
  totalShares,
}: StatisticsCardsProps) => {
  const activePercentage = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
  const inactivePercentage = totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100) : 0;

  const cards = [
    {
      id: 'total',
      title: 'Total Members',
      value: totalMembers,
      Icon: Users,
      color: 'blue',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      pct: 100,
      sub: `${totalMembers} total`,
    },
    {
      id: 'active',
      title: 'Active Members',
      value: activeMembers,
      Icon: UserCheck,
      color: 'green',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100',
      pct: activePercentage,
      sub: `${activePercentage}% of total · ${totalMembers - activeMembers} inactive`,
    },
    {
      id: 'inactive',
      title: 'Inactive Members',
      value: inactiveMembers,
      Icon: UserX,
      color: 'gray',
      bgLight: 'bg-gray-50',
      textColor: 'text-gray-600',
      iconBg: 'bg-gray-100',
      pct: inactivePercentage,
      sub: `${inactivePercentage}% of total`,
    },
    {
      id: 'shares',
      title: 'Total Shares',
      value: totalShares,
      Icon: TrendingUp,
      color: 'purple',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      pct: 100,
      sub: `Avg ${totalMembers > 0 ? Math.round(totalShares / totalMembers) : 0} per member`,
    },
  ];

  const barColor: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 cursor-default relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-medium text-gray-500 truncate">{card.title}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {card.value.toLocaleString()}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${card.iconBg} flex-shrink-0 ml-2`}>
              <card.Icon size={18} className={card.textColor} />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full ${barColor[card.color]}`}
                style={{ width: `${Math.min(card.pct, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 truncate">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
