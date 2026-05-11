// src/pages/Members/profile/components/ProfileLayout.tsx
import React from 'react';
import type { ReactNode } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import type { Member } from '../../../../types';

interface ProfileLayoutProps {
  member: Member;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  children: ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  member,
  activeTab,
  onTabChange,
  isOwnProfile,
  onEdit,
  onSettings,
  onLogout,
  children
}) => {
  // Define tabs with icons
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'documents', label: 'Documents & Reports', icon: '📄' },
  ];

  // Add Investment tab only if member is an investor/shareholder
  const isInvestor = member.membership?.shareCount > 0;
  if (isInvestor) {
    tabs.push({ id: 'investment', label: 'Investment', icon: '📈' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Profile Header */}
      <ProfileHeader
        member={member}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
        onSettings={onSettings}
        onLogout={onLogout}
      />

      {/* Tabs Navigation */}
      <ProfileTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;