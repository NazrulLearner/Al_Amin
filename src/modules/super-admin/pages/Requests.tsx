// src/pages/super-admin/Requests.tsx
import React, { useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  where,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../../services/firebase/firebase';
import { useAuth } from '../../../app/providers/AuthProvider';

interface Request {
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requesterNid: string;
  somityName: string;
  somityAddress: string;
  somityPhone: string;
  somityEmail: string;
  memberId: string;
  position: string;
  shares: number;
  message: string;
  status: string;
  submittedAt: Date;
  rejectionReason?: string;
}

const Requests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const reqRef = collection(db, 'somity_requests');
      const q = query(reqRef, where('status', '==', 'pending'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const reqs: Request[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        reqs.push({
          id: doc.id,
          requesterName: data.requesterName,
          requesterEmail: data.requesterEmail,
          requesterPhone: data.requesterPhone,
          requesterNid: data.requesterNid || '',
          dateOfBirth: data.dateOfBirth || '',
          fatherName: data.fatherName || '',
          motherName: data.motherName || '',
          spouseName: data.spouseName || '',
          somityName: data.somityName,
          somityAddress: data.somityAddress || '',
          somityPhone: data.somityPhone || '',
          somityEmail: data.somityEmail || '',
          memberId: data.memberId,
          position: data.position || 'Founder & President',
          shares: data.shares || 100,
          message: data.message,
          status: data.status,
          submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
          rejectionReason: data.rejectionReason,
        });
      });
      
      setRequests(reqs);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !adminPassword) return;
    
    setProcessing(true);
    
    try {
      // 1. Create Admin user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        selectedRequest.requesterEmail, 
        adminPassword
      );
      const adminUser = userCredential.user;
      
      const now = Timestamp.now();
      
      // 2. Create Somity settings document
      const somitySettingsRef = doc(db, 'somity_settings', 'config');
      await setDoc(somitySettingsRef, {
        general: {
          somityName: selectedRequest.somityName,
          somityEmail: selectedRequest.somityEmail || selectedRequest.requesterEmail,
          somityPhone: selectedRequest.somityPhone || selectedRequest.requesterPhone,
          somityAddress: selectedRequest.somityAddress || '',
        },
        status: 'active',
        plan: 'free',
        settings: {
          shareValue: 1000,
          monthlyFee: 1000,
          lateFee: 50,
          loanInterest: 5,
          maxMembers: 100,
          maxLoans: 50,
        },
        stats: {
          totalMembers: 1,
          totalLoans: 0,
          totalCollections: 0,
          totalOutstanding: 0,
          totalDue: 0,
        },
        createdAt: now,
        updatedAt: now,
        createdBy: user?.uid || adminUser.uid,
      });
      
      // 3. Create Member document
      const memberRef = doc(db, 'members', selectedRequest.memberId);
      await setDoc(memberRef, {
        id: selectedRequest.memberId,
        memberId: selectedRequest.memberId,
        uid: adminUser.uid,
        firstName: selectedRequest.requesterName.split(' ')[0] || '',
        lastName: selectedRequest.requesterName.split(' ').slice(1).join(' ') || '',
        fullName: selectedRequest.requesterName,
        phone: selectedRequest.requesterPhone,
        email: selectedRequest.requesterEmail,
        nidNumber: selectedRequest.requesterNid,
        dateOfBirth: selectedRequest.dateOfBirth || '',
        fatherName: selectedRequest.fatherName || '',
        motherName: selectedRequest.motherName || '',
        spouseName: selectedRequest.spouseName || '',
        address: {
          presentAddress: selectedRequest.somityAddress || '',
          permanentAddress: selectedRequest.somityAddress || '',
        },
        membership: {
          dateOfJoin: new Date().toISOString().split('T')[0],
          position: selectedRequest.position,
          role: 'admin',
          status: 'active',
          shareCount: selectedRequest.shares,
          perShareFee: 1000,
          monthlyFee: 1000,
          totalShareValue: selectedRequest.shares * 1000,
        },
        financials: {
          totalFeesPaid: 0,
          totalPendingAmount: 0,
          currentLoanBalance: 0,
          totalSavings: 0,
          activeLoanBalance: 0,
          dueAmount: 0,
        },
        verification: {
          status: 'verified',
          verifiedBy: user?.uid,
          verifiedAt: now,
        },
        metadata: {
          createdBy: user?.uid,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        },
      });
      
      // 4. Create AppUser document
      const userRef = doc(db, 'users', adminUser.uid);
      await setDoc(userRef, {
        uid: adminUser.uid,
        email: selectedRequest.requesterEmail,
        fullName: selectedRequest.requesterName,
        phone: selectedRequest.requesterPhone,
        role: 'admin',
        memberId: selectedRequest.memberId,
        createdAt: now,
        lastLoginAt: now,
        updatedAt: now,
      });
      
      // 5. Update request status
      const requestRef = doc(db, 'somity_requests', selectedRequest.id);
      await updateDoc(requestRef, {
        status: 'approved',
        reviewedAt: now,
        reviewedBy: user?.uid,
      });
      
      alert(`✅ Somity request approved!\n\nAdmin login:\nEmail: ${selectedRequest.requesterEmail}\nPassword: ${adminPassword}\n\nPlease save this password.`);
      
      setShowApproveModal(false);
      setAdminPassword('');
      setSelectedRequest(null);
      await loadRequests();
      
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert('Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return;
    
    setProcessing(true);
    
    try {
      const requestRef = doc(db, 'somity_requests', selectedRequest.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectionReason: rejectionReason,
        reviewedAt: Timestamp.now(),
        reviewedBy: user?.uid,
      });
      
      alert(`Request rejected: ${rejectionReason}`);
      
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      await loadRequests();
      
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert('Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Somity Requests</h1>

      {/* Stats */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📝</span>
          <div>
            <p className="font-medium text-yellow-800">Pending Requests</p>
            <p className="text-2xl font-bold text-yellow-800">{requests.length}</p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{req.somityName}</h3>
                  <p className="text-sm text-gray-500">Requested by: {req.requesterName}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setShowApproveModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setShowRejectModal(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm">{req.requesterEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm">{req.requesterPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">NID</p>
                  <p className="text-sm">{req.requesterNid || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member ID</p>
                  <p className="text-sm">{req.memberId}</p>
                </div>
              </div>

              {req.message && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Message</p>
                  <p className="text-sm">{req.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Approve Somity Request</h3>
            <p className="mb-2">Somity: <strong>{selectedRequest.somityName}</strong></p>
            <p className="mb-4">Admin: <strong>{selectedRequest.requesterName}</strong> ({selectedRequest.requesterEmail})</p>
            
            <label className="block text-sm font-medium mb-1">Set Admin Password</label>
            <input
              type="password"
              placeholder="Enter password for admin account (min 6 chars)"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={!adminPassword || processing}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Approve'}
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reject Request</h3>
            <p className="mb-2">Somity: <strong>{selectedRequest.somityName}</strong></p>
            
            <label className="block text-sm font-medium mb-1">Rejection Reason</label>
            <textarea
              placeholder="Why is this request being rejected?"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={!rejectionReason || processing}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
