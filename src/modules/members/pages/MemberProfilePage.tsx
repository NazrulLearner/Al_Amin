// src/pages/Members/profile/MemberProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { memberService } from '../services/memberService';
import type { Member } from '../../../types';

// Import Layout
import ProfileLayout from '../components/profile/ProfileLayout';

// Import Tabs
import OverviewTab from '../components/tabs/OverviewTab';
import PersonalInfoTab from '../components/tabs/PersonalInfoTab';
import FinanceTab from '../components/tabs/FinanceTab';
import DocumentsTab from '../components/tabs/DocumentsTab';
import EditMember from '../components/memberList/EditMember';

const MemberProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      if (!id) return;
      // ✅ FIX: Single somity data - single somity!
      const data = await memberService.getMemberById(id);
      setMember(data);
    } catch (error) {
      console.error('Error fetching member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchMember();
    setEditModalOpen(false);
  };

  // ✅ Check if this is the logged-in user's own profile
  const isOwnProfile = (): boolean => {
    if (!userData || !member) return false;
    return userData.memberId === member.memberId;
  };

  // ✅ Check if user can edit (admin or own profile)
  const canEdit = (): boolean => {
    if (!userData) return false;
    return userData.role === 'admin' || isOwnProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Member Not Found</h2>
          <button
            onClick={() => navigate('/members/index')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout
      member={member}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isOwnProfile={isOwnProfile()}
      onEdit={canEdit() ? () => setEditModalOpen(true) : undefined}
      onSettings={isOwnProfile() ? () => navigate('/settings/account') : undefined}
    >
      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab member={member} />}
      {activeTab === 'personal' && <PersonalInfoTab member={member} />}
      {activeTab === 'financial' && <FinanceTab member={member} />}
      {activeTab === 'documents' && <DocumentsTab member={member} isOwnProfile={isOwnProfile()} />}

      {/* ✅ FIX: EditMember - no somityId prop needed */}
      {editModalOpen && (
        <EditMember
          memberId={member.memberId}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </ProfileLayout>
  );
};

export default MemberProfilePage;
