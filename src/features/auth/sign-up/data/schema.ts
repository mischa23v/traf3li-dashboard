import { z } from 'zod'

export const registrationSchema = z.object({
    // ═══════════════════════════════════════════════════════
    // 🎯 MARKETPLACE PARTICIPATION
    // ═══════════════════════════════════════════════════════
    wantsMarketplaceProfile: z.boolean().default(false),

    // ═══════════════════════════════════════════════════════
    // 1. ACCOUNT & PERSONAL INFORMATION
    // ═══════════════════════════════════════════════════════
    firstName: z.string().min(2, 'الاسم الأول مطلوب'),
    lastName: z.string().min(2, 'اسم العائلة مطلوب'),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string()
        .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        .max(128, 'كلمة المرور طويلة جداً')
        .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
        .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
        .regex(/\d/, 'يجب أن تحتوي على رقم'),
    confirmPassword: z.string(),
    profilePicture: z.any().optional(), // File
    phone: z.string()
        .min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل')
        .max(15, 'رقم الهاتف طويل جداً')
        .regex(/^\+?[0-9]{10,15}$/, 'صيغة رقم الهاتف غير صحيحة (مثال: +966501234567)'),
    gender: z.enum(['ذكر', 'أنثى']),
    nationality: z.string().min(2, 'الجنسية مطلوبة'),
    country: z.string().default('السعودية'),
    region: z.string().min(2, 'المنطقة مطلوبة'),
    city: z.string().min(2, 'المدينة مطلوبة'),

    // ═══════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════
    // 3. PROFESSIONAL CREDENTIALS
    // ═══════════════════════════════════════════════════════
    isLicensedLawyer: z.boolean().default(true),
    licenseNumber: z.string().optional(), // Validated in superRefine
    totalYearsOfExperience: z.coerce.number().min(0).optional(),
    currentWorkNature: z.enum([
        'مكتب محاماة',
        'شركة / قطاع خاص',
        'عمل حر',
        'جهة حكومية / شبه حكومية',
    ]).optional(),
    currentFirmName: z.string().optional(),
    bio: z.string().max(1000).optional(),
    bioEn: z.string().optional(),
    education: z.string().optional(),

    // ═══════════════════════════════════════════════════════
    // 4. COURT EXPERIENCE
    // ═══════════════════════════════════════════════════════
    courtExperience: z.array(z.object({
        courtName: z.enum([
            'المحكمة العمالية',
            'المحكمة التجارية',
            'محكمة الأحوال الشخصية',
            'المحكمة العامة',
            'محكمة التنفيذ',
            'المحكمة الإدارية (ديوان المظالم)',
            'هيئات ولجان خاصة',
        ]),
        hasExperience: z.boolean().default(false),
        approximateCases: z.enum(['1-10', '11-50', '51-100', '100+']).optional(),
    })).optional(),

    // ═══════════════════════════════════════════════════════
    // 5. SPECIALIZATIONS
    // ═══════════════════════════════════════════════════════
    specializations: z.array(z.string()).default([]),
    otherSpecialization: z.string().optional(),

    // ═══════════════════════════════════════════════════════
    // 6. LANGUAGES
    // ═══════════════════════════════════════════════════════
    languages: z.array(z.string()).default([]),
    otherLanguages: z.string().optional(),

    // ═══════════════════════════════════════════════════════
    // 7. SERVICE OFFERINGS & PRICING
    // ═══════════════════════════════════════════════════════
    serviceType: z.enum(['استشارات فقط', 'ترافع وتمثيل قضائي', 'كلاهما']).optional(),
    hourlyRate: z.coerce.number().min(0).optional(),
    fixedConsultationPrice: z.coerce.number().min(0).optional(),
    consultationDuration: z.coerce.number().default(30),
    pricingModel: z.array(z.string()).default([]),
    servicePricing: z.object({
        lawsuitDrafting: z.coerce.number().optional(),
        responseMemo: z.coerce.number().optional(),
        contractReview: z.coerce.number().optional(),
    }).optional(),

    // ═══════════════════════════════════════════════════════
    // 8. AVAILABILITY
    // ═══════════════════════════════════════════════════════
    availabilityStatus: z.enum(['متاح', 'مشغول', 'في إجازة']).default('متاح'),
    citiesForInPersonHearings: z.array(z.string()).default([]),
    acceptsRemoteWork: z.enum(['نعم', 'لا', 'كلاهما']).optional(),
    maxActiveCases: z.coerce.number().optional(),

    // ═══════════════════════════════════════════════════════
    // 9. KYC / COMPLIANCE
    // ═══════════════════════════════════════════════════════
    nationalId: z.string().min(10, 'رقم الهوية الوطنية مطلوب'),
    nationalIdDocument: z.any().optional(), // File
    mailingAddress: z.string().min(5, 'العنوان الوطني مطلوب'),
    workAddress: z.string().optional(),
    ibanNumber: z.string().min(15, 'رقم الآيبان مطلوب'),
    bankName: z.string().min(2, 'اسم البنك مطلوب'),

    agreedToTerms: z.boolean().refine(val => val === true, 'يجب الموافقة على الشروط والأحكام'),
    agreedToPrivacyPolicy: z.boolean().refine(val => val === true, 'يجب الموافقة على سياسة الخصوصية'),
    agreedToConflictOfInterest: z.boolean().refine(val => val === true, 'يجب الإقرار بعدم وجود تعارض مصالح'),
}).superRefine((data, ctx) => {
    // Password Confirmation
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'كلمات المرور غير متطابقة',
            path: ['confirmPassword'],
        })
    }

    // Licensed Lawyer Validation
    if (data.isLicensedLawyer && !data.licenseNumber) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'رقم الرخصة مطلوب للمحامين المرخصين',
            path: ['licenseNumber'],
        })
    }

    // Marketplace Validation
    if (data.wantsMarketplaceProfile) {
        if (!data.bio) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'النبذة التعريفية مطلوبة للملف التعريفي',
                path: ['bio'],
            })
        }
        if (!data.totalYearsOfExperience) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'سنوات الخبرة مطلوبة',
                path: ['totalYearsOfExperience'],
            })
        }
        if (data.specializations.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'يرجى اختيار تخصص واحد على الأقل',
                path: ['specializations'],
            })
        }
        if (data.languages.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'يرجى اختيار لغة واحدة على الأقل',
                path: ['languages'],
            })
        }
        if (!data.serviceType) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'نوع الخدمة مطلوب',
                path: ['serviceType'],
            })
        }
        if (!data.hourlyRate && !data.fixedConsultationPrice) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'يرجى تحديد سعر الساعة أو سعر الاستشارة',
                path: ['hourlyRate'],
            })
        }
        if (!data.acceptsRemoteWork) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'يرجى تحديد إمكانية العمل عن بعد',
                path: ['acceptsRemoteWork'],
            })
        }
    }
})

export type RegistrationFormValues = z.infer<typeof registrationSchema>
