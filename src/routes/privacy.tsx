import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/sign-up" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6">
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة للتسجيل
          </Link>
          <h1 className="text-4xl font-bold text-[#0f172a] mb-2">سياسة الخصوصية</h1>
          <p className="text-slate-500">آخر تحديث: ٢٥ نوفمبر ٢٠٢٥</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 lg:p-12 space-y-12">

          {/* Introduction */}
          <section>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <span className="text-3xl">🛡️</span>
                التزامنا بخصوصيتك
              </h2>
              <p className="text-purple-900 leading-relaxed">
                في <strong className="text-emerald-600">ترافعلي (TRAF3LI)</strong>، نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. 
                هذه السياسة تشرح بالتفصيل كيفية جمعنا، استخدامنا، تخزيننا، ومشاركة بياناتك الشخصية وفقاً لـ 
                <strong> قانون حماية البيانات الشخصية السعودي (PDPL)</strong>.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>🏢</span>
                  معلومات مراقب البيانات
                </h3>
                <div className="text-sm text-slate-700 space-y-1">
                  <p><strong>اسم الشركة:</strong> ترافعلي (TRAF3LI)</p>
                  <p><strong>الدور:</strong> مراقب البيانات (Data Controller)</p>
                  <p><strong>البريد الإلكتروني:</strong> privacy@traf3li.com</p>
                  <p><strong>الموقع:</strong> https://traf3li.com</p>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-5">
                <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <span>👤</span>
                  مسؤول حماية البيانات (DPO)
                </h3>
                <div className="text-sm text-emerald-800 space-y-1">
                  <p><strong>البريد الإلكتروني:</strong> dpo@traf3li.com</p>
                  <p><strong>للشكاوى:</strong> يمكنك التواصل معنا مباشرة</p>
                  <p><strong>السلطة المشرفة:</strong> هيئة البيانات والذكاء الاصطناعي (SDAIA)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 1: Data Collection */}
          <section id="data-collection">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١. البيانات التي نجمعها</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-4">١.١ البيانات الشخصية الأساسية</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h4 className="font-semibold text-blue-900 mb-3">عند التسجيل:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ الاسم الكامل</li>
                      <li>✓ البريد الإلكتروني</li>
                      <li>✓ رقم الجوال</li>
                      <li>✓ كلمة المرور (مُشفرة)</li>
                      <li>✓ نوع الحساب</li>
                      <li>✓ الصورة الشخصية (اختياري)</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
                    <h4 className="font-semibold text-emerald-900 mb-3">للمحامين فقط:</h4>
                    <ul className="text-sm text-emerald-800 space-y-1">
                      <li>✓ رقم الترخيص (وزارة العدل)</li>
                      <li>✓ شهادة الترخيص</li>
                      <li>✓ الهوية الوطنية/الإقامة</li>
                      <li>✓ التخصص القانوني</li>
                      <li>✓ سنوات الخبرة</li>
                      <li>✓ معلومات الحساب البنكي</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-4">١.٢ البيانات القانونية (حساسة جداً 🔴)</h3>
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">⚖️</span>
                    <div>
                      <h4 className="font-bold text-red-900 mb-2">بيانات تحتاج حماية قصوى</h4>
                      <p className="text-sm text-red-800">
                        هذه البيانات مُشفرة بـ <strong>AES-256-GCM</strong> ومحمية بأعلى معايير الأمان
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• تفاصيل القضايا</li>
                      <li>• الأحكام القضائية</li>
                      <li>• المستندات القانونية</li>
                    </ul>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• الاستشارات القانونية</li>
                      <li>• العقود والاتفاقيات</li>
                      <li>• الجلسات القضائية</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-4">١.٣ البيانات المالية (حساسة 🟡)</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">💳</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-900 mb-2">⚠️ نحن لا نخزن أرقام البطاقات!</h4>
                      <p className="text-sm text-amber-800 mb-3">
                        نستخدم <strong>Stripe</strong> لمعالجة المدفوعات. نخزن فقط:
                      </p>
                      <ul className="text-sm text-amber-800 space-y-1 mr-4">
                        <li>• Payment Intent ID من Stripe</li>
                        <li>• آخر 4 أرقام من البطاقة</li>
                        <li>• نوع البطاقة (Visa, Mada, إلخ)</li>
                        <li>• حالة الدفع</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-4">١.٤ البيانات التقنية</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">معلومات الجهاز:</h4>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li>• عنوان IP</li>
                      <li>• نوع المتصفح</li>
                      <li>• نظام التشغيل</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">معلومات الاستخدام:</h4>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li>• الصفحات المزارة</li>
                      <li>• الوقت المستغرق</li>
                      <li>• عمليات البحث</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Cookies:</h4>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li>• Session cookies</li>
                      <li>• Auth tokens</li>
                      <li>• Analytics (بموافقتك)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Legal Basis */}
          <section id="legal-basis">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٢. الأساس القانوني لمعالجة البيانات</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border-r-4 border-green-500 rounded-lg p-5">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <span>✓</span>
                  الموافقة (Consent)
                </h3>
                <p className="text-sm text-green-800">
                  نحصل على موافقتك الصريحة قبل معالجة البيانات الحساسة. 
                  يمكنك سحب موافقتك في أي وقت عبر: <strong>الإعدادات &gt; الخصوصية &gt; إدارة الموافقات</strong>
                </p>
              </div>

              <div className="bg-blue-50 border-r-4 border-blue-500 rounded-lg p-5">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span>📝</span>
                  تنفيذ العقد (Contract Performance)
                </h3>
                <p className="text-sm text-blue-800">
                  نعالج بياناتك لتنفيذ العقد الإلكتروني بينك وبين المحامي (إنشاء الحساب، معالجة المدفوعات، تقديم الخدمات).
                </p>
              </div>

              <div className="bg-purple-50 border-r-4 border-purple-500 rounded-lg p-5">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <span>⚖️</span>
                  الالتزام القانوني (Legal Obligation)
                </h3>
                <p className="text-sm text-purple-800">
                  نعالج بياناتك للامتثال للقوانين السعودية (الاحتفاظ بسجلات محاسبية، التحقق من الهوية، الاستجابة لأوامر المحاكم).
                </p>
              </div>

              <div className="bg-orange-50 border-r-4 border-orange-500 rounded-lg p-5">
                <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  المصالح المشروعة (Legitimate Interests)
                </h3>
                <p className="text-sm text-orange-800">
                  نعالج بياناتك لمصالحنا المشروعة (تحسين المنصة، منع الاحتيال، البحث وتحليل البيانات) 
                  شريطة عدم تجاوز حقوقك.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Usage */}
          <section id="usage">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٣. كيف نستخدم بياناتك</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-5">
                <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🛠️</span>
                  تقديم الخدمات
                </h3>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• إدارة حسابك</li>
                  <li>• ربط العملاء بالمحامين</li>
                  <li>• معالجة المدفوعات</li>
                  <li>• إدارة القضايا</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📧</span>
                  الاتصالات
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• إشعارات الطلبات</li>
                  <li>• تحديثات القضايا</li>
                  <li>• الدعم الفني</li>
                  <li>• التسويق (بموافقتك)</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  الأمان
                </h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• منع الاحتيال</li>
                  <li>• التحقق من الهوية</li>
                  <li>• مراقبة المعاملات المشبوهة</li>
                  <li>• الامتثال لمكافحة غسل الأموال</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-5">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  التحسين
                </h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• تحليل الأداء</li>
                  <li>• تطوير ميزات جديدة</li>
                  <li>• تحسين تجربة المستخدم</li>
                  <li>• البحث والتطوير</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-6">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                التسويق
              </h4>
              <p className="text-sm text-amber-800">
                لن نرسل لك رسائل تسويقية إلا بموافقتك. يمكنك إلغاء الاشتراك في أي وقت عبر:
              </p>
              <ul className="text-sm text-amber-800 mt-2 mr-4">
                <li>• رابط "إلغاء الاشتراك" في البريد الإلكتروني</li>
                <li>• إعدادات الإشعارات في حسابك</li>
                <li>• التواصل مع: privacy@traf3li.com</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Third Parties */}
          <section id="third-parties">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٤. مشاركة البيانات مع أطراف ثالثة</h2>
            
            <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 mb-6">
              <p className="text-red-900 font-bold text-lg text-center">
                🚫 نحن لا نبيع بياناتك الشخصية أبداً
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-4">٤.١ مقدمو الخدمات الأساسية</h3>
                <div className="grid gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
                    <span className="text-3xl">💳</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">Stripe</h4>
                      <p className="text-sm text-blue-800">معالجة المدفوعات (متوافق مع PCI DSS)</p>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-4">
                    <span className="text-3xl">☁️</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">AWS S3 & Cloudinary</h4>
                      <p className="text-sm text-green-800">تخزين الملفات (خوادم في الشرق الأوسط)</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-4">
                    <span className="text-3xl">🗄️</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900">MongoDB Atlas</h4>
                      <p className="text-sm text-purple-800">قاعدة البيانات (منطقة الشرق الأوسط)</p>
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-4">
                    <span className="text-3xl">📧</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900">SendGrid</h4>
                      <p className="text-sm text-orange-800">إرسال البريد الإلكتروني</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-4">٤.٢ السلطات الحكومية</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  <p className="text-sm text-slate-700 mb-3">
                    قد نكشف عن بياناتك للجهات الحكومية في الحالات التالية:
                  </p>
                  <ul className="text-sm text-slate-700 space-y-2 mr-4">
                    <li>• أوامر المحكمة</li>
                    <li>• طلبات الجهات الأمنية</li>
                    <li>• الامتثال التنظيمي (وزارة التجارة، هيئة الزكاة، SDAIA)</li>
                    <li>• حماية الحقوق والسلامة</li>
                  </ul>
                  <p className="text-sm text-slate-600 mt-3 bg-white rounded p-3">
                    💡 <strong>نراجع جميع الطلبات</strong> للتأكد من قانونيتها ونكشف فقط عن الحد الأدنى من البيانات الضرورية.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Security */}
          <section id="security">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٥. حماية البيانات والأمان</h2>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  التدابير التقنية
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">التشفير:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ <strong>AES-256-GCM</strong> للبيانات الحساسة</li>
                      <li>✓ <strong>TLS 1.3</strong> للاتصالات</li>
                      <li>✓ <strong>bcrypt (12 rounds)</strong> لكلمات المرور</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">المصادقة:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ نظام dual-token</li>
                      <li>✓ HttpOnly cookies</li>
                      <li>✓ MFA للمحامين</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">البنية التحتية:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Firewalls</li>
                      <li>✓ DDoS Protection</li>
                      <li>✓ Intrusion Detection</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">النسخ الاحتياطية:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ نسخ يومية تلقائية</li>
                      <li>✓ تشفير النسخ</li>
                      <li>✓ مواقع جغرافية متعددة</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  التدابير التنظيمية
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">ضوابط الوصول:</h4>
                    <p className="text-xs text-green-800">مبدأ الحد الأدنى من الصلاحيات + تسجيل جميع عمليات الوصول</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">تدريب الموظفين:</h4>
                    <p className="text-xs text-green-800">تدريب إلزامي على PDPL وأمن المعلومات</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">المراجعات الأمنية:</h4>
                    <p className="text-xs text-green-800">اختبار اختراق ربع سنوي ومراجعات دورية</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Data Retention */}
          <section id="retention">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٦. الاحتفاظ بالبيانات</h2>
            
            <div className="space-y-4">
              <p className="text-slate-700">
                نحتفظ ببياناتك الشخصية فقط للمدة <strong>الضرورية</strong> لتحقيق الأغراض المحددة أو حسب ما يتطلبه القانون:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">✓ معلومات الحساب</h4>
                  <p className="text-sm text-green-800">
                    طوال فترة نشاط الحساب + <strong>٩٠ يوماً</strong> بعد الحذف
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">⚖️ البيانات القانونية</h4>
                  <p className="text-sm text-blue-800">
                    <strong>١٠-١٥ سنة</strong> بعد إغلاق القضية (متطلب قانوني)
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">💰 البيانات المالية</h4>
                  <p className="text-sm text-amber-800">
                    <strong>١٠ سنوات</strong> (متطلب هيئة الزكاة والضريبة)
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">📊 سجلات الوصول</h4>
                  <p className="text-sm text-purple-800">
                    <strong>٥ سنوات</strong> (لأغراض الأمان والامتثال)
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                <h4 className="font-semibold text-slate-900 mb-2">🗑️ الحذف الآمن</h4>
                <p className="text-sm text-slate-700">
                  بعد انتهاء مدة الاحتفاظ، يتم الحذف النهائي من جميع الأنظمة والنسخ الاحتياطية. 
                  البيانات المحذوفة <strong>لا يمكن استرجاعها</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Your Rights */}
          <section id="rights">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٧. حقوق أصحاب البيانات (حقوقك)</h2>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 mb-6">
              <p className="text-emerald-900 font-semibold text-center">
                وفقاً لـ <strong>PDPL</strong>، لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:
              </p>
            </div>

            <div className="space-y-3">
              <details className="bg-blue-50 border border-blue-200 rounded-lg p-5 group">
                <summary className="font-semibold text-blue-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>📖</span>
                    الحق في الوصول (Right of Access)
                  </span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    يمكنك الحصول على نسخة من جميع بياناتك الشخصية التي نحتفظ بها.
                  </p>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-2">كيفية الطلب:</p>
                    <p className="text-sm text-blue-800">
                      <strong>الإعدادات &gt; الخصوصية &gt; تنزيل بياناتي</strong>
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      ⏱️ وقت الاستجابة: خلال <strong>٣٠ يوماً</strong> | 💰 التكلفة: <strong>مجاناً</strong>
                    </p>
                  </div>
                </div>
              </details>

              <details className="bg-green-50 border border-green-200 rounded-lg p-5 group">
                <summary className="font-semibold text-green-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>✏️</span>
                    الحق في التصحيح (Right to Rectification)
                  </span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-800 mb-3">
                    يمكنك تصحيح البيانات غير الدقيقة أو استكمال البيانات الناقصة.
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>الملف الشخصي &gt; تعديل</strong> أو أرسل إلى: privacy@traf3li.com
                  </p>
                </div>
              </details>

              <details className="bg-red-50 border border-red-200 rounded-lg p-5 group">
                <summary className="font-semibold text-red-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>🗑️</span>
                    الحق في المحو (Right to Erasure)
                  </span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-800 mb-3">
                    يمكنك طلب حذف بياناتك في حالات محددة.
                  </p>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm font-semibold text-red-900 mb-2">كيفية الطلب:</p>
                    <p className="text-sm text-red-800 mb-2">
                      <strong>الإعدادات &gt; الخصوصية &gt; حذف حسابي</strong>
                    </p>
                    <p className="text-xs text-red-700">
                      ⏱️ وقت الاستجابة: <strong>٣٠ يوماً</strong> + ٩٠ يوماً للحذف الكامل
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 mt-3">
                    <p className="text-xs text-amber-800">
                      ⚠️ <strong>استثناءات:</strong> لا يمكن حذف البيانات المطلوبة قانونياً (سجلات ضريبية، قضايا قانونية جارية)
                    </p>
                  </div>
                </div>
              </details>

              <details className="bg-purple-50 border border-purple-200 rounded-lg p-5 group">
                <summary className="font-semibold text-purple-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>📦</span>
                    الحق في نقل البيانات (Right to Data Portability)
                  </span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-sm text-purple-800 mb-3">
                    يمكنك الحصول على نسخة من بياناتك بصيغة منظمة وقابلة للقراءة آلياً (JSON, CSV).
                  </p>
                  <p className="text-sm text-purple-800">
                    <strong>الإعدادات &gt; الخصوصية &gt; تصدير بياناتي</strong>
                  </p>
                </div>
              </details>

              <details className="bg-orange-50 border border-orange-200 rounded-lg p-5 group">
                <summary className="font-semibold text-orange-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>🚫</span>
                    الحق في الاعتراض (Right to Object)
                  </span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 pt-4 border-t border-orange-200">
                  <p className="text-sm text-orange-800 mb-3">
                    يمكنك الاعتراض على معالجة بياناتك للتسويق المباشر (سنوقف فوراً) أو لمصالح مشروعة.
                  </p>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-orange-800">
                      <strong>للتسويق:</strong> انقر "إلغاء الاشتراك" في البريد الإلكتروني
                    </p>
                    <p className="text-sm text-orange-800 mt-1">
                      <strong>لحالات أخرى:</strong> أرسل إلى privacy@traf3li.com
                    </p>
                  </div>
                </div>
              </details>

              <details className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 group">
                <summary className="font-semibold text-indigo-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>↩️</span>
                    الحق في سحب الموافقة (Right to Withdraw Consent)
                  </span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <p className="text-sm text-indigo-800">
                    يمكنك سحب موافقتك في أي وقت. سنوقف المعالجة فوراً بعد السحب.
                  </p>
                  <p className="text-sm text-indigo-800 mt-2">
                    <strong>الإعدادات &gt; الخصوصية &gt; إدارة الموافقات</strong>
                  </p>
                </div>
              </details>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-5 mt-6">
              <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <span>📞</span>
                كيفية ممارسة حقوقك
              </h4>
              <div className="text-sm text-emerald-800 space-y-2">
                <p><strong>البريد الإلكتروني:</strong> privacy@traf3li.com</p>
                <p><strong>مسؤول حماية البيانات:</strong> dpo@traf3li.com</p>
                <p><strong>وقت الاستجابة:</strong> خلال <strong>٣٠ يوماً</strong> (قد يمتد لـ ٣٠ يوماً إضافية للطلبات المعقدة)</p>
              </div>
            </div>
          </section>

          {/* Section 8: Data Breaches */}
          <section id="breaches">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٨. انتهاكات البيانات</h2>
            
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
              <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 text-xl">
                <span className="text-2xl">🚨</span>
                التزامنا بالإشعار الفوري
              </h3>
              <p className="text-red-900 mb-4">
                في حالة حدوث انتهاك لبياناتك، نلتزم بما يلي وفقاً لـ <strong>PDPL</strong>:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">إشعار SDAIA:</h4>
                  <p className="text-sm text-red-800">
                    خلال <strong className="text-lg">٧٢ ساعة</strong> من اكتشاف الانتهاك
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">إشعارك:</h4>
                  <p className="text-sm text-red-800">
                    خلال <strong className="text-lg">٧٢ ساعة</strong> إذا كان هناك خطر كبير
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-red-900 mb-2">سنوفر لك:</p>
                <ul className="text-sm text-red-800 space-y-1 mr-4">
                  <li>• طبيعة الانتهاك وما حدث بالضبط</li>
                  <li>• البيانات المتأثرة</li>
                  <li>• التدابير المتخذة للاحتواء</li>
                  <li>• توصيات لحماية نفسك</li>
                  <li>• معلومات الاتصال للاستفسارات</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 9: Cookies */}
          <section id="cookies">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٩. ملفات تعريف الارتباط (Cookies)</h2>
            
            <div className="space-y-4">
              <p className="text-slate-700">
                Cookies هي ملفات نصية صغيرة تُخزن على جهازك لتحسين تجربتك.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span>✓</span>
                    Cookies ضرورية
                  </h4>
                  <p className="text-sm text-green-800 mb-2">
                    <strong>الموافقة:</strong> غير مطلوبة (ضرورية للخدمة)
                  </p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Session ID</li>
                    <li>• JWT Tokens (HttpOnly)</li>
                    <li>• CSRF protection</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>⚙️</span>
                    Cookies وظيفية
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>الموافقة:</strong> مُفترضة (يمكن رفضها)
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• تفضيل اللغة</li>
                    <li>• وضع الثيم</li>
                    <li>• إعدادات العرض</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <span>📊</span>
                    Cookies الأداء
                  </h4>
                  <p className="text-sm text-purple-800 mb-2">
                    <strong>الموافقة:</strong> مطلوبة
                  </p>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Google Analytics</li>
                    <li>• سرعة التحميل</li>
                    <li>• تحليل الاستخدام</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <span>📢</span>
                    Cookies التسويق
                  </h4>
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>الموافقة:</strong> مطلوبة بشدة
                  </p>
                  <p className="text-sm text-amber-800">
                    (لا نستخدمها حالياً)
                  </p>
                </div>
              </div>

              <div className="bg-slate-100 border border-slate-300 rounded-lg p-5">
                <h4 className="font-semibold text-slate-900 mb-3">🎛️ إدارة Cookies</h4>
                <p className="text-sm text-slate-700">
                  يمكنك التحكم في Cookies عبر: <strong>الإعدادات &gt; الخصوصية &gt; إعدادات Cookies</strong>
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  ⚠️ تعطيل Cookies الضرورية قد يؤثر على وظائف الموقع.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10: Contact */}
          <section id="contact">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١٠. الاتصال بنا</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  مسؤول حماية البيانات
                </h3>
                <div className="space-y-2 text-sm text-purple-800">
                  <p><strong>البريد الإلكتروني:</strong> dpo@traf3li.com</p>
                  <p><strong>الاستفسارات العامة:</strong> privacy@traf3li.com</p>
                  <p><strong>وقت الاستجابة:</strong> خلال ٣٠ يوماً</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  السلطة المشرفة
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>الجهة:</strong> هيئة البيانات والذكاء الاصطناعي (SDAIA)</p>
                  <p><strong>الموقع:</strong> https://sdaia.gov.sa</p>
                  <p><strong>الهاتف:</strong> ١٩٩٩٩</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-6">
              <h4 className="font-semibold text-amber-900 mb-3">📢 للشكاوى المتعلقة بحماية البيانات</h4>
              <p className="text-sm text-amber-800">
                إذا كنت غير راضي عن طريقة تعاملنا مع بياناتك:
              </p>
              <ol className="text-sm text-amber-800 space-y-1 mr-4 mt-2">
                <li>1. اتصل بنا أولاً: privacy@traf3li.com</li>
                <li>2. إذا لم تكن راضياً، قدم شكوى إلى SDAIA</li>
              </ol>
            </div>
          </section>

          {/* Final Section */}
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">شكراً لثقتك في ترافعلي!</h2>
            <p className="text-emerald-800 mb-6 max-w-2xl mx-auto">
              نحن ملتزمون بحماية بياناتك الشخصية والامتثال الكامل لقانون حماية البيانات الشخصية السعودي (PDPL) 
              وجميع القوانين ذات الصلة.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="/terms"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-all border-2 border-emerald-200"
              >
                <span>📋</span>
                اطلع على الشروط والأحكام
              </a>
              <a
                href="mailto:privacy@traf3li.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
              >
                <span>📧</span>
                تواصل معنا
              </a>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <Link
            to="/sign-up"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            العودة للتسجيل
          </Link>
          <p className="text-slate-500 text-sm">
            آخر تحديث: ٢٥ نوفمبر ٢٠٢٥ | الإصدار 1.0
          </p>
          <p className="text-slate-400 text-xs">
            متوافق مع: قانون حماية البيانات الشخصية السعودي (PDPL) - المرسوم الملكي رقم م/١٩
          </p>
          <p className="text-slate-400 text-xs">
            © ٢٠٢٥ ترافعلي (TRAF3LI) - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  )
}
