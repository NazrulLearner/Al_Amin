// src/pages/fees/PendingFees.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { memberDueService } from '../services/memberDueService';
import { memberService } from '../../members/services/memberService';
import { 
  Loader2, CheckCircle, 
  Search, X
} from 'lucide-react';
import { toast } from 'sonner';
import type { MemberDueInfo } from '../../../types';

const PendingFees: React.FC = () => {
  const { somityInfo } = useAuth();
  const { settings } = useSomitySettings();
  const navigate = useNavigate();
  
  const [pendingList, setPendingList] = useState<MemberDueInfo[]>([]);
  const [filteredList, setFilteredList] = useState<MemberDueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberDueInfo | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fiscalYearStart = settings?.financial?.fiscalYearStart || 'July-2021';
  const somityStartMonth = fiscalYearStart.split('-')[0] || 'July';
  const somityStartYear = parseInt(fiscalYearStart.split('-')[1]) || 2021;

  useEffect(() => {
    fetchPendingFees();
  }, []);

  const fetchPendingFees = async () => {
    try {
      setLoading(true);
      // Single somity data!
      const members = await memberService.getSimpleMembers();
      
      const pending: MemberDueInfo[] = [];
      
      for (const member of members) {
        if (member.status === 'active') {
          // Single somity data!
          const dueInfo = await memberDueService.getMemberDue(
            member.memberId, 
            member.monthlyFee, 
            somityStartMonth, 
            somityStartYear
          );
          if (dueInfo.totalDue > 0) {
            pending.push({
              ...dueInfo,
              memberName: member.fullName,
              shareCount: member.shareCount,
              monthlyFee: member.monthlyFee
            });
          }
        }
      }
      
      const sorted = pending.sort((a, b) => b.totalDue - a.totalDue);
      setPendingList(sorted);
      setFilteredList(sorted);
    } catch (error) {
      console.error('Error fetching pending fees:', error);
      toast.error('বকেয়া ফি লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredList(pendingList);
    } else {
      const filtered = pendingList.filter(member =>
        member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.memberId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    }
  }, [searchTerm, pendingList]);

  const totalPending = pendingList.reduce((sum, m) => sum + m.totalDue, 0);
  const totalMembersWithDue = pendingList.length;
  const avgDue = totalMembersWithDue > 0 ? Math.round(totalPending / totalMembersWithDue) : 0;

  const getDueLevel = (months: number) => {
    if (months <= 2) return { text: 'Low', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
    if (months <= 5) return { text: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    return { text: 'High', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
  };

  const handleViewDetails = (member: MemberDueInfo) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const handlePayNow = (memberId: string) => {
    navigate('/fees/entry', { state: { memberId } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-600">বকেয়া ফি</h1>
          <p className="text-gray-500 mt-2">{somityInfo?.name || 'সোমিটি'} - বকেয়া ফি তালিকা</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-gray-500">মোট বকেয়া</p>
            <p className="text-2xl font-bold text-red-600">৳{totalPending.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-gray-500">বকেয়া সদস্য</p>
            <p className="text-2xl font-bold text-orange-600">{totalMembersWithDue}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-gray-500">গড় বকেয়া</p>
            <p className="text-2xl font-bold text-amber-600">৳{avgDue.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="সদস্যের নাম বা আইডি দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">সদস্য</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">শেয়ার</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">মাসিক ফি</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">বকেয়া মাস</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">মোট বকেয়া</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredList.map((member) => {
                  const dueLevel = getDueLevel(member.dueMonths.length);
                  return (
                    <tr key={member.memberId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{member.memberName}</p>
                        <p className="text-xs text-gray-500">{member.memberId}</p>
                      </td>
                      <td className="px-6 py-4">{member.shareCount}</td>
                      <td className="px-6 py-4">৳{member.monthlyFee.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${dueLevel.bg} ${dueLevel.color}`}>
                          {member.dueMonths.length} মাস
                        </span>
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-red-600">৳{member.totalDue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleViewDetails(member)} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200">বিস্তারিত</button>
                          <button onClick={() => handlePayNow(member.memberId)} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">জমা দিন</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredList.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <p className="text-lg font-medium">কোনো বকেয়া ফি নেই!</p>
              <p className="text-sm text-gray-500">সব সদস্যের ফি আপডেট আছে</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">বকেয়া বিস্তারিত</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold">{selectedMember.memberName}</h3>
                <p className="text-sm text-gray-500">ID: {selectedMember.memberId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-500">মোট বকেয়া</p>
                  <p className="text-xl font-bold text-red-600">৳{selectedMember.totalDue.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-orange-500">বকেয়া মাস</p>
                  <p className="text-xl font-bold text-orange-600">{selectedMember.dueMonths.length} মাস</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">বকেয়া মাসসমূহ:</h4>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {selectedMember.dueMonths.map((month, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm">
                      {month.month} {month.year}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => { setShowDetailsModal(false); handlePayNow(selectedMember.memberId); }}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700"
                >
                  ফি জমা দিন
                </button>
                <button onClick={() => setShowDetailsModal(false)} className="flex-1 border py-2.5 rounded-xl hover:bg-gray-50">
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingFees;
