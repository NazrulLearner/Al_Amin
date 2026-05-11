import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  Filter, 
  Search, 
  Download,
  Eye
} from 'lucide-react';
import type { Team } from '../types/team';

// Mock data - in real app, this comes from API
const mockTeams: Team[] = [
  {
    id: 'T001',
    name: 'Core Management Team',
    type: 'core',
    description: 'Overall society management and decision making',
    formationDate: '2024-01-15',
    status: 'active',
    members: [
      { id: 'M001', name: 'নাজরুল ইসলাম', role: 'President', duties: [], permissions: [] },
      { id: 'M002', name: 'রহিম উদ্দিন', role: 'Vice President', duties: [], permissions: [] }
    ],
    responsibilities: ['Policy making', 'Budget approval', 'Member management'],
    tasks: [],
    performanceMetrics: []
  },
  {
    id: 'T002',
    name: 'Finance Team',
    type: 'finance',
    description: 'Financial transactions and accounts management',
    formationDate: '2024-01-20',
    status: 'active',
    members: [
      { id: 'M003', name: 'করিম আহমেদ', role: 'Finance Lead', duties: [], permissions: [] },
      { id: 'M004', name: 'আয়েশা বেগম', role: 'Accountant 1', duties: [], permissions: [] }
    ],
    responsibilities: ['Daily transactions', 'Monthly reporting', 'Bank reconciliation'],
    tasks: [],
    performanceMetrics: []
  },
  {
    id: 'T003', 
    name: 'Loan Management Team',
    type: 'loan',
    description: 'Loan application processing and approval',
    formationDate: '2024-02-01',
    status: 'active',
    members: [
      { id: 'M005', name: 'সজিব রহমান', role: 'Loan Coordinator', duties: [], permissions: [] },
      { id: 'M006', name: 'ফাতেমা খাতুন', role: 'Loan Verifier', duties: [], permissions: [] }
    ],
    responsibilities: ['Loan verification', 'Approval process', 'Recovery management'],
    tasks: [],
    performanceMetrics: []
  }
];

export default function TeamList() {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // Filter teams based on search and filters
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    const matchesType = typeFilter === 'all' || team.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      setTeams(teams.filter(team => team.id !== teamId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTeams.length > 0 && window.confirm(`Delete ${selectedTeams.length} selected teams?`)) {
      setTeams(teams.filter(team => !selectedTeams.includes(team.id)));
      setSelectedTeams([]);
    }
  };

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const selectAllTeams = () => {
    setSelectedTeams(
      selectedTeams.length === filteredTeams.length 
        ? [] 
        : filteredTeams.map(team => team.id)
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeNames = {
      core: 'Core',
      finance: 'Finance', 
      loan: 'Loan',
      other: 'Other'
    };
    return (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
        {typeNames[type as keyof typeof typeNames]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Team Management</h1>
              <p className="text-gray-600 mt-1">Manage all teams and their members</p>
            </div>
            <Link
              to="/teams/create"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Create New Team
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="core">Core Team</option>
              <option value="finance">Finance Team</option>
              <option value="loan">Loan Team</option>
              <option value="other">Other</option>
            </select>

            <div className="flex gap-2">
              <button className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Filter size={16} />
                Filter
              </button>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTeams.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-yellow-800">
                {selectedTeams.length} team(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Teams Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                      onChange={selectAllTeams}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <Users size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No teams found</p>
                      <Link
                        to="/teams/create"
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Create your first team
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team.id)}
                          onChange={() => toggleTeamSelection(team.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {team.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getTypeBadge(team.type)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {team.members.filter(m => m.name).length} / {team.members.length}
                          </span>
                          <div className="text-xs text-gray-500">
                            {team.members.filter(m => m.name).length === team.members.length ? 'Complete' : 'Incomplete'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {team.members.slice(0, 2).map(m => m.name).filter(Boolean).join(', ')}
                          {team.members.filter(m => m.name).length > 2 && '...'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(team.formationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(team.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/teams/${team.id}`}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/teams/edit/${team.id}`}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Edit Team"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Team"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTeams.length}</span> of{' '}
                <span className="font-medium">{filteredTeams.length}</span> results
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
              </div>
              <Users className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Teams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teams.filter(t => t.status === 'active').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teams.flatMap(t => t.members).filter(m => m.name).length}
                </p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Complete Teams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teams.filter(t => t.members.every(m => m.name)).length}
                </p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}