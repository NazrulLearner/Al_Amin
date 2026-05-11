import { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Download, 
  Search,
  Users,
  Plus,
  Award,
  TrendingUp,
  Clock,
  UserPlus,
  UserMinus,
  Settings,
  FileText
} from 'lucide-react';

// Mock team history data
const teamHistoryData = {
  teams: [
    {
      id: 'T001',
      name: 'Core Management Team',
      type: 'core',
      status: 'active',
      formationDate: '2024-01-15',
      totalMembers: 4,
      history: [
        {
          id: 'H001',
          type: 'team_created',
          title: 'Team Created',
          description: 'Core Management Team was formed',
          date: '2024-01-15',
          user: 'System Admin',
          changes: [
            { field: 'Team Type', oldValue: '', newValue: 'Core Management' },
            { field: 'Initial Members', oldValue: '', newValue: '4 members' }
          ]
        },
        {
          id: 'H002',
          type: 'member_added',
          title: 'Member Added',
          description: 'নাজরুল ইসলাম joined as President',
          date: '2024-01-16',
          user: 'System Admin',
          changes: [
            { field: 'Role', oldValue: 'Vacant', newValue: 'President' },
            { field: 'Member', oldValue: '', newValue: 'নাজরুল ইসলাম' }
          ]
        },
        {
          id: 'H003',
          type: 'member_added',
          title: 'Member Added',
          description: 'রহিম উদ্দিন joined as Vice President',
          date: '2024-01-16',
          user: 'System Admin',
          changes: [
            { field: 'Role', oldValue: 'Vacant', newValue: 'Vice President' },
            { field: 'Member', oldValue: '', newValue: 'রহিম উদ্দিন' }
          ]
        },
        {
          id: 'H004',
          type: 'responsibility_updated',
          title: 'Responsibilities Updated',
          description: 'Added budget approval responsibility',
          date: '2024-01-20',
          user: 'নাজরুল ইসলাম',
          changes: [
            { field: 'Responsibilities', oldValue: '12 items', newValue: '13 items' }
          ]
        },
        {
          id: 'H005',
          type: 'performance_achievement',
          title: 'Performance Milestone',
          description: 'Achieved 90% overall performance score',
          date: '2024-02-15',
          user: 'System',
          changes: [
            { field: 'Performance Score', oldValue: '85%', newValue: '90%' }
          ]
        },
        {
          id: 'H006',
          type: 'member_removed',
          title: 'Member Removed',
          description: 'Previous Secretary was removed',
          date: '2024-02-20',
          user: 'নাজরুল ইসলাম',
          changes: [
            { field: 'Secretary Role', oldValue: 'আসিফ আহমেদ', newValue: 'Vacant' }
          ]
        },
        {
          id: 'H007',
          type: 'member_added',
          title: 'Member Added',
          description: 'করিম আহমেদ appointed as new Secretary',
          date: '2024-02-21',
          user: 'নাজরুল ইসলাম',
          changes: [
            { field: 'Secretary Role', oldValue: 'Vacant', newValue: 'করিম আহমেদ' }
          ]
        }
      ]
    },
    {
      id: 'T002',
      name: 'Finance Team',
      type: 'finance',
      status: 'active',
      formationDate: '2024-01-20',
      totalMembers: 3,
      history: [
        {
          id: 'H008',
          type: 'team_created',
          title: 'Team Created',
          description: 'Finance Team was formed',
          date: '2024-01-20',
          user: 'System Admin',
          changes: [
            { field: 'Team Type', oldValue: '', newValue: 'Finance Team' },
            { field: 'Initial Members', oldValue: '', newValue: '3 members' }
          ]
        },
        {
          id: 'H009',
          type: 'member_added',
          title: 'Member Added',
          description: 'সজিব রহমান joined as Finance Lead',
          date: '2024-01-21',
          user: 'System Admin',
          changes: [
            { field: 'Role', oldValue: 'Vacant', newValue: 'Finance Lead' },
            { field: 'Member', oldValue: '', newValue: 'সজিব রহমান' }
          ]
        },
        {
          id: 'H010',
          type: 'kpi_updated',
          title: 'KPI Targets Updated',
          description: 'Updated financial accuracy targets',
          date: '2024-01-25',
          user: 'সজিব রহমান',
          changes: [
            { field: 'Accounting Accuracy', oldValue: '98%', newValue: '99%' }
          ]
        },
        {
          id: 'H011',
          type: 'performance_achievement',
          title: 'Excellent Performance',
          description: 'Achieved 98.5% accounting accuracy',
          date: '2024-02-28',
          user: 'System',
          changes: [
            { field: 'Actual Accuracy', oldValue: '97%', newValue: '98.5%' }
          ]
        }
      ]
    },
    {
      id: 'T003',
      name: 'Loan Management Team',
      type: 'loan',
      status: 'active',
      formationDate: '2024-02-01',
      totalMembers: 3,
      history: [
        {
          id: 'H012',
          type: 'team_created',
          title: 'Team Created',
          description: 'Loan Management Team was formed',
          date: '2024-02-01',
          user: 'System Admin',
          changes: [
            { field: 'Team Type', oldValue: '', newValue: 'Loan Management' },
            { field: 'Initial Members', oldValue: '', newValue: '3 members' }
          ]
        },
        {
          id: 'H013',
          type: 'settings_updated',
          title: 'Loan Limits Updated',
          description: 'Increased maximum loan approval limit',
          date: '2024-02-10',
          user: 'System Admin',
          changes: [
            { field: 'Max Loan Amount', oldValue: '₹50,000', newValue: '₹75,000' }
          ]
        }
      ]
    }
  ],
  activityTypes: [
    'all',
    'team_created',
    'member_added',
    'member_removed',
    'responsibility_updated',
    'performance_achievement',
    'kpi_updated',
    'settings_updated'
  ]
};

export default function TeamHistory() {
  const [selectedTeam, setSelectedTeam] = useState(teamHistoryData.teams[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [activityType, setActivityType] = useState('all');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'table'

  const getActivityIcon = (type: string) => {
    const icons = {
      team_created: <Plus className="text-green-600" size={16} />,
      member_added: <UserPlus className="text-blue-600" size={16} />,
      member_removed: <UserMinus className="text-red-600" size={16} />,
      responsibility_updated: <Settings className="text-purple-600" size={16} />,
      performance_achievement: <Award className="text-yellow-600" size={16} />,
      kpi_updated: <TrendingUp className="text-indigo-600" size={16} />,
      settings_updated: <Settings className="text-gray-600" size={16} />
    };
    return icons[type as keyof typeof icons] || <FileText className="text-gray-600" size={16} />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      team_created: 'bg-green-100 border-green-200',
      member_added: 'bg-blue-100 border-blue-200',
      member_removed: 'bg-red-100 border-red-200',
      responsibility_updated: 'bg-purple-100 border-purple-200',
      performance_achievement: 'bg-yellow-100 border-yellow-200',
      kpi_updated: 'bg-indigo-100 border-indigo-200',
      settings_updated: 'bg-gray-100 border-gray-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 border-gray-200';
  };

  const filteredHistory = selectedTeam.history.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activityType === 'all' || activity.type === activityType;
    
    return matchesSearch && matchesType;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Team History</h1>
              <p className="text-gray-600 mt-1">Track all team activities and changes over time</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'timeline' ? 'table' : 'timeline')}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                {viewMode === 'timeline' ? <FileText size={16} /> : <Clock size={16} />}
                {viewMode === 'timeline' ? 'Table View' : 'Timeline View'}
              </button>
              
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download size={16} />
                Export History
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Activities</p>
                  <p className="text-3xl font-bold mt-2">
                    {teamHistoryData.teams.reduce((sum, team) => sum + team.history.length, 0)}
                  </p>
                </div>
                <FileText size={32} className="text-blue-200" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Teams Tracked</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {teamHistoryData.teams.length}
                  </p>
                </div>
                <Users size={24} className="text-green-600" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Member Changes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {teamHistoryData.teams.flatMap(team => team.history)
                      .filter(activity => activity.type.includes('member')).length}
                  </p>
                </div>
                <UserPlus size={24} className="text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Performance Events</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {teamHistoryData.teams.flatMap(team => team.history)
                      .filter(activity => activity.type.includes('performance')).length}
                  </p>
                </div>
                <Award size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last3months">Last 3 Months</option>
            </select>

            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="team_created">Team Created</option>
              <option value="member_added">Member Added</option>
              <option value="member_removed">Member Removed</option>
              <option value="responsibility_updated">Responsibilities</option>
              <option value="performance_achievement">Achievements</option>
              <option value="kpi_updated">KPI Updates</option>
              <option value="settings_updated">Settings</option>
            </select>

            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Filter size={16} />
              Apply Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teams List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Teams</h3>
              <div className="space-y-3">
                {teamHistoryData.teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedTeam.id === team.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">{team.name}</div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{team.history.length} activities</span>
                      <span>{team.totalMembers} members</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Formed: {new Date(team.formationDate).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Type Legend */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Activity Types</h3>
              <div className="space-y-2">
                {teamHistoryData.activityTypes.filter(type => type !== 'all').map((type) => (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    {getActivityIcon(type)}
                    <span className="capitalize text-gray-700">
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main History Content */}
          <div className="lg:col-span-3">
            {/* Selected Team Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTeam.name}</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedTeam.history.length} activities since formation
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Formed: {new Date(selectedTeam.formationDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedTeam.totalMembers} members • {selectedTeam.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline View */}
            {viewMode === 'timeline' ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Activity Timeline</h3>
                
                <div className="space-y-6">
                  {filteredHistory.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        {index < filteredHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                        )}
                      </div>

                      {/* Activity content */}
                      <div className="flex-1 pb-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar size={14} />
                              {new Date(activity.date).toLocaleDateString()}
                              <span className="text-xs">({getTimeAgo(activity.date)})</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{activity.description}</p>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            By: <span className="font-medium">{activity.user}</span>
                          </div>

                          {/* Changes made */}
                          {activity.changes && activity.changes.length > 0 && (
                            <div className="border-t pt-3 mt-3">
                              <div className="text-sm font-medium text-gray-700 mb-2">Changes:</div>
                              <div className="space-y-1">
                                {activity.changes.map((change, changeIndex) => (
                                  <div key={changeIndex} className="flex items-center gap-2 text-sm">
                                    <div className="text-gray-600 min-w-[120px]">{change.field}:</div>
                                    {change.oldValue && (
                                      <>
                                        <div className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs line-through">
                                          {change.oldValue}
                                        </div>
                                        <div className="text-gray-400">→</div>
                                      </>
                                    )}
                                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                      {change.newValue}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No activities found matching your filters</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Table View */
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredHistory.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getActivityIcon(activity.type)}
                              <span className="font-medium text-gray-900">{activity.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                            {activity.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(activity.date).toLocaleDateString()}
                            <div className="text-xs text-gray-500">{getTimeAgo(activity.date)}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {activity.user}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                              {activity.type.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}