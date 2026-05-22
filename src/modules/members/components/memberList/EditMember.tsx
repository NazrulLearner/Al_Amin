// src/components/Members/memberList/EditMember.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, User, Phone, Users, DollarSign, Heart, Home, 
  Upload, FileText, Loader2, Badge, Shield
} from 'lucide-react';
import { useAuth } from '../../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../../app/providers/SomitySettingsProvider';
import { memberService } from '../../services/memberService';
import type { Member, UserRole, MemberStatus } from '../../../../types';
import { collections } from '../../../../services/firebase/firebaseCollections';
import { getDocs, query, where, updateDoc, Timestamp } from 'firebase/firestore';

interface EditMemberProps {
  memberId: string;
  somityId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  phone: string;
  alternatePhone: string;
  email: string;
  nidNumber: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineePhone: string;
  nomineeNid: string;
  nomineeShare: number;
  division: string;
  district: string;
  upazila: string;
  union: string;
  village: string;
  presentAddress: string;
  permanentAddress: string;
  sameAsPresent: boolean;
  shareCount: number;
  perShareFee: number;
  monthlyFee: number;
  position: string;
  role: UserRole;
  status: MemberStatus;
  dateOfJoin: string;
  totalFeesPaid: number;
  currentLoanBalance: number;
}

const EditMember = ({ memberId, isOpen, onClose, onSuccess }: EditMemberProps) => {
  const { user } = useAuth();
  const { settings } = useSomitySettings();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [signaturePreview, setSignaturePreview] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '', middleName: '', lastName: '', fullName: '',
    phone: '', alternatePhone: '', email: '', nidNumber: '', dateOfBirth: '',
    fatherName: '', motherName: '', spouseName: '',
    nomineeName: '', nomineeRelation: '', nomineePhone: '', nomineeNid: '', nomineeShare: 0,
    division: '', district: '', upazila: '', union: '', village: '',
    presentAddress: '', permanentAddress: '', sameAsPresent: false,
    shareCount: 1, perShareFee: 1000, monthlyFee: 1000,
    position: 'General Member', role: 'member', status: 'active',
    dateOfJoin: new Date().toISOString().split('T')[0],
    totalFeesPaid: 0, currentLoanBalance: 0,
  });

  const shareSettings = settings?.share;
  const maxShare = shareSettings?.maxShare || 100;
  const minShare = shareSettings?.minShare || 1;
  const perShareValue = shareSettings?.perShareValue || 1000;

  const syncUserRoleByMemberId = async (targetMemberId: string, role: UserRole) => {
    const usersQuery = query(collections.users(), where('memberId', '==', targetMemberId));
    const userSnapshot = await getDocs(usersQuery);
    await Promise.all(userSnapshot.docs.map(userDoc =>
      updateDoc(userDoc.ref, {
        role,
        updatedAt: Timestamp.now(),
      })
    ));
  };

  const getLinkedUserRole = async (targetMemberId: string): Promise<UserRole | null> => {
    const usersQuery = query(collections.users(), where('memberId', '==', targetMemberId));
    const userSnapshot = await getDocs(usersQuery);
    if (userSnapshot.empty) return null;
    return (userSnapshot.docs[0].data().role as UserRole) || null;
  };

  useEffect(() => {
    if (!isOpen) {
      setPhotoFile(null); setSignatureFile(null);
      setPhotoPreview(''); setSignaturePreview('');
      setErrors({}); setActiveTab('personal');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && memberId) fetchMember();
  }, [isOpen, memberId]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const memberData = await memberService.getMemberById(memberId);
      if (memberData) {
        const linkedUserRole = await getLinkedUserRole(memberData.memberId || memberId);
        const loadedFormData: FormData = {
          firstName: memberData.firstName || '',
          middleName: memberData.middleName || '',
          lastName: memberData.lastName || '',
          fullName: memberData.fullName || '',
          phone: memberData.phone || '',
          alternatePhone: memberData.alternatePhone || '',
          email: memberData.email || '',
          nidNumber: memberData.nidNumber || '',
          dateOfBirth: memberData.dateOfBirth || '',
          fatherName: memberData.fatherName || '',
          motherName: memberData.motherName || '',
          spouseName: memberData.spouseName || '',
          nomineeName: memberData.nominee?.name || '',
          nomineeRelation: memberData.nominee?.relation || '',
          nomineePhone: memberData.nominee?.phone || '',
          nomineeNid: memberData.nominee?.nid || '',
          nomineeShare: memberData.nominee?.share || 0,
          division: memberData.address?.division || '',
          district: memberData.address?.district || '',
          upazila: memberData.address?.upazila || '',
          union: memberData.address?.union || '',
          village: memberData.address?.village || '',
          presentAddress: memberData.address?.presentAddress || '',
          permanentAddress: memberData.address?.permanentAddress || '',
          sameAsPresent: memberData.address?.sameAsPresent || false,
          shareCount: memberData.membership?.shareCount || 1,
          perShareFee: memberData.membership?.perShareFee || perShareValue,
          monthlyFee: memberData.membership?.monthlyFee || 1000,
          position: memberData.membership?.position || 'General Member',
          role: linkedUserRole || (memberData.membership?.role as UserRole) || 'member',
          status: (memberData.membership?.status as MemberStatus) || 'active',
          dateOfJoin: memberData.membership?.dateOfJoin || new Date().toISOString().split('T')[0],
          totalFeesPaid: memberData.financials?.totalFeesPaid || 0,
          currentLoanBalance: memberData.financials?.currentLoanBalance || 0,
        };
        setFormData(loadedFormData);
        setOriginalFormData(loadedFormData);

        if (memberData.photoUrl) setPhotoPreview(memberData.photoUrl);
        if (memberData.signatureUrl) setSignaturePreview(memberData.signatureUrl);
      }
    } catch (error) {
      console.error('Error fetching member:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const monthlyFee = formData.shareCount * perShareValue;
    setFormData(prev => ({ ...prev, monthlyFee }));
  }, [formData.shareCount, perShareValue]);

  useEffect(() => {
    const fullName = `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.trim();
    setFormData(prev => ({ ...prev, fullName }));
  }, [formData.firstName, formData.middleName, formData.lastName]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '', general: '' }));
  };

  const isFormDataChanged = (): boolean => {
    if (!originalFormData) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: 'File size must be less than 5MB' })); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErrors(prev => ({ ...prev, signature: 'File size must be less than 2MB' })); return; }
    setSignatureFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setSignaturePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => { setPhotoFile(null); setPhotoPreview(''); };
  const removeSignature = () => { setSignatureFile(null); setSignaturePreview(''); };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!isFormDataChanged() && !photoFile && !signatureFile) {
      newErrors.general = 'কোনো পরিবর্তন করা হয়নি। অনুগ্রহ করে কিছু পরিবর্তন করুন।';
    }
    if (formData.shareCount < minShare) newErrors.shareCount = `Minimum share count is ${minShare}`;
    if (formData.shareCount > maxShare) newErrors.shareCount = `Maximum share count is ${maxShare}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const updateData: Partial<Member> = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        fullName: formData.fullName,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        email: formData.email,
        nidNumber: formData.nidNumber,
        dateOfBirth: formData.dateOfBirth,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        spouseName: formData.spouseName,
        nominee: {
          name: formData.nomineeName,
          relation: formData.nomineeRelation,
          phone: formData.nomineePhone,
          nid: formData.nomineeNid,
          share: formData.nomineeShare,
        },
        address: {
          country: 'Bangladesh',
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          union: formData.union,
          village: formData.village,
          presentAddress: formData.presentAddress,
          permanentAddress: formData.sameAsPresent ? formData.presentAddress : formData.permanentAddress,
          sameAsPresent: formData.sameAsPresent,
        },
        membership: {
          dateOfJoin: formData.dateOfJoin,
          membershipType: 'regular',
          position: formData.position,
          role: formData.role,
          status: formData.status,
          shareCount: formData.shareCount,
          perShareFee: perShareValue,
          monthlyFee: formData.monthlyFee,
          totalShareValue: formData.monthlyFee,
        },
      };

      await memberService.updateMember(memberId, updateData, user?.uid || 'system');
      await syncUserRoleByMemberId(memberId, formData.role);

      if (photoFile) {
        await memberService.updateMemberPhoto(memberId, photoFile, user?.uid || 'system');
      }
      if (signatureFile) {
        await memberService.updateMemberSignature(memberId, signatureFile, user?.uid || 'system');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Error updating member');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      cashier: 'bg-blue-100 text-blue-700',
      member: 'bg-green-100 text-green-700',
      manager: 'bg-amber-100 text-amber-700',
      accountant: 'bg-indigo-100 text-indigo-700',
    };
    return roles[role] || roles.member;
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      inactive: 'bg-gray-100 text-gray-700',
      pending: 'bg-amber-100 text-amber-700',
      suspended: 'bg-orange-100 text-orange-700',
      terminated: 'bg-rose-100 text-rose-700',
    };
    return statuses[status] || statuses.inactive;
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'family', label: 'Family', icon: Heart },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'address', label: 'Address', icon: Home },
    { id: 'membership', label: 'Membership', icon: Users },
    { id: 'financial', label: 'Financial', icon: DollarSign },
  ];

  if (loading) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-2xl p-8 shadow-2xl">
              <Loader2 size={40} className="animate-spin text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading member data...</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Edit Member</h2>
                  <p className="text-green-100 mt-1">{formData.fullName || 'Member'} • {memberId}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <div className="flex px-6 gap-1 min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      <Icon size={16} /> {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 max-h-[55vh] overflow-y-auto">
              {errors.general && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errors.general}
                </div>
              )}

              {/* Personal Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                      <input type="text" value={formData.middleName} onChange={(e) => handleInputChange('middleName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NID Number</label>
                      <input type="text" value={formData.nidNumber} onChange={(e) => handleInputChange('nidNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      {photoPreview ? (
                        <div className="relative">
                          <img src={photoPreview} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
                          <button type="button" onClick={removePhoto} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"><User size={24} className="text-gray-400" /></div>
                      )}
                      <label className="cursor-pointer bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 inline-flex items-center">
                        <Upload size={14} className="mr-2" /> Upload Photo
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Family Tab */}
              {activeTab === 'family' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name *</label>
                      <input type="text" value={formData.fatherName} onChange={(e) => handleInputChange('fatherName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.fatherName ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.fatherName && <p className="text-xs text-red-500 mt-1">{errors.fatherName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name *</label>
                      <input type="text" value={formData.motherName} onChange={(e) => handleInputChange('motherName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.motherName ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.motherName && <p className="text-xs text-red-500 mt-1">{errors.motherName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
                      <input type="text" value={formData.spouseName} onChange={(e) => handleInputChange('spouseName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Heart size={16} className="mr-2 text-pink-500" /> Nominee Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Name</label>
                        <input type="text" value={formData.nomineeName} onChange={(e) => handleInputChange('nomineeName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                        <select value={formData.nomineeRelation} onChange={(e) => handleInputChange('nomineeRelation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option value="">Select</option>
                          <option value="Son">Son</option><option value="Daughter">Daughter</option>
                          <option value="Wife">Wife</option><option value="Husband">Husband</option>
                          <option value="Father">Father</option><option value="Mother">Mother</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="tel" value={formData.nomineePhone} onChange={(e) => handleInputChange('nomineePhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Share (%)</label>
                        <input type="number" value={formData.nomineeShare} onChange={(e) => handleInputChange('nomineeShare', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" max="100" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                      <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                      <input type="tel" value={formData.alternatePhone} onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                    <div className="flex items-center gap-4">
                      {signaturePreview ? (
                        <div className="relative">
                          <img src={signaturePreview} alt="Signature" className="w-24 h-16 border-2 border-purple-500 rounded-lg object-contain bg-white" />
                          <button type="button" onClick={removeSignature} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                        </div>
                      ) : (
                        <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"><FileText size={20} className="text-gray-400" /></div>
                      )}
                      <label className="cursor-pointer bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 inline-flex items-center">
                        <Upload size={14} className="mr-2" /> Upload Signature
                        <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Present Address *</label>
                    <textarea value={formData.presentAddress} onChange={(e) => handleInputChange('presentAddress', e.target.value)} rows={2}
                      className={`w-full px-3 py-2 border rounded-lg ${errors.presentAddress ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.presentAddress && <p className="text-xs text-red-500 mt-1">{errors.presentAddress}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sameAsPresent" checked={formData.sameAsPresent}
                      onChange={(e) => handleInputChange('sameAsPresent', e.target.checked)} className="rounded border-gray-300" />
                    <label htmlFor="sameAsPresent" className="text-sm text-gray-600">Same as present address</label>
                  </div>

                  {!formData.sameAsPresent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                      <textarea value={formData.permanentAddress} onChange={(e) => handleInputChange('permanentAddress', e.target.value)} rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                      <input type="text" value={formData.division} onChange={(e) => handleInputChange('division', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <input type="text" value={formData.district} onChange={(e) => handleInputChange('district', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upazila</label>
                      <input type="text" value={formData.upazila} onChange={(e) => handleInputChange('upazila', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                      <input type="text" value={formData.village} onChange={(e) => handleInputChange('village', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </div>
              )}

              {/* Membership Tab */}
              {activeTab === 'membership' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                      <input type="date" value={formData.dateOfJoin} onChange={(e) => handleInputChange('dateOfJoin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Share Count (Min: {minShare}, Max: {maxShare})</label>
                      <select value={formData.shareCount} onChange={(e) => handleInputChange('shareCount', parseInt(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.shareCount ? 'border-red-500' : 'border-gray-300'}`}>
                        {Array.from({ length: Math.min(maxShare, 50) }, (_, i) => i + minShare).map(n => <option key={n} value={n}>{n} Share{n > 1 ? 's' : ''}</option>)}
                      </select>
                      {errors.shareCount && <p className="text-xs text-red-500 mt-1">{errors.shareCount}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee (৳)</label>
                      <input type="number" value={formData.monthlyFee} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                      <p className="text-xs text-gray-500 mt-1">= {formData.shareCount} × {perShareValue}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input type="text" value={formData.position} onChange={(e) => handleInputChange('position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select value={formData.role} onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="member">Member</option><option value="collector">Collector</option><option value="cashier">Cashier</option>
                        <option value="admin">Admin</option><option value="manager">Manager</option>
                        <option value="accountant">Accountant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value as MemberStatus)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="active">Active</option><option value="inactive">Inactive</option>
                        <option value="pending">Pending</option><option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Tab */}
              {activeTab === 'financial' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees Paid (৳)</label>
                      <input type="number" value={formData.totalFeesPaid} onChange={(e) => handleInputChange('totalFeesPaid', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Loan Balance (৳)</label>
                      <input type="number" value={formData.currentLoanBalance} onChange={(e) => handleInputChange('currentLoanBalance', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Financial Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-600">Monthly Fee:</span><span className="ml-2 font-semibold">৳{formData.monthlyFee}</span></div>
                      <div><span className="text-gray-600">Total Shares:</span><span className="ml-2 font-semibold">{formData.shareCount}</span></div>
                      <div><span className="text-gray-600">Total Paid:</span><span className="ml-2 font-semibold text-green-600">৳{formData.totalFeesPaid}</span></div>
                      <div><span className="text-gray-600">Loan Balance:</span><span className="ml-2 font-semibold text-amber-600">৳{formData.currentLoanBalance}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(formData.role)}`}>
                    <Shield size={12} className="mr-1" /> {formData.role}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(formData.status)}`}>
                    <Badge size={12} className="mr-1" /> {formData.status}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={handleSubmit} disabled={saving}
                    className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                    {saving ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : <><Save size={16} className="mr-2" /> Save Changes</>}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditMember;
