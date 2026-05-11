// src/components/Members/memberList/MemberTable.tsx
import { motion } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Badge,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Shield,
  Users,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import type { SimpleMember } from '../../../../types';

interface MemberTableProps {
  members: SimpleMember[];
  onView: (memberId: string) => void;
  onEdit: (memberId: string) => void;
  onDelete: (memberId: string) => void;
  userRole?: string;
}

const MemberTable = ({ members = [], onView, onEdit, onDelete, userRole }: MemberTableProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'suspended': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'terminated': return 'bg-rose-100 text-rose-700 border border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'cashier': return 'bg-blue-100 text-blue-700 border border-blue-200';
      default: return 'bg-green-100 text-green-700 border border-green-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={12} className="mr-1" />;
      case 'cashier': return <DollarSign size={12} className="mr-1" />;
      default: return <User size={12} className="mr-1" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('bn-BD', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace('বাংলা', '');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateRelative = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return '';
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A';
    return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'M';
    const parts = fullName.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return fullName.substring(0, 2).toUpperCase();
  };

  const toggleExpand = (memberId: string) => {
    setExpandedRow(expandedRow === memberId ? null : memberId);
  };

  if (members.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm"
      >
        <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border-4 border-white shadow-lg">
          <Users size={48} className="text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No members found</h3>
        <p className="text-gray-500 mb-6">Get started by adding your first member</p>
        {(userRole === 'admin' || userRole === 'cashier') && (
          <button
            onClick={() => window.location.href = '/members/AddMember'}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            Add New Member
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View - Scrollable */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left w-[280px]">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Member</span>
                  </th>
                  <th className="px-6 py-4 text-left w-[220px]">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Contact</span>
                  </th>
                  <th className="px-6 py-4 text-left w-[140px]">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Joined</span>
                  </th>
                  <th className="px-6 py-4 text-left w-[100px]">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Role</span>
                  </th>
                  <th className="px-6 py-4 text-left w-[100px]">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Shares</span>
                  </th>
                  <th className="px-6 py-4 text-left w-[100px]">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</span>
                  </th>
                  <th className="px-6 py-4 text-right w-[140px]">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Member Column with Photo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 min-w-[200px]">
                        {/* Profile Photo / Avatar */}
                        <div className="relative flex-shrink-0">
                          {member.photoUrl ? (
                            <img 
                              src={member.photoUrl} 
                              alt={member.fullName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-green-500 shadow-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md';
                                  fallback.innerText = getInitials(member.fullName);
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {getInitials(member.fullName)}
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            member.status === 'active' ? 'bg-green-500' : 
                            member.status === 'inactive' ? 'bg-gray-400' :
                            member.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-800 hover:text-green-600 cursor-pointer transition-colors truncate max-w-[120px] md:max-w-[150px]" title={member.fullName}>
                            {member.fullName}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Badge size={12} className="mr-1 flex-shrink-0" />
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded truncate max-w-[100px]" title={member.memberId}>
                              {member.memberId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-2 min-w-[160px]">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                          <span className="font-medium truncate" title={formatPhone(member.phone)}>
                            {formatPhone(member.phone)}
                          </span>
                        </div>
                        {member.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[150px]" title={member.email}>
                              {member.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Join Date Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 min-w-[100px]">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                          <span className="whitespace-nowrap">{formatDate(member.dateOfJoin)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={12} className="mr-1 text-gray-400 flex-shrink-0" />
                          <span className="whitespace-nowrap">{formatDateRelative(member.dateOfJoin)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${getRoleBadge(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
                      </span>
                    </td>

                    {/* Shares Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 min-w-[80px]">
                        <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {member.shareCount || 0}
                        </div>
                        <div className="text-xs text-emerald-600 font-medium whitespace-nowrap">
                          ৳{(member.totalFeesPaid || 0).toLocaleString()}
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(member.status)}`}>
                        <span className={`w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${
                          member.status === 'active' ? 'bg-green-500' : 
                          member.status === 'inactive' ? 'bg-gray-500' :
                          member.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onView(member.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 bg-white border border-blue-200 shadow-sm flex-shrink-0"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                        {(userRole === 'admin' || userRole === 'cashier') && (
                          <button
                            onClick={() => onEdit(member.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all hover:scale-110 bg-white border border-emerald-200 shadow-sm flex-shrink-0"
                            title="Edit Member"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {userRole === 'admin' && (
                          <button
                            onClick={() => onDelete(member.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all hover:scale-110 bg-white border border-rose-200 shadow-sm flex-shrink-0"
                            title="Delete Member"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Card Header */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(member.id)}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {/* Profile Photo / Avatar - Mobile */}
                <div className="relative flex-shrink-0">
                  {member.photoUrl ? (
                    <img 
                      src={member.photoUrl} 
                      alt={member.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-green-500 shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md';
                          fallback.innerText = getInitials(member.fullName);
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {getInitials(member.fullName)}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    member.status === 'active' ? 'bg-green-500' : 
                    member.status === 'inactive' ? 'bg-gray-400' :
                    member.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-lg truncate" title={member.fullName}>
                    {member.fullName}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Badge size={12} className="mr-1 flex-shrink-0" />
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded truncate" title={member.memberId}>
                      {member.memberId}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${getRoleBadge(member.role)}`}>
                  {getRoleIcon(member.role)}
                  {member.role}
                </span>
                {expandedRow === member.id ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* Quick Info - Always Visible */}
            <div className="px-4 pb-3 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center text-sm text-gray-600 min-w-0">
                <Phone size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate" title={formatPhone(member.phone)}>
                  {formatPhone(member.phone)}
                </span>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${getStatusColor(member.status)}`}>
                <span className={`w-2 h-2 rounded-full mr-1 ${
                  member.status === 'active' ? 'bg-green-500' : 
                  member.status === 'inactive' ? 'bg-gray-500' :
                  member.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                {member.status}
              </span>
            </div>

            {/* Actions - Always Visible on Mobile */}
            <div className="px-4 py-3 flex items-center justify-end space-x-2 bg-gray-50/50">
              <button
                onClick={() => onView(member.id)}
                className="flex-1 flex items-center justify-center px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <Eye size={16} className="mr-2" />
                View
              </button>
              {(userRole === 'admin' || userRole === 'cashier') && (
                <button
                  onClick={() => onEdit(member.id)}
                  className="flex-1 flex items-center justify-center px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200"
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </button>
              )}
              {userRole === 'admin' && (
                <button
                  onClick={() => onDelete(member.id)}
                  className="flex-1 flex items-center justify-center px-3 py-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors border border-rose-200"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              )}
            </div>

            {/* Expanded Details */}
            {expandedRow === member.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4 space-y-3 bg-white border-t border-gray-100"
              >
                <div className="grid grid-cols-2 gap-3 pt-3">
                  {member.email && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">Email</div>
                      <div className="flex items-center text-sm text-gray-700 min-w-0">
                        <Mail size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate" title={member.email}>{member.email}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Join Date</div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                      <span>{formatDate(member.dateOfJoin)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Joined</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={12} className="mr-1 text-gray-400" />
                      {formatDateRelative(member.dateOfJoin)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Shares</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {member.shareCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Fees Paid</div>
                    <div className="text-sm font-semibold text-emerald-600">
                      ৳{(member.totalFeesPaid || 0).toLocaleString()}
                    </div>
                  </div>
                  {member.totalPendingAmount > 0 && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">Pending Amount</div>
                      <div className="text-sm font-semibold text-amber-600">
                        ৳{member.totalPendingAmount.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Results Count */}
      {members.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing {members.length} {members.length === 1 ? 'member' : 'members'}
          </div>
          <div className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTable;