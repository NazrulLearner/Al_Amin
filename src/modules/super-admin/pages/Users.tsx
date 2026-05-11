// src/pages/super-admin/Users.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { Search, Shield, Ban, CheckCircle } from 'lucide-react';

interface PlatformUser {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'cashier' | 'member';
  memberId?: string;
  status: 'active' | 'blocked';
  createdAt: Date;
  lastLoginAt: Date;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'admin' | 'cashier' | 'member'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const usersList: PlatformUser[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        usersList.push({
          uid: doc.id,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone || '',
          role: data.role || 'member',
          memberId: data.memberId || '',
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate?.() || new Date(),
        });
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phone.includes(term)
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const handleBlockUser = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if (window.confirm(`Are you sure you want to ${newStatus} this user?`)) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { status: newStatus });
        await loadUsers();
      } catch (error) {
        console.error('Error updating user status:', error);
        alert('Failed to update user status');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'super_admin':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 flex items-center gap-1"><Shield size={12} /> Super Admin</span>;
      case 'admin':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Admin</span>;
      case 'cashier':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Cashier</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Member</span>;
    }
  };

  const stats = {
    total: users.length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    admins: users.filter(u => u.role === 'admin').length,
    members: users.filter(u => u.role === 'member').length,
    active: users.filter(u => u.status === 'active').length,
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Platform Users</h1>
      <p className="text-gray-500 mb-6">Manage all users across the platform</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4"><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-purple-50 rounded-lg shadow p-4"><p className="text-sm text-purple-600">Super Admins</p><p className="text-2xl font-bold text-purple-700">{stats.superAdmins}</p></div>
        <div className="bg-blue-50 rounded-lg shadow p-4"><p className="text-sm text-blue-600">Admins</p><p className="text-2xl font-bold text-blue-700">{stats.admins}</p></div>
        <div className="bg-gray-50 rounded-lg shadow p-4"><p className="text-sm text-gray-600">Members</p><p className="text-2xl font-bold text-gray-700">{stats.members}</p></div>
        <div className="bg-green-50 rounded-lg shadow p-4"><p className="text-sm text-green-600">Active</p><p className="text-2xl font-bold text-green-700">{stats.active}</p></div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name, email, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="cashier">Cashier</option>
            <option value="member">Member</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Role</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Member ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Joined</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.uid} className="hover:bg-gray-50">
                <td className="px-6 py-4"><div className="font-medium">{user.fullName}</div><div className="text-sm text-gray-500">{user.email}</div><div className="text-xs text-gray-400">{user.phone}</div></td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4 text-sm">{user.memberId || <span className="text-gray-400">—</span>}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span></td>
                <td className="px-6 py-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleBlockUser(user.uid, user.status)} className={`p-1 rounded ${user.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={user.status === 'active' ? 'Block User' : 'Unblock User'}>
                    {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
