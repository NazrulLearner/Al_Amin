// src/modules/contributions/components/MemberSearchCard.tsx
import React, { useRef } from 'react';
import { Search, User, X } from 'lucide-react';

export interface SimpleMember {
  id: string;
  memberId: string;
  fullName: string;
  phone: string;
  shareCount: number;
  monthlyFee: number;
  totalFeesPaid: number;
}

interface MemberSearchCardProps {
  members: SimpleMember[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMember: SimpleMember | null;
  onSelectMember: (member: SimpleMember) => void;
  onClearMember: () => void;
  showMemberList: boolean;
  onShowMemberListChange: (show: boolean) => void;
}

const MemberSearchCard: React.FC<MemberSearchCardProps> = ({
  members,
  searchTerm,
  onSearchChange,
  selectedMember,
  onSelectMember,
  onClearMember,
  showMemberList,
  onShowMemberListChange,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const memberListRef = useRef<HTMLDivElement>(null);

  const filteredMembers = members.filter(member =>
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          সদস্য খুঁজুন
        </h2>
      </div>

      <div className="p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="মেম্বার আইডি, নাম বা মোবাইল নম্বর..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onShowMemberListChange(true);
            }}
            onFocus={() => onShowMemberListChange(true)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {showMemberList && searchTerm && !selectedMember && (
          <div
            ref={memberListRef}
            className="absolute z-10 w-[calc(100%-2.5rem)] mt-1 bg-white border rounded-lg max-h-60 overflow-y-auto shadow-lg"
          >
            {filteredMembers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                কোনো সদস্য পাওয়া যায়নি
              </div>
            ) : (
              filteredMembers.map(member => (
                <div
                  key={member.id}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b transition-colors"
                  onClick={() => onSelectMember(member)}
                >
                  <p className="font-medium text-gray-900">{member.fullName}</p>
                  <p className="text-xs text-gray-500">ID: {member.memberId}</p>
                  <p className="text-xs text-green-600 mt-1">
                    মাসিক অবদান: ৳{member.monthlyFee.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {selectedMember && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">নির্বাচিত সদস্য</p>
                  <p className="font-semibold text-gray-900">{selectedMember.fullName}</p>
                  <p className="text-sm text-gray-600">ID: {selectedMember.memberId}</p>
                </div>
              </div>
              <button
                onClick={onClearMember}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-blue-200">
              <div className="bg-white/50 rounded-lg p-2 text-center">
                <span className="text-gray-600">শেয়ার</span>
                <p className="font-bold text-gray-900">{selectedMember.shareCount}</p>
              </div>
              <div className="bg-white/50 rounded-lg p-2 text-center">
                <span className="text-gray-600">মাসিক অবদান</span>
                <p className="font-bold text-green-600">৳{selectedMember.monthlyFee.toLocaleString()}</p>
              </div>
              <div className="col-span-2 bg-white/50 rounded-lg p-2 text-center">
                <span className="text-gray-600">মোট জমা</span>
                <p className="font-bold text-blue-600">৳{selectedMember.totalFeesPaid.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberSearchCard;