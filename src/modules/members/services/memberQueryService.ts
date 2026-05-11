// src/modules/members/services/memberQueryService.ts

import { getDocs, query, where, orderBy } from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import type { SimpleMember, MemberStatus, UserRole } from '../../../types';

/**
 * 🔍 Member Query Service
 * Search, filter, stats - READ operations only
 */

export const memberQueryService = {
  /**
   * Map member document to SimpleMember
   */
  toSimpleMember(member: any): SimpleMember {
    return {
      id: member.memberId,
      memberId: member.memberId,
      fullName: member.fullName || '',
      phone: member.phone || '',
      email: member.email || '',
      photoUrl: member.photoUrl || '',
      position: member.membership?.position || '',
      role: member.membership?.role || 'member',
      status: member.membership?.status || 'active',
      shareCount: member.membership?.shareCount || 0,
      monthlyFee: member.membership?.monthlyFee || 0,
      totalFeesPaid: member.financials?.totalFeesPaid || 0,
      totalPendingMonths: member.financials?.totalPendingMonths || 0,
      totalPendingAmount: member.financials?.totalPendingAmount || 0,
      monthlyDueAmount: member.financials?.monthlyDueAmount || 0,
      currentLoanBalance: member.financials?.currentLoanBalance || 0,
      isLoanActive: member.financials?.isLoanActive || false,
      dateOfJoin: member.membership?.dateOfJoin || '',
      createdAt: member.metadata?.createdAt || new Date(),
      lastPaymentDate: member.financials?.lastFeePaidMonth ? 
        new Date(
          member.financials.lastFeePaidYear || new Date().getFullYear(), 
          new Date(Date.parse(member.financials.lastFeePaidMonth + " 1, 2000")).getMonth()
        ) : null,
    };
  },

  /**
   * Search members by term
   */
  async searchMembers(searchTerm: string): Promise<SimpleMember[]> {
    try {
      const members = await this.getAllMembers();
      const term = searchTerm.toLowerCase();
      
      return members.filter(member => 
        member.memberId.toLowerCase().includes(term) ||
        member.fullName.toLowerCase().includes(term) ||
        member.phone.includes(term) ||
        (member.email && member.email.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error searching members:', error);
      throw error;
    }
  },

  /**
   * Get members by status
   */
  async getMembersByStatus(status: MemberStatus): Promise<SimpleMember[]> {
    try {
      const members = await this.getAllMembers();
      return members.filter(member => member.status === status);
    } catch (error) {
      console.error('Error getting members by status:', error);
      throw error;
    }
  },

  /**
   * Get members by role
   */
  async getMembersByRole(role: UserRole): Promise<SimpleMember[]> {
    try {
      const members = await this.getAllMembers();
      return members.filter(member => member.role === role);
    } catch (error) {
      console.error('Error getting members by role:', error);
      throw error;
    }
  },

  /**
   * Get member statistics
   */
  async getMemberStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    totalShares: number;
    totalFeesCollected: number;
    totalPendingFees: number;
    totalLoansActive: number;
  }> {
    try {
      const members = await this.getAllMembersRaw();
      
      return {
        total: members.length,
        active: members.filter(m => m.membership?.status === 'active').length,
        inactive: members.filter(m => m.membership?.status === 'inactive').length,
        pending: members.filter(m => m.membership?.status === 'pending').length,
        totalShares: members.reduce((sum, m) => sum + (m.membership?.shareCount || 0), 0),
        totalFeesCollected: members.reduce((sum, m) => sum + (m.financials?.totalFeesPaid || 0), 0),
        totalPendingFees: members.reduce((sum, m) => sum + (m.financials?.totalPendingAmount || 0), 0),
        totalLoansActive: members.filter(m => m.financials?.isLoanActive).length,
      };
    } catch (error) {
      console.error('Error getting member stats:', error);
      throw error;
    }
  },

  /**
   * Get all members as SimpleMember array
   */
  async getAllMembers(): Promise<SimpleMember[]> {
    const rawMembers = await this.getAllMembersRaw();
    return rawMembers.map(member => this.toSimpleMember(member));
  },

  /**
   * Get all members as raw data
   */
  async getAllMembersRaw(): Promise<any[]> {
    try {
      const membersRef = collections.members();
      const q = query(
        membersRef, 
        where('metadata.isDeleted', '==', false),
        orderBy('metadata.createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const members = querySnapshot.docs.map(doc => doc.data());
      
      console.log(`✅ Loaded ${members.length} members`);
      return members;
    } catch (error: any) {
      console.error('Error getting members:', error);
      throw new Error('Failed to get members: ' + error.message);
    }
  },

  /**
   * Generate next member ID
   */
  async generateNextMemberId(prefix: string = 'M'): Promise<string> {
    try {
      const members = await this.getAllMembers();
      
      if (members.length === 0) {
        return `${prefix}001`;
      }
      
      const numbers = members
        .map(m => {
          const match = m.memberId.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        })
        .filter(n => n > 0);
      
      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      const nextNumber = maxNumber + 1;
      
      return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating member ID:', error);
      return `${prefix}${Date.now().toString().slice(-3)}`;
    }
  },
};