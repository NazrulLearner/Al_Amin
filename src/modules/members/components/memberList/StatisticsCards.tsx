import { Users, UserCheck, UserX, TrendingUp, Info } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  totalShares 
}: StatisticsCardsProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const activePercentage = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
  const inactivePercentage = totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100) : 0;

  const cards = [
    {
      id: 'total',
      title: 'Total Members',
      value: totalMembers,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      lightGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      progressColor: 'bg-blue-500',
      percentage: 100,
      detail: `${totalMembers} total`,
      subtext: 'All registered members'
    },
    {
      id: 'active',
      title: 'Active Members',
      value: activeMembers,
      icon: UserCheck,
      gradient: 'from-green-500 to-green-600',
      lightGradient: 'from-green-50 to-green-100',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100',
      progressColor: 'bg-green-500',
      percentage: activePercentage,
      detail: `${activePercentage}% of total`,
      subtext: `${totalMembers - activeMembers} inactive`
    },
    {
      id: 'inactive',
      title: 'Inactive Members',
      value: inactiveMembers,
      icon: UserX,
      gradient: 'from-gray-500 to-gray-600',
      lightGradient: 'from-gray-50 to-gray-100',
      textColor: 'text-gray-600',
      iconBg: 'bg-gray-100',
      progressColor: 'bg-gray-500',
      percentage: inactivePercentage,
      detail: `${inactivePercentage}% of total`,
      subtext: 'Currently not active'
    },
    {
      id: 'shares',
      title: 'Total Shares',
      value: totalShares,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      lightGradient: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      progressColor: 'bg-purple-500',
      percentage: 100,
      detail: `${totalShares} shares`,
      subtext: `Avg ${totalMembers > 0 ? Math.round(totalShares / totalMembers) : 0} per member`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isHovered = hoveredCard === card.id;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Main Card */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 cursor-default relative overflow-hidden group"
            >
              {/* Background Gradient Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.lightGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`p-3 rounded-xl ${card.iconBg} shadow-sm`}
                  >
                    <Icon size={22} className={card.textColor} />
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: card.id === 'shares' 
                          ? '100%' 
                          : `${Math.min(card.percentage, 100)}%` 
                      }}
                      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                      className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${card.gradient}`}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {card.id === 'shares' ? 'Total shares' : `${card.percentage}% of total`}
                    </span>
                    
                    {/* Hover Info - Desktop */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="hidden md:flex items-center space-x-1 text-xs"
                        >
                          <Info size={12} className="text-gray-400" />
                          <span className="font-medium text-gray-700">{card.subtext}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mobile Info */}
                    <span className="md:hidden text-xs font-medium text-gray-600">
                      {card.subtext}
                    </span>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.gradient} opacity-5 rounded-bl-full`} />
                <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${card.gradient} opacity-5 rounded-tr-full`} />
              </div>
            </motion.div>

            {/* Detailed Tooltip Card - On Hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:block absolute -bottom-24 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20"
                >
                  {/* Triangle Pointer */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                        <Icon size={14} className={card.textColor} />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{card.title}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Count</span>
                        <p className="font-bold text-gray-900">{card.value}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Percentage</span>
                        <p className="font-bold text-gray-900">{card.percentage}%</p>
                      </div>
                    </div>

                    {card.id !== 'shares' && (
                      <>
                        <div className="h-px bg-gray-100" />
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Active</span>
                            <span className="text-xs font-semibold text-green-600">{activePercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${activePercentage}%` }}
                              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">Inactive</span>
                            <span className="text-xs font-semibold text-gray-600">{inactivePercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${inactivePercentage}%` }}
                              className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {card.id === 'shares' && (
                      <div className="text-xs text-gray-600">
                        Average {totalMembers > 0 ? Math.round(totalShares / totalMembers) : 0} shares per member
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatisticsCards;