/**
 * Saudi Legal Constants
 * Reference data for Saudi Arabian legal case management
 */

// ═══════════════════════════════════════════════════════════════
// SAUDI COURTS (المحاكم)
// ═══════════════════════════════════════════════════════════════

const SAUDI_COURTS = [
    { code: 'general', nameAr: 'المحكمة العامة', nameEn: 'General Court' },
    { code: 'criminal', nameAr: 'المحكمة الجزائية', nameEn: 'Criminal Court' },
    { code: 'commercial', nameAr: 'المحكمة التجارية', nameEn: 'Commercial Court' },
    { code: 'labor', nameAr: 'المحكمة العمالية', nameEn: 'Labor Court' },
    { code: 'family', nameAr: 'محكمة الأحوال الشخصية', nameEn: 'Family Court' },
    { code: 'administrative', nameAr: 'المحكمة الإدارية (ديوان المظالم)', nameEn: 'Administrative Court' },
    { code: 'appeal', nameAr: 'محكمة الاستئناف', nameEn: 'Court of Appeal' },
    { code: 'supreme', nameAr: 'المحكمة العليا', nameEn: 'Supreme Court' },
];

// ═══════════════════════════════════════════════════════════════
// SAUDI COMMITTEES (اللجان)
// ═══════════════════════════════════════════════════════════════

const SAUDI_COMMITTEES = [
    { code: 'banking', nameAr: 'لجنة المنازعات المصرفية', nameEn: 'Banking Disputes Committee' },
    { code: 'securities', nameAr: 'لجنة الفصل في منازعات الأوراق المالية', nameEn: 'Securities Disputes Committee' },
    { code: 'insurance', nameAr: 'لجنة الفصل في المنازعات والمخالفات التأمينية', nameEn: 'Insurance Disputes Committee' },
    { code: 'customs', nameAr: 'لجنة الفصل في المخالفات والمنازعات الجمركية', nameEn: 'Customs Disputes Committee' },
    { code: 'tax', nameAr: 'لجنة الفصل في المخالفات والمنازعات الضريبية', nameEn: 'Tax Disputes Committee' },
    { code: 'labor_primary', nameAr: 'الهيئة الابتدائية لتسوية الخلافات العمالية', nameEn: 'Primary Labor Disputes Committee' },
    { code: 'labor_supreme', nameAr: 'الهيئة العليا لتسوية الخلافات العمالية', nameEn: 'Supreme Labor Disputes Committee' },
    { code: 'real_estate', nameAr: 'لجنة النزاعات العقارية', nameEn: 'Real Estate Disputes Committee' },
    { code: 'competition', nameAr: 'لجنة الفصل في مخالفات نظام المنافسة', nameEn: 'Competition Violations Committee' },
];

// ═══════════════════════════════════════════════════════════════
// SAUDI REGIONS (المناطق)
// ═══════════════════════════════════════════════════════════════

const SAUDI_REGIONS = [
    {
        code: 'riyadh',
        nameAr: 'منطقة الرياض',
        nameEn: 'Riyadh Region',
        cities: ['الرياض', 'الخرج', 'الدوادمي', 'المجمعة', 'الزلفي', 'شقراء', 'عفيف', 'وادي الدواسر', 'الأفلاج', 'حوطة بني تميم', 'السليل', 'الحريق', 'ضرما', 'الدرعية', 'المزاحمية', 'رماح']
    },
    {
        code: 'makkah',
        nameAr: 'منطقة مكة المكرمة',
        nameEn: 'Makkah Region',
        cities: ['مكة المكرمة', 'جدة', 'الطائف', 'رابغ', 'الجموم', 'خليص', 'القنفذة', 'الليث', 'أضم', 'تربة', 'رنية', 'الخرمة', 'الموية', 'ميسان', 'بحرة']
    },
    {
        code: 'madinah',
        nameAr: 'منطقة المدينة المنورة',
        nameEn: 'Madinah Region',
        cities: ['المدينة المنورة', 'ينبع', 'العلا', 'بدر', 'خيبر', 'المهد', 'العيص', 'الحناكية', 'وادي الفرع']
    },
    {
        code: 'qassim',
        nameAr: 'منطقة القصيم',
        nameEn: 'Al-Qassim Region',
        cities: ['بريدة', 'عنيزة', 'الرس', 'المذنب', 'البكيرية', 'البدائع', 'رياض الخبراء', 'عيون الجواء', 'الأسياح', 'النبهانية']
    },
    {
        code: 'eastern',
        nameAr: 'المنطقة الشرقية',
        nameEn: 'Eastern Region',
        cities: ['الدمام', 'الخبر', 'الظهران', 'الأحساء', 'الهفوف', 'المبرز', 'الجبيل', 'القطيف', 'رأس تنورة', 'بقيق', 'النعيرية', 'حفر الباطن', 'الخفجي', 'سيهات', 'صفوى']
    },
    {
        code: 'asir',
        nameAr: 'منطقة عسير',
        nameEn: 'Asir Region',
        cities: ['أبها', 'خميس مشيط', 'بيشة', 'النماص', 'سراة عبيدة', 'أحد رفيدة', 'المجاردة', 'رجال ألمع', 'ظهران الجنوب', 'تثليث', 'محايل', 'بارق', 'تنومة']
    },
    {
        code: 'tabuk',
        nameAr: 'منطقة تبوك',
        nameEn: 'Tabuk Region',
        cities: ['تبوك', 'الوجه', 'ضباء', 'تيماء', 'أملج', 'حقل', 'البدع']
    },
    {
        code: 'hail',
        nameAr: 'منطقة حائل',
        nameEn: 'Hail Region',
        cities: ['حائل', 'بقعاء', 'الغزالة', 'الشنان', 'السليمي', 'موقق', 'الحائط', 'سميراء']
    },
    {
        code: 'northern',
        nameAr: 'منطقة الحدود الشمالية',
        nameEn: 'Northern Borders Region',
        cities: ['عرعر', 'رفحاء', 'طريف', 'العويقيلة', 'الشعبة']
    },
    {
        code: 'jazan',
        nameAr: 'منطقة جازان',
        nameEn: 'Jazan Region',
        cities: ['جازان', 'صبيا', 'أبو عريش', 'صامطة', 'الدرب', 'بيش', 'فيفا', 'العارضة', 'الريث', 'ضمد', 'أحد المسارحة', 'فرسان']
    },
    {
        code: 'najran',
        nameAr: 'منطقة نجران',
        nameEn: 'Najran Region',
        cities: ['نجران', 'شرورة', 'حبونا', 'بدر الجنوب', 'ثار', 'خباش', 'يدمة']
    },
    {
        code: 'baha',
        nameAr: 'منطقة الباحة',
        nameEn: 'Al-Bahah Region',
        cities: ['الباحة', 'بلجرشي', 'المخواة', 'المندق', 'قلوة', 'العقيق', 'غامد الزناد', 'القرى']
    },
    {
        code: 'jawf',
        nameAr: 'منطقة الجوف',
        nameEn: 'Al-Jawf Region',
        cities: ['سكاكا', 'دومة الجندل', 'القريات', 'طبرجل', 'صوير']
    }
];

// ═══════════════════════════════════════════════════════════════
// CASE CATEGORIES WITH SUB-CATEGORIES
// ═══════════════════════════════════════════════════════════════

const CASE_CATEGORIES = {
    labor: {
        code: 'labor',
        nameAr: 'عمالية',
        nameEn: 'Labor',
        subCategories: [
            { code: 'wages', nameAr: 'أجور ومستحقات', nameEn: 'Wages and Entitlements' },
            { code: 'termination', nameAr: 'فصل تعسفي', nameEn: 'Wrongful Termination' },
            { code: 'end_of_service', nameAr: 'مكافأة نهاية الخدمة', nameEn: 'End of Service Benefits' },
            { code: 'work_injury', nameAr: 'إصابات عمل', nameEn: 'Work Injuries' },
            { code: 'vacation', nameAr: 'إجازات', nameEn: 'Leave/Vacation' },
            { code: 'contract_dispute', nameAr: 'نزاع عقد عمل', nameEn: 'Employment Contract Dispute' }
        ]
    },
    commercial: {
        code: 'commercial',
        nameAr: 'تجارية',
        nameEn: 'Commercial',
        subCategories: [
            { code: 'contracts', nameAr: 'عقود تجارية', nameEn: 'Commercial Contracts' },
            { code: 'partnership', nameAr: 'شراكة', nameEn: 'Partnership' },
            { code: 'bankruptcy', nameAr: 'إفلاس', nameEn: 'Bankruptcy' },
            { code: 'cheques', nameAr: 'شيكات', nameEn: 'Cheques' },
            { code: 'promissory', nameAr: 'سندات لأمر', nameEn: 'Promissory Notes' },
            { code: 'agency', nameAr: 'وكالة تجارية', nameEn: 'Commercial Agency' },
            { code: 'franchise', nameAr: 'امتياز تجاري', nameEn: 'Franchise' },
            { code: 'insurance', nameAr: 'تأمين', nameEn: 'Insurance' }
        ]
    },
    civil: {
        code: 'civil',
        nameAr: 'مدنية',
        nameEn: 'Civil',
        subCategories: [
            { code: 'property', nameAr: 'ملكية عقارية', nameEn: 'Real Estate Ownership' },
            { code: 'rent', nameAr: 'إيجارات', nameEn: 'Rent/Lease' },
            { code: 'compensation', nameAr: 'تعويضات', nameEn: 'Compensation' },
            { code: 'debt', nameAr: 'مطالبة مالية', nameEn: 'Financial Claims' },
            { code: 'inheritance', nameAr: 'ميراث', nameEn: 'Inheritance' }
        ]
    },
    criminal: {
        code: 'criminal',
        nameAr: 'جنائية',
        nameEn: 'Criminal',
        subCategories: [
            { code: 'fraud', nameAr: 'احتيال', nameEn: 'Fraud' },
            { code: 'forgery', nameAr: 'تزوير', nameEn: 'Forgery' },
            { code: 'embezzlement', nameAr: 'اختلاس', nameEn: 'Embezzlement' },
            { code: 'defamation', nameAr: 'قذف وتشهير', nameEn: 'Defamation' },
            { code: 'assault', nameAr: 'اعتداء', nameEn: 'Assault' }
        ]
    },
    family: {
        code: 'family',
        nameAr: 'أحوال شخصية',
        nameEn: 'Family/Personal Status',
        subCategories: [
            { code: 'divorce', nameAr: 'طلاق', nameEn: 'Divorce' },
            { code: 'khula', nameAr: 'خلع', nameEn: 'Khula (Wife-initiated divorce)' },
            { code: 'custody', nameAr: 'حضانة', nameEn: 'Custody' },
            { code: 'alimony', nameAr: 'نفقة', nameEn: 'Alimony/Maintenance' },
            { code: 'visitation', nameAr: 'رؤية', nameEn: 'Visitation Rights' },
            { code: 'marriage_contract', nameAr: 'عقد زواج', nameEn: 'Marriage Contract' },
            { code: 'inheritance_division', nameAr: 'قسمة تركة', nameEn: 'Estate Division' }
        ]
    },
    administrative: {
        code: 'administrative',
        nameAr: 'إدارية',
        nameEn: 'Administrative',
        subCategories: [
            { code: 'government_decision', nameAr: 'قرار إداري', nameEn: 'Government Decision' },
            { code: 'tender', nameAr: 'مناقصات', nameEn: 'Tenders' },
            { code: 'employment', nameAr: 'وظيفة حكومية', nameEn: 'Government Employment' },
            { code: 'license', nameAr: 'تراخيص', nameEn: 'Licenses' }
        ]
    },
    other: {
        code: 'other',
        nameAr: 'أخرى',
        nameEn: 'Other',
        subCategories: [
            { code: 'general', nameAr: 'عام', nameEn: 'General' }
        ]
    }
};

// ═══════════════════════════════════════════════════════════════
// CLAIM TYPES
// ═══════════════════════════════════════════════════════════════

const CLAIM_TYPES = [
    { code: 'wages', nameAr: 'أجور متأخرة', nameEn: 'Outstanding Wages' },
    { code: 'end_of_service', nameAr: 'مكافأة نهاية خدمة', nameEn: 'End of Service Benefits' },
    { code: 'vacation', nameAr: 'بدل إجازات', nameEn: 'Leave Allowance' },
    { code: 'compensation', nameAr: 'تعويض', nameEn: 'Compensation' },
    { code: 'allowances', nameAr: 'بدلات', nameEn: 'Allowances' },
    { code: 'overtime', nameAr: 'ساعات إضافية', nameEn: 'Overtime' },
    { code: 'notice_period', nameAr: 'بدل إشعار', nameEn: 'Notice Period Compensation' },
    { code: 'housing', nameAr: 'بدل سكن', nameEn: 'Housing Allowance' },
    { code: 'transport', nameAr: 'بدل مواصلات', nameEn: 'Transport Allowance' },
    { code: 'medical', nameAr: 'تأمين طبي', nameEn: 'Medical Insurance' },
    { code: 'bonus', nameAr: 'مكافآت', nameEn: 'Bonuses' },
    { code: 'commission', nameAr: 'عمولات', nameEn: 'Commissions' },
    { code: 'other', nameAr: 'أخرى', nameEn: 'Other' }
];

// ═══════════════════════════════════════════════════════════════
// POWER OF ATTORNEY SCOPES
// ═══════════════════════════════════════════════════════════════

const POA_SCOPES = [
    { code: 'general', nameAr: 'وكالة عامة', nameEn: 'General Power of Attorney' },
    { code: 'specific', nameAr: 'وكالة خاصة', nameEn: 'Specific Power of Attorney' },
    { code: 'litigation', nameAr: 'وكالة قضائية', nameEn: 'Litigation Power of Attorney' }
];

// ═══════════════════════════════════════════════════════════════
// PARTY TYPES
// ═══════════════════════════════════════════════════════════════

const PARTY_TYPES = [
    { code: 'individual', nameAr: 'فرد', nameEn: 'Individual' },
    { code: 'company', nameAr: 'شركة', nameEn: 'Company' },
    { code: 'government', nameAr: 'جهة حكومية', nameEn: 'Government Entity' }
];

// ═══════════════════════════════════════════════════════════════
// DOCUMENT CATEGORIES
// ═══════════════════════════════════════════════════════════════

const DOCUMENT_CATEGORIES = [
    { code: 'contract', nameAr: 'عقد', nameEn: 'Contract' },
    { code: 'evidence', nameAr: 'دليل', nameEn: 'Evidence' },
    { code: 'correspondence', nameAr: 'مراسلات', nameEn: 'Correspondence' },
    { code: 'court_document', nameAr: 'مستند محكمة', nameEn: 'Court Document' },
    { code: 'poa', nameAr: 'وكالة', nameEn: 'Power of Attorney' },
    { code: 'id_document', nameAr: 'هوية', nameEn: 'ID Document' },
    { code: 'other', nameAr: 'أخرى', nameEn: 'Other' }
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get court by code
 * @param {string} code - Court code
 * @returns {Object|undefined} Court object
 */
const getCourtByCode = (code) => SAUDI_COURTS.find(c => c.code === code);

/**
 * Get committee by code
 * @param {string} code - Committee code
 * @returns {Object|undefined} Committee object
 */
const getCommitteeByCode = (code) => SAUDI_COMMITTEES.find(c => c.code === code);

/**
 * Get region by code
 * @param {string} code - Region code
 * @returns {Object|undefined} Region object
 */
const getRegionByCode = (code) => SAUDI_REGIONS.find(r => r.code === code);

/**
 * Get cities by region code
 * @param {string} regionCode - Region code
 * @returns {string[]} Array of city names
 */
const getCitiesByRegion = (regionCode) => {
    const region = getRegionByCode(regionCode);
    return region ? region.cities : [];
};

/**
 * Get category with sub-categories
 * @param {string} code - Category code
 * @returns {Object|undefined} Category object with sub-categories
 */
const getCategoryByCode = (code) => CASE_CATEGORIES[code];

/**
 * Get sub-category by codes
 * @param {string} categoryCode - Category code
 * @param {string} subCategoryCode - Sub-category code
 * @returns {Object|undefined} Sub-category object
 */
const getSubCategoryByCode = (categoryCode, subCategoryCode) => {
    const category = CASE_CATEGORIES[categoryCode];
    if (!category) return undefined;
    return category.subCategories.find(sc => sc.code === subCategoryCode);
};

/**
 * Get claim type by code
 * @param {string} code - Claim type code
 * @returns {Object|undefined} Claim type object
 */
const getClaimTypeByCode = (code) => CLAIM_TYPES.find(ct => ct.code === code);

/**
 * Get all sub-categories for a category
 * @param {string} categoryCode - Category code
 * @returns {Object[]} Array of sub-category objects
 */
const getSubCategoriesByCategory = (categoryCode) => {
    const category = CASE_CATEGORIES[categoryCode];
    return category ? category.subCategories : [];
};

module.exports = {
    // Constants
    SAUDI_COURTS,
    SAUDI_COMMITTEES,
    SAUDI_REGIONS,
    CASE_CATEGORIES,
    CLAIM_TYPES,
    POA_SCOPES,
    PARTY_TYPES,
    DOCUMENT_CATEGORIES,

    // Helper functions
    getCourtByCode,
    getCommitteeByCode,
    getRegionByCode,
    getCitiesByRegion,
    getCategoryByCode,
    getSubCategoryByCode,
    getClaimTypeByCode,
    getSubCategoriesByCategory
};
