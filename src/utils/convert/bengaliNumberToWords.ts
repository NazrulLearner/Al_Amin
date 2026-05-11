// src/utils/convert/bengaliNumberToWords.ts

const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
const teens = ['', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
const tens = ['', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

const convertBelowHundred = (n: number): string => {
  if (n === 0) return '';
  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  if (one === 0) return tens[ten];
  return tens[ten] + ' ' + ones[one];
};

const convertBelowThousand = (n: number): string => {
  if (n === 0) return '';
  if (n < 100) return convertBelowHundred(n);
  const hundred = Math.floor(n / 100);
  const remainder = n % 100;
  const hundredText = ones[hundred] + ' শত';
  if (remainder === 0) return hundredText;
  return hundredText + ' ' + convertBelowHundred(remainder);
};

const convertBelowLakh = (n: number): string => {
  if (n === 0) return '';
  if (n < 1000) {
    return convertBelowThousand(n);
  }
  const thousand = Math.floor(n / 1000);
  const remainder = n % 1000;
  let result = '';
  
  // Handle thousand part
  if (thousand > 0) {
    if (thousand < 100) {
      result += convertBelowHundred(thousand) + ' হাজার';
    } else {
      result += convertBelowThousand(thousand) + ' হাজার';
    }
  }
  if (remainder > 0) {
    if (thousand > 0) result += ' ';
    result += convertBelowThousand(remainder);
  }
  return result;
};

const convertBelowCrore = (n: number): string => {
  if (n === 0) return '';
  if (n < 100000) {
    return convertBelowLakh(n);
  }
  const lakh = Math.floor(n / 100000);
  const remainder = n % 100000;
  let result = '';
  
  if (lakh > 0) {
    if (lakh < 100) {
      result += convertBelowHundred(lakh) + ' লক্ষ';
    } else {
      result += convertBelowLakh(lakh) + ' লক্ষ';
    }
  }
  if (remainder > 0) {
    if (lakh > 0) result += ' ';
    result += convertBelowLakh(remainder);
  }
  return result;
};

const convertBelowArab = (n: number): string => {
  if (n === 0) return '';
  if (n < 10000000) {
    return convertBelowCrore(n);
  }
  const crore = Math.floor(n / 10000000);
  const remainder = n % 10000000;
  let result = '';
  
  if (crore > 0) {
    if (crore < 100) {
      result += convertBelowHundred(crore) + ' কোটি';
    } else {
      result += convertBelowCrore(crore) + ' কোটি';
    }
  }
  if (remainder > 0) {
    if (crore > 0) result += ' ';
    result += convertBelowCrore(remainder);
  }
  return result;
};

/**
 * Convert number to Bengali words
 * @param num - Number to convert (e.g., 10000)
 * @param includeMatro - Include "মাত্র" at the end (default: true)
 * @returns Bengali words (e.g., "দশ হাজার টাকা মাত্র")
 */
export const convertToBengaliWords = (num: number, includeMatro: boolean = true): string => {
  if (num === 0) return 'শূন্য টাকা';
  
  const taka = Math.floor(num);
  const paisa = Math.round((num - taka) * 100);
  
  let result = '';
  
  if (taka > 0) {
    result = convertBelowArab(taka);
    result = result + ' টাকা';
  } else {
    result = 'শূন্য টাকা';
  }
  
  if (paisa > 0) {
    result = result + ' ও ' + convertBelowHundred(paisa) + ' পয়সা';
  } else {
    if (includeMatro) {
      result = result + ' মাত্র';
    }
  }
  
  return result;
};