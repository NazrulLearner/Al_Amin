// src/modules/Investments/constants/investmentTypes.ts

export const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  fixed_deposit: 'ফিক্সড ডিপোজিট',
  savings: 'সেভিংস',
  business: 'ব্যবসায়িক বিনিয়োগ',
  project: '프로젝트 বিনিয়োগ',
  real_estate: 'রিয়েল এস্টেট',
  agriculture: 'কৃষি প্রকল্প',
  stock_market: 'শেয়ার বাজার',
  other: 'অন্যান্য',
};

export const INVESTMENT_TYPE_ICONS: Record<string, string> = {
  fixed_deposit: '🏦',
  savings: '💰',
  business: '🏢',
  project: '📊',
  real_estate: '🏠',
  agriculture: '🌾',
  stock_market: '📈',
  other: '📁',
};

export const INVESTMENT_TYPE_COLORS: Record<string, string> = {
  fixed_deposit: 'bg-blue-100 text-blue-700 border-blue-200',
  savings: 'bg-green-100 text-green-700 border-green-200',
  business: 'bg-purple-100 text-purple-700 border-purple-200',
  project: 'bg-orange-100 text-orange-700 border-orange-200',
  real_estate: 'bg-teal-100 text-teal-700 border-teal-200',
  agriculture: 'bg-lime-100 text-lime-700 border-lime-200',
  stock_market: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

// 🆕 ADD THIS - for dropdown and review section
export const INVESTMENT_CATEGORIES = [
  { value: 'fixed_deposit', label: 'ফিক্সড ডিপোজিট', icon: '🏦', description: 'ব্যাংকে নির্দিষ্ট মেয়াদে বিনিয়োগ' },
  { value: 'savings', label: 'সেভিংস', icon: '💰', description: 'সেভিংস অ্যাকাউন্টে বিনিয়োগ' },
  { value: 'business', label: 'ব্যবসায়িক উদ্যোগ', icon: '🏢', description: 'ব্যবসায় বিনিয়োগ' },
  { value: 'real_estate', label: 'রিয়েল এস্টেট', icon: '🏠', description: 'জমি/বিল্ডিং এ বিনিয়োগ' },
  { value: 'agriculture', label: 'কৃষি প্রকল্প', icon: '🌾', description: 'কৃষি ভিত্তিক বিনিয়োগ' },
  { value: 'stock_market', label: 'শেয়ার বাজার', icon: '📈', description: 'শেয়ার/স্টক মার্কেটে বিনিয়োগ' },
  { value: 'project', label: 'প্রকল্প', icon: '📊', description: 'নির্দিষ্ট প্রকল্পে বিনিয়োগ' },
  { value: 'other', label: 'অন্যান্য', icon: '📁', description: 'অন্যান্য ধরনের বিনিয়োগ' },
];

export const INVESTMENT_TYPE_OPTIONS = INVESTMENT_CATEGORIES.map(cat => ({
  value: cat.value,
  label: cat.label
}));