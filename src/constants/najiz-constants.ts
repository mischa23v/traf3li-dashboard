/**
 * Najiz Integration Constants
 * Saudi Arabia Ministry of Justice (Najiz) compliant data structures
 *
 * This file contains all constants required for Najiz integration:
 * - 13 Saudi Administrative Regions (المناطق الإدارية)
 * - 131+ Major Cities by Region (المدن)
 * - 8 Identity Document Types (أنواع الهوية)
 * - Salutations (الألقاب)
 * - GCC Countries (دول الخليج)
 */

// ═══════════════════════════════════════════════════════════════
// IDENTITY TYPES (أنواع الهوية)
// ═══════════════════════════════════════════════════════════════

export const NAJIZ_IDENTITY_TYPES = [
  { value: 'national_id', labelAr: 'الهوية الوطنية', labelEn: 'Saudi National ID' },
  { value: 'iqama', labelAr: 'الإقامة', labelEn: 'Resident ID (Iqama)' },
  { value: 'gcc_id', labelAr: 'هوية مواطني الخليج', labelEn: 'GCC ID' },
  { value: 'passport', labelAr: 'جواز السفر', labelEn: 'Passport' },
  { value: 'border_number', labelAr: 'رقم الحدود', labelEn: 'Border Number' },
  { value: 'visitor_id', labelAr: 'هوية زائر', labelEn: 'Visitor ID' },
  { value: 'temporary_id', labelAr: 'هوية مؤقتة', labelEn: 'Temporary ID' },
  { value: 'diplomatic_id', labelAr: 'هوية دبلوماسية', labelEn: 'Diplomatic ID' },
] as const

export type NajizIdentityType = typeof NAJIZ_IDENTITY_TYPES[number]['value']

// ═══════════════════════════════════════════════════════════════
// SAUDI REGIONS (المناطق الإدارية الـ 13)
// ═══════════════════════════════════════════════════════════════

export const SAUDI_REGIONS = [
  { code: '01', nameAr: 'منطقة الرياض', nameEn: 'Riyadh Region', capitalAr: 'الرياض', capitalEn: 'Riyadh' },
  { code: '02', nameAr: 'منطقة مكة المكرمة', nameEn: 'Makkah Region', capitalAr: 'مكة المكرمة', capitalEn: 'Makkah' },
  { code: '03', nameAr: 'منطقة المدينة المنورة', nameEn: 'Madinah Region', capitalAr: 'المدينة المنورة', capitalEn: 'Madinah' },
  { code: '04', nameAr: 'منطقة القصيم', nameEn: 'Al-Qassim Region', capitalAr: 'بريدة', capitalEn: 'Buraidah' },
  { code: '05', nameAr: 'المنطقة الشرقية', nameEn: 'Eastern Region', capitalAr: 'الدمام', capitalEn: 'Dammam' },
  { code: '06', nameAr: 'منطقة عسير', nameEn: 'Asir Region', capitalAr: 'أبها', capitalEn: 'Abha' },
  { code: '07', nameAr: 'منطقة تبوك', nameEn: 'Tabuk Region', capitalAr: 'تبوك', capitalEn: 'Tabuk' },
  { code: '08', nameAr: 'منطقة حائل', nameEn: 'Hail Region', capitalAr: 'حائل', capitalEn: 'Hail' },
  { code: '09', nameAr: 'منطقة الحدود الشمالية', nameEn: 'Northern Borders Region', capitalAr: 'عرعر', capitalEn: 'Arar' },
  { code: '10', nameAr: 'منطقة جازان', nameEn: 'Jazan Region', capitalAr: 'جازان', capitalEn: 'Jazan' },
  { code: '11', nameAr: 'منطقة نجران', nameEn: 'Najran Region', capitalAr: 'نجران', capitalEn: 'Najran' },
  { code: '12', nameAr: 'منطقة الباحة', nameEn: 'Al-Bahah Region', capitalAr: 'الباحة', capitalEn: 'Al-Bahah' },
  { code: '13', nameAr: 'منطقة الجوف', nameEn: 'Al-Jawf Region', capitalAr: 'سكاكا', capitalEn: 'Sakakah' },
] as const

export type SaudiRegionCode = typeof SAUDI_REGIONS[number]['code']

// ═══════════════════════════════════════════════════════════════
// SAUDI CITIES BY REGION (المدن حسب المنطقة)
// ═══════════════════════════════════════════════════════════════

export const SAUDI_CITIES_BY_REGION: Record<string, { nameAr: string; nameEn: string }[]> = {
  '01': [ // Riyadh Region (16 cities)
    { nameAr: 'الرياض', nameEn: 'Riyadh' },
    { nameAr: 'الخرج', nameEn: 'Al-Kharj' },
    { nameAr: 'الدوادمي', nameEn: 'Al-Dawadmi' },
    { nameAr: 'المجمعة', nameEn: 'Al-Majmaah' },
    { nameAr: 'الزلفي', nameEn: 'Al-Zulfi' },
    { nameAr: 'شقراء', nameEn: 'Shaqra' },
    { nameAr: 'عفيف', nameEn: 'Afif' },
    { nameAr: 'وادي الدواسر', nameEn: 'Wadi Al-Dawasir' },
    { nameAr: 'الأفلاج', nameEn: 'Al-Aflaj' },
    { nameAr: 'حوطة بني تميم', nameEn: 'Hotat Bani Tamim' },
    { nameAr: 'السليل', nameEn: 'Al-Sulayil' },
    { nameAr: 'الحريق', nameEn: 'Al-Hariq' },
    { nameAr: 'ضرما', nameEn: 'Dirma' },
    { nameAr: 'الدرعية', nameEn: 'Diriyah' },
    { nameAr: 'المزاحمية', nameEn: 'Al-Muzahimiyah' },
    { nameAr: 'رماح', nameEn: 'Rumah' },
  ],
  '02': [ // Makkah Region (15 cities)
    { nameAr: 'مكة المكرمة', nameEn: 'Makkah' },
    { nameAr: 'جدة', nameEn: 'Jeddah' },
    { nameAr: 'الطائف', nameEn: 'Taif' },
    { nameAr: 'رابغ', nameEn: 'Rabigh' },
    { nameAr: 'الجموم', nameEn: 'Al-Jumum' },
    { nameAr: 'خليص', nameEn: 'Khulais' },
    { nameAr: 'القنفذة', nameEn: 'Al-Qunfudhah' },
    { nameAr: 'الليث', nameEn: 'Al-Lith' },
    { nameAr: 'أضم', nameEn: 'Adham' },
    { nameAr: 'تربة', nameEn: 'Turbah' },
    { nameAr: 'رنية', nameEn: 'Ranyah' },
    { nameAr: 'الخرمة', nameEn: 'Al-Khurmah' },
    { nameAr: 'الموية', nameEn: 'Al-Muwayh' },
    { nameAr: 'ميسان', nameEn: 'Maysan' },
    { nameAr: 'بحرة', nameEn: 'Bahrah' },
  ],
  '03': [ // Madinah Region (9 cities)
    { nameAr: 'المدينة المنورة', nameEn: 'Madinah' },
    { nameAr: 'ينبع', nameEn: 'Yanbu' },
    { nameAr: 'العلا', nameEn: 'Al-Ula' },
    { nameAr: 'بدر', nameEn: 'Badr' },
    { nameAr: 'خيبر', nameEn: 'Khaybar' },
    { nameAr: 'المهد', nameEn: 'Al-Mahd' },
    { nameAr: 'العيص', nameEn: 'Al-Ais' },
    { nameAr: 'الحناكية', nameEn: 'Al-Hanakiyah' },
    { nameAr: 'وادي الفرع', nameEn: 'Wadi Al-Fara' },
  ],
  '04': [ // Al-Qassim Region (10 cities)
    { nameAr: 'بريدة', nameEn: 'Buraidah' },
    { nameAr: 'عنيزة', nameEn: 'Unaizah' },
    { nameAr: 'الرس', nameEn: 'Al-Rass' },
    { nameAr: 'المذنب', nameEn: 'Al-Mithnab' },
    { nameAr: 'البكيرية', nameEn: 'Al-Bukayriyah' },
    { nameAr: 'البدائع', nameEn: 'Al-Badai' },
    { nameAr: 'رياض الخبراء', nameEn: 'Riyadh Al-Khabra' },
    { nameAr: 'عيون الجواء', nameEn: 'Uyun Al-Jiwa' },
    { nameAr: 'الأسياح', nameEn: 'Al-Asyah' },
    { nameAr: 'النبهانية', nameEn: 'Al-Nabhaniyah' },
  ],
  '05': [ // Eastern Region (15 cities)
    { nameAr: 'الدمام', nameEn: 'Dammam' },
    { nameAr: 'الخبر', nameEn: 'Khobar' },
    { nameAr: 'الظهران', nameEn: 'Dhahran' },
    { nameAr: 'الأحساء', nameEn: 'Al-Ahsa' },
    { nameAr: 'الهفوف', nameEn: 'Hofuf' },
    { nameAr: 'المبرز', nameEn: 'Al-Mubarraz' },
    { nameAr: 'الجبيل', nameEn: 'Jubail' },
    { nameAr: 'القطيف', nameEn: 'Qatif' },
    { nameAr: 'رأس تنورة', nameEn: 'Ras Tanura' },
    { nameAr: 'بقيق', nameEn: 'Buqayq' },
    { nameAr: 'النعيرية', nameEn: 'Al-Nuayriyah' },
    { nameAr: 'حفر الباطن', nameEn: 'Hafar Al-Batin' },
    { nameAr: 'الخفجي', nameEn: 'Khafji' },
    { nameAr: 'سيهات', nameEn: 'Saihat' },
    { nameAr: 'صفوى', nameEn: 'Safwa' },
  ],
  '06': [ // Asir Region (13 cities)
    { nameAr: 'أبها', nameEn: 'Abha' },
    { nameAr: 'خميس مشيط', nameEn: 'Khamis Mushait' },
    { nameAr: 'بيشة', nameEn: 'Bisha' },
    { nameAr: 'النماص', nameEn: 'Al-Namas' },
    { nameAr: 'سراة عبيدة', nameEn: 'Sarat Abidah' },
    { nameAr: 'أحد رفيدة', nameEn: 'Ahad Rufaidah' },
    { nameAr: 'المجاردة', nameEn: 'Al-Majardah' },
    { nameAr: 'رجال ألمع', nameEn: 'Rijal Almaa' },
    { nameAr: 'ظهران الجنوب', nameEn: 'Dhahran Al-Janoub' },
    { nameAr: 'تثليث', nameEn: 'Tathlith' },
    { nameAr: 'محايل', nameEn: 'Muhayil' },
    { nameAr: 'بارق', nameEn: 'Bariq' },
    { nameAr: 'تنومة', nameEn: 'Tanomah' },
  ],
  '07': [ // Tabuk Region (7 cities)
    { nameAr: 'تبوك', nameEn: 'Tabuk' },
    { nameAr: 'الوجه', nameEn: 'Al-Wajh' },
    { nameAr: 'ضباء', nameEn: 'Duba' },
    { nameAr: 'تيماء', nameEn: 'Tayma' },
    { nameAr: 'أملج', nameEn: 'Umluj' },
    { nameAr: 'حقل', nameEn: 'Haql' },
    { nameAr: 'البدع', nameEn: 'Al-Bada' },
  ],
  '08': [ // Hail Region (8 cities)
    { nameAr: 'حائل', nameEn: 'Hail' },
    { nameAr: 'بقعاء', nameEn: 'Baqa' },
    { nameAr: 'الغزالة', nameEn: 'Al-Ghazalah' },
    { nameAr: 'الشنان', nameEn: 'Al-Shinan' },
    { nameAr: 'السليمي', nameEn: 'Al-Sulaymi' },
    { nameAr: 'موقق', nameEn: 'Mawqaq' },
    { nameAr: 'الحائط', nameEn: 'Al-Hait' },
    { nameAr: 'سميراء', nameEn: 'Samira' },
  ],
  '09': [ // Northern Borders Region (5 cities)
    { nameAr: 'عرعر', nameEn: 'Arar' },
    { nameAr: 'رفحاء', nameEn: 'Rafha' },
    { nameAr: 'طريف', nameEn: 'Turaif' },
    { nameAr: 'العويقيلة', nameEn: 'Al-Uwayqilah' },
    { nameAr: 'الشعبة', nameEn: 'Al-Shuabah' },
  ],
  '10': [ // Jazan Region (12 cities)
    { nameAr: 'جازان', nameEn: 'Jazan' },
    { nameAr: 'صبيا', nameEn: 'Sabya' },
    { nameAr: 'أبو عريش', nameEn: 'Abu Arish' },
    { nameAr: 'صامطة', nameEn: 'Samtah' },
    { nameAr: 'الدرب', nameEn: 'Al-Darb' },
    { nameAr: 'بيش', nameEn: 'Bish' },
    { nameAr: 'فيفا', nameEn: 'Fifa' },
    { nameAr: 'العارضة', nameEn: 'Al-Aridah' },
    { nameAr: 'الريث', nameEn: 'Al-Raith' },
    { nameAr: 'ضمد', nameEn: 'Damad' },
    { nameAr: 'أحد المسارحة', nameEn: 'Ahad Al-Masarihah' },
    { nameAr: 'فرسان', nameEn: 'Farasan' },
  ],
  '11': [ // Najran Region (7 cities)
    { nameAr: 'نجران', nameEn: 'Najran' },
    { nameAr: 'شرورة', nameEn: 'Sharurah' },
    { nameAr: 'حبونا', nameEn: 'Habuna' },
    { nameAr: 'بدر الجنوب', nameEn: 'Badr Al-Janoub' },
    { nameAr: 'ثار', nameEn: 'Thar' },
    { nameAr: 'خباش', nameEn: 'Khubash' },
    { nameAr: 'يدمة', nameEn: 'Yadamah' },
  ],
  '12': [ // Al-Bahah Region (8 cities)
    { nameAr: 'الباحة', nameEn: 'Al-Baha' },
    { nameAr: 'بلجرشي', nameEn: 'Baljurashi' },
    { nameAr: 'المخواة', nameEn: 'Al-Mikhwah' },
    { nameAr: 'المندق', nameEn: 'Al-Mandaq' },
    { nameAr: 'قلوة', nameEn: 'Qilwah' },
    { nameAr: 'العقيق', nameEn: 'Al-Aqiq' },
    { nameAr: 'غامد الزناد', nameEn: 'Ghamid Al-Zinad' },
    { nameAr: 'القرى', nameEn: 'Al-Qura' },
  ],
  '13': [ // Al-Jawf Region (5 cities)
    { nameAr: 'سكاكا', nameEn: 'Sakakah' },
    { nameAr: 'دومة الجندل', nameEn: 'Dumat Al-Jandal' },
    { nameAr: 'القريات', nameEn: 'Qurayyat' },
    { nameAr: 'طبرجل', nameEn: 'Tabarjal' },
    { nameAr: 'صوير', nameEn: 'Suwayr' },
  ],
}

// Flat list of all cities for quick lookup
export const ALL_SAUDI_CITIES = Object.values(SAUDI_CITIES_BY_REGION).flat()

// ═══════════════════════════════════════════════════════════════
// GCC COUNTRIES (دول الخليج)
// ═══════════════════════════════════════════════════════════════

export const GCC_COUNTRIES = [
  { code: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia' },
  { code: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates' },
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait' },
  { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain' },
  { code: 'OM', nameAr: 'عُمان', nameEn: 'Oman' },
  { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar' },
] as const

export type GCCCountryCode = typeof GCC_COUNTRIES[number]['code']

// ═══════════════════════════════════════════════════════════════
// SALUTATIONS (الألقاب)
// ═══════════════════════════════════════════════════════════════

export const SALUTATIONS_EN = [
  { value: 'mr', labelAr: 'السيد', labelEn: 'Mr.' },
  { value: 'mrs', labelAr: 'السيدة', labelEn: 'Mrs.' },
  { value: 'ms', labelAr: 'الآنسة', labelEn: 'Ms.' },
  { value: 'dr', labelAr: 'الدكتور', labelEn: 'Dr.' },
  { value: 'eng', labelAr: 'المهندس', labelEn: 'Eng.' },
  { value: 'prof', labelAr: 'الأستاذ', labelEn: 'Prof.' },
  { value: 'sheikh', labelAr: 'الشيخ', labelEn: 'Sheikh' },
  { value: 'his_excellency', labelAr: 'صاحب المعالي', labelEn: 'His Excellency' },
  { value: 'her_excellency', labelAr: 'صاحبة المعالي', labelEn: 'Her Excellency' },
] as const

export const SALUTATIONS_AR = [
  { value: 'السيد', labelAr: 'السيد', labelEn: 'Mr.' },
  { value: 'السيدة', labelAr: 'السيدة', labelEn: 'Mrs.' },
  { value: 'الآنسة', labelAr: 'الآنسة', labelEn: 'Ms.' },
  { value: 'الدكتور', labelAr: 'الدكتور', labelEn: 'Dr. (Male)' },
  { value: 'الدكتورة', labelAr: 'الدكتورة', labelEn: 'Dr. (Female)' },
  { value: 'المهندس', labelAr: 'المهندس', labelEn: 'Eng. (Male)' },
  { value: 'المهندسة', labelAr: 'المهندسة', labelEn: 'Eng. (Female)' },
  { value: 'الأستاذ', labelAr: 'الأستاذ', labelEn: 'Prof. (Male)' },
  { value: 'الأستاذة', labelAr: 'الأستاذة', labelEn: 'Prof. (Female)' },
  { value: 'الشيخ', labelAr: 'الشيخ', labelEn: 'Sheikh (Male)' },
  { value: 'الشيخة', labelAr: 'الشيخة', labelEn: 'Sheikh (Female)' },
  { value: 'صاحب السمو', labelAr: 'صاحب السمو', labelEn: 'His Highness' },
  { value: 'صاحبة السمو', labelAr: 'صاحبة السمو', labelEn: 'Her Highness' },
  { value: 'صاحب المعالي', labelAr: 'صاحب المعالي', labelEn: 'His Excellency' },
  { value: 'صاحبة المعالي', labelAr: 'صاحبة المعالي', labelEn: 'Her Excellency' },
] as const

export type SalutationEn = typeof SALUTATIONS_EN[number]['value']
export type SalutationAr = typeof SALUTATIONS_AR[number]['value']

// ═══════════════════════════════════════════════════════════════
// GENDER & MARITAL STATUS
// ═══════════════════════════════════════════════════════════════

export const GENDERS = [
  { value: 'male', labelAr: 'ذكر', labelEn: 'Male' },
  { value: 'female', labelAr: 'أنثى', labelEn: 'Female' },
] as const

export type Gender = typeof GENDERS[number]['value']

export const MARITAL_STATUSES = [
  { value: 'single', labelAr: 'أعزب', labelEn: 'Single' },
  { value: 'married', labelAr: 'متزوج', labelEn: 'Married' },
  { value: 'divorced', labelAr: 'مطلق', labelEn: 'Divorced' },
  { value: 'widowed', labelAr: 'أرمل', labelEn: 'Widowed' },
] as const

export type MaritalStatus = typeof MARITAL_STATUSES[number]['value']

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get region by code
 */
export function getRegionByCode(code: string) {
  return SAUDI_REGIONS.find(r => r.code === code)
}

/**
 * Get cities by region code
 */
export function getCitiesByRegion(regionCode: string) {
  return SAUDI_CITIES_BY_REGION[regionCode] || []
}

/**
 * Get identity type label
 */
export function getIdentityTypeLabel(value: string, language: 'ar' | 'en' = 'ar') {
  const type = NAJIZ_IDENTITY_TYPES.find(t => t.value === value)
  return type ? (language === 'ar' ? type.labelAr : type.labelEn) : value
}

/**
 * Validate Saudi National ID (10 digits, starts with 1)
 */
export function isValidNationalId(id: string): boolean {
  return /^1\d{9}$/.test(id)
}

/**
 * Validate Iqama Number (10 digits, starts with 2)
 */
export function isValidIqamaNumber(id: string): boolean {
  return /^2\d{9}$/.test(id)
}

/**
 * Validate Saudi Postal Code (5 digits)
 */
export function isValidPostalCode(code: string): boolean {
  return /^\d{5}$/.test(code)
}

/**
 * Validate Building Number (4 digits)
 */
export function isValidBuildingNumber(num: string): boolean {
  return /^\d{4}$/.test(num)
}

/**
 * Validate Additional Number (4 digits)
 */
export function isValidAdditionalNumber(num: string): boolean {
  return /^\d{4}$/.test(num)
}

/**
 * Validate Short Address (4 letters + 4 digits)
 */
export function isValidShortAddress(addr: string): boolean {
  return /^[A-Z]{4}\d{4}$/i.test(addr.replace(/\s/g, ''))
}

/**
 * Validate Hijri Date (YYYY/MM/DD format)
 */
export function isValidHijriDate(date: string): boolean {
  return /^1[34]\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|30)$/.test(date)
}

/**
 * Format full Arabic name from parts
 */
export function formatArabicName(parts: {
  firstName?: string
  fatherName?: string
  grandfatherName?: string
  familyName?: string
}): string {
  return [parts.firstName, parts.fatherName, parts.grandfatherName, parts.familyName]
    .filter(Boolean)
    .join(' ')
}

/**
 * Format National Address
 */
export function formatNationalAddress(address: {
  buildingNumber?: string
  streetName?: string
  streetNameAr?: string
  district?: string
  districtAr?: string
  city?: string
  cityAr?: string
  postalCode?: string
  additionalNumber?: string
}, language: 'ar' | 'en' = 'ar'): string {
  const street = language === 'ar' ? address.streetNameAr : address.streetName
  const districtName = language === 'ar' ? address.districtAr : address.district
  const cityName = language === 'ar' ? address.cityAr : address.city

  const parts = [
    address.buildingNumber,
    street,
    districtName,
    cityName,
    address.postalCode,
  ].filter(Boolean)

  if (address.additionalNumber) {
    parts.push(`(${address.additionalNumber})`)
  }

  return parts.join(language === 'ar' ? '، ' : ', ')
}
