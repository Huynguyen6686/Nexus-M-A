import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, lang: 'en' | 'vi' = 'en') {
  if (lang === 'vi') {
    // Vietnamese format: 5.000.000.000 ₫
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' ₫';
  }
  // English format: $5,000,000,000
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(number: number, lang: 'en' | 'vi' = 'en') {
  if (lang === 'vi') {
    const val = Math.abs(number);
    if (val >= 1e9) return (number / 1e9).toFixed(1).replace('.', ',') + ' Tỷ';
    if (val >= 1e6) return (number / 1e6).toFixed(1).replace('.', ',') + ' Tr';
    return new Intl.NumberFormat('vi-VN').format(number);
  }
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
}
