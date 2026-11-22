// src/pages/Members/AddMember.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ArrowRight, ArrowLeft, CheckCircle2, Upload, X, Save,
  Users, Home, FileText, Heart, Loader2, AlertCircle, Check,
  Calendar, Phone, Mail, MapPin, IdCard, CreditCard, Shield
} from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { memberService } from '../services/memberService';
import AddressSelect from '../components/addMember/AddressSelect';
import type { UserRole } from '../../../types';
import { toast } from 'sonner';

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
    gender: 'male' as const,
    bloodGroup: '',
    occupation: '',
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
  emergencyContact: {
    name: '',
    phone: '',
    relation: ''
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

  // Calculate values from settings
  const perShareValue = shareSettings?.perShareValue || 1000;
  const minShare = shareSettings?.minShare || 1;
  const maxShare = shareSettings?.maxShare || 100;
  const defaultShare = shareSettings?.defaultShare || 1;
  const feeAmountPerShare = feeSettings?.amountPerShare || 1000;
  const defaultMonthlyFee = defaultShare * feeAmountPerShare;

  // Initialize form with settings (no auto Member ID generation)
  useEffect(() => {
    if (!settingsLoading) {
      setFormData(prev => ({
        ...prev,
        membership: {
          ...prev.membership,
          memberId: '', // Manual entry required - no auto-generation
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

  
  // Validation with Bengali messages
  const getErrorMessage = (field: string): string => {
    const messages: Record<string, string> = {
      'membership.memberId': 'সদস্য আইডি আবশ্যক',
      'personal.firstName': 'প্রথম নাম আবশ্যক',
      'personal.lastName': 'উপনাম আবশ্যক',
      'personal.phone': 'ফোন নম্বর আবশ্যক',
      'personal.dateOfBirth': 'জন্ম তারিখ আবশ্যক',
      'family.fatherName': "পিতার নাম আবশ্যক",
      'family.motherName': "মাতার নাম আবশ্যক",
      'membership.shareCount': `সর্বনিম্ন শেয়ার ${minShare} এবং সর্বোচ্চ ${maxShare}`,
      'address.district': 'জেলা আবশ্যক',
      'address.presentAddress': 'বর্তমান ঠিকানা আবশ্যক',
      'address.permanentAddress': 'স্থায়ী ঠিকানা আবশ্যক',
    };
    return messages[field] || 'This field is required';
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.membership.memberId?.trim()) newErrors['membership.memberId'] = getErrorMessage('membership.memberId');
    if (!formData.personal.firstName?.trim()) newErrors['personal.firstName'] = getErrorMessage('personal.firstName');
    if (!formData.personal.lastName?.trim()) newErrors['personal.lastName'] = getErrorMessage('personal.lastName');
    if (!formData.personal.phone?.trim()) newErrors['personal.phone'] = getErrorMessage('personal.phone');
    if (!formData.personal.dateOfBirth) newErrors['personal.dateOfBirth'] = getErrorMessage('personal.dateOfBirth');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('দয়া করে আবশ্যক ফিল্ডগুলো পূরণ করুন');
    }
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.family.fatherName?.trim()) newErrors['family.fatherName'] = getErrorMessage('family.fatherName');
    if (!formData.family.motherName?.trim()) newErrors['family.motherName'] = getErrorMessage('family.motherName');
    if (formData.membership.shareCount < minShare || formData.membership.shareCount > maxShare) {
      newErrors['membership.shareCount'] = getErrorMessage('membership.shareCount');
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('দয়া করে আবশ্যক ফিল্ডগুলো পূরণ করুন');
    }
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.address.district?.trim()) newErrors['address.district'] = getErrorMessage('address.district');
    if (!formData.address.presentAddress?.trim()) newErrors['address.presentAddress'] = getErrorMessage('address.presentAddress');
    if (!formData.address.sameAsPresent && !formData.address.permanentAddress?.trim()) {
      newErrors['address.permanentAddress'] = getErrorMessage('address.permanentAddress');
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('দয়া করে আবশ্যক ফিল্ডগুলো পূরণ করুন');
    }
    return Object.keys(newErrors).length === 0;
  };

  // Validate Member ID format
  const validateMemberId = useCallback((value: string) => {
    if (!value.trim()) return;
    const upperValue = value.toUpperCase();
    // Allow alphanumeric, hyphens, underscores
    if (!/^[A-Z0-9\-_]+$/.test(upperValue)) {
      setErrors(prev => ({ ...prev, 'membership.memberId': 'Member ID can only contain letters, numbers, hyphens, and underscores' }));
      return;
    }
    if (upperValue.length < 3 || upperValue.length > 20) {
      setErrors(prev => ({ ...prev, 'membership.memberId': 'Member ID must be 3-20 characters' }));
      return;
    }
    setErrors(prev => {
      const next = { ...prev };
      delete next['membership.memberId'];
      return next;
    });
  }, []);

  const steps = [
    { number: 1, title: 'Personal Info', bnTitle: 'ব্যক্তিগত তথ্য', icon: User },
    { number: 2, title: 'Family & Membership', bnTitle: 'পরিবার ও সদস্যাত্ব', icon: Users },
    { number: 3, title: 'Address & Documents', bnTitle: 'ঠিকানা ও নথি', icon: Home },
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
        toast.error('দয়া করে সদস্য আইডি লিখুন');
        setLoading(false);
        return;
      }

      const memberData = {
        memberId: finalMemberId,
        personal: formData.personal,
        family: formData.family,
        emergencyContact: formData.emergencyContact,
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

      toast.success(`✅ সদস্য সফলভাবে যোগ করা হয়েছে!`, {
        description: `Member ID: ${finalMemberId} | নাম: ${formData.personal.fullName} | মাসিক ফি: ৳${formData.membership.monthlyFee}`,
        duration: 5000
      });

      navigate('/members/index');

    } catch (error: any) {
      console.error('Error saving member:', error);
      toast.error(`❌ ত্রুটি: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getError = (field: string) => errors[field];
  const inputClass = (field?: string) =>
    `block w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 ${
      field && getError(field) ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
    }`;
  const readOnlyClass = 'block min-h-[40px] w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 shadow-sm';
  const secondaryButtonClass = 'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
  const primaryButtonClass = 'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

  if (settingsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 to-cyan-50 px-3 py-4 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Users className="text-green-600 h-5 w-5 sm:h-6 sm:w-6" />
            নতুন সদস্য যোগ করুন
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">সদস্য নিবন্ধন প্রক্রিয়া পূরণ করুন</p>
          {somityInfo && (
            <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
              <Shield size={12} /> সমিতি: {somityInfo.name}
            </p>
          )}
        </div>

        {/* Progress Steps - Mobile Optimized */}
        <div className="mb-6 flex justify-center overflow-x-auto pb-2">
          <div className="inline-flex min-w-max items-center rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep >= step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    isActive ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={14} /> : <StepIcon size={14} />}
                  </div>
                  {/* Mobile: Show only icons; Desktop: Show labels */}
                  <div className="hidden sm:block ml-1.5">
                    <span className={`whitespace-nowrap text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {step.title}
                    </span>
                    <span className={`block whitespace-nowrap text-[10px] ${isActive ? 'text-green-500' : 'text-gray-300'}`}>
                      {step.bnTitle}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-2 h-0.5 w-8 sm:w-12 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container - Simplified card, full width on mobile */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="h-1 bg-gradient-to-r from-green-500 to-cyan-500"></div>

          <div className="p-3 sm:p-5 lg:p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                  <h2 className="mb-4 flex items-center text-lg sm:text-xl font-semibold text-gray-800">
                    <User className="mr-2 sm:mr-3 text-green-500 h-5 w-5 sm:h-6 sm:w-6" /> ব্যক্তিগত তথ্য
                  </h2>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2 lg:gap-x-5 lg:gap-y-4">
                    {/* Member ID */}
                    <div className="md:col-span-2">
                      <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <IdCard size={16} className="text-blue-500" />
                        Member ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input type="text" value={formData.membership.memberId}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            handleInputChange('membership.memberId', value);
                            validateMemberId(value);
                          }}
                          onBlur={(e) => validateMemberId(e.target.value)}
                          className={`${inputClass('membership.memberId')} pr-10`}
                          placeholder="Enter unique Member ID (e.g., MEM001, M001)" maxLength={20} />
                        {errors['membership.memberId'] ? (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                        ) : formData.membership.memberId?.trim() ? (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        ) : null}
                      </div>
                      {getError('membership.memberId') && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{getError('membership.memberId')}</p>}
                      <p className="text-xs text-gray-500 mt-1">আবশ্যক: এই সদস্যের অনন্য শনাক্তকারী। পরে পরিবর্তন করা যাবে না।</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Calendar size={14} className="text-blue-500" />
                        Join Date <span className="text-red-500">*</span>
                      </label>
                      <input type="date" value={formData.membership.dateOfJoin}
                        onChange={(e) => handleInputChange('membership.dateOfJoin', e.target.value)}
                        className={inputClass()} />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <User size={14} className="text-blue-500" />
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" value={formData.personal.firstName}
                        onChange={(e) => handleInputChange('personal.firstName', e.target.value)}
                        className={inputClass('personal.firstName')}
                        placeholder="প্রথম নাম লিখুন" />
                      {getError('personal.firstName') && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{getError('personal.firstName')}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <User size={14} className="text-gray-400" />
                        Middle Name
                      </label>
                      <input type="text" value={formData.personal.middleName}
                        onChange={(e) => handleInputChange('personal.middleName', e.target.value)}
                        className={inputClass()}
                        placeholder="মধ্যের নাম (ঐচ্ছিক)" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <User size={14} className="text-blue-500" />
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" value={formData.personal.lastName}
                        onChange={(e) => handleInputChange('personal.lastName', e.target.value)}
                        className={inputClass('personal.lastName')}
                        placeholder="উপনাম লিখুন" />
                      {getError('personal.lastName') && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{getError('personal.lastName')}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <User size={14} className="text-gray-400" />
                        Full Name (Auto-generated)
                      </label>
                      <div className={readOnlyClass}>{formData.personal.fullName || 'পুরো নাম এখানে দেখাবে'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Phone size={14} className="text-blue-500" />
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input type="tel" value={formData.personal.phone}
                        onChange={(e) => handleInputChange('personal.phone', e.target.value)}
                        className={inputClass('personal.phone')}
                        placeholder="01XXXXXXXXX" />
                      {getError('personal.phone') && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{getError('personal.phone')}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Phone size={14} className="text-gray-400" />
                        Alternate Phone
                      </label>
                      <input type="tel" value={formData.personal.alternatePhone}
                        onChange={(e) => handleInputChange('personal.alternatePhone', e.target.value)}
                        className={inputClass()}
                        placeholder="01XXXXXXXXX" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Mail size={14} className="text-gray-400" />
                        Email Address
                      </label>
                      <input type="email" value={formData.personal.email}
                        onChange={(e) => handleInputChange('personal.email', e.target.value)}
                        className={inputClass()}
                        placeholder="name@example.com" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <IdCard size={14} className="text-gray-400" />
                        NID Number
                      </label>
                      <input type="text" value={formData.personal.nidNumber}
                        onChange={(e) => handleInputChange('personal.nidNumber', e.target.value)}
                        className={inputClass()}
                        placeholder="জাতীয় পরিচয়পত্র নম্বর" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Calendar size={14} className="text-blue-500" />
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input type="date" value={formData.personal.dateOfBirth}
                        onChange={(e) => handleInputChange('personal.dateOfBirth', e.target.value)}
                        className={inputClass('personal.dateOfBirth')} />
                      {getError('personal.dateOfBirth') && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{getError('personal.dateOfBirth')}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <User size={14} className="text-gray-400" />
                        Occupation
                      </label>
                      <input type="text" value={formData.personal.occupation}
                        onChange={(e) => handleInputChange('personal.occupation', e.target.value)}
                        className={inputClass()}
                        placeholder="পেশা/ব্যবসা লিখুন" />
                    </div>

                    {/* Profile Photo */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                      <div className="flex flex-wrap items-center gap-4">
                        {photoPreview ? (
                          <div className="relative">
                            <img src={photoPreview} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
                            <button type="button" onClick={removePhoto} className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white shadow-sm transition hover:bg-red-600"><X size={12} /></button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center"><User size={20} className="text-gray-400" /></div>
                        )}
                        <div>
                          <label className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98]">
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
                    <Users className="mr-3 text-blue-500" size={24} /> পরিবার ও সদস্যাত্ব
                  </h2>
                  <div className="space-y-6">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-blue-500" /> পরিবার संबंधিত তথ্য
                      </h3>
                      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <User size={14} className="text-blue-500" />
                            পিতার নাম <span className="text-red-500">*</span>
                          </label>
                          <input type="text" value={formData.family.fatherName}
                            onChange={(e) => handleInputChange('family.fatherName', e.target.value)}
                            className={inputClass('family.fatherName')}
                            placeholder="পিতার নাম লিখুন" />
                          {getError('family.fatherName') && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10} />{getError('family.fatherName')}</p>}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <User size={14} className="text-blue-500" />
                            মাতার নাম <span className="text-red-500">*</span>
                          </label>
                          <input type="text" value={formData.family.motherName}
                            onChange={(e) => handleInputChange('family.motherName', e.target.value)}
                            className={inputClass('family.motherName')}
                            placeholder="মাতার নাম লিখুন" />
                          {getError('family.motherName') && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10} />{getError('family.motherName')}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Nominee */}
                    <div className="rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50 to-red-50 p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center"><Heart className="mr-2 text-pink-500" size={20} /> মনোনীত ব্যক্তি (Nominee)</h3>
                      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <User size={14} className="text-pink-500" />
                            মনোনীত ব্যক্তির নাম
                          </label>
                          <input type="text" value={formData.family.nominee.name}
                            onChange={(e) => handleInputChange('family.nominee.name', e.target.value)}
                            className={inputClass()}
                            placeholder="মনোনীত ব্যক্তির নাম লিখুন" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Heart size={14} className="text-pink-500" />
                            সম্পর্ক
                          </label>
                          <select value={formData.family.nominee.relation}
                            onChange={(e) => handleInputChange('family.nominee.relation', e.target.value)}
                            className={inputClass()}>
                            <option value="">নির্বাচন করুন</option>
                            <option value="Son">পুত্র</option><option value="Daughter">পুত্রী</option>
                            <option value="Wife">স্ত্রী</option><option value="Husband">স্বামী</option>
                            <option value="Father">পিতা</option><option value="Mother">মাতা</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Phone size={14} className="text-pink-500" />
                            মনোনীত ব্যক্তির ফোন
                          </label>
                          <input type="tel" value={formData.family.nominee.phone}
                            onChange={(e) => handleInputChange('family.nominee.phone', e.target.value)}
                            className={inputClass()}
                            placeholder="মনোনীত ব্যক্তির ফোন নম্বর" />
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center"><Phone className="mr-2 text-amber-500" size={20} /> জরুরি যোগাযোগ (Emergency Contact)</h3>
                      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <User size={14} className="text-amber-500" />
                            নাম
                          </label>
                          <input type="text" value={formData.emergencyContact.name}
                            onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                            className={inputClass()}
                            placeholder="জরুরি যোগাযোগের ব্যক্তির নাম" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Phone size={14} className="text-amber-500" />
                            ফোন নম্বর
                          </label>
                          <input type="tel" value={formData.emergencyContact.phone}
                            onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                            className={inputClass()}
                            placeholder="ফোন নম্বর" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Heart size={14} className="text-amber-500" />
                            সম্পর্ক
                          </label>
                          <select value={formData.emergencyContact.relation}
                            onChange={(e) => handleInputChange('emergencyContact.relation', e.target.value)}
                            className={inputClass()}>
                            <option value="">নির্বাচন করুন</option>
                            <option value="Spouse">স্ত্রী/স্বামী</option>
                            <option value="Father">পিতা</option>
                            <option value="Mother">মাতা</option>
                            <option value="Sibling">ভাই/বোন</option>
                            <option value="Child">পুত্র/পুত্রী</option>
                            <option value="Friend">বন্ধু</option>
                            <option value="Other">অন্যান্য</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Membership */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard size={20} className="text-green-500" /> সদস্যাত্ব বিবরণ
                      </h3>
                      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <CreditCard size={14} className="text-blue-500" />
                            শেয়ার সংখ্যা (ন্যূনতম: {minShare}, সর্বোচ্চ: {maxShare})
                          </label>
                          <select value={formData.membership.shareCount}
                            onChange={(e) => handleInputChange('membership.shareCount', parseInt(e.target.value))}
                            className={inputClass('membership.shareCount')}>
                            {Array.from({ length: Math.min(maxShare, 20) }, (_, i) => i + minShare).map(n => <option key={n} value={n}>{n} শেয়ার</option>)}
                          </select>
                          {getError('membership.shareCount') && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10} />{getError('membership.shareCount')}</p>}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <CreditCard size={14} className="text-gray-400" />
                            প্রতি শেয়ার ফি (৳)
                          </label>
                          <div className={readOnlyClass}>৳{perShareValue}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <CreditCard size={14} className="text-green-500" />
                            মাসিক ফি (৳)
                          </label>
                          <div className="block min-h-[42px] w-full rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 shadow-sm">৳{formData.membership.monthlyFee}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Shield size={14} className="text-gray-400" />
                            সদস্যের ভূমিকা
                          </label>
                          <select value={formData.membership.role}
                            onChange={(e) => handleInputChange('membership.role', e.target.value as UserRole)}
                            className={inputClass()}>
                            <option value="admin">অ্যাডমিন</option><option value="president">প্রেসিডেন্ট</option>
                            <option value="manager">ম্যানেজার</option><option value="accountant">অ্যাকাউন্ট্যান্ট</option>
                            <option value="cashier">ক্যাশিয়ার</option><option value="member">সদস্য</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Shield size={14} className="text-gray-400" />
                            পদবী
                          </label>
                          <input type="text" value={formData.membership.position}
                            onChange={(e) => handleInputChange('membership.position', e.target.value)}
                            className={inputClass()}
                            placeholder="পদবী লিখুন" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Address & Documents */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center"><Home className="mr-3 text-purple-500" size={24} /> ঠিকানা ও নথি</h2>
                  <div className="space-y-6">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-purple-500" /> ঠিকানা
                      </h3>
                      <AddressSelect value={{ division: formData.address.division, district: formData.address.district, upazila: formData.address.upazila, union: formData.address.union, village: formData.address.village }}
                        onChange={handleAddressChange} errors={{ division: errors['address.division'], district: errors['address.district'] }} />
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <MapPin size={14} className="text-blue-500" />
                          বর্তমান ঠিকানা <span className="text-red-500">*</span>
                        </label>
                        <textarea value={formData.address.presentAddress}
                          onChange={(e) => handleInputChange('address.presentAddress', e.target.value)} rows={2}
                          className={inputClass('address.presentAddress')}
                          placeholder="বর্তমান ঠিকানা লিখুন" />
                        {getError('address.presentAddress') && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10} />{getError('address.presentAddress')}</p>}
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <input type="checkbox" id="sameAsPresent" checked={formData.address.sameAsPresent}
                          onChange={(e) => handleInputChange('address.sameAsPresent', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <label htmlFor="sameAsPresent" className="text-sm text-gray-600">স্থায়ী ঠিকানা বর্তমান ঠিকানার মতোই</label>
                      </div>
                      {!formData.address.sameAsPresent && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            স্থায়ী ঠিকানা
                          </label>
                          <textarea value={formData.address.permanentAddress}
                            onChange={(e) => handleInputChange('address.permanentAddress', e.target.value)} rows={2}
                            className={inputClass('address.permanentAddress')}
                            placeholder="স্থায়ী ঠিকানা লিখুন" />
                          {getError('address.permanentAddress') && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10} />{getError('address.permanentAddress')}</p>}
                        </div>
                      )}
                    </div>

                    {/* Signature */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-purple-500" /> স্বাক্ষর
                      </h3>
                      <div className="flex flex-wrap items-center gap-4">
                        {signaturePreview ? (
                          <div className="relative">
                            <img src={signaturePreview} alt="Signature" className="w-24 h-16 border-2 border-purple-500 rounded-lg object-contain bg-white" />
                            <button type="button" onClick={removeSignature} className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white shadow-sm transition hover:bg-red-600"><X size={12} /></button>
                          </div>
                        ) : (
                          <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"><FileText size={20} className="text-gray-400" /></div>
                        )}
                        <label className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 active:scale-[0.98]">
                          <Upload size={14} className="mr-2" /> স্বাক্ষর আপলোড করুন
                          <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">নিবন্ধন সারসংক্ষেপ</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><span className="text-gray-600">সদস্য আইডি:</span> <span className="ml-2 font-medium">{formData.membership.memberId}</span></div>
                        <div><span className="text-gray-600">নাম:</span> <span className="ml-2 font-medium">{formData.personal.fullName}</span></div>
                        <div><span className="text-gray-600">ফোন:</span> <span className="ml-2 font-medium">{formData.personal.phone}</span></div>
                        <div><span className="text-gray-600">পেশা:</span> <span className="ml-2 font-medium">{formData.personal.occupation || '-'}</span></div>
                        <div><span className="text-gray-600">জরুরি যোগাযোগ:</span> <span className="ml-2 font-medium">{formData.emergencyContact.name || '-'}</span></div>
                        <div><span className="text-gray-600">মাসিক ফি:</span> <span className="ml-2 font-medium">৳{formData.membership.monthlyFee}</span></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation - Mobile: Full width stacked; Desktop: Inline */}
            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Previous/Cancel Button - Step 1: Cancel, Steps 2-3: Previous */}
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/members') : prevStep}
                disabled={currentStep === 1 ? false : currentStep === 1}
                className={secondaryButtonClass + ' w-full sm:w-auto'}
              >
                {currentStep === 1 ? (
                  <> <X size={16} className="mr-1" /> বাতিল </>
                ) : (
                  <> <ArrowLeft size={16} /> পেছনে </>
                )}
              </button>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {currentStep < steps.length ? (
                  <button type="button" onClick={nextStep} className={primaryButtonClass + ' w-full sm:w-auto'}>
                    {currentStep === 3 ? (
                      <> <Save size={16} className="mr-2" /> নিবন্ধন সম্পন্ন করুন </>
                    ) : (
                      <> পরবর্তী <ArrowRight size={16} /> </>
                    )}
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading} className={primaryButtonClass + ' w-full sm:w-auto'}>
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-2" />
                        সংরক্ষণ করা হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        নিবন্ধন সম্পন্ন করুন
                      </>
                    )}
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
