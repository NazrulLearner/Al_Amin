// src/modules/settings/constants/bank.constants.ts

export const ACCOUNT_TYPES = {
  somity: [
    { value: 'savings', label: 'সেভিংস' },
    { value: 'current', label: 'কারেন্ট' },
    { value: 'business', label: 'ব্যবসায়িক' },
    { value: 'joint', label: 'যৌথ অ্যাকাউন্ট' }
  ],
  collector: [
    { value: 'savings', label: 'সেভিংস' },
    { value: 'current', label: 'কারেন্ট' }
  ]
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: 'সেভিংস',
  current: 'কারেন্ট',
  business: 'ব্যবসায়িক',
  joint: 'যৌথ অ্যাকাউন্ট'
};

export const OWNER_TYPES = {
  SOMITY: 'somity',
  COLLECTOR: 'collector'
} as const;