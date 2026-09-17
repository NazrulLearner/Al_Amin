// src/modules/Investments/constants/investmentConstants.ts

export const CATEGORIES = [
  { value: 'fixed_deposit', label: 'স্থায়ী আমানত (FDR)' },
  { value: 'business', label: 'ব্যবসায়িক বিনিয়োগ' },
  { value: 'real_estate', label: 'রিয়েল এস্টেট' },
  { value: 'agriculture', label: 'কৃষি প্রকল্প' },
  { value: 'stock_market', label: 'শেয়ার বাজার' },
  { value: 'project', label: 'নির্দিষ্ট প্রকল্প' },
  { value: 'savings', label: 'সেভিংস' },
  { value: 'other', label: 'অন্যান্য' },
];

// Risk Levels with better descriptions
export const RISK_LEVELS = [
  { 
    value: 'very_low', 
    label: 'অত্যন্ত কম ঝুঁকি', 
    description: 'ব্যাংক FDR, সরকারি বন্ড — প্রায় নিশ্চিত লাভ',
    color: 'green'
  },
  { 
    value: 'low', 
    label: 'কম ঝুঁকি', 
    description: 'স্বনামধন্য প্রতিষ্ঠানে বিনিয়োগ — লাভের সম্ভাবনা উচ্চ',
    color: 'emerald'
  },
  { 
    value: 'medium', 
    label: 'মাঝারি ঝুঁকি', 
    description: 'সাধারণ ব্যবসায়িক বিনিয়োগ — লাভের সম্ভাবনা মাঝারি',
    color: 'yellow'
  },
  { 
    value: 'high', 
    label: 'বেশি ঝুঁকি', 
    description: 'নতুন ব্যবসা বা উদ্যোগ — লাভ বেশি কিন্তু অনিশ্চিত',
    color: 'orange'
  },
  { 
    value: 'very_high', 
    label: 'অত্যন্ত বেশি ঝুঁকি', 
    description: 'অত্যন্ত ঝুঁকিপূর্ণ বিনিয়োগ — সতর্কতা প্রয়োজন',
    color: 'red'
  },
];

export const STATUS_LABELS = {
  pending: 'অপেক্ষমাণ',
  active: 'সক্রিয়',
  matured: 'পরিপক্ক',
  rejected: 'বাতিল',
  withdrawn: 'প্রত্যাহারকৃত',
};

export const PROFIT_FREQUENCIES = [
  { value: 'monthly', label: 'মাসিক' },
  { value: 'quarterly', label: 'ত্রৈমাসিক' },
  { value: 'half_yearly', label: 'অর্ধ-বার্ষিক' },
  { value: 'yearly', label: 'বার্ষিক' },
  { value: 'on_maturity', label: 'মেয়াদান্তে' },
];

export const BANKS = [
  'ডাকা ব্যাংক',
  'ইসলামী ব্যাংক',
  'মার্কেন্টাইল ব্যাংক',
  'ফার্স্ট সিকিউরিটি ব্যাংক',
  'অন্যান্য',
];

export const ACCOUNT_TYPES = [
  { value: 'savings', label: 'সঞ্চয়ী হিসাব' },
  { value: 'current', label: 'চলতি হিসাব' },
  { value: 'fdr', label: 'FDR হিসাব' },
  { value: 'dps', label: 'DPS হিসাব' },
  { value: 'other', label: 'অন্যান্য' },
];

export const COLLATERAL_TYPES = [
  { value: 'none', label: 'কোনো জামানত নেই' },
  { value: 'land', label: 'জমি/সম্পত্তি' },
  { value: 'gold', label: 'সোনা/অলংকার' },
  { value: 'document', label: 'দলিলপত্র' },
  { value: 'personal_guarantee', label: 'ব্যক্তিগত জামানত' },
  { value: 'other', label: 'অন্যান্য' },
];

export const MANAGEMENT_TYPE_LABELS = {
  somity_direct: 'সমিতি সরাসরি পরিচালনা করবে',
  member_committee: 'সদস্য কমিটির মাধ্যমে',
};

// 🆕 Payment methods for co-investors
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'নগদ (ক্যাশ)', icon: '💵', description: 'সরাসরি নগদ অর্থ প্রদান' },
  { value: 'bank', label: 'ব্যাংক ট্রান্সফার', icon: '🏦', description: 'ব্যাংকের মাধ্যমে ট্রান্সফার' },
  { value: 'bkash', label: 'বিকাশ', icon: '📱', description: 'বিকাশ মোবাইল ব্যাংকিং' },
  { value: 'nagad', label: 'নগদ', icon: '📱', description: 'নগদ মোবাইল ব্যাংকিং' },
  { value: 'rocket', label: 'রকেট', icon: '🚀', description: 'রকেট মোবাইল ব্যাংকিং' },
];

// 🆕 Investment status colors (for UI)
export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  matured: 'bg-blue-100 text-blue-800 border-blue-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-800 border-gray-200',
};

// 🆕 Maturity status labels
export const INVESTMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'অপেক্ষমাণ',
  active: 'সক্রিয়',
  matured: 'পরিপক্ক',
  rejected: 'বাতিল',
  withdrawn: 'প্রত্যাহারকৃত',
  expired: 'মেয়াদ উত্তীর্ণ',
  'no_maturity': 'অনির্দিষ্ট মেয়াদ',
};