// src/pages/settings/index.tsx

import React, { useState, useEffect } from 'react';
import { getDoc, setDoc } from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import type { SomitySettings } from '../../../types/settings';
import { DEFAULT_SOMITY_SETTINGS } from '../../../types/settings';
import { toast } from 'sonner';
import { Loader2, Save, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettingsValidation } from '../hooks/useSettingsValidation';

// Your components
import GeneralSettings from '../components/GeneralSettings';
import ShareSettings from '../components/ShareSettings';
import FeeSettings from '../components/FeeSettings';
import MemberSettings from '../components/MemberSettings';
import LoanSettings from '../components/FinancingSettings';
import IslamicLoanSettings from '../components/IslamicFinanceSettings';
import InvestmentSettings from '../components/InvestmentSettings';
import CollectionSettings from '../components/CollectionSettings';
import CollectorSettings from '../components/CollectorSettings';
import FinancialSettings from '../components/FinancialSettings';
import ReportSettings from '../components/ReportSettings';
import SecuritySettings from '../components/SecuritySettings';

const SomitySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SomitySettings>(DEFAULT_SOMITY_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<SomitySettings>(DEFAULT_SOMITY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  
  const { 
    validateSettingsChange, 
    warnings, 
    showWarningModal, 
    setShowWarningModal, 
    pendingChanges, 
    setPendingChanges 
  } = useSettingsValidation();

  useEffect(() => {
    fetchSettings();
  }, []);

  // Check if tabs need scroll buttons
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
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
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
      toast.success('✅ Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || '❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    if (!hasChanges) {
      toast.info('ℹ️ No changes to save. Please modify something first.');
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
    { id: 'loan', label: 'Loans', icon: '💵', shortLabel: 'Loan' },
    { id: 'islamic', label: 'Islamic Loans', icon: '🕌', shortLabel: 'Islamic' },
    { id: 'investment', label: 'Investment', icon: '📈', shortLabel: 'Inv' },
    { id: 'collection', label: 'Collection', icon: '💳', shortLabel: 'Coll' },
    { id: 'collector', label: 'Collectors', icon: '👥', shortLabel: 'Collr' },
    { id: 'financial', label: 'Financial', icon: '📊', shortLabel: 'Fin' },
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
      {/* Header - NOT sticky, normal flow */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Somity Settings</h1>
              <p className="text-sm text-gray-500 mt-1">
                Configure your Somity settings and preferences
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Sticky but NOT fixed, scrolls with page */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Tabs with horizontal scroll */}
          <div className="relative">
            {/* Left scroll button */}
            {showScrollButtons && (
              <button
                onClick={() => scrollTabs('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1.5 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
            )}
            
            {/* Tabs Container - horizontal scroll */}
            <div
              ref={tabsContainerRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <nav className="flex gap-1 min-w-max px-1 py-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium 
                      rounded-lg transition-all whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-base">{tab.icon}</span>
                    {/* Hide label on very small screens */}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-xs">{tab.shortLabel}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Right scroll button */}
            {showScrollButtons && (
              <button
                onClick={() => scrollTabs('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1.5 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content - Normal flow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        {activeTab === 'loan' && (
          <LoanSettings settings={settings} updateSettings={updateSettings} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">⚠️ Important Warning</h2>
                </div>
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setPendingChanges(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Your changes may affect existing data. Please review the following:
              </p>
              
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {warnings.map((warning, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="font-medium text-yellow-800">{warning.message}</p>
                    <p className="text-sm text-yellow-700 mt-1">{warning.impact}</p>
                    <p className="text-sm text-yellow-600 mt-1 font-medium">💡 {warning.suggestion}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>⚠️ Note:</strong> These changes cannot be automatically reverted. 
                  Make sure you understand the impact before proceeding.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmSave}
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  I Understand, Save Anyway
                </button>
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setPendingChanges(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
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