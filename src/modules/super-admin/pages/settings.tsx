// src/pages/super-admin/Settings.tsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../services/firebase/firebase';
import { useAuth } from '../../../app/providers/AuthProvider';
import { 
  Save, 
  Globe, 
  Shield, 
  Bell, 
  Database, 
  Sparkles,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  CreditCard
} from 'lucide-react';

interface SettingsType {
  general: {
    appName: string;
    appLogo: string;
    currency: string;
    currencySymbol: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  limits: {
    free: { maxMembers: number; maxLoans: number; maxAdmins: number; storageGB: number; monthlyTransactions: number };
    basic: { maxMembers: number; maxLoans: number; maxAdmins: number; storageGB: number; monthlyTransactions: number };
    premium: { maxMembers: number; maxLoans: number; maxAdmins: number; storageGB: number; monthlyTransactions: number };
  };
  features: {
    loans: boolean; savings: boolean; reports: boolean; notifications: boolean; chat: boolean; apiAccess: boolean; exportData: boolean; auditLogs: boolean;
  };
  subscription: {
    trialDays: number; defaultPlan: 'free' | 'basic' | 'premium'; autoSuspend: boolean; suspendAfterDays: number; invoiceGeneration: boolean;
  };
  security: {
    multiLogin: boolean; sessionTimeout: number; passwordMinLength: number; passwordRequireSpecialChar: boolean; passwordRequireNumber: boolean;
    twoFactorAuth: boolean; ipWhitelist: string[]; maxLoginAttempts: number; lockoutDuration: number;
  };
  notifications: {
    emailAlerts: boolean; adminAlerts: boolean; slackWebhook: string; dailyDigest: boolean; weeklyReport: boolean;
    onError: boolean; onUserSignup: boolean; onPaymentReceived: boolean;
  };
  maintenance: {
    backupEnabled: boolean; backupFrequency: 'daily' | 'weekly' | 'monthly'; lastBackup: Date | null; maintenanceMode: boolean; maintenanceMessage: string;
  };
  updatedAt: Date;
  updatedBy: string;
}

const defaultSettings: SettingsType = {
  general: { appName: 'MicroFinPlus', appLogo: '', currency: 'BDT', currencySymbol: '৳', timezone: 'Asia/Dhaka', dateFormat: 'DD/MM/YYYY', language: 'bn' },
  limits: {
    free: { maxMembers: 100, maxLoans: 50, maxAdmins: 1, storageGB: 1, monthlyTransactions: 500 },
    basic: { maxMembers: 500, maxLoans: 200, maxAdmins: 3, storageGB: 5, monthlyTransactions: 2000 },
    premium: { maxMembers: 9999, maxLoans: 9999, maxAdmins: 10, storageGB: 50, monthlyTransactions: 10000 },
  },
  features: { loans: true, savings: true, reports: true, notifications: true, chat: true, apiAccess: false, exportData: true, auditLogs: true },
  subscription: { trialDays: 14, defaultPlan: 'free', autoSuspend: true, suspendAfterDays: 30, invoiceGeneration: true },
  security: { multiLogin: true, sessionTimeout: 60, passwordMinLength: 6, passwordRequireSpecialChar: false, passwordRequireNumber: false, twoFactorAuth: false, ipWhitelist: [], maxLoginAttempts: 5, lockoutDuration: 30 },
  notifications: { emailAlerts: true, adminAlerts: true, slackWebhook: '', dailyDigest: false, weeklyReport: true, onError: true, onUserSignup: false, onPaymentReceived: true },
  maintenance: { backupEnabled: true, backupFrequency: 'daily', lastBackup: null, maintenanceMode: false, maintenanceMessage: 'System is under maintenance. Please check back later.' },
  updatedAt: new Date(),
  updatedBy: '',
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const settingsRef = doc(db, 'system', 'globalSettings');
      const snapshot = await getDoc(settingsRef);
      
      if (snapshot.exists()) {
        // Document exists - load it
        setSettings({ ...defaultSettings, ...snapshot.data() });
      } else {
        // Document doesn't exist - create it with default values
        console.log('Settings document not found, creating default...');
        await setDoc(settingsRef, {
          ...defaultSettings,
          updatedAt: Timestamp.now(),
          updatedBy: user?.uid || 'system',
        });
        setSettings(defaultSettings);
        setMessage({ type: 'success', text: 'Default settings created successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const storageRef = ref(storage, `system/logo/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSettings(prev => ({ ...prev, general: { ...prev.general, appLogo: url } }));
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: 'Failed to upload logo' });
    } finally { setUploadingLogo(false); }
  };

  const removeLogo = async () => {
    if (settings.general.appLogo) {
      try {
        const logoRef = ref(storage, settings.general.appLogo);
        await deleteObject(logoRef);
      } catch (error) { 
        console.error('Error deleting old logo:', error); 
      }
    }
    setSettings(prev => ({ ...prev, general: { ...prev.general, appLogo: '' } }));
    setMessage({ type: 'success', text: 'Logo removed successfully!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const settingsRef = doc(db, 'system', 'globalSettings');
      
      // Prepare data for save (remove undefined values)
      const saveData = {
        ...settings,
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid || 'system',
      };
      
      await updateDoc(settingsRef, saveData);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      if (error.code === 'not-found') {
        // If still not found, create it
        try {
          const settingsRef = doc(db, 'system', 'globalSettings');
          await setDoc(settingsRef, {
            ...settings,
            updatedAt: Timestamp.now(),
            updatedBy: user?.uid || 'system',
          });
          setMessage({ type: 'success', text: 'Settings created and saved successfully!' });
        } catch (createError) {
          setMessage({ type: 'error', text: 'Failed to create settings document' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings: ' + error.message });
      }
      setTimeout(() => setMessage(null), 3000);
    } finally { 
      setSaving(false); 
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'limits', label: 'Limits', icon: <Users size={18} /> },
    { id: 'features', label: 'Features', icon: <Sparkles size={18} /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Database size={18} /> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-gray-500">Configure global platform settings</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-green-500 text-green-600 bg-green-50' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">App Name</label>
                  <input 
                    type="text" 
                    value={settings.general.appName} 
                    onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, appName: e.target.value } }))} 
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select 
                    value={settings.general.currency} 
                    onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, currency: e.target.value, currencySymbol: e.target.value === 'BDT' ? '৳' : e.target.value === 'USD' ? '$' : '₹' } }))} 
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <select 
                    value={settings.general.timezone} 
                    onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, timezone: e.target.value } }))} 
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Format</label>
                  <select 
                    value={settings.general.dateFormat} 
                    onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, dateFormat: e.target.value } }))} 
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">App Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {settings.general.appLogo ? 
                        <img src={settings.general.appLogo} alt="Logo" className="w-full h-full object-contain" /> : 
                        <Globe className="w-8 h-8 text-gray-400" />
                      }
                    </div>
                    <div className="flex gap-2">
                      <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
                        {uploadingLogo ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                      </label>
                      {settings.general.appLogo && (
                        <button onClick={removeLogo} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Recommended size: 200x60px. Max 2MB.</p>
                </div>
              </div>
            </div>
          )}

          {/* Limits Settings */}
          {activeTab === 'limits' && (
            <div className="space-y-8">
              {(['free', 'basic', 'premium'] as const).map(plan => (
                <div key={plan} className="border rounded-lg p-4">
                  <h3 className="font-semibold capitalize mb-3">{plan} Plan</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Max Members</label>
                      <input type="number" value={settings.limits[plan].maxMembers} onChange={(e) => setSettings(prev => ({ ...prev, limits: { ...prev.limits, [plan]: { ...prev.limits[plan], maxMembers: parseInt(e.target.value) } } }))} className="w-full px-2 py-1 border rounded" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Max Loans</label>
                      <input type="number" value={settings.limits[plan].maxLoans} onChange={(e) => setSettings(prev => ({ ...prev, limits: { ...prev.limits, [plan]: { ...prev.limits[plan], maxLoans: parseInt(e.target.value) } } }))} className="w-full px-2 py-1 border rounded" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Max Admins</label>
                      <input type="number" value={settings.limits[plan].maxAdmins} onChange={(e) => setSettings(prev => ({ ...prev, limits: { ...prev.limits, [plan]: { ...prev.limits[plan], maxAdmins: parseInt(e.target.value) } } }))} className="w-full px-2 py-1 border rounded" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Storage (GB)</label>
                      <input type="number" value={settings.limits[plan].storageGB} onChange={(e) => setSettings(prev => ({ ...prev, limits: { ...prev.limits, [plan]: { ...prev.limits[plan], storageGB: parseInt(e.target.value) } } }))} className="w-full px-2 py-1 border rounded" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Monthly Transactions</label>
                      <input type="number" value={settings.limits[plan].monthlyTransactions} onChange={(e) => setSettings(prev => ({ ...prev, limits: { ...prev.limits, [plan]: { ...prev.limits[plan], monthlyTransactions: parseInt(e.target.value) } } }))} className="w-full px-2 py-1 border rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Features Settings */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {key === 'loans' ? <DollarSign size={16} /> : key === 'savings' ? <TrendingUp size={16} /> : key === 'reports' ? <FileText size={16} /> : key === 'notifications' ? <Bell size={16} /> : key === 'chat' ? <MessageSquare size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-xs text-gray-500">Enable/disable {key} feature</p>
                    </div>
                  </div>
                  <button onClick={() => setSettings(prev => ({ ...prev, features: { ...prev.features, [key]: !value } }))} className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Subscription Settings */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Trial Days</label>
                  <input type="number" value={settings.subscription.trialDays} onChange={(e) => setSettings(prev => ({ ...prev, subscription: { ...prev.subscription, trialDays: parseInt(e.target.value) } }))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Default Plan</label>
                  <select value={settings.subscription.defaultPlan} onChange={(e) => setSettings(prev => ({ ...prev, subscription: { ...prev.subscription, defaultPlan: e.target.value as any } }))} className="w-full px-3 py-2 border rounded">
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Auto Suspend Inactive Orgs</p>
                    <p className="text-sm text-gray-500">Automatically suspend somity after {settings.subscription.suspendAfterDays} days</p>
                  </div>
                  <button onClick={() => setSettings(prev => ({ ...prev, subscription: { ...prev.subscription, autoSuspend: !prev.subscription.autoSuspend } }))} className={`relative w-12 h-6 rounded-full transition-colors ${settings.subscription.autoSuspend ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.subscription.autoSuspend ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Auto Generate Invoices</p>
                    <p className="text-sm text-gray-500">Automatically generate invoices for subscriptions</p>
                  </div>
                  <button onClick={() => setSettings(prev => ({ ...prev, subscription: { ...prev.subscription, invoiceGeneration: !prev.subscription.invoiceGeneration } }))} className={`relative w-12 h-6 rounded-full transition-colors ${settings.subscription.invoiceGeneration ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.subscription.invoiceGeneration ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
                  <input type="number" value={settings.security.sessionTimeout} onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, sessionTimeout: parseInt(e.target.value) } }))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Password Length</label>
                  <input type="number" value={settings.security.passwordMinLength} onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, passwordMinLength: parseInt(e.target.value) } }))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Login Attempts</label>
                  <input type="number" value={settings.security.maxLoginAttempts} onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) } }))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lockout Duration (minutes)</label>
                  <input type="number" value={settings.security.lockoutDuration} onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, lockoutDuration: parseInt(e.target.value) } }))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Allow Multiple Logins</p>
                    <p className="text-sm text-gray-500">Allow users to be logged in from multiple devices</p>
                  </div>
                  <button onClick={() => setSettings(prev => ({ ...prev, security: { ...prev.security, multiLogin: !prev.security.multiLogin } }))} className={`relative w-12 h-6 rounded-full transition-colors ${settings.security.multiLogin ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.security.multiLogin ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Two Factor Authentication</p>
                    <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                  </div>
                  <button onClick={() => setSettings(prev => ({ ...prev, security: { ...prev.security, twoFactorAuth: !prev.security.twoFactorAuth } }))} className={`relative w-12 h-6 rounded-full transition-colors ${settings.security.twoFactorAuth ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.security.twoFactorAuth ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Slack Webhook URL</label>
                <input type="text" value={settings.notifications.slackWebhook} onChange={(e) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, slackWebhook: e.target.value } }))} placeholder="https://hooks.slack.com/services/..." className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.notifications).filter(([k]) => k !== 'slackWebhook').map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-xs text-gray-500">Send notification for {key}</p>
                    </div>
                    <button onClick={() => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: !value } }))} className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Settings */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Enable Backup</p>
                  <p className="text-sm text-gray-500">Automatically backup database daily</p>
                </div>
                <button onClick={() => setSettings(prev => ({ ...prev, maintenance: { ...prev.maintenance, backupEnabled: !prev.maintenance.backupEnabled } }))} className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenance.backupEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.maintenance.backupEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              {settings.maintenance.backupEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-1">Backup Frequency</label>
                  <select value={settings.maintenance.backupFrequency} onChange={(e) => setSettings(prev => ({ ...prev, maintenance: { ...prev.maintenance, backupFrequency: e.target.value as any } }))} className="w-full px-3 py-2 border rounded">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between p-3 border rounded mb-4">
                  <div>
                    <p className="font-medium text-orange-600">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Put the entire platform in maintenance mode</p>
                  </div>
                  <button onClick={() => setSettings(prev => ({ ...prev, maintenance: { ...prev.maintenance, maintenanceMode: !prev.maintenance.maintenanceMode } }))} className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenance.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.maintenance.maintenanceMode ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                {settings.maintenance.maintenanceMode && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Maintenance Message</label>
                    <textarea value={settings.maintenance.maintenanceMessage} onChange={(e) => setSettings(prev => ({ ...prev, maintenance: { ...prev.maintenance, maintenanceMessage: e.target.value } }))} rows={3} className="w-full px-3 py-2 border rounded" />
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-sm font-medium">Last Backup: {settings.maintenance.lastBackup ? new Date(settings.maintenance.lastBackup).toLocaleString() : 'Never'}</p>
                  <button className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <RefreshCw size={14} />Trigger Backup Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
