// src/modules/settings/components/GeneralSettings.tsx
import React, { useState } from 'react';
import type { SomitySettings } from '../../../types/settings';
import { toast } from 'sonner';
import { Upload, Info, Building2, Phone, Mail, MapPin, Hash, Calendar, FileText, Droplets, Eye } from 'lucide-react';

interface GeneralSettingsProps {
  settings: SomitySettings;
  updateSettings: (updates: Partial<SomitySettings>) => void;
}

const SectionHeader = ({ icon: Icon, title, color }: { icon: any; title: string; color: string }) => (
  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
    <span className={color}><Icon className="h-5 w-5" /></span>
    {title}
  </h3>
);

const Field = ({ label, value, onChange, placeholder, type = 'text', required, icon: Icon, hint }: {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: any;
  hint?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
      <input
        type={type}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ''}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, updateSettings }) => {
  const [uploading, setUploading] = useState(false);

  // 🔥 সরাসরি settings থেকে value নিচ্ছি, কোনো local state না
  const general = settings.general || {};

  // Handle general field change
  const handleChange = (field: string, value: any) => {
    updateSettings({ 
      general: { 
        ...settings.general, 
        [field]: value 
      } 
    });
  };

  // Logo compression
  const compressToJPEG = (file: File, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          const max = 300;
          if (w > max || h > max) {
            if (w > h) { h = (h * max) / w; w = max; }
            else { w = (w * max) / h; h = max; }
          }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { 
      toast.error('ছবির সাইজ 5MB এর নিচে হতে হবে'); 
      return; 
    }
    
    setUploading(true);
    try {
      const compressed = await compressToJPEG(file, 0.6);
      const sizeKB = ((compressed.length * 3) / 4 / 1024).toFixed(0);
      handleChange('logo', compressed);
      toast.success(`✅ লোগো আপলোড হয়েছে (~${sizeKB}KB)`);
    } catch {
      toast.error('ছবি প্রসেস করতে সমস্যা হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    handleChange('logo', '');
    toast.info('লোগো রিমুভ করা হয়েছে');
  };

  // ============================================
  // RENDER
  // ============================================

  const somityName = general.somityName ?? '';
  const somityEmail = general.somityEmail ?? '';
  const somityPhone = general.somityPhone ?? '';
  const somityAddress = general.somityAddress ?? '';
  const logoPreview = general.logo || '';
  const watermarkText = general.watermarkText || 'স্মৃতি চিরন্তন';
  const watermarkOpacity = general.watermarkOpacity ?? 0.1;
  const watermarkEnabled = general.watermarkEnabled !== false;
  const watermarkRotation = general.watermarkRotation ?? -12;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">সাধারণ সেটিংস</h2>
        <p className="text-sm text-gray-500 mt-1">
          আপনার সমিতির নাম, ঠিকানা, লোগো এবং ওয়াটারমার্ক কনফিগার করুন
        </p>
      </div>

      <div className="p-6 space-y-8">
        
        {/* ==================== BRANDING ==================== */}
        <div>
          <SectionHeader icon={Building2} title="সমিতির ব্র্যান্ডিং" color="text-blue-600" />
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo Upload */}
            <div className="flex-shrink-0">
              <div className={`w-32 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden ${uploading ? 'opacity-50' : ''}`}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="h-12 w-12 text-gray-300" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'কম্প্রেস হচ্ছে...' : 'লোগো আপলোড'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
                {logoPreview && (
                  <button onClick={removeLogo} type="button" className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
                    রিমুভ
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">JPEG, সর্বোচ্চ 300px</p>
            </div>

            {/* Slogan & Website */}
            <div className="flex-1 space-y-4">
              <Field
                label="সমিতির স্লোগান"
                value={general.slogan}
                onChange={(v) => handleChange('slogan', v)}
                placeholder="যেমন: একতা, শৃঙ্খলা, উন্নতি"
                hint="আপনার সমিতির মূলমন্ত্র ট্যাগলাইন"
              />
              <Field
                label="ওয়েবসাইট"
                value={general.website}
                onChange={(v) => handleChange('website', v)}
                placeholder="https://your-somity.com"
                type="url"
                hint="অপশনাল"
              />
            </div>
          </div>
        </div>

        {/* ==================== BASIC INFO ==================== */}
        <div className="border-t pt-8">
          <SectionHeader icon={Info} title="মৌলিক তথ্য" color="text-green-600" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="সমিতির নাম"
              value={somityName}
              onChange={(v) => handleChange('somityName', v)}
              placeholder="আপনার সমিতির নাম"
              required
              icon={Building2}
            />
            <Field
              label="রেজিস্ট্রেশন নম্বর"
              value={general.registrationNumber}
              onChange={(v) => handleChange('registrationNumber', v)}
              placeholder="যেমন: S-12345/2021"
              icon={Hash}
            />
            <Field
              label="প্রতিষ্ঠার বছর"
              value={general.establishedYear}
              onChange={(v) => handleChange('establishedYear', v)}
              placeholder="যেমন: 2021"
              type="number"
              icon={Calendar}
            />
            <Field
              label="ট্যাক্স আইডি / বিআইএন"
              value={general.taxId}
              onChange={(v) => handleChange('taxId', v)}
              placeholder="123456789012"
              icon={FileText}
            />
          </div>
        </div>

        {/* ==================== CONTACT ==================== */}
        <div className="border-t pt-8">
          <SectionHeader icon={Phone} title="যোগাযোগের তথ্য" color="text-purple-600" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="ইমেইল ঠিকানা"
              value={somityEmail}
              onChange={(v) => handleChange('somityEmail', v)}
              placeholder="somity@example.com"
              type="email"
              icon={Mail}
            />
            <Field
              label="ফোন নম্বর"
              value={somityPhone}
              onChange={(v) => handleChange('somityPhone', v)}
              placeholder="+8801XXXXXXXXX"
              type="tel"
              icon={Phone}
            />
            <Field
              label="বিকল্প ফোন"
              value={general.alternativePhone}
              onChange={(v) => handleChange('alternativePhone', v)}
              placeholder="অপশনাল"
              type="tel"
              icon={Phone}
            />
            <Field
              label="ফ্যাক্স নম্বর"
              value={general.fax}
              onChange={(v) => handleChange('fax', v)}
              placeholder="অপশনাল"
              icon={FileText}
            />
          </div>
          
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              সম্পূর্ণ ঠিকানা
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
              value={somityAddress}
              onChange={(e) => handleChange('somityAddress', e.target.value)}
              placeholder="হাউজ নং, রোড, গ্রাম, উপজেলা..."
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        {/* ==================== WATERMARK ==================== */}
        <div className="border-t pt-8">
          <SectionHeader icon={Droplets} title="ওয়াটারমার্ক সেটিংস" color="text-cyan-600" />
          
          <div className="bg-gradient-to-r from-gray-50 to-cyan-50 rounded-xl p-5 border border-cyan-100 space-y-5">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <p className="font-medium text-gray-800">ওয়াটারমার্ক চালু করুন</p>
                <p className="text-xs text-gray-500">রসিদ এবং ডকুমেন্টে ওয়াটারমার্ক দেখাবে</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('watermarkEnabled', !watermarkEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${watermarkEnabled ? 'bg-cyan-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${watermarkEnabled ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            {watermarkEnabled && (
              <>
                <Field
                  label="ওয়াটারমার্ক টেক্সট"
                  value={watermarkText}
                  onChange={(v) => handleChange('watermarkText', v)}
                  placeholder="যেমন: স্মৃতি চিরন্তন"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    স্বচ্ছতা: <span className="text-cyan-600 font-bold">{Math.round(watermarkOpacity * 100)}%</span>
                  </label>
                  <input
                    type="range" min="3" max="30" step="1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    value={Math.round(watermarkOpacity * 100)}
                    onChange={(e) => handleChange('watermarkOpacity', parseInt(e.target.value) / 100)}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>হালকা (3%)</span><span>মিডিয়াম</span><span>ডার্ক (30%)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ঘূর্ণন: <span className="text-cyan-600 font-bold">{watermarkRotation}°</span>
                  </label>
                  <input
                    type="range" min="-45" max="45" step="1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    value={watermarkRotation}
                    onChange={(e) => handleChange('watermarkRotation', parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>-45° (বামে)</span><span>0° (সোজা)</span><span>45° (ডানে)</span>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-lg border-2 border-cyan-200 bg-white h-40 flex items-center justify-center">
                  <p className="text-gray-300 z-10">📄 রসিদ কন্টেন্ট</p>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: watermarkOpacity }}>
                    <div style={{ transform: `rotate(${watermarkRotation}deg)` }} className="text-center">
                      {logoPreview && (
                        <img src={logoPreview} alt="" className="w-12 h-12 mx-auto mb-1 opacity-50" style={{ filter: 'grayscale(100%)' }} />
                      )}
                      <p className="text-lg font-bold text-gray-500 whitespace-nowrap">{watermarkText}</p>
                      <p className="text-xs text-gray-400">{somityName}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ==================== PREVIEW CARD ==================== */}
        <div className="border-t pt-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              সমিতির প্রিভিউ
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl border flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1.5" />
                ) : (
                  <Building2 className="h-7 w-7 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-lg truncate">{somityName || 'আপনার সমিতির নাম'}</p>
                {general.slogan && <p className="text-sm text-gray-500">{general.slogan}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                  {somityEmail && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {somityEmail}</span>}
                  {somityPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {somityPhone}</span>}
                </div>
              </div>
            </div>
            {watermarkEnabled && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-cyan-500" />
                  ওয়াটারমার্ক: "{watermarkText}" ({Math.round(watermarkOpacity * 100)}%, {watermarkRotation}°)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            <strong>নোট:</strong> এখানে করা পরিবর্তনগুলো সংরক্ষণ করতে পেজের উপরের <strong>"Save Changes"</strong> বাটনে ক্লিক করুন।
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
