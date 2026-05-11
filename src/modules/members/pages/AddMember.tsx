// src/pages/Members/AddMember.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ArrowRight, ArrowLeft, CheckCircle2, Upload, X, Save,
  Users, Home, FileText, Heart, Loader2
} from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { memberService } from '../services/memberService';
import AddressSelect from '../components/addMember/AddressSelect';
import type { UserRole } from '../../../types';

// Initial Form State - somity data!
const initialFormState = {
  personal: {
    firstName: '',
    middleName: '',
    lastName: '',
    fullName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    nidNumber: '',
    dateOfBirth: '',
    photoUrl: '',
    signatureUrl: ''
  },
  family: {
    fatherName: '',
    motherName: '',
    spouseName: '',
    nominee: {
      name: '',
      relation: '',
      nid: '',
      phone: '',
      share: 0
    },
    referenceMemberId: ''
  },
  address: {
    country: 'Bangladesh',
    division: '',
    district: '',
    upazila: '',
    union: '',
    village: '',
    presentAddress: '',
    permanentAddress: '',
    sameAsPresent: false
  },
  membership: {
    memberId: '',
    dateOfJoin: new Date().toISOString().split('T')[0],
    membershipType: 'regular' as const,
    position: 'General Member',
    role: 'member' as UserRole,
    status: 'active' as const,
    shareCount: 1,
    perShareFee: 0,
    monthlyFee: 0,
    totalShareValue: 0
  },
  financials: {
    totalFeesPaid: 0,
    lastFeePaidMonth: null,
    lastFeePaidYear: null,
    totalPendingMonths: 0,
    totalPendingAmount: 0,
    monthlyDueAmount: 0,
    currentLoanBalance: 0,
    isLoanActive: false,
    totalLoanPaid: 0,
    totalSavings: 0,
    activeLoanBalance: 0,
    dueAmount: 0
  },
  verification: {
    status: 'pending' as const,
    verifiedBy: null,
    verifiedAt: null
  },
  metadata: {
    createdBy: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false
  }
};

const AddMember = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [signaturePreview, setSignaturePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user, somityInfo } = useAuth();
  const { settings, loading: settingsLoading } = useSomitySettings();
  const navigate = useNavigate();

  // Get settings values
  const shareSettings = settings?.share;
  const feeSettings = settings?.fee;
  const memberSettings = settings?.member;

  // Calculate values from settings
  const perShareValue = shareSettings?.perShareValue || 1000;
  const minShare = shareSettings?.minShare || 1;
  const maxShare = shareSettings?.maxShare || 100;
  const defaultShare = shareSettings?.defaultShare || 1;
  const feeAmountPerShare = feeSettings?.amountPerShare || 1000;
  const defaultMonthlyFee = defaultShare * feeAmountPerShare;
  const memberIdPrefix = memberSettings?.memberIdPrefix || 'MBR-';
  const memberIdDigitLength = memberSettings?.memberIdDigitLength || 3;

  // Generate member ID
  const generateMemberId = () => {
    const randomNum = Math.floor(Math.random() * Math.pow(10, memberIdDigitLength));
    const paddedNum = randomNum.toString().padStart(memberIdDigitLength, '0');
    return `${memberIdPrefix}${paddedNum}`;
  };

  // Initialize form with settings
  useEffect(() => {
    if (!settingsLoading) {
      setFormData(prev => ({
        ...prev,
        membership: {
          ...prev.membership,
          memberId: memberSettings?.autoGenerateMemberId ? generateMemberId() : '',
          perShareFee: perShareValue,
          shareCount: defaultShare,
          monthlyFee: defaultMonthlyFee,
          totalShareValue: defaultMonthlyFee
        },
        financials: {
          ...prev.financials,
          monthlyDueAmount: defaultMonthlyFee
        },
        metadata: {
          ...prev.metadata,
          createdBy: user?.uid || 'system'
        }
      }));
    }
  }, [settingsLoading, user?.uid]);

  // Calculate monthly fee when shareCount or perShareFee changes
  useEffect(() => {
    const monthlyFee = (formData.membership.shareCount || 1) * (formData.membership.perShareFee || perShareValue);
    setFormData(prev => ({
      ...prev,
      membership: { ...prev.membership, monthlyFee, totalShareValue: monthlyFee },
      financials: { ...prev.financials, monthlyDueAmount: monthlyFee }
    }));
  }, [formData.membership.shareCount, formData.membership.perShareFee, perShareValue]);

  // Generate full name
  useEffect(() => {
    const fullName = `${formData.personal.firstName} ${formData.personal.middleName || ''} ${formData.personal.lastName}`.trim();
    setFormData(prev => ({ ...prev, personal: { ...prev.personal, fullName } }));
  }, [formData.personal.firstName, formData.personal.middleName, formData.personal.lastName]);

  // Handlers
  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    if (errors[path]) setErrors(prev => ({ ...prev, [path]: '' }));
  };

  const handleAddressChange = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        division: addressData.division,
        district: addressData.district,
        upazila: addressData.upazila,
        union: addressData.union,
        village: addressData.village
      }
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: 'File size must be less than 5MB' })); return; }
    if (!file.type.startsWith('image/')) { setErrors(prev => ({ ...prev, photo: 'File must be an image' })); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErrors(prev => ({ ...prev, signature: 'File size must be less than 2MB' })); return; }
    if (!file.type.startsWith('image/')) { setErrors(prev => ({ ...prev, signature: 'File must be an image' })); return; }
    setSignatureFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setSignaturePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => { setPhotoFile(null); setPhotoPreview(''); };
  const removeSignature = () => { setSignatureFile(null); setSignaturePreview(''); };

  const regenerateMemberId = () => {
    const newId = generateMemberId();
    handleInputChange('membership.memberId', newId);
  };

  // Validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.membership.memberId?.trim()) newErrors['membership.memberId'] = 'Member ID is required';
    if (!formData.personal.firstName?.trim()) newErrors['personal.firstName'] = 'First name is required';
    if (!formData.personal.lastName?.trim()) newErrors['personal.lastName'] = 'Last name is required';
    if (!formData.personal.phone?.trim()) newErrors['personal.phone'] = 'Phone number is required';
    if (!formData.personal.dateOfBirth) newErrors['personal.dateOfBirth'] = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.family.fatherName?.trim()) newErrors['family.fatherName'] = "Father's name is required";
    if (!formData.family.motherName?.trim()) newErrors['family.motherName'] = "Mother's name is required";
    if (formData.membership.shareCount < minShare) newErrors['membership.shareCount'] = `Minimum share count is ${minShare}`;
    if (formData.membership.shareCount > maxShare) newErrors['membership.shareCount'] = `Maximum share count is ${maxShare}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.address.district?.trim()) newErrors['address.district'] = 'District is required';
    if (!formData.address.presentAddress?.trim()) newErrors['address.presentAddress'] = 'Present address is required';
    if (!formData.address.sameAsPresent && !formData.address.permanentAddress?.trim()) newErrors['address.permanentAddress'] = 'Permanent address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Family & Membership', icon: Users },
    { number: 3, title: 'Address & Documents', icon: Home },
  ];

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Submit Handler - Single somity data!
  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    setLoading(true);
    
    try {
      const finalMemberId = formData.membership.memberId;
      if (!finalMemberId) {
        alert('Please enter a Member ID');
        setLoading(false);
        return;
      }

      const memberData = {
        memberId: finalMemberId,
        personal: formData.personal,
        family: formData.family,
        address: {
          ...formData.address,
          permanentAddress: formData.address.sameAsPresent ? formData.address.presentAddress : formData.address.permanentAddress
        },
        membership: {
          ...formData.membership,
          monthlyFee: formData.membership.monthlyFee,
          totalShareValue: formData.membership.monthlyFee,
          shareCount: formData.membership.shareCount,
          perShareFee: perShareValue
        },
        createdBy: user?.uid || 'system'
      };

      // Single somity data!
      await memberService.addMember(memberData, photoFile, signatureFile);
      
      alert(`✅ Member successfully added!\n\nMember ID: ${finalMemberId}\nName: ${formData.personal.fullName}\nMonthly Fee: ৳${formData.membership.monthlyFee}`);
      
      navigate('/members/index');
      
    } catch (error: any) {
      console.error('Error saving member:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getError = (field: string) => errors[field];

  if (settingsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Add New Member</h1>
          <p className="text-sm text-gray-600">Complete the member registration process</p>
          {somityInfo && (
            <p className="text-xs text-green-600 mt-1">Somity: {somityInfo.name}</p>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Share Value: ৳{perShareValue} | Monthly Fee: ৳{feeAmountPerShare}/share | Max Share: {maxShare}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-sm">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.number ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.number ? <CheckCircle2 size={16} /> : <StepIcon size={16} />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${currentStep >= step.number ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-3 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-green-500 to-cyan-500"></div>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <User className="mr-3 text-green-500" size={24} /> Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Member ID */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member ID <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <input type="text" value={formData.membership.memberId}
                          onChange={(e) => handleInputChange('membership.memberId', e.target.value.toUpperCase())}
                          className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 ${getError('membership.memberId') ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder={`e.g., ${memberIdPrefix}001`} />
                        {memberSettings?.autoGenerateMemberId && (
                          <button type="button" onClick={regenerateMemberId} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Generate</button>
                        )}
                      </div>
                      {getError('membership.memberId') && <p className="text-xs text-red-500 mt-1">{getError('membership.memberId')}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Join Date <span className="text-red-500">*</span></label>
                      <input type="date" value={formData.membership.dateOfJoin}
                        onChange={(e) => handleInputChange('membership.dateOfJoin', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.personal.firstName}
                        onChange={(e) => handleInputChange('personal.firstName', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg ${getError('personal.firstName') ? 'border-red-500' : 'border-gray-300'}`} />
                      {getError('personal.firstName') && <p className="text-xs text-red-500 mt-1">{getError('personal.firstName')}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                      <input type="text" value={formData.personal.middleName}
                        onChange={(e) => handleInputChange('personal.middleName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.personal.lastName}
                        onChange={(e) => handleInputChange('personal.lastName', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg ${getError('personal.lastName') ? 'border-red-500' : 'border-gray-300'}`} />
                      {getError('personal.lastName') && <p className="text-xs text-red-500 mt-1">{getError('personal.lastName')}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Auto-generated)</label>
                      <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600">{formData.personal.fullName}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                      <input type="tel" value={formData.personal.phone}
                        onChange={(e) => handleInputChange('personal.phone', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg ${getError('personal.phone') ? 'border-red-500' : 'border-gray-300'}`} />
                      {getError('personal.phone') && <p className="text-xs text-red-500 mt-1">{getError('personal.phone')}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                      <input type="tel" value={formData.personal.alternatePhone}
                        onChange={(e) => handleInputChange('personal.alternatePhone', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" value={formData.personal.email}
                        onChange={(e) => handleInputChange('personal.email', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NID Number</label>
                      <input type="text" value={formData.personal.nidNumber}
                        onChange={(e) => handleInputChange('personal.nidNumber', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                      <input type="date" value={formData.personal.dateOfBirth}
                        onChange={(e) => handleInputChange('personal.dateOfBirth', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg ${getError('personal.dateOfBirth') ? 'border-red-500' : 'border-gray-300'}`} />
                      {getError('personal.dateOfBirth') && <p className="text-xs text-red-500 mt-1">{getError('personal.dateOfBirth')}</p>}
                    </div>

                    {/* Profile Photo */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                      <div className="flex items-center space-x-4">
                        {photoPreview ? (
                          <div className="relative">
                            <img src={photoPreview} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
                            <button type="button" onClick={removePhoto} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center"><User size={20} className="text-gray-400" /></div>
                        )}
                        <div>
                          <label className="cursor-pointer bg-green-500 text-white px-3 py-2 text-sm rounded-lg hover:bg-green-600 inline-flex items-center">
                            <Upload size={14} className="mr-2" /> Upload Photo
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Family & Membership */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Users className="mr-3 text-blue-500" size={24} /> Family & Membership
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Family Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name <span className="text-red-500">*</span></label>
                          <input type="text" value={formData.family.fatherName}
                            onChange={(e) => handleInputChange('family.fatherName', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg ${getError('family.fatherName') ? 'border-red-500' : 'border-gray-300'}`} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name <span className="text-red-500">*</span></label>
                          <input type="text" value={formData.family.motherName}
                            onChange={(e) => handleInputChange('family.motherName', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg ${getError('family.motherName') ? 'border-red-500' : 'border-gray-300'}`} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
                          <input type="text" value={formData.family.spouseName}
                            onChange={(e) => handleInputChange('family.spouseName', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Nominee */}
                    <div className="bg-gradient-to-r from-pink-50 to-red-50 p-4 rounded-lg border border-pink-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center"><Heart className="mr-2 text-pink-500" size={20} /> Nominee</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Name</label>
                          <input type="text" value={formData.family.nominee.name}
                            onChange={(e) => handleInputChange('family.nominee.name', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                          <select value={formData.family.nominee.relation}
                            onChange={(e) => handleInputChange('family.nominee.relation', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                            <option value="">Select</option>
                            <option value="Son">Son</option><option value="Daughter">Daughter</option>
                            <option value="Wife">Wife</option><option value="Husband">Husband</option>
                            <option value="Father">Father</option><option value="Mother">Mother</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Phone</label>
                          <input type="tel" value={formData.family.nominee.phone}
                            onChange={(e) => handleInputChange('family.nominee.phone', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Share (%)</label>
                          <input type="number" value={formData.family.nominee.share || ''}
                            onChange={(e) => handleInputChange('family.nominee.share', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" min="0" max="100" />
                        </div>
                      </div>
                    </div>

                    {/* Membership */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Membership</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Share Count (Min: {minShare}, Max: {maxShare})</label>
                          <select value={formData.membership.shareCount}
                            onChange={(e) => handleInputChange('membership.shareCount', parseInt(e.target.value))}
                            className={`w-full px-3 py-2 text-sm border rounded-lg ${getError('membership.shareCount') ? 'border-red-500' : 'border-gray-300'}`}>
                            {Array.from({ length: Math.min(maxShare, 20) }, (_, i) => i + minShare).map(n => <option key={n} value={n}>{n} Share{n > 1 ? 's' : ''}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Per Share Fee (৳)</label>
                          <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600">৳{perShareValue}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee (৳)</label>
                          <div className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg bg-green-50 text-green-700 font-medium">৳{formData.membership.monthlyFee}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Member Role</label>
                          <select value={formData.membership.role}
                            onChange={(e) => handleInputChange('membership.role', e.target.value as UserRole)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                            <option value="member">Member</option><option value="cashier">Cashier</option><option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <input type="text" value={formData.membership.position}
                            onChange={(e) => handleInputChange('membership.position', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Address & Documents */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center"><Home className="mr-3 text-purple-500" size={24} /> Address & Documents</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Address</h3>
                      <AddressSelect value={{ division: formData.address.division, district: formData.address.district, upazila: formData.address.upazila, union: formData.address.union, village: formData.address.village }}
                        onChange={handleAddressChange} errors={{ division: errors['address.division'], district: errors['address.district'] }} />
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Present Address <span className="text-red-500">*</span></label>
                        <textarea value={formData.address.presentAddress}
                          onChange={(e) => handleInputChange('address.presentAddress', e.target.value)} rows={2}
                          className={`w-full px-3 py-2 text-sm border rounded-lg ${getError('address.presentAddress') ? 'border-red-500' : 'border-gray-300'}`} />
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <input type="checkbox" id="sameAsPresent" checked={formData.address.sameAsPresent}
                          onChange={(e) => handleInputChange('address.sameAsPresent', e.target.checked)} className="rounded" />
                        <label htmlFor="sameAsPresent" className="text-sm text-gray-600">Same as present address</label>
                      </div>
                      {!formData.address.sameAsPresent && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                          <textarea value={formData.address.permanentAddress}
                            onChange={(e) => handleInputChange('address.permanentAddress', e.target.value)} rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                        </div>
                      )}
                    </div>

                    {/* Signature */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Signature</h3>
                      <div className="flex items-center space-x-4">
                        {signaturePreview ? (
                          <div className="relative">
                            <img src={signaturePreview} alt="Signature" className="w-24 h-16 border-2 border-purple-500 rounded-lg object-contain bg-white" />
                            <button type="button" onClick={removeSignature} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                          </div>
                        ) : (
                          <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"><FileText size={20} className="text-gray-400" /></div>
                        )}
                        <label className="cursor-pointer bg-purple-500 text-white px-3 py-2 text-sm rounded-lg hover:bg-purple-600 inline-flex items-center">
                          <Upload size={14} className="mr-2" /> Upload Signature
                          <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">Registration Summary</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><span className="text-gray-600">Member ID:</span> <span className="ml-2 font-medium">{formData.membership.memberId}</span></div>
                        <div><span className="text-gray-600">Name:</span> <span className="ml-2 font-medium">{formData.personal.fullName}</span></div>
                        <div><span className="text-gray-600">Phone:</span> <span className="ml-2 font-medium">{formData.personal.phone}</span></div>
                        <div><span className="text-gray-600">Monthly Fee:</span> <span className="ml-2 font-medium">৳{formData.membership.monthlyFee}</span></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <button type="button" onClick={prevStep} disabled={currentStep === 1}
                className="flex items-center px-4 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <ArrowLeft size={16} className="mr-2" /> Previous
              </button>
              <div className="flex items-center space-x-3">
                <button type="button" onClick={() => navigate('/members/index')} className="px-4 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                {currentStep < steps.length ? (
                  <button type="button" onClick={nextStep} className="flex items-center px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Next <ArrowRight size={16} className="ml-2" />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading}
                    className="flex items-center px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                    {loading ? <><Loader2 size={14} className="animate-spin mr-2" /> Saving...</> : <><Save size={16} className="mr-2" /> Complete Registration</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMember;
