// src/modules/settings/components/CollectorSettings.tsx
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Trash2, Search, 
  CheckCircle, XCircle, Loader2, MapPin,
  Phone, Mail, Shield, AlertCircle
} from 'lucide-react';
import { memberService } from '../../members/services/memberService';
import { collections } from '../../../services/firebase/firebaseCollections';
import { updateDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import type { SomitySettings, CollectorAssignment } from '../../../types';

interface CollectorSettingsProps {
  settings: SomitySettings;
  updateSettings: (updates: Partial<SomitySettings>) => void;
}

interface SimpleMember {
  id: string;
  memberId: string;
  fullName: string;
  phone: string;
  email?: string;
}

const CollectorSettings: React.FC<CollectorSettingsProps> = ({ settings, updateSettings }) => {
  const [members, setMembers] = useState<SimpleMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<SimpleMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [] = useState(false);

  const collectorSettings = settings?.collection?.collectorSettings;
  const collectorEnabled = collectorSettings?.enabled ?? true;
  const collectors = collectorSettings?.collectors || [];

  useEffect(() => {
    if (showAddModal) {
      loadMembers();
    }
  }, [showAddModal]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const allMembers = await memberService.getSimpleMembers();
      const collectorMemberIds = new Set(collectors.map(c => c.memberId));
      const availableMembers = allMembers.filter(
        (m: SimpleMember) => !collectorMemberIds.has(m.memberId)
      );
      setMembers(availableMembers);
    } catch (error) {
      toast.error('সদস্য লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = () => {
    const newEnabled = !collectorEnabled;
    updateSettings({
      collection: {
        ...settings.collection,
        collectorSettings: {
          ...collectorSettings,
          enabled: newEnabled,
          collectors,
        },
      },
    });
  };

  const syncUserRoleByMemberId = async (memberId: string, role: 'collector' | 'member') => {
    try {
      const usersQuery = query(collections.users(), where('memberId', '==', memberId));
      const userSnapshot = await getDocs(usersQuery);
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          role,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.warn(`Could not sync role to users collection for member ${memberId}:`, error);
      throw error;
    }
  };

  const handleAddCollector = async () => {
    if (!selectedMember) return;

    const newCollector: CollectorAssignment = {
      id: `col_${Date.now()}`,
      memberId: selectedMember.memberId,
      memberName: selectedMember.fullName,
      phone: selectedMember.phone,
      email: selectedMember.email,
      assignedAreas: [],
      isActive: true,
      joinedAt: new Date(),
    };

    const updatedCollectors = [...collectors, newCollector];

    try {
      // 🔄 Update member's role in Firebase to 'collector'
      const memberRef = collections.member(selectedMember.id);
      await updateDoc(memberRef, {
        'membership.role': 'collector',
        'metadata.updatedAt': Timestamp.now(),
      });

      // 🔄 Sync the user's auth profile role if the member has a linked user account
      await syncUserRoleByMemberId(selectedMember.memberId, 'collector');

      updateSettings({
        collection: {
          ...settings.collection,
          collectorSettings: {
            ...collectorSettings,
            enabled: collectorEnabled,
            collectors: updatedCollectors,
          },
        },
      });

      setShowAddModal(false);
      setSelectedMember(null);
      setSearchTerm('');
      toast.success(`${selectedMember.fullName} কালেক্টর হিসেবে যোগ করা হয়েছে!`);
    } catch (error) {
      toast.error('কালেক্টর role update করতে ব্যর্থ');
      console.error(error);
    }
  };

  const handleRemoveCollector = async (collectorId: string) => {
    const collector = collectors.find(c => c.id === collectorId);
    const updatedCollectors = collectors.filter(c => c.id !== collectorId);

    if (!collector) return;

    try {
      const memberRef = collections.member(collector.memberId);
      await updateDoc(memberRef, {
        'membership.role': 'member',
        'metadata.updatedAt': Timestamp.now(),
      });

      await syncUserRoleByMemberId(collector.memberId, 'member');

      updateSettings({
        collection: {
          ...settings.collection,
          collectorSettings: {
            ...collectorSettings,
            enabled: collectorEnabled,
            collectors: updatedCollectors,
          },
        },
      });
      toast.success(`${collector.memberName} কালেক্টর থেকে সরানো হয়েছে`);
    } catch (error) {
      toast.error('কালেক্টর সরাতে ব্যর্থ');
      console.error(error);
    }
  };

  const handleToggleCollectorStatus = (collectorId: string) => {
    const updatedCollectors = collectors.map(c => 
      c.id === collectorId ? { ...c, isActive: !c.isActive } : c
    );
    updateSettings({
      collection: {
        ...settings.collection,
        collectorSettings: {
          ...collectorSettings,
          enabled: collectorEnabled,
          collectors: updatedCollectors,
        },
      },
    });
  };

  const filteredMembers = members.filter(m =>
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            কালেক্টর সেটিংস
          </h3>
          <p className="text-sm text-gray-500 mt-1">কে কে ফি সংগ্রহ করবে তা নির্ধারণ করুন</p>
        </div>
        <button
          onClick={handleToggleEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            collectorEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              collectorEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Enabled Notice */}
      {collectorEnabled ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            কালেক্টর সিস্টেম সক্রিয় আছে। ফি জমার সময় কালেক্টর নির্বাচন করতে হবে।
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            কালেক্টর সিস্টেম বন্ধ আছে।
          </p>
        </div>
      )}

      {/* Collector Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
          <p className="text-2xl font-bold text-green-600">
            {collectors.filter(c => c.isActive).length}
          </p>
          <p className="text-sm text-green-700">সক্রিয়</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
          <p className="text-2xl font-bold text-red-600">
            {collectors.filter(c => !c.isActive).length}
          </p>
          <p className="text-sm text-red-700">নিষ্ক্রিয়</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">
            {collectors.length}
          </p>
          <p className="text-sm text-blue-700">মোট</p>
        </div>
      </div>

      {/* Add Collector Button */}
      <button
        onClick={() => {
          loadMembers();
          setShowAddModal(true);
        }}
        disabled={!collectorEnabled}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        নতুন কালেক্টর যোগ করুন
      </button>

      {/* Collectors List */}
      <div className="space-y-3">
        {collectors.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">কোনো কালেক্টর নেই</p>
            <p className="text-sm text-gray-400">উপরের বাটনে ক্লিক করে কালেক্টর যোগ করুন</p>
          </div>
        ) : (
          collectors.map(collector => (
            <div
              key={collector.id}
              className={`bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow ${
                collector.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  collector.isActive ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  <Users className={`h-5 w-5 ${
                    collector.isActive ? 'text-blue-600' : 'text-red-400'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{collector.memberName}</p>
                  <p className="text-xs text-gray-500">ID: {collector.memberId}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {collector.phone}
                    </span>
                    {collector.email && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {collector.email}
                      </span>
                    )}
                  </div>
                  {collector.assignedAreas && collector.assignedAreas.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {collector.assignedAreas.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleCollectorStatus(collector.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    collector.isActive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={collector.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                >
                  {collector.isActive ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => handleRemoveCollector(collector.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="সরিয়ে ফেলুন"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Collector Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">কালেক্টর নির্বাচন করুন</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedMember(null);
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="নাম, আইডি বা ফোন দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">কোনো সদস্য পাওয়া যায়নি</p>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map(member => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        selectedMember?.id === member.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-medium">{member.fullName}</p>
                      <p className="text-xs text-gray-500">
                        ID: {member.memberId} | 📞 {member.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedMember(null);
                  setSearchTerm('');
                }}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                onClick={handleAddCollector}
                disabled={!selectedMember}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedMember
                  ? `${selectedMember.fullName} কে যোগ করুন`
                  : 'সদস্য নির্বাচন করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorSettings;
