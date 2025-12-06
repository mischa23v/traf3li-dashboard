import { useState } from 'react';
import { apiClient } from '@/lib/api';

const Icons = {
  TrafliLogo: () => (<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>),
  User: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
  Users: () => (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
  Mail: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
  Lock: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>),
  Phone: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>),
  Eye: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>),
  EyeOff: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>),
  MapPin: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  Briefcase: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
  Award: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>),
  Banknote: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
  Shield: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
  Store: () => (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
  Layout: () => (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>),
  Check: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>),
  CheckCircle: () => (<svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  ChevronLeft: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>),
  ChevronRight: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>),
};

const REGIONS = ['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'الشرقية', 'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف'];
const NATIONALITIES = ['سعودي', 'إماراتي', 'كويتي', 'قطري', 'بحريني', 'عماني', 'يمني', 'عراقي', 'سوري', 'لبناني', 'أردني', 'فلسطيني', 'مصري', 'سوداني', 'ليبي', 'تونسي', 'جزائري', 'مغربي', 'موريتاني', 'صومالي', 'جيبوتي', 'قمري', 'هندي', 'باكستاني', 'بنغلاديشي', 'سريلانكي', 'نيبالي', 'أفغاني', 'إيراني', 'تركي', 'صيني', 'ياباني', 'كوري جنوبي', 'كوري شمالي', 'فلبيني', 'إندونيسي', 'ماليزي', 'تايلاندي', 'فيتنامي', 'سنغافوري', 'بروناوي', 'ميانماري', 'كمبودي', 'لاوسي', 'منغولي', 'كازاخستاني', 'أوزبكستاني', 'تركمانستاني', 'طاجيكستاني', 'قيرغيزستاني', 'أذربيجاني', 'أرميني', 'جورجي', 'بريطاني', 'فرنسي', 'ألماني', 'إيطالي', 'إسباني', 'برتغالي', 'هولندي', 'بلجيكي', 'سويسري', 'نمساوي', 'سويدي', 'نرويجي', 'دنماركي', 'فنلندي', 'أيسلندي', 'أيرلندي', 'بولندي', 'تشيكي', 'سلوفاكي', 'مجري', 'روماني', 'بلغاري', 'يوناني', 'صربي', 'كرواتي', 'سلوفيني', 'بوسني', 'ألباني', 'مقدوني', 'أوكراني', 'روسي', 'بيلاروسي', 'ليتواني', 'لاتفي', 'إستوني', 'أمريكي', 'كندي', 'مكسيكي', 'برازيلي', 'أرجنتيني', 'تشيلي', 'كولومبي', 'بيروفي', 'فنزويلي', 'إكوادوري', 'بوليفي', 'باراغواي', 'أوروغواي', 'كوبي', 'جامايكي', 'نيجيري', 'إثيوبي', 'كيني', 'أوغندي', 'تنزاني', 'جنوب أفريقي', 'غاني', 'كاميروني', 'ساحل العاجي', 'سنغالي', 'مالي', 'نيجري', 'تشادي', 'إريتري', 'رواندي', 'أسترالي', 'نيوزيلندي', 'فيجي'];
const COURTS = [{ id: 'general', name: 'المحكمة العامة' }, { id: 'criminal', name: 'المحكمة الجزائية' }, { id: 'personal', name: 'محكمة الأحوال الشخصية' }, { id: 'commercial', name: 'المحكمة التجارية' }, { id: 'labor', name: 'المحكمة العمالية' }, { id: 'admin', name: 'ديوان المظالم' }];
const SPECIALIZATIONS = [{ id: 'labor', name: 'نظام العمل' }, { id: 'commercial', name: 'النظام التجاري' }, { id: 'companies', name: 'الشركات' }, { id: 'realestate', name: 'العقارات' }, { id: 'criminal', name: 'الجزائي' }, { id: 'family', name: 'الأحوال الشخصية' }, { id: 'admin', name: 'القضاء الإداري' }, { id: 'arbitration', name: 'التحكيم' }, { id: 'ip', name: 'الملكية الفكرية' }, { id: 'banking', name: 'المصرفي والتمويل' }];
const LANGUAGES = ['العربية', 'الإنجليزية', 'الصينية', 'الهندية', 'الإسبانية', 'الفرنسية', 'البنغالية', 'البرتغالية', 'الروسية', 'اليابانية', 'الألمانية', 'الكورية', 'التركية', 'الإيطالية', 'الفارسية', 'الأردية'];
const WORK_TYPES = ['مكتب محاماة', 'شركة / قطاع خاص', 'عمل حر', 'جهة حكومية', 'إدارة قانونية'];
const CASE_RANGES = ['1-10', '11-30', '31-50', '51-100', '+100'];

export function SignUpForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userType: '',
    lawyerWorkMode: '' as '' | 'solo' | 'create_firm' | 'join_firm', // Updated to match backend API
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    nationality: '',
    region: '',
    city: '',
    isLicensed: null as boolean | null,
    licenseNumber: '',
    courts: {} as Record<string, { selected?: boolean; caseCount?: string; name?: string }>,
    yearsOfExperience: '',
    workType: '',
    // Firm data for create_firm mode
    firmName: '',
    firmNameEn: '',
    firmLicenseNumber: '',
    firmEmail: '',
    firmPhone: '',
    firmAddress: '',
    firmWebsite: '',
    firmDescription: '',
    firmSpecializations: [] as string[],
    // Invitation code for join_firm mode
    invitationCode: '',
    specializations: [] as string[],
    languages: ['العربية'] as string[],
    bio: '',
    isRegisteredKhebra: null as boolean | null,
    serviceType: '',
    pricingModel: [] as string[],
    hourlyRateMin: '',
    hourlyRateMax: '',
    acceptsRemote: '',
    agreedTerms: false,
    agreedPrivacy: false,
    agreedConflict: false,
  });

  const updateField = (field: string, value: any) => { 
    setFormData(prev => ({ ...prev, [field]: value })); 
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); 
  };
  
  const toggleArrayItem = (field: 'specializations' | 'pricingModel', item: string) => { 
    setFormData(prev => ({ 
      ...prev, 
      [field]: prev[field].includes(item) ? prev[field].filter((i: string) => i !== item) : [...prev[field], item] 
    })); 
  };
  
  const updateCourt = (courtId: string, field: string, value: any) => { 
    const courtData = COURTS.find(c => c.id === courtId); 
    setFormData(prev => ({ 
      ...prev, 
      courts: { 
        ...prev.courts, 
        [courtId]: { 
          ...prev.courts[courtId], 
          [field]: value, 
          name: courtData?.name 
        } 
      } 
    })); 
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^05\d{8}$/.test(phone);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    // Step 1 - Basic Info (All)
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'الحقل مطلوب';
      if (!formData.lastName.trim()) newErrors.lastName = 'الحقل مطلوب';
      if (!formData.username.trim()) newErrors.username = 'الحقل مطلوب';
      else if (formData.username.length < 3) newErrors.username = 'يجب أن لا يقل عن 3 أحرف';
      if (!formData.email.trim()) newErrors.email = 'الحقل مطلوب';
      else if (!validateEmail(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
      // Phone validation for client and all lawyer modes
      if (!formData.phone) newErrors.phone = 'الحقل مطلوب';
      else if (!validatePhone(formData.phone)) newErrors.phone = 'رقم الجوال غير صحيح';

      // Invitation code required for join_firm mode
      if (formData.lawyerWorkMode === 'join_firm') {
        if (!formData.invitationCode.trim()) newErrors.invitationCode = 'كود الدعوة مطلوب';
      }
    }

    // Step 2 - Password + Location (All users)
    if (step === 2) {
      if (!formData.password) newErrors.password = 'الحقل مطلوب';
      else if (formData.password.length < 8) newErrors.password = 'يجب أن تكون مكونة من 8 خانات على الأقل';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'الحقل مطلوب';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
      if (!formData.nationality) newErrors.nationality = 'الحقل مطلوب';
      if (!formData.region) newErrors.region = 'الحقل مطلوب';
      if (!formData.city.trim()) newErrors.city = 'الحقل مطلوب';
    }

    // Step 3 - Firm Data (create_firm mode only)
    if (step === 3 && formData.lawyerWorkMode === 'create_firm') {
      if (!formData.firmName.trim()) newErrors.firmName = 'اسم المكتب مطلوب';
      if (!formData.firmLicenseNumber.trim()) newErrors.firmLicenseNumber = 'رقم الترخيص مطلوب';
    }

    // Final Step - Terms (all users)
    const finalStep = getTotalSteps();
    if (step === finalStep) {
      if (!formData.agreedTerms) newErrors.agreedTerms = 'يرجى الموافقة';
      if (!formData.agreedPrivacy) newErrors.agreedPrivacy = 'يرجى الموافقة';
      if (formData.userType === 'lawyer' && !formData.agreedConflict) newErrors.agreedConflict = 'يرجى الموافقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalSteps = () => {
    if (formData.userType === 'client') return 3;
    if (formData.lawyerWorkMode === 'solo') return 3; // Solo lawyer: basic info, password, terms
    if (formData.lawyerWorkMode === 'join_firm') return 3; // Join firm: basic info + code, password, terms
    if (formData.lawyerWorkMode === 'create_firm') return 4; // Create firm: basic info, password, firm data, terms
    return 3;
  };

  const nextStep = () => { 
    if (validateStep(currentStep)) { 
      setCurrentStep(prev => Math.min(prev + 1, getTotalSteps())); 
      setErrors({}); 
    } 
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (loading) return;
    if (validateStep(currentStep)) {
      setLoading(true);
      try {
        const isLawyer = formData.userType === 'lawyer';

        // Build base payload
        const payload: Record<string, any> = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          firstName: formData.firstName,
          lastName: formData.lastName,
          description: formData.bio || null,
          role: isLawyer ? 'lawyer' : 'client',
          country: 'Saudi Arabia',
          nationality: formData.nationality || null,
          region: formData.region || null,
          city: formData.city || null
        };

        // Add lawyer-specific fields
        if (isLawyer) {
          payload.lawyerWorkMode = formData.lawyerWorkMode;

          // Add firmData for create_firm mode
          if (formData.lawyerWorkMode === 'create_firm') {
            payload.firmData = {
              name: formData.firmName,
              nameEn: formData.firmNameEn || null,
              licenseNumber: formData.firmLicenseNumber,
              email: formData.firmEmail || null,
              phone: formData.firmPhone || null,
              address: formData.firmAddress || null,
              website: formData.firmWebsite || null,
              description: formData.firmDescription || null,
              specializations: formData.firmSpecializations.length > 0 ? formData.firmSpecializations : null,
            };
          }

          // Add invitationCode for join_firm mode
          if (formData.lawyerWorkMode === 'join_firm') {
            payload.invitationCode = formData.invitationCode;
          }
        }

        const response = await apiClient.post('/auth/register', payload);
        if (response.status === 201) setShowSuccess(true);
      } catch (error: any) {
        console.error('Registration error:', error);
        alert(error.response?.data?.message || 'حدث خطأ ما، يرجى المحاولة مرة أخرى');
      } finally {
        setLoading(false);
      }
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
              <div className="inline-flex items-center justify-center text-emerald-500 mb-6 animate-scaleIn"><Icons.CheckCircle /></div>
              <h1 className="text-2xl font-bold text-[#0f172a] mb-3">تم إنشاء الحساب بنجاح</h1>
              <p className="text-slate-500 mb-8">{formData.userType === 'lawyer' ? 'يمكنك الآن البدء في إدارة قضاياك واستقبال العملاء.' : 'يمكنك الآن البحث عن محامٍ مناسب لقضيتك.'}</p>
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-center">
                <p className="text-sm text-slate-600 mb-2">تم التسجيل باسم</p>
                <p className="font-bold text-[#0f172a]">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-slate-500">{formData.email}</p>
              </div>
              <a href="/sign-in" className="block w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-center">تسجيل الدخول</a>
              <p className="text-sm text-slate-400 mt-4">سيتم إرسال رسالة تأكيد على البريد الإلكتروني</p>
            </div>
          </div>
        </div>
        <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } } .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }`}</style>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F8F9FA] text-[#0f172a] mb-6"><Icons.TrafliLogo /></div>
              <h1 className="text-3xl font-bold text-[#0f172a] mb-2">إنشاء حساب جديد</h1>
              <p className="text-slate-500 text-lg">اختر نوع الحساب</p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => { updateField('userType', 'client'); setCurrentStep(1); }} className={`p-6 rounded-2xl border-2 transition-all text-center hover:shadow-md ${formData.userType === 'client' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-4"><Icons.Users /></div>
                  <h3 className="font-bold text-[#0f172a] mb-1">عميل</h3>
                  <p className="text-slate-500 text-sm">البحث عن محامٍ</p>
                </button>
                <button onClick={() => updateField('userType', 'lawyer')} className={`p-6 rounded-2xl border-2 transition-all text-center hover:shadow-md ${formData.userType === 'lawyer' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto mb-4"><Icons.TrafliLogo /></div>
                  <h3 className="font-bold text-[#0f172a] mb-1">محامي</h3>
                  <p className="text-slate-500 text-sm">تقديم الخدمات القانونية</p>
                </button>
              </div>
              {formData.userType === 'lawyer' && (
                <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-100 animate-fadeIn">
                  <h3 className="font-bold text-[#0f172a] mb-4">كيف تريد العمل؟</h3>
                  <div className="space-y-3">
                    <button onClick={() => { updateField('lawyerWorkMode', 'solo'); setCurrentStep(1); }} className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-right ${formData.lawyerWorkMode === 'solo' ? 'border-emerald-500 bg-white' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.lawyerWorkMode === 'solo' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}><Icons.User /></div>
                      <div className="flex-1"><h4 className="font-bold text-[#0f172a] text-sm">محامي مستقل</h4><p className="text-xs text-slate-500">العمل بشكل مستقل بدون مكتب</p></div>
                    </button>
                    <button onClick={() => { updateField('lawyerWorkMode', 'create_firm'); setCurrentStep(1); }} className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-right ${formData.lawyerWorkMode === 'create_firm' ? 'border-emerald-500 bg-white' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.lawyerWorkMode === 'create_firm' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}><Icons.Store /></div>
                      <div className="flex-1"><h4 className="font-bold text-[#0f172a] text-sm">إنشاء مكتب جديد</h4><p className="text-xs text-slate-500">إنشاء مكتب محاماة وإدارة الفريق</p></div>
                    </button>
                    <button onClick={() => { updateField('lawyerWorkMode', 'join_firm'); setCurrentStep(1); }} className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-right ${formData.lawyerWorkMode === 'join_firm' ? 'border-emerald-500 bg-white' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.lawyerWorkMode === 'join_firm' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}><Icons.Users /></div>
                      <div className="flex-1"><h4 className="font-bold text-[#0f172a] text-sm">الانضمام لمكتب</h4><p className="text-xs text-slate-500">لدي كود دعوة للانضمام لمكتب</p></div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-slate-500 mt-6">لديك حساب بالفعل؟ <a href="/sign-in" className="text-emerald-600 hover:text-emerald-700 font-bold">تسجيل الدخول</a></p>
          </div>
        </div>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }`}</style>
      </div>
    );
  }

  const totalSteps = getTotalSteps();
  
  const getStepInfo = () => {
    if (formData.userType === 'client') {
      const steps = [
        { title: 'البيانات الأساسية والجوال', icon: <Icons.User /> },
        { title: 'كلمة المرور والموقع', icon: <Icons.Lock /> },
        { title: 'الإقرارات والموافقات', icon: <Icons.Shield /> }
      ];
      return steps[currentStep - 1] || steps[0];
    }

    if (formData.lawyerWorkMode === 'solo' || formData.lawyerWorkMode === 'join_firm') {
      const steps = [
        { title: formData.lawyerWorkMode === 'join_firm' ? 'البيانات الأساسية وكود الدعوة' : 'البيانات الأساسية والجوال', icon: <Icons.User /> },
        { title: 'كلمة المرور والموقع', icon: <Icons.Lock /> },
        { title: 'الإقرارات والموافقات', icon: <Icons.Shield /> }
      ];
      return steps[currentStep - 1] || steps[0];
    }

    if (formData.lawyerWorkMode === 'create_firm') {
      const steps = [
        { title: 'البيانات الأساسية والجوال', icon: <Icons.User /> },
        { title: 'كلمة المرور والموقع', icon: <Icons.Lock /> },
        { title: 'بيانات المكتب', icon: <Icons.Store /> },
        { title: 'الإقرارات والموافقات', icon: <Icons.Shield /> }
      ];
      return steps[currentStep - 1] || steps[0];
    }

    // Default fallback
    const steps = [
      { title: 'البيانات الأساسية', icon: <Icons.User /> },
      { title: 'كلمة المرور والموقع', icon: <Icons.Lock /> },
      { title: 'الإقرارات والموافقات', icon: <Icons.Shield /> }
    ];
    return steps[currentStep - 1] || steps[0];
  };
  
  const stepInfo = getStepInfo();

  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F8F9FA] text-[#0f172a] mb-6"><Icons.TrafliLogo /></div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">إنشاء حساب جديد</h1>
            <p className="text-slate-500">الخطوة {currentStep} من {totalSteps}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">{stepInfo.icon}</div>
                <h2 className="text-xl font-bold text-[#0f172a]">{stepInfo.title}</h2>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
              </div>
            </div>
            <div className="p-6 pt-4 space-y-5 max-h-[60vh] overflow-y-auto">

              {/* STEP 1: Basic Info */}
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0f172a] mb-2">الاسم الأول <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.firstName ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0f172a] mb-2">الاسم الأخير <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.lastName ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">اسم المستخدم <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.User /></div>
                      <input type="text" value={formData.username} onChange={(e) => updateField('username', e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())} className={`w-full h-12 pr-12 pl-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.username ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} dir="ltr" style={{ textAlign: 'left' }} maxLength={20} />
                    </div>
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">البريد الإلكتروني <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Mail /></div>
                      <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={`w-full h-12 pr-12 pl-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} dir="ltr" style={{ textAlign: 'left' }} />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  {/* Phone field for all users */}
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">رقم الجوال <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Phone /></div>
                      <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className={`w-full h-12 pr-12 pl-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.phone ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} placeholder="05XXXXXXXX" dir="ltr" style={{ textAlign: 'left' }} maxLength={10} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Invitation code field for join_firm mode */}
                  {formData.lawyerWorkMode === 'join_firm' && (
                    <div>
                      <label className="block text-sm font-medium text-[#0f172a] mb-2">كود الدعوة <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Award /></div>
                        <input type="text" value={formData.invitationCode} onChange={(e) => updateField('invitationCode', e.target.value.toUpperCase())} className={`w-full h-12 pr-12 pl-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.invitationCode ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} placeholder="أدخل كود الدعوة" dir="ltr" style={{ textAlign: 'left' }} />
                      </div>
                      {errors.invitationCode && <p className="text-red-500 text-xs mt-1">{errors.invitationCode}</p>}
                      <p className="text-xs text-slate-400 mt-1">احصل على كود الدعوة من مالك المكتب</p>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: Password + Location (All users) */}
              {currentStep === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">كلمة المرور <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Lock /></div>
                      <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => updateField('password', e.target.value)} className={`w-full h-12 pr-12 pl-12 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} dir="ltr" style={{ textAlign: 'left' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">تأكيد كلمة المرور <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Lock /></div>
                      <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} className={`w-full h-12 pr-12 pl-12 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} dir="ltr" style={{ textAlign: 'left' }} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">الجنسية <span className="text-red-500">*</span></label>
                    <select value={formData.nationality} onChange={(e) => updateField('nationality', e.target.value)} className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none appearance-none ${errors.nationality ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`}>
                      <option value="">اختر</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">المنطقة <span className="text-red-500">*</span></label>
                    <select value={formData.region} onChange={(e) => updateField('region', e.target.value)} className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none appearance-none ${errors.region ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`}>
                      <option value="">اختر</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">المدينة <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none ${errors.city ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                </>
              )}

              {/* STEP 3: Firm Data (create_firm mode only) */}
              {currentStep === 3 && formData.lawyerWorkMode === 'create_firm' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">اسم المكتب (بالعربية) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Store /></div>
                      <input type="text" value={formData.firmName} onChange={(e) => updateField('firmName', e.target.value)} className={`w-full h-12 pr-12 pl-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.firmName ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} placeholder="مكتب المحاماة" />
                    </div>
                    {errors.firmName && <p className="text-red-500 text-xs mt-1">{errors.firmName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">اسم المكتب (بالإنجليزية) <span className="text-slate-400 text-xs">(اختياري)</span></label>
                    <input type="text" value={formData.firmNameEn} onChange={(e) => updateField('firmNameEn', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0f172a] outline-none focus:border-[#0f172a]" placeholder="Law Firm Name" dir="ltr" style={{ textAlign: 'left' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">رقم ترخيص المكتب <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Award /></div>
                      <input type="text" value={formData.firmLicenseNumber} onChange={(e) => updateField('firmLicenseNumber', e.target.value)} className={`w-full h-12 pr-12 pl-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${errors.firmLicenseNumber ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'}`} placeholder="رقم الترخيص" dir="ltr" style={{ textAlign: 'left' }} />
                    </div>
                    {errors.firmLicenseNumber && <p className="text-red-500 text-xs mt-1">{errors.firmLicenseNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0f172a] mb-2">البريد الإلكتروني للمكتب <span className="text-slate-400 text-xs">(اختياري)</span></label>
                      <input type="email" value={formData.firmEmail} onChange={(e) => updateField('firmEmail', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0f172a] outline-none focus:border-[#0f172a]" dir="ltr" style={{ textAlign: 'left' }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0f172a] mb-2">هاتف المكتب <span className="text-slate-400 text-xs">(اختياري)</span></label>
                      <input type="tel" value={formData.firmPhone} onChange={(e) => updateField('firmPhone', e.target.value.replace(/\D/g, ''))} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0f172a] outline-none focus:border-[#0f172a]" dir="ltr" style={{ textAlign: 'left' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">عنوان المكتب <span className="text-slate-400 text-xs">(اختياري)</span></label>
                    <input type="text" value={formData.firmAddress} onChange={(e) => updateField('firmAddress', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0f172a] outline-none focus:border-[#0f172a]" placeholder="العنوان الكامل" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">الموقع الإلكتروني <span className="text-slate-400 text-xs">(اختياري)</span></label>
                    <input type="url" value={formData.firmWebsite} onChange={(e) => updateField('firmWebsite', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0f172a] outline-none focus:border-[#0f172a]" placeholder="https://example.com" dir="ltr" style={{ textAlign: 'left' }} />
                  </div>
                </>
              )}

              {/* FINAL STEP: Terms (All users - step 3 for client/solo/join_firm, step 4 for create_firm) */}
              {currentStep === totalSteps && (
                <div className="space-y-3">
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${errors.agreedTerms ? 'border-red-300' : formData.agreedTerms ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'}`}>
                    <button type="button" onClick={() => updateField('agreedTerms', !formData.agreedTerms)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${formData.agreedTerms ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>{formData.agreedTerms && <Icons.Check />}</button>
                    <span className="text-[#0f172a]">أقر بموافقتي على <a href="/terms" target="_blank" className="text-emerald-600 font-medium hover:underline">الشروط والأحكام</a></span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${errors.agreedPrivacy ? 'border-red-300' : formData.agreedPrivacy ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'}`}>
                    <button type="button" onClick={() => updateField('agreedPrivacy', !formData.agreedPrivacy)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${formData.agreedPrivacy ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>{formData.agreedPrivacy && <Icons.Check />}</button>
                    <span className="text-[#0f172a]">أقر بموافقتي على <a href="/privacy" target="_blank" className="text-emerald-600 font-medium hover:underline">سياسة الخصوصية</a></span>
                  </div>
                  {formData.userType === 'lawyer' && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl border ${errors.agreedConflict ? 'border-red-300' : formData.agreedConflict ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <button type="button" onClick={() => updateField('agreedConflict', !formData.agreedConflict)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${formData.agreedConflict ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>{formData.agreedConflict && <Icons.Check />}</button>
                      <span className="text-[#0f172a]">أقر بموافقتي على <a href="/conflict-policy" target="_blank" className="text-emerald-600 font-medium hover:underline">سياسة تعارض المصالح</a></span>
                    </div>
                  )}
                </div>
              )}

            </div>

            <div className="p-6 pt-2 flex items-center justify-between border-t border-slate-100">
              <button type="button" onClick={prevStep} className="flex items-center gap-2 px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"><Icons.ChevronRight />السابق</button>
              {currentStep < totalSteps ? (
                <button type="button" onClick={nextStep} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold shadow-lg shadow-emerald-500/20">التالي<Icons.ChevronLeft /></button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading} className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-emerald-500/20 ${loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}</button>
              )}
            </div>
          </div>
          <p className="text-center text-slate-500 mt-6">لديك حساب بالفعل؟ <a href="/sign-in" className="text-emerald-600 font-bold">تسجيل الدخول</a></p>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
    </div>
  );
}
