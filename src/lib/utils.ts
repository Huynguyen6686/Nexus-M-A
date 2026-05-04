import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, lang: 'en' | 'vi' = 'en') {
  if (!Number.isFinite(amount)) return lang === 'vi' ? '0 đ' : '$0';

  if (lang === 'vi') {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' đ';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(number: number, lang: 'en' | 'vi' = 'en') {
  if (!Number.isFinite(number)) return '0';

  if (lang === 'vi') {
    const val = Math.abs(number);
    if (val >= 1e12) return (number / 1e12).toFixed(1).replace('.', ',') + ' nghìn tỷ';
    if (val >= 1e9) return (number / 1e9).toFixed(1).replace('.', ',') + ' tỷ';
    if (val >= 1e6) return (number / 1e6).toFixed(1).replace('.', ',') + ' triệu';
    return new Intl.NumberFormat('vi-VN').format(number);
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(number);
}
