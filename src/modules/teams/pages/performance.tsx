import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Download,
  Activity
} from 'lucide-react';

// Mock performance data
const performanceData = {
  overallScore: 86,
  teams: [
    {
      id: 'T001',
      name: 'Core Management Team',
      type: 'core',
      performance: 92,
      trend: 'up',
      members: 4,
      completedTasks: 45,
      pendingTasks: 3,
      kpis: [
        { name: 'Meeting Attendance', target: 85, current: 92, unit: '%' },
        { name: 'Decision Implementation', target: 90, current: 88, unit: '%' },
        { name: 'Member Satisfaction', target: 85, current: 90, unit: '%' }
      ],
      achievements: [
        'Annual budget 100% approved',
        '25 new members enrolled',
        '95% meeting attendance',
        '10 emergency decisions implemented'
      ],
      membersPerformance: [
        { name: 'নাজরুল ইসলাম', role: 'President', efficiency: 95, tasksCompleted: 12 },
        { name: 'রহিম উদ্দিন', role: 'Vice President', efficiency: 88, tasksCompleted: 8 },
        { name: 'করিম আহমেদ', role: 'Secretary', efficiency: 90, tasksCompleted: 15 },
        { name: 'আয়েশা বেগম', role: 'Treasurer', efficiency: 85, tasksCompleted: 10 }
      ]
    },
    {
      id: 'T002',
      name: 'Finance Team',
      type: 'finance',
      performance: 84,
      trend: 'up',
      members: 3,
      completedTasks: 38,
      pendingTasks: 5,
      kpis: [
        { name: 'Accounting Accuracy', target: 99, current: 98.5, unit: '%' },
        { name: 'Report Timeliness', target: 100, current: 95, unit: '%' },
        { name: 'Cash Balance Zero', target: 0, current: 0, unit: 'times' }
      ],
      achievements: [
        'Monthly reports 100% on time',
        'Zero accounting errors',
        'Bank reconciliation perfect',
        'Cash flow optimized'
      ],
      membersPerformance: [
        { name: 'সজিব রহমান', role: 'Finance Lead', efficiency: 90, tasksCompleted: 15 },
        { name: 'ফাতেমা খাতুন', role: 'Accountant 1', efficiency: 85, tasksCompleted: 12 },
        { name: 'রোকেয়া বেগম', role: 'Accountant 2', efficiency: 80, tasksCompleted: 11 }
      ]
    },
    {
      id: 'T003',
      name: 'Loan Management Team',
      type: 'loan',
      performance: 82,
      trend: 'stable',
      members: 3,
      completedTasks: 42,
      pendingTasks: 4,
      kpis: [
        { name: 'Loan Processing Time', target: 3, current: 2.5, unit: 'days' },
        { name: 'Default Rate', target: 5, current: 3.2, unit: '%' },
        { name: 'Recovery Rate', target: 95, current: 96.8, unit: '%' }
      ],
      achievements: [
        'Loan processing time reduced',
        'Default rate below target',
        'High recovery rate',
        'Member satisfaction improved'
      ],
      membersPerformance: [
        { name: 'জaved করিম', role: 'Loan Coordinator', efficiency: 88, tasksCompleted: 18 },
        { name: 'নুসরাত জাহান', role: 'Loan Verifier', efficiency: 85, tasksCompleted: 14 },
        { name: 'ইমরান হোসেন', role: 'Loan Approver', efficiency: 80, tasksCompleted: 10 }
      ]
    }
  ],
  monthlyTrend: [
    { month: 'Jan', performance: 78 },
    { month: 'Feb', performance: 82 },
    { month: 'Mar', performance: 85 },
    { month: 'Apr', performance: 83 },
    { month: 'May', performance: 86 },
    { month: 'Jun', performance: 86 }
  ]
};

export default function TeamPerformance() {
  const [selectedTeam, setSelectedTeam] = useState(performanceData.teams[0]);
  const [timeRange, setTimeRange] = useState('last6months');
  const [viewType, setViewType] = useState('overview');

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-600" />;
    if (trend === 'down') return <TrendingUp size={16} className="text-red-600 rotate-180" />;
    return <Activity size={16} className="text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Team Performance</h1>
              <p className="text-gray-600 mt-1">Track and analyze team performance metrics</p>
            </div>
            
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="lastmonth">Last Month</option>
                <option value="last3months">Last 3 Months</option>
                <option value="last6months">Last 6 Months</option>
                <option value="lastyear">Last Year</option>
              </select>
              
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="overview">Overview</option>
                <option value="detailed">Detailed View</option>
                <option value="comparative">Comparative</option>
              </select>
              
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Overall Performance Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Overall Performance</p>
                  <p className="text-3xl font-bold mt-2">{performanceData.overallScore}%</p>
                  <p className="text-green-100 text-sm mt-1">Excellent</p>
                </div>
                <TrendingUp size={32} className="text-green-200" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Teams</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{performanceData.teams.length}</p>
                </div>
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {performanceData.teams.reduce((sum, team) => sum + team.members, 0)}
                  </p>
                </div>
                <Users size={24} className="text-green-600" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {performanceData.teams.reduce((sum, team) => sum + team.completedTasks, 0)}
                  </p>
                </div>
                <Target size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teams List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Teams</h3>
              <div className="space-y-3">
                {performanceData.teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedTeam.id === team.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{team.name}</span>
                      {getTrendIcon(team.trend)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(team.performance)}`}>
                        {team.performance}%
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Users size={14} />
                        {team.members}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Performance Dashboard */}
          <div className="lg:col-span-3">
            {/* Selected Team Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTeam.name}</h2>
                  <p className="text-gray-600 mt-1">Performance overview and metrics</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(selectedTeam.performance)}`}>
                    {getTrendIcon(selectedTeam.trend)}
                    Overall Score: {selectedTeam.performance}%
                  </div>
                </div>
              </div>

              {/* KPIs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {selectedTeam.kpis.map((kpi, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{kpi.name}</span>
                      <span className="text-sm text-gray-500">Target: {kpi.target}{kpi.unit}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {kpi.current}{kpi.unit}
                      </span>
                      <div className={`text-sm font-medium ${
                        kpi.current >= kpi.target ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.current >= kpi.target ? '✓ Achieved' : '⚠ Needs improvement'}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tasks Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Tasks Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completed Tasks</span>
                      <span className="font-semibold text-green-600">{selectedTeam.completedTasks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending Tasks</span>
                      <span className="font-semibold text-yellow-600">{selectedTeam.pendingTasks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-blue-600">
                        {Math.round((selectedTeam.completedTasks / (selectedTeam.completedTasks + selectedTeam.pendingTasks)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Recent Achievements</h4>
                  <div className="space-y-2">
                    {selectedTeam.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Award size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Team Members Performance</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Efficiency
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tasks Completed
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedTeam.membersPerformance.map((member, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{member.name}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {member.role}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${member.efficiency}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{member.efficiency}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {member.tasksCompleted}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.efficiency >= 90
                              ? 'bg-green-100 text-green-800'
                              : member.efficiency >= 80
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {member.efficiency >= 90 ? 'Excellent' : member.efficiency >= 80 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Trend Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Trend</h3>
              <div className="flex items-end gap-2 h-32">
                {performanceData.monthlyTrend.map((month) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all hover:from-green-600 hover:to-green-400"
                      style={{ height: `${(month.performance / 100) * 80}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{month.month}</span>
                    <span className="text-xs font-medium text-gray-900">{month.performance}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}