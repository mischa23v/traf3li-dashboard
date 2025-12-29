import { useTranslation } from 'react-i18next'

// Icons
const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export function AuthFooter() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <footer className="w-full bg-slate-800 text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {isRTL ? 'عن ترافعلي' : 'About Traf3li'}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {isRTL
                ? 'منصة سعودية رائدة تربط العملاء بأفضل المحامين المعتمدين لتقديم خدمات قانونية احترافية بكل سهولة وشفافية.'
                : 'A leading Saudi platform connecting clients with the best certified lawyers to provide professional legal services with ease and transparency.'}
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {isRTL ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>{isRTL ? 'الخدمات القانونية' : 'Legal Services'}</li>
              <li>{isRTL ? 'أعمال المحاماة' : 'Legal Work'}</li>
              <li>{isRTL ? 'تصفح المحامين' : 'Browse Lawyers'}</li>
              <li>{isRTL ? 'من نحن' : 'About Us'}</li>
            </ul>
          </div>

          {/* Legal Support Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {isRTL ? 'الدعم القانوني' : 'Legal Support'}
            </h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>{isRTL ? 'شروط الاستخدام' : 'Terms of Use'}</li>
              <li>{isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}</li>
              <li>{isRTL ? 'اتصل بنا' : 'Contact Us'}</li>
              <li>{isRTL ? 'الأسئلة الشائعة' : 'FAQs'}</li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <MailIcon />
                <span>info@traf3li.com</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon />
                <span dir="ltr">920000000</span>
              </li>
              <li className="flex items-center gap-2">
                <LocationIcon />
                <span>
                  {isRTL
                    ? 'الرياض، المملكة العربية السعودية'
                    : 'Riyadh, Saudi Arabia'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-slate-400 text-sm">
            {isRTL
              ? `© ${new Date().getFullYear()} ترافعلي - جميع الحقوق محفوظة. منصة قانونية مرخصة في المملكة العربية السعودية.`
              : `© ${new Date().getFullYear()} Traf3li - All rights reserved. A licensed legal platform in Saudi Arabia.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
