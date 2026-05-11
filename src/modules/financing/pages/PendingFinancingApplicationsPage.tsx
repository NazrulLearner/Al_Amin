// src/pages/Loans/PendingApplications.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { loanService } from '../services/FinancingService';
import { 
  Eye, CheckCircle, XCircle, Loader2, Clock, User, 
  DollarSign, TrendingUp, Shield, Users, 
  CreditCard, Home, Building2, Package, Sprout, Heart,
  Search, Filter, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import DisbursementModal from '../components/DisbursementModal';
import { formatAmount } from '../../../utils/formatters/amountFormatter';

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
  const { settings, formatDate } = useSomitySettings();
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

  // 🔥 FIX: Get default interest rate from settings
  const defaultInterestRate = settings?.loan?.defaultInterestRate || 10;
  const islamicConfig = settings?.islamicLoanConfig;

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

  // 🔥 FIX: Get interest/profit rate based on loan type
  const getRateForLoanType = (loanType: string): number => {
    // Qard Hasanah = 0% interest (service charge only)
    if (loanType === 'qardHasanah') return 0;
    
    // Musharaka, Mudaraba, Ijarah, Salam, Kafalah = 0% (different models)
    if (['musharaka', 'mudaraba', 'ijarah', 'salam', 'kafalah'].includes(loanType)) {
      return 0;
    }
    
    // Get from islamic config
    const config = islamicConfig?.[loanType as keyof typeof islamicConfig];
    if (config && typeof config === 'object' && 'profitRate' in config) {
      return (config as any).profitRate;
    }
    
    return defaultInterestRate;
  };

  // 🔥 FIX: Get service charge for Qard Hasanah
  const getServiceChargePercent = (app: Application): number => {
    if (app.loanType !== 'qardHasanah') return 0;
    return app.loanDetails?.serviceChargePercent || 
           islamicConfig?.qardHasanah?.serviceFee || 0;
  };

  const handleApprove = async () => {
    if (!selectedApp || !somityInfo?.id) return;
    
    setProcessing(true);
    try {
      const interestRate = getRateForLoanType(selectedApp.loanType);
      
      const loanId = await loanService.approveLoanApplication(
        selectedApp.id,
        user?.uid || 'admin',
        interestRate,
        islamicConfig
      );
      setApprovedLoanId(loanId);
      setShowModal(false);
      setShowDisbursementModal(true);
      
      const rateMessage = selectedApp.loanType === 'qardHasanah' 
        ? `with ${getServiceChargePercent(selectedApp)}% service charge`
        : `with ${interestRate}% rate`;
      
      toast.success(`✅ Loan approved ${rateMessage}! Please record disbursement.`);
      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleDisbursementSuccess = () => {
    setShowDisbursementModal(false);
    setApprovedLoanId(null);
    setSelectedApp(null);
    fetchApplications();
    toast.success('✅ Loan disbursement recorded successfully!');
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

  const calculateLoanAmount = (app: Application) => {
    const details = app.loanDetails;
    switch (app.loanType) {
      case 'murabaha': return details?.assetCost || 0;
      case 'musharaka': 
      case 'mudaraba': return details?.totalCapital || 0;
      case 'qardHasanah': return details?.loanAmount || 0;
      case 'salam': return details?.totalPrice || 0;
      case 'ijarah': return details?.assetValue || 0;
      case 'kafalah': return details?.guaranteeAmount || 0;
      case 'istisna': 
      case 'tawarruq': return details?.totalCost || 0;
      default: return details?.amount || 0;
    }
  };

  // 🔥 FIX: Calculate total payable based on loan type
  const calculateTotalPayable = (app: Application): number => {
    const amount = calculateLoanAmount(app);
    const duration = app.loanDetails?.durationMonths || 
                     app.loanDetails?.leasePeriod || 
                     app.loanDetails?.deliveryPeriod || 12;
    
    switch (app.loanType) {
      case 'qardHasanah':
        const serviceCharge = getServiceChargePercent(app);
        return amount + (amount * serviceCharge / 100);
        
      case 'ijarah':
        const rentalAmount = app.loanDetails?.rentalAmount || 0;
        return rentalAmount * duration;
        
      case 'musharaka':
      case 'mudaraba':
        return amount; // Profit sharing - capital only
        
      default:
        const rate = getRateForLoanType(app.loanType);
        return amount * (1 + rate / 100);
    }
  };

  // 🔥 FIX: Calculate monthly installment
  const calculateMonthlyInstallment = (app: Application): number => {
    const total = calculateTotalPayable(app);
    const duration = app.loanDetails?.durationMonths || 
                     app.loanDetails?.leasePeriod || 
                     app.loanDetails?.deliveryPeriod || 12;
    return duration > 0 ? Math.round(total / duration) : 0;
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

  // 🔥 FIX: Get rate display text
  const getRateDisplayText = (app: Application): string => {
    if (app.loanType === 'qardHasanah') {
      return `Service: ${getServiceChargePercent(app)}%`;
    }
    if (['musharaka', 'mudaraba', 'ijarah', 'salam', 'kafalah'].includes(app.loanType)) {
      return 'Profit Sharing';
    }
    return `${getRateForLoanType(app.loanType)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pending Loan Applications
          </h1>
          <p className="text-gray-500 mt-2">Review and approve loan applications from members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{applications.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">
              ৳{applications.reduce((sum, app) => sum + calculateLoanAmount(app), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Default Rate</p>
            <p className="text-2xl font-bold text-blue-600">{defaultInterestRate}%</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-sm text-blue-100">Ready to Review</p>
            <p className="text-2xl font-bold">{applications.length} applications</p>
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
                className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">App ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Loan Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map((app) => {
                  const amount = calculateLoanAmount(app);
                  const Icon = getLoanTypeIcon(app.loanType);
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium">{app.applicationId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{app.applicant.name}</p>
                        <p className="text-xs text-gray-500">{app.applicant.memberID || 'Non-Member'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-blue-500" />
                          <span className="text-sm capitalize">{app.loanType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">{formatAmount(amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-blue-600">{getRateDisplayText(app)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(app.loanApplicationDate || app.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedApp(app); setShowModal(true); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-blue-800 flex items-center gap-2"><User className="h-4 w-4" /> Applicant</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{selectedApp.applicant.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span>{selectedApp.applicant.phone}</span></div>
                    {selectedApp.applicant.memberID && <div className="flex justify-between"><span className="text-gray-500">Member ID:</span><span>{selectedApp.applicant.memberID}</span></div>}
                    {selectedApp.applicant.monthlyIncome && <div className="flex justify-between"><span className="text-gray-500">Monthly Income:</span><span>৳{selectedApp.applicant.monthlyIncome.toLocaleString()}</span></div>}
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-green-800 flex items-center gap-2"><Shield className="h-4 w-4" /> Guarantor</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{selectedApp.grantor.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Member ID:</span><span className="font-mono">{selectedApp.grantor.memberID}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span>{selectedApp.grantor.phone}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Relation:</span><span className="capitalize">{selectedApp.grantor.relation}</span></div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-purple-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-purple-800 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Loan Details</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><span className="text-gray-500">Type:</span><div className="font-semibold capitalize">{selectedApp.loanType}</div></div>
                    <div><span className="text-gray-500">Amount:</span><div className="font-bold text-green-600">৳{calculateLoanAmount(selectedApp).toLocaleString()}</div></div>
                    <div><span className="text-gray-500">Duration:</span><div>{selectedApp.loanDetails?.durationMonths || selectedApp.loanDetails?.leasePeriod || 12} months</div></div>
                    <div><span className="text-gray-500">Rate:</span><div className="font-medium text-blue-600">{getRateDisplayText(selectedApp)}</div></div>
                  </div>
                  {selectedApp.loanDetails?.purpose && (
                    <div className="mt-3">
                      <span className="text-gray-500">Purpose:</span>
                      <p className="text-sm mt-1">{selectedApp.loanDetails.purpose}</p>
                    </div>
                  )}
                  {selectedApp.remarks && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-500">Remarks:</p>
                      <p className="text-sm">{selectedApp.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Calculation Preview */}
              <div className={`rounded-lg p-4 ${selectedApp.loanType === 'qardHasanah' ? 'bg-red-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  {selectedApp.loanType === 'qardHasanah' && <Heart className="h-4 w-4 text-red-500" />}
                  {selectedApp.loanType === 'qardHasanah' ? 'Qard Hasanah Calculation' : 'Loan Calculation Preview'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-gray-600">Principal:</span><div className="font-semibold">৳{calculateLoanAmount(selectedApp).toLocaleString()}</div></div>
                  
                  {selectedApp.loanType === 'qardHasanah' ? (
                    <>
                      <div><span className="text-gray-600">Service Charge ({getServiceChargePercent(selectedApp)}%):</span><div className="font-semibold">৳{Math.round(calculateLoanAmount(selectedApp) * getServiceChargePercent(selectedApp) / 100).toLocaleString()}</div></div>
                      <div><span className="text-gray-600">Total Payable:</span><div className="font-semibold text-green-600">৳{calculateTotalPayable(selectedApp).toLocaleString()}</div></div>
                      <div><span className="text-gray-600">Monthly:</span><div className="font-semibold text-blue-600">৳{calculateMonthlyInstallment(selectedApp).toLocaleString()}</div></div>
                    </>
                  ) : selectedApp.loanType === 'musharaka' || selectedApp.loanType === 'mudaraba' ? (
                    <>
                      <div><span className="text-gray-600">Profit Sharing:</span><div className="font-semibold">Variable</div></div>
                      <div><span className="text-gray-600">Capital Return:</span><div className="font-semibold text-green-600">৳{calculateLoanAmount(selectedApp).toLocaleString()}</div></div>
                      <div><span className="text-gray-600">Period:</span><div className="font-semibold">{selectedApp.loanDetails?.durationMonths || 12} months</div></div>
                    </>
                  ) : (
                    <>
                      <div><span className="text-gray-600">Interest ({getRateForLoanType(selectedApp.loanType)}%):</span><div className="font-semibold">৳{Math.round(calculateLoanAmount(selectedApp) * getRateForLoanType(selectedApp.loanType) / 100).toLocaleString()}</div></div>
                      <div><span className="text-gray-600">Total Payable:</span><div className="font-semibold text-green-600">৳{calculateTotalPayable(selectedApp).toLocaleString()}</div></div>
                      <div><span className="text-gray-600">Monthly:</span><div className="font-semibold text-blue-600">৳{calculateMonthlyInstallment(selectedApp).toLocaleString()}</div></div>
                    </>
                  )}
                </div>
                {selectedApp.loanType === 'qardHasanah' && (
                  <p className="text-xs text-red-600 mt-3 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Interest-free benevolent loan - only service charge applies (goes to charity)
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleReject} disabled={processing} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Reject
                </button>
                <button onClick={handleApprove} disabled={processing} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
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