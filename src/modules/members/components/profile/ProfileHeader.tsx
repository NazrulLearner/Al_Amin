// src/pages/Members/profile/components/ProfileHeader.tsx
import React from 'react';
import { Settings, Edit2, LogOut, Mail, Phone, Calendar, Badge } from 'lucide-react';
import type { Member } from '../../../../types';

interface ProfileHeaderProps {
  member: Member;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  member,
  onEdit,
  onSettings,
  onLogout
}) => {
  const getInitials = (name: string) => {
    if (!name) return 'M';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'cashier': return 'bg-blue-100 text-blue-700 border border-blue-200';
      default: return 'bg-green-100 text-green-700 border border-green-200';
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center text-3xl font-bold shadow-lg">
              {member.personal?.photoUrl ? (
                <img src={member.personal.photoUrl} alt={member.fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(member.fullName)
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
              member.membership?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
            }`} />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{member.fullName}</h1>
              <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getRoleBadge(member.membership?.role || 'member')}`}>
                {member.membership?.role || 'Member'}
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/90 text-sm">
              <div className="flex items-center">
                <Badge size={14} className="mr-2" />
                <span>ID: {member.memberId}</span>
              </div>
              <div className="flex items-center">
                <Mail size={14} className="mr-2" />
                <span>{member.email || 'No email'}</span>
              </div>
              <div className="flex items-center">
                <Phone size={14} className="mr-2" />
                <span>{member.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={14} className="mr-2" />
                <span>Joined: {member.membership?.dateOfJoin || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Edit Profile"
              >
                <Edit2 size={18} />
              </button>
            )}
            {onSettings && (
              <button
                onClick={onSettings}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={18} />
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 bg-red-500/50 hover:bg-red-500 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;