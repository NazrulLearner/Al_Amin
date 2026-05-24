// src/modules/financing/pages/PendingFinancingApplicationsPage.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { loanService } from '../services/FinancingService';
import { 
  Eye, CheckCircle, XCircle, Loader2, Clock, User, 
  DollarSign, TrendingUp, Shield, Users, 
  CreditCard, Home, Building2, Package, Sprout, Heart,
  Search, Filter, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import DisbursementModal from '../components/DisbursementModal';

interface Application {
  id: string;
  applicationId: string;
  status: string;
  applicant: {
    isMember: boolean;
    memberID?: string;
    name: string;
    phone: string;
    monthlyIncome?: number;
  };
  grantor: {
    memberID: string;
    name: string;
    phone: string;
    relation: string;
  };
  loanType: string;
  loanDetails: any;
  remarks?: string;
  loanApplicationDate?: Date;
  createdAt: Date;
}

const PendingApplications: React.FC = () => {
  const { somityInfo, user } = useAuth();
  const { settings, formatAmount, formatDate } = useSomitySettings();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [approvedLoanId, setApprovedLoanId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const toAmount = (value: any): number => {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount : 0;
  };

  useEffect(() => {
    fetchApplications();
  }, [somityInfo]);

  const fetchApplications = async () => {
    if (!somityInfo?.id) return;
    try {
      setLoading(true);
      const data = await loanService.getPendingApplications();
      setApplications(data);
      setFilteredApps(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...applications];
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(app => app.loanType === filterType);
    }
    setFilteredApps(filtered);
  }, [searchTerm, filterType, applications]);

  const calculateLoanAmount = (app: Application) => {
    const details = app.loanDetails;
    switch (app.loanType) {
      case 'murabaha': return toAmount(details?.assetCost);
      case 'musharaka': 
      case 'mudaraba': return toAmount(details?.totalCapital);
      case 'qardHasanah': return toAmount(details?.loanAmount);
      case 'salam': return toAmount(details?.totalPrice);
      case 'ijarah': return toAmount(details?.assetValue);
      case 'kafalah': return toAmount(details?.guaranteeAmount);
      case 'istisna': 
      case 'tawarruq': return toAmount(details?.totalCost);
      default: return toAmount(details?.amount);
    }
  };

  const getLoanTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      murabaha: TrendingUp, musharaka: Users, mudaraba: TrendingUp,
      salam: Sprout, ijarah: Home, istisna: Building2,
      kafalah: Shield, qardHasanah: Heart, tawarruq: Package
    };
    return icons[type] || CreditCard;
  };

  const loanTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'murabaha', label: 'Murabaha' },
    { value: 'musharaka', label: 'Musharaka' },
    { value: 'mudaraba', label: 'Mudaraba' },
    { value: 'salam', label: 'Salam' },
    { value: 'ijarah', label: 'Ijarah' },
    { value: 'istisna', label: 'Istisna' },
    { value: 'kafalah', label: 'Kafalah' },
    { value: 'qardHasanah', label: 'Qard Hasanah' },
    { value: 'tawarruq', label: 'Tawarruq' },
  ];

  const totalAmount = applications.reduce((sum, app) => sum + calculateLoanAmount(app), 0);

  const handleApprove = async () => {
    if (!selectedApp || !somityInfo?.id) return;
    setProcessing(true);
    try {
      const loanId = await loanService.approveLoanApplication(
        selectedApp.id,
        user?.uid || 'admin',
        settings
      );
      setApprovedLoanId(loanId);
      setShowModal(false);
      setShowDisbursementModal(true);
      toast.success(`✅ Loan approved! Please record disbursement.`);
      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
      setProcessing(false);
    }
  };

  const handleDisbursementSuccess = () => {
    setShowDisbursementModal(false);
    setApprovedLoanId(null);
    setSelectedApp(null);
    fetchApplications();
    toast.success('✅ Loan disbursement recorded successfully!');
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedApp || !somityInfo?.id) return;
    setProcessing(true);
    try {
      await loanService.rejectLoanApplication(
        selectedApp.id,
        user?.uid || 'admin',
        'Rejected by admin'
      );
      toast.success(`❌ Loan application rejected`);
      setShowModal(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pending Loan Applications</h1>
          <p className="text-gray-500 mt-1">Review and approve loan applications from members</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pending Amount</p>
                <p className="text-2xl font-bold text-blue-600">{formatAmount(totalAmount)}</p>
                <p className="text-xs text-gray-400 mt-1">{applications.length} applications waiting</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Ready to Review</p>
                <p className="text-3xl font-bold">{applications.length} applications</p>
                <p className="text-xs text-green-200 mt-1">Click on any application to review</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by Application ID or Member Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {loanTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">App ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan Type</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map((app) => {
                  const amount = calculateLoanAmount(app);
                  const Icon = getLoanTypeIcon(app.loanType);
                  return (
                    <tr 
                      key={app.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => { setSelectedApp(app); setShowModal(true); }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">{app.applicationId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{app.applicant.name}</p>
                        <p className="text-xs text-gray-500">{app.applicant.memberID || 'Non-Member'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-blue-500" />
                          <span className="text-sm capitalize text-gray-700">{app.loanType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-green-600">{formatAmount(amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(app.loanApplicationDate || app.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedApp(app); setShowModal(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredApps.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">No pending applications</p>
              <p className="text-sm text-gray-500 mt-1">All loan applications have been processed</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Application Details</h2>
                <p className="text-sm text-gray-500">ID: {selectedApp.applicationId}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800">Pending Approval - Please review the details below</span>
              </div>

              {/* Applicant & Guarantor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-blue-800 flex items-center gap-2"><User className="h-4 w-4" /> Applicant</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{selectedApp.applicant.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span>{selectedApp.applicant.phone}</span></div>
                    {selectedApp.applicant.memberID && <div className="flex justify-between"><span className="text-gray-500">Member ID:</span><span>{selectedApp.applicant.memberID}</span></div>}
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-green-800 flex items-center gap-2"><Shield className="h-4 w-4" /> Guarantor</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{selectedApp.grantor.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Member ID:</span><span className="font-mono">{selectedApp.grantor.memberID}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Relation:</span><span className="capitalize">{selectedApp.grantor.relation}</span></div>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-purple-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-purple-800 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Loan Details</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><span className="text-gray-500">Type:</span><div className="font-semibold capitalize">{selectedApp.loanType}</div></div>
                    <div><span className="text-gray-500">Amount:</span><div className="font-bold text-green-600">{formatAmount(calculateLoanAmount(selectedApp))}</div></div>
                    <div><span className="text-gray-500">Duration:</span><div>{selectedApp.loanDetails?.durationMonths || 12} months</div></div>
                  </div>
                  {selectedApp.loanDetails?.purpose && (
                    <div className="mt-3"><span className="text-gray-500">Purpose:</span><p className="text-sm mt-1">{selectedApp.loanDetails.purpose}</p></div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReject} 
                  disabled={processing} 
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Reject
                </button>
                <button 
                  onClick={handleApprove} 
                  disabled={processing} 
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disbursement Modal */}
      {showDisbursementModal && approvedLoanId && selectedApp && (
        <DisbursementModal
          isOpen={showDisbursementModal}
          onClose={() => setShowDisbursementModal(false)}
          onSuccess={handleDisbursementSuccess}
          loanId={approvedLoanId}
          loanAmount={calculateLoanAmount(selectedApp)}
          memberId={selectedApp.applicant.memberID || ''}
          memberName={selectedApp.applicant.name}
        />
      )}
    </div>
  );
};

export default PendingApplications;
