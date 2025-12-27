/**
 * Complete OAuth Profile Component
 * For first-time OAuth users to complete their profile and select role
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

// ============================================
// SVG ICONS
// ============================================
const Icons = {
  TrafliLogo: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  Users: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Store: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Layout: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
}

export function CompleteOAuthProfile() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.setUser)
  const isRTL = i18n.language === 'ar'

  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    userType: '' as 'client' | 'lawyer' | '',
    lawyerMode: '' as 'marketplace' | 'dashboard' | '',
    phone: user?.phone || '',
  })

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validatePhone = (phone: string) => /^05\d{8}$/.test(phone)

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 0 && !formData.userType) {
      newErrors.userType = isRTL ? 'يرجى اختيار نوع الحساب' : 'Please select account type'
    }

    if (currentStep === 1 && formData.userType === 'lawyer' && !formData.lawyerMode) {
      newErrors.lawyerMode = isRTL ? 'يرجى اختيار نوع الاستخدام' : 'Please select usage type'
    }

    if (currentStep === 2 && !formData.phone) {
      newErrors.phone = isRTL ? 'رقم الجوال مطلوب' : 'Phone number is required'
    } else if (currentStep === 2 && !validatePhone(formData.phone)) {
      newErrors.phone = isRTL ? 'رقم الجوال غير صحيح' : 'Invalid phone number'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Move to next step or submit
    if (currentStep === 0 && formData.userType === 'client') {
      setCurrentStep(2) // Skip lawyer mode selection
    } else if (currentStep === 0 && formData.userType === 'lawyer') {
      setCurrentStep(1)
    } else if (currentStep === 1) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      await handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // TODO: Call API to update user profile with role and phone
      // For now, update local state
      if (user) {
        updateUser({
          ...user,
          role: formData.userType as 'client' | 'lawyer',
          phone: formData.phone,
          isSeller: formData.userType === 'lawyer',
        })
      }

      toast.success(isRTL ? 'تم إكمال حسابك بنجاح!' : 'Profile completed successfully!')

      // Navigate based on role
      if (formData.userType === 'lawyer' && formData.lawyerMode === 'marketplace') {
        navigate({ to: ROUTES.dashboard.home })
      } else {
        navigate({ to: ROUTES.dashboard.home })
      }
    } catch (error: any) {
      toast.error(error.message || (isRTL ? 'حدث خطأ' : 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // STEP 0: Role Selection
  // ============================================
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F8F9FA] text-[#0f172a] mb-6">
                <Icons.TrafliLogo />
              </div>
              <h1 className="text-3xl font-bold text-[#0f172a] mb-2">
                {isRTL ? 'أكمل حسابك' : 'Complete Your Profile'}
              </h1>
              <p className="text-slate-500 text-lg">
                {isRTL ? 'مرحباً ' : 'Welcome '}
                <span className="font-semibold text-emerald-600">{user?.firstName || user?.email}</span>
                {isRTL ? '! اختر نوع الحساب' : '! Choose your account type'}
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              {errors.userType && (
                <p className="text-red-500 text-sm text-center mb-4">{errors.userType}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => updateField('userType', 'client')}
                  className={`p-6 rounded-2xl border-2 transition-all text-center hover:shadow-md ${
                    formData.userType === 'client'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <Icons.Users />
                  </div>
                  <h3 className="font-bold text-[#0f172a] mb-1">
                    {isRTL ? 'عميل' : 'Client'}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {isRTL ? 'البحث عن محامٍ' : 'Find a lawyer'}
                  </p>
                </button>

                <button
                  onClick={() => updateField('userType', 'lawyer')}
                  className={`p-6 rounded-2xl border-2 transition-all text-center hover:shadow-md ${
                    formData.userType === 'lawyer'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto mb-4">
                    <Icons.TrafliLogo />
                  </div>
                  <h3 className="font-bold text-[#0f172a] mb-1">
                    {isRTL ? 'محامي' : 'Lawyer'}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {isRTL ? 'تقديم الخدمات القانونية' : 'Provide legal services'}
                  </p>
                </button>
              </div>

              <button
                onClick={handleContinue}
                disabled={!formData.userType}
                className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? 'متابعة' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // STEP 1: Lawyer Mode Selection
  // ============================================
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0f172a] text-emerald-400 mb-6 shadow-xl">
                <Icons.TrafliLogo />
              </div>
              <h1 className="text-3xl font-bold text-[#0f172a] mb-2">
                {isRTL ? 'نوع الاستخدام' : 'Usage Type'}
              </h1>
              <p className="text-slate-500 text-lg">
                {isRTL ? 'كيف ستستخدم المنصة؟' : 'How will you use the platform?'}
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              {errors.lawyerMode && (
                <p className="text-red-500 text-sm text-center mb-4">{errors.lawyerMode}</p>
              )}

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => updateField('lawyerMode', 'marketplace')}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-start ${
                    formData.lawyerMode === 'marketplace'
                      ? 'border-emerald-500 bg-white'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.lawyerMode === 'marketplace'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icons.Store />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#0f172a] text-sm">
                      {isRTL ? 'السوق + لوحة التحكم' : 'Marketplace + Dashboard'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isRTL ? 'استقبال عملاء جدد وإدارة القضايا' : 'Receive new clients and manage cases'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => updateField('lawyerMode', 'dashboard')}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-start ${
                    formData.lawyerMode === 'dashboard'
                      ? 'border-emerald-500 bg-white'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.lawyerMode === 'dashboard'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icons.Layout />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#0f172a] text-sm">
                      {isRTL ? 'لوحة التحكم فقط' : 'Dashboard Only'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isRTL ? 'إدارة القضايا الحالية' : 'Manage existing cases'}
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                >
                  {isRTL ? 'السابق' : 'Back'}
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!formData.lawyerMode}
                  className="flex-1 py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRTL ? 'متابعة' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // STEP 2: Phone Number
  // ============================================
  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0f172a] text-emerald-400 mb-6 shadow-xl">
              <Icons.TrafliLogo />
            </div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">
              {isRTL ? 'رقم الجوال' : 'Phone Number'}
            </h1>
            <p className="text-slate-500 text-lg">
              {isRTL ? 'أدخل رقم الجوال للتواصل' : 'Enter your phone number for contact'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
                {isRTL ? 'رقم الجوال' : 'Phone Number'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Icons.Phone />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`w-full h-12 pe-12 ps-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all ${
                    errors.phone
                      ? 'border-red-400'
                      : 'border-slate-200 focus:border-[#0f172a]'
                  }`}
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                  style={{ textAlign: 'left' }}
                  maxLength={10}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(formData.userType === 'lawyer' ? 1 : 0)}
                className="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
              >
                {isRTL ? 'السابق' : 'Back'}
              </button>
              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="flex-1 py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  isRTL ? 'إكمال الحساب' : 'Complete Profile'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompleteOAuthProfile
