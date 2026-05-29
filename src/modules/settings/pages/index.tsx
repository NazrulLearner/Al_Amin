// src/modules/settings/pages/index.tsx

import React, { useState, useEffect } from 'react';
import { getDoc, setDoc } from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import type { SomitySettings } from '../../../types/settings';
import { DEFAULT_SOMITY_SETTINGS } from '../../../types/settings';
import { toast } from 'sonner';
import { Loader2, Save, AlertTriangle, X, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { useSettingsValidation } from '../hooks/useSettingsValidation';

// Settings Components
import GeneralSettings from '../components/GeneralSettings';
import ShareSettings from '../components/ShareSettings';
import FeeSettings from '../components/FeeSettings';
import MemberSettings from '../components/MemberSettings';
import IslamicLoanSettings from '../components/IslamicFinanceSettings';
import InvestmentSettings from '../components/InvestmentSettings';
import CollectionSettings from '../components/CollectionSettings';
import CollectorSettings from '../components/CollectorSettings';
import FinancialSettings from '../components/FinancialSettings';
import ReportSettings from '../components/ReportSettings';
import SecuritySettings from '../components/SecuritySettings';

// Bank Components (New)
import SomityBankSettings from '../components/bank/SomityBankSettings';
import CollectorBankSettings from '../components/bank/CollectorBankSettings';

interface SimpleCollector {
  id: string;
  memberId: string;
  name: string;
  phone: string;
}

const SomitySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SomitySettings>(DEFAULT_SOMITY_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<SomitySettings>(DEFAULT_SOMITY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  
  const { 
    validateSettingsChange, 
    warnings, 
    showWarningModal, 
    setShowWarningModal, 
    pendingChanges, 
    setPendingChanges 
  } = useSettingsValidation();

  // Helper: Get collectors list from settings
  const getCollectorsList = (): SimpleCollector[] => {
    const collectors = settings.collection?.collectorSettings?.collectors || [];
    return collectors
      .filter((c: any) => c.isActive)
      .map((c: any) => ({
        id: c.memberId,
        memberId: c.memberId,
        name: c.memberName,
        phone: c.phone || ''
      }));
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsDoc = await getDoc(collections.somitySettings());
      const data = settingsDoc.exists() ? settingsDoc.data() : {};
      const generalData = data.general || {};
      const loadedSettings = {
        ...DEFAULT_SOMITY_SETTINGS,
        ...data,
        general: {
          ...DEFAULT_SOMITY_SETTINGS.general,
          ...generalData,
          somityName: generalData.somityName ?? DEFAULT_SOMITY_SETTINGS.general.somityName,
          somityEmail: generalData.somityEmail ?? DEFAULT_SOMITY_SETTINGS.general.somityEmail,
          somityPhone: generalData.somityPhone ?? DEFAULT_SOMITY_SETTINGS.general.somityPhone,
          somityAddress: generalData.somityAddress ?? DEFAULT_SOMITY_SETTINGS.general.somityAddress,
        },
      };
      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('সেটিংস লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      const container = tabsContainerRef.current;
      if (container) {
        setShowScrollButtons(container.scrollWidth > container.clientWidth);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  useEffect(() => {
    if (showSaveSuccess) {
      const timer = setTimeout(() => setShowSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSaveSuccess]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const updateSettings = (updates: Partial<SomitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const performSave = async (settingsToSave: SomitySettings) => {
    try {
      setSaving(true);
      await setDoc(collections.somitySettings(), {
        ...settingsToSave,
        updatedAt: new Date()
      }, { merge: true });
      setOriginalSettings(settingsToSave);
      setShowSaveSuccess(true);
      toast.success('✅ সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || '❌ সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    
    if (!hasChanges) {
      toast.info('ℹ️ কোনো পরিবর্তন করা হয়নি। দয়া করে প্রথমে কিছু পরিবর্তন করুন।');
      return;
    }
    
    const warningsList = await validateSettingsChange(settings, originalSettings);
    
    if (warningsList.length > 0) {
      setPendingChanges(settings);
      setShowWarningModal(true);
      return;
    }
    
    await performSave(settings);
  };

  const handleConfirmSave = async () => {
    if (pendingChanges) {
      await performSave(pendingChanges);
    }
    setShowWarningModal(false);
    setPendingChanges(null);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '🏢', shortLabel: 'Gen' },
    { id: 'share', label: 'Share', icon: '📊', shortLabel: 'Share' },
    { id: 'fee', label: 'Fees', icon: '💰', shortLabel: 'Fee' },
    { id: 'member', label: 'Members', icon: '👥', shortLabel: 'Members' },
    { id: 'bank', label: 'Bank Accounts', icon: '🏦', shortLabel: 'Bank' },
    { id: 'islamic', label: 'Islamic Finance', icon: '🕌', shortLabel: 'Islamic' },
    { id: 'investment', label: 'Investment', icon: '📈', shortLabel: 'Inv' },
    { id: 'collection', label: 'Collection', icon: '💳', shortLabel: 'Coll' },
    { id: 'collector', label: 'Collectors', icon: '👥', shortLabel: 'Collr' },
    { id: 'financial', label: 'Financial', icon: '💰', shortLabel: 'Fin' },
    { id: 'report', label: 'Reports', icon: '📋', shortLabel: 'Rep' },
    { id: 'security', label: 'Security', icon: '🔒', shortLabel: 'Sec' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">Somity Settings</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Save Success Banner */}
      {showSaveSuccess && (
        <div className="fixed top-16 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <p className="text-sm text-green-700">সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="sticky top-[49px] z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {showScrollButtons && (
              <button
                onClick={() => scrollTabs('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
              </button>
            )}
            
            <div
              ref={tabsContainerRef}
              className="overflow-x-auto scrollbar-hide py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <nav className="flex gap-0.5 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                      rounded-md transition-all whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-xs">{tab.shortLabel}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            {showScrollButtons && (
              <button
                onClick={() => scrollTabs('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 border border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {activeTab === 'general' && (
          <GeneralSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {activeTab === 'share' && (
          <ShareSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {activeTab === 'fee' && (
          <FeeSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {activeTab === 'member' && (
          <MemberSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {/* ✅ Bank Tab - Using New Components */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            <SomityBankSettings />
            <CollectorBankSettings 
              collectors={getCollectorsList()}
              isEnabled={settings.collection?.allowCollectorPersonalAccount || false}
              onToggle={() => {
                updateSettings({
                  collection: {
                    ...settings.collection,
                    allowCollectorPersonalAccount: !(settings.collection?.allowCollectorPersonalAccount || false)
                  }
                });
              }}
            />
          </div>
        )}
        
        {activeTab === 'islamic' && (
          <IslamicLoanSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {activeTab === 'investment' && (
          <InvestmentSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {activeTab === 'collection' && (
          <CollectionSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {activeTab === 'collector' && (
          <CollectorSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {activeTab === 'financial' && (
          <FinancialSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {activeTab === 'report' && (
          <ReportSettings settings={settings} updateSettings={updateSettings} />
        )}
        
        {activeTab === 'security' && (
          <SecuritySettings settings={settings} updateSettings={updateSettings} />
        )}
      </div>
      
      {/* Warning Modal */}
      {showWarningModal && warnings.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">গুরুত্বপূর্ণ সতর্কতা!</h2>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                আপনার পরিবর্তনগুলি বিদ্যমান ডাটাকে প্রভাবিত করতে পারে:
              </p>
              
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {warnings.map((warning, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
                    <p className="text-xs font-medium text-yellow-800">{warning.message}</p>
                    <p className="text-xs text-yellow-700 mt-0.5">{warning.impact}</p>
                    <p className="text-xs text-yellow-600 mt-0.5">💡 {warning.suggestion}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmSave}
                  className="flex-1 bg-yellow-600 text-white py-1.5 text-sm rounded-lg hover:bg-yellow-700"
                >
                  তবু সংরক্ষণ করব
                </button>
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setPendingChanges(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-1.5 text-sm rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SomitySettingsPage;