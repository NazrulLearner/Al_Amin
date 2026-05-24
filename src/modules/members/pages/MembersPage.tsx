// src/Modules/Members/pages/MembersPage.tsx
// Main page for member list with search, filters, pagination, and statistics
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { memberService } from '../services/memberService';
import type { SimpleMember } from '../../../types';
import StatisticsCards from '../components/memberList/StatisticsCards';
import SearchFilter from '../components/memberList/SearchFilter';
import MemberTable from '../components/memberList/MemberTable';
import EditMember from '../components/memberList/EditMember';

const MemberList = () => {
  const [members, setMembers] = useState<SimpleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  const { userData, somityInfo } = useAuth();
  const { loading: settingsLoading } = useSomitySettings();
  const navigate = useNavigate();

  // Get items per page from settings (fallback to 50)
  const itemsPerPage = 50;

  useEffect(() => {
    if (!settingsLoading) {
      fetchMembers();
    }
  }, [settingsLoading]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Single somity data! Direct call
      console.log('Fetching all members...');
      const membersData = await memberService.getSimpleMembers();
      console.log('Members data received:', membersData?.length || 0);
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.includes(searchTerm) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Statistics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const inactiveMembers = members.filter(m => m.status === 'inactive').length;
  const totalShares = members.reduce((sum, member) => sum + (member.shareCount || 0), 0);

  // Handlers
  const handleViewProfile = (memberId: string) => {
    navigate(`/members/profile/${memberId}`);
  };

  const handleEditMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchMembers();
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই সদস্যকে ডিলিট করতে চান?')) return;
    
    try {
      // Single somity data!
      await memberService.deleteMember(memberId, userData?.uid || 'system');
      await fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('সদস্য ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    console.log(`Exporting as ${type}`, filteredMembers);
    alert(`${filteredMembers.length} জন সদস্য ${type.toUpperCase()} হিসেবে এক্সপোর্ট হচ্ছে`);
  };

  const handleRefresh = () => {
    fetchMembers();
  };

  // Get user role
  const userRole = userData?.role || 'member';

  // Loading state
  if (settingsLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-500">
              {settingsLoading ? 'সেটিংস লোড হচ্ছে...' : 'সদস্য লোড হচ্ছে...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                সদস্য ব্যবস্থাপনা
              </h1>
              <p className="text-gray-600 mt-2">
                {somityInfo?.name || 'সোমিটি'} - সকল সদস্য এক জায়গায় দেখুন ও পরিচালনা করুন
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} className="mr-2" />
                রিফ্রেশ
              </button>
              {(userRole === 'admin' || userRole === 'cashier') && (
                <Link
                  to="/members/AddMember"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} className="mr-2" />
                  নতুন সদস্য যোগ করুন
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <StatisticsCards
          totalMembers={totalMembers}
          activeMembers={activeMembers}
          inactiveMembers={inactiveMembers}
          totalShares={totalShares}
        />

        {/* Search & Filters */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onExport={handleExport}
        />

        {/* Member Table */}
        <MemberTable
          members={currentMembers}
          onView={handleViewProfile}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
          userRole={userRole}
        />

        {/* Pagination */}
        {filteredMembers.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              দেখানো হচ্ছে <span className="font-medium">{indexOfFirstItem + 1}</span> থেকে{' '}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredMembers.length)}</span> পর্যন্ত{' '}
              (মোট: <span className="font-medium">{filteredMembers.length}</span> জন)
            </div>
            <div className="flex items-center space-x-2 flex-wrap justify-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="mr-1" /> আগে
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-2 text-sm border rounded-lg transition-colors min-w-[40px] ${
                      currentPage === pageNum
                        ? 'bg-green-500 text-white border-green-500'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                পরবর্তী <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredMembers.length === 0 && members.length > 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
            <p className="text-gray-500">আপনার ফিল্টার অনুযায়ী কোনো সদস্য পাওয়া যায়নি</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setRoleFilter('all');
              }}
              className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              সকল ফিল্টার ক্লিয়ার করুন
            </button>
          </div>
        )}

        {/* Edit Member Modal */}
        {selectedMemberId && (
          <EditMember
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedMemberId(null);
            }}
            memberId={selectedMemberId}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default MemberList;
