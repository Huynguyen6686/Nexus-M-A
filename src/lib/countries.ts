export interface CountryOption {
  code: string;
  value: string;
  en: string;
  vi: string;
}

export const countries: CountryOption[] = [
  { code: 'VN', value: 'Vietnam', en: 'Vietnam', vi: 'Việt Nam' },
  { code: 'SG', value: 'Singapore', en: 'Singapore', vi: 'Singapore' },
  { code: 'US', value: 'United States', en: 'United States', vi: 'Hoa Kỳ' },
  { code: 'GB', value: 'United Kingdom', en: 'United Kingdom', vi: 'Vương quốc Anh' },
  { code: 'HK', value: 'Hong Kong', en: 'Hong Kong', vi: 'Hồng Kông' },
  { code: 'JP', value: 'Japan', en: 'Japan', vi: 'Nhật Bản' },
  { code: 'KR', value: 'South Korea', en: 'South Korea', vi: 'Hàn Quốc' },
  { code: 'CN', value: 'China', en: 'China', vi: 'Trung Quốc' },
  { code: 'TW', value: 'Taiwan', en: 'Taiwan', vi: 'Đài Loan' },
  { code: 'TH', value: 'Thailand', en: 'Thailand', vi: 'Thái Lan' },
  { code: 'MY', value: 'Malaysia', en: 'Malaysia', vi: 'Malaysia' },
  { code: 'ID', value: 'Indonesia', en: 'Indonesia', vi: 'Indonesia' },
  { code: 'PH', value: 'Philippines', en: 'Philippines', vi: 'Philippines' },
  { code: 'IN', value: 'India', en: 'India', vi: 'Ấn Độ' },
  { code: 'AU', value: 'Australia', en: 'Australia', vi: 'Úc' },
  { code: 'NZ', value: 'New Zealand', en: 'New Zealand', vi: 'New Zealand' },
  { code: 'CA', value: 'Canada', en: 'Canada', vi: 'Canada' },
  { code: 'DE', value: 'Germany', en: 'Germany', vi: 'Đức' },
  { code: 'FR', value: 'France', en: 'France', vi: 'Pháp' },
  { code: 'NL', value: 'Netherlands', en: 'Netherlands', vi: 'Hà Lan' },
  { code: 'CH', value: 'Switzerland', en: 'Switzerland', vi: 'Thụy Sĩ' },
  { code: 'AE', value: 'United Arab Emirates', en: 'United Arab Emirates', vi: 'Các tiểu vương quốc Ả Rập thống nhất' },
  { code: 'SA', value: 'Saudi Arabia', en: 'Saudi Arabia', vi: 'Ả Rập Xê Út' },
  { code: 'BR', value: 'Brazil', en: 'Brazil', vi: 'Brazil' },
  { code: 'MX', value: 'Mexico', en: 'Mexico', vi: 'Mexico' },
];

export function getCountryOption(value?: string) {
  return countries.find(country => country.value === value) || countries[0];
}

export function countryLabel(country: CountryOption, language: 'en' | 'vi') {
  return language === 'vi' ? country.vi : country.en;
}

export function countryFlagUrl(country: CountryOption) {
  return `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`;
}
