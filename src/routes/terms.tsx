import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
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
          <h1 className="text-4xl font-bold text-[#0f172a] mb-2">الشروط والأحكام</h1>
          <p className="text-slate-500">آخر تحديث: ٢٥ نوفمبر ٢٠٢٥</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 lg:p-12 space-y-12">

          {/* Section 1: Introduction */}
          <section id="introduction">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١. مقدمة وتعريفات</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">١.١ عن المنصة</h3>
                <p className="text-slate-700 leading-relaxed">
                  مرحباً بك في <strong className="text-emerald-600">ترافعلي (TRAF3LI)</strong>، المنصة الإلكترونية الرائدة لربط العملاء بالمحامين المرخصين في المملكة العربية السعودية. 
                  نحن منصة متكاملة لإدارة الخدمات القانونية وسوق للخدمات القانونية.
                </p>
                <div className="mt-4 bg-emerald-50 border-r-4 border-emerald-500 rounded-lg p-4">
                  <p className="text-sm font-semibold text-emerald-900 mb-2">معلومات المنصة:</p>
                  <ul className="text-sm text-emerald-800 space-y-1">
                    <li><strong>اسم المنصة:</strong> ترافعلي (TRAF3LI)</li>
                    <li><strong>البريد الإلكتروني:</strong> legal@traf3li.com</li>
                    <li><strong>الموقع الإلكتروني:</strong> https://traf3li.com</li>
                    <li><strong>الجهة المشرفة:</strong> وزارة التجارة ووزارة العدل</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">١.٢ التعريفات</h3>
                <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                  <div className="grid gap-3">
                    <div className="flex gap-3">
                      <span className="text-emerald-600 font-bold min-w-fit">•</span>
                      <div>
                        <strong className="text-slate-900">المنصة:</strong>
                        <span className="text-slate-700"> منصة ترافعلي الإلكترونية وجميع خدماتها وتطبيقاتها</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-600 font-bold min-w-fit">•</span>
                      <div>
                        <strong className="text-slate-900">المستخدم:</strong>
                        <span className="text-slate-700"> أي شخص يستخدم المنصة (عميل، محامي، أو زائر)</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-600 font-bold min-w-fit">•</span>
                      <div>
                        <strong className="text-slate-900">العميل:</strong>
                        <span className="text-slate-700"> الشخص الذي يطلب خدمات قانونية عبر المنصة</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-600 font-bold min-w-fit">•</span>
                      <div>
                        <strong className="text-slate-900">المحامي:</strong>
                        <span className="text-slate-700"> المحامي المرخص من وزارة العدل السعودية المسجل في المنصة</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-600 font-bold min-w-fit">•</span>
                      <div>
                        <strong className="text-slate-900">البيانات الشخصية:</strong>
                        <span className="text-slate-700"> أي معلومات تتعلق بشخص طبيعي محدد أو قابل للتحديد</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-600 font-bold min-w-fit">•</span>
                      <div>
                        <strong className="text-slate-900">البيانات الحساسة:</strong>
                        <span className="text-slate-700"> البيانات المتعلقة بالهوية الوطنية، المعلومات المالية، والقضايا القانونية</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Acceptance */}
          <section id="acceptance">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٢. قبول الشروط والأحكام</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٢.١ الموافقة على الشروط</h3>
                <p className="text-slate-700 leading-relaxed">
                  باستخدامك للمنصة أو إنشاء حساب عليها، فإنك توافق على الالتزام بهذه الشروط والأحكام بالكامل. 
                  إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام المنصة.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٢.٢ الأهلية القانونية</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-900 font-medium">
                    ⚠️ يجب أن يكون عمرك <strong>١٨ عاماً على الأقل</strong> لاستخدام المنصة. 
                    باستخدامك للمنصة، تقر بأن لديك الأهلية القانونية الكاملة لإبرام العقود بموجب القوانين السعودية.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٢.٣ التحديثات على الشروط</h3>
                <p className="text-slate-700 leading-relaxed">
                  نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني 
                  أو إشعار على المنصة. استمرارك في استخدام المنصة بعد التعديلات يعني موافقتك على الشروط المحدثة.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Services */}
          <section id="services">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٣. الخدمات المقدمة</h2>
            
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                توفر منصة ترافعلي الخدمات التالية:
              </p>

              <div className="grid gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-5">
                  <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">🏪</span>
                    سوق الخدمات القانونية (Marketplace)
                  </h4>
                  <ul className="text-sm text-emerald-800 space-y-1 mr-6">
                    <li>• عرض الخدمات القانونية المتاحة من المحامين المسجلين</li>
                    <li>• تصنيف الخدمات حسب المجال القانوني</li>
                    <li>• تصفح ملفات المحامين وتقييماتهم</li>
                    <li>• نظام تقييم ومراجعات للخدمات</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">💼</span>
                    نظام المشاريع والعروض (Bidding System)
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 mr-6">
                    <li>• نشر المشاريع القانونية من قبل العملاء</li>
                    <li>• تلقي عروض من المحامين المؤهلين</li>
                    <li>• مقارنة العروض واختيار الأنسب</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5">
                  <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    إدارة القضايا (Case Management)
                  </h4>
                  <ul className="text-sm text-purple-800 space-y-1 mr-6">
                    <li>• متابعة القضايا القانونية الجارية</li>
                    <li>• مشاركة المستندات والملفات بشكل آمن</li>
                    <li>• تتبع الجلسات والمواعيد القضائية</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-5">
                  <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">❓</span>
                    منصة الأسئلة والأجوبة (Q&A Community)
                  </h4>
                  <ul className="text-sm text-orange-800 space-y-1 mr-6">
                    <li>• طرح الأسئلة القانونية العامة</li>
                    <li>• الحصول على إجابات من المحامين المسجلين</li>
                    <li>• بناء مجتمع قانوني تفاعلي</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-lg p-5">
                  <h4 className="font-bold text-cyan-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    نظام المراسلات (Messaging System)
                  </h4>
                  <ul className="text-sm text-cyan-800 space-y-1 mr-6">
                    <li>• التواصل المباشر بين العملاء والمحامين</li>
                    <li>• مراسلات فورية آمنة ومشفرة</li>
                    <li>• مشاركة الملفات والمستندات</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4 mt-6">
                <h4 className="font-bold text-red-900 mb-2">⚠️ دور المنصة</h4>
                <p className="text-sm text-red-800">
                  ترافعلي هي منصة وسيطة تربط بين العملاء والمحامين. المنصة <strong>لا تقدم</strong> استشارات قانونية مباشرة 
                  ولا تمثل العملاء أمام المحاكم. المسؤولية القانونية عن الخدمات المقدمة تقع على عاتق المحامي مقدم الخدمة.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Registration */}
          <section id="registration">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٤. التسجيل والحسابات</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٤.١ إنشاء الحساب</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  لاستخدام معظم خدمات المنصة، يجب عليك إنشاء حساب بتقديم:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">جميع المستخدمين:</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>✓ الاسم الكامل</li>
                      <li>✓ البريد الإلكتروني</li>
                      <li>✓ رقم الجوال</li>
                      <li>✓ كلمة مرور قوية</li>
                      <li>✓ نوع الحساب (عميل أو محامي)</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-900 mb-2">للمحامين فقط:</h4>
                    <ul className="text-sm text-emerald-800 space-y-1">
                      <li>✓ رقم الترخيص من وزارة العدل</li>
                      <li>✓ شهادة الترخيص</li>
                      <li>✓ الهوية الوطنية أو الإقامة</li>
                      <li>✓ التخصص القانوني</li>
                      <li>✓ سنوات الخبرة</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٤.٢ صحة المعلومات</h3>
                <p className="text-slate-700 leading-relaxed">
                  تتعهد بأن جميع المعلومات المقدمة صحيحة ودقيقة ومحدثة. يجب عليك تحديث معلومات حسابك فوراً في حالة حدوث أي تغيير.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٤.٣ سرية الحساب</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-900">
                    🔐 أنت مسؤول عن الحفاظ على سرية بيانات دخولك (اسم المستخدم وكلمة المرور). 
                    يجب عليك إخطارنا فوراً في حالة الاشتباه في أي استخدام غير مصرح به لحسابك.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Obligations */}
          <section id="obligations">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٥. الالتزامات والمسؤوليات</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٥.١ التزامات جميع المستخدمين</h3>
                <div className="bg-slate-50 rounded-lg p-6">
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex gap-3">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>استخدام المنصة للأغراض القانونية فقط</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>الامتثال لجميع القوانين واللوائح السعودية</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>التعامل بأدب واحترام مع جميع المستخدمين</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>تقديم معلومات صحيحة ودقيقة</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>حماية الملكية الفكرية</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٥.٢ التزامات المحامين</h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-emerald-900 mb-2">أ) الترخيص والمؤهلات</h4>
                      <p className="text-sm text-emerald-800">
                        الحفاظ على رخصة مزاولة المهنة سارية المفعول والامتثال لقواعد السلوك المهني للمحامين في المملكة.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 mb-2">ب) السرية المهنية</h4>
                      <p className="text-sm text-emerald-800">
                        الحفاظ على سرية معلومات العميل (Attorney-Client Privilege) وعدم الإفصاح عن معلومات القضية لأي طرف ثالث.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 mb-2">ج) تضارب المصالح</h4>
                      <p className="text-sm text-emerald-800">
                        الإفصاح الفوري عن أي تضارب محتمل في المصالح وعدم قبول قضايا تتعارض مع قضايا عملاء حاليين.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Pricing */}
          <section id="pricing">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٦. الأسعار والدفع</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٦.١ هيكل الأسعار</h3>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">💰</span>
                    <div>
                      <h4 className="font-bold text-emerald-900 text-lg">عمولة المنصة</h4>
                      <p className="text-emerald-700 text-sm">تُخصم تلقائياً من المبلغ المحول للمحامي</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-emerald-200">
                    <p className="text-center">
                      <span className="text-5xl font-bold text-emerald-600">١٠٪</span>
                      <span className="block text-slate-600 mt-2">من قيمة كل خدمة</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٦.٢ طرق الدفع المتاحة</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-semibold text-slate-900">بطاقات مدى</p>
                      <p className="text-xs text-slate-600">Mada</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-semibold text-slate-900">البطاقات الائتمانية</p>
                      <p className="text-xs text-slate-600">Visa, Mastercard</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="font-semibold text-slate-900">محافظ إلكترونية</p>
                      <p className="text-xs text-slate-600">STC Pay, Apple Pay</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="font-semibold text-slate-900">Stripe</p>
                      <p className="text-xs text-slate-600">للمدفوعات الدولية</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٦.٣ سياسة الاسترداد</h3>
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ الإلغاء قبل البدء بالعمل</h4>
                    <p className="text-sm text-green-800">
                      يمكن إلغاء الطلب بالكامل واسترداد المبلغ كاملاً قبل بدء المحامي بالعمل. 
                      يتم الاسترداد خلال ٥-٧ أيام عمل.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">⚠️ الإلغاء بعد البدء بالعمل</h4>
                    <p className="text-sm text-amber-800">
                      إذا بدأ المحامي بالعمل، يحق له الحصول على مقابل العمل المنجز. 
                      يتم التفاوض بين العميل والمحامي على قيمة العمل المنجز.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">ℹ️ عدم رضا العميل</h4>
                    <p className="text-sm text-blue-800">
                      إذا لم يكن العميل راضياً عن الخدمة، يجب تقديم شكوى خلال <strong>٧ أيام</strong> من استلام العمل. 
                      تقوم المنصة بمراجعة الشكوى بحيادية.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٦.٤ ضريبة القيمة المضافة</h3>
                <div className="bg-slate-100 rounded-lg p-4">
                  <p className="text-slate-800">
                    تُطبق ضريبة القيمة المضافة بنسبة <strong className="text-emerald-600">١٥٪</strong> على جميع الخدمات 
                    حسب لوائح هيئة الزكاة والضريبة والجمارك.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: IP */}
          <section id="intellectual-property">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٧. حقوق الملكية الفكرية</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٧.١ ملكية المنصة</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  جميع حقوق الملكية الفكرية المتعلقة بالمنصة (التصميم، الشعار، العلامة التجارية، الأكواد البرمجية، المحتوى) 
                  مملوكة حصرياً لـ <strong className="text-emerald-600">ترافعلي</strong>.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">محظور:</h4>
                  <ul className="text-sm text-red-800 space-y-1 mr-4">
                    <li>✗ نسخ أو تقليد تصميم المنصة</li>
                    <li>✗ استخدام شعار أو علامة ترافعلي دون إذن كتابي</li>
                    <li>✗ استخراج البيانات بطرق آلية (Scraping)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٧.٢ محتوى المستخدمين</h3>
                <p className="text-slate-700 leading-relaxed">
                  عند رفع محتوى (نصوص، صور، مستندات) على المنصة، تظل ملكية المحتوى لك. 
                  ومع ذلك، فإنك تمنح المنصة ترخيصاً محدوداً لاستخدام المحتوى لأغراض تشغيل وتحسين الخدمات.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: Confidentiality */}
          <section id="confidentiality">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٨. السرية وحماية المعلومات</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٨.١ السرية المهنية (Attorney-Client Privilege)</h3>
                <div className="bg-purple-50 border-r-4 border-purple-500 rounded-lg p-5">
                  <p className="text-purple-900 font-medium mb-3">
                    🔒 جميع المحامين المسجلين ملزمون بالحفاظ على <strong>السرية التامة</strong> لمعلومات العملاء 
                    وفقاً لقواعد السلوك المهني للمحامين في المملكة العربية السعودية.
                  </p>
                  <div className="bg-white rounded-lg p-4 mt-3">
                    <p className="text-sm font-semibold text-purple-900 mb-2">لا يجوز للمحامي:</p>
                    <ul className="text-sm text-purple-800 space-y-1 mr-4">
                      <li>✗ الإفصاح عن معلومات العميل لأي طرف ثالث</li>
                      <li>✗ استخدام معلومات العميل لأغراض شخصية</li>
                      <li>✗ مناقشة تفاصيل القضية علناً</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٨.٢ حماية البيانات على المنصة</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <span>🔐</span>
                      التشفير
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• AES-256-GCM للبيانات الحساسة</li>
                      <li>• TLS 1.3 للاتصالات</li>
                      <li>• bcrypt لكلمات المرور</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <span>🗄️</span>
                      تخزين آمن
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• خوادم في منطقة الشرق الأوسط</li>
                      <li>• نسخ احتياطية يومية</li>
                      <li>• ضوابط وصول صارمة</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 9: Prohibited Content */}
          <section id="prohibited">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٩. المحتوى المحظور والسلوك غير المقبول</h2>
            
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-red-900 mb-4">⛔ يُحظر نشر أو تحميل:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">محتوى غير قانوني:</h4>
                  <ul className="text-sm text-red-700 space-y-1 mr-4">
                    <li>• ترويج للجرائم أو الإرهاب</li>
                    <li>• غسيل الأموال أو الاحتيال</li>
                    <li>• انتهاك للقوانين السعودية</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">محتوى مسيء:</h4>
                  <ul className="text-sm text-red-700 space-y-1 mr-4">
                    <li>• خطاب كراهية أو تمييز</li>
                    <li>• تشهير أو قذف</li>
                    <li>• تهديدات أو تحرش</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">محتوى مضلل:</h4>
                  <ul className="text-sm text-red-700 space-y-1 mr-4">
                    <li>• معلومات قانونية كاذبة</li>
                    <li>• انتحال شخصية</li>
                    <li>• بيانات مزيفة</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">انتهاكات الملكية:</h4>
                  <ul className="text-sm text-red-700 space-y-1 mr-4">
                    <li>• محتوى محمي بحقوق النشر</li>
                    <li>• علامات تجارية مزيفة</li>
                    <li>• برامج مقرصنة</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-[#0f172a] mb-3">٩.٢ الإجراءات التأديبية</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">١. إنذار كتابي</span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">٢. تقييد الحساب</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">٣. تعليق الحساب</span>
                <span className="bg-red-200 text-red-900 px-3 py-1 rounded-full text-sm font-medium">٤. إنهاء الحساب</span>
                <span className="bg-red-300 text-red-900 px-3 py-1 rounded-full text-sm font-medium">٥. إجراءات قانونية</span>
              </div>
            </div>
          </section>

          {/* Section 10: Disclaimer */}
          <section id="disclaimer">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١٠. إخلاء المسؤولية والقيود</h2>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  دور المنصة الوسيط
                </h3>
                <div className="space-y-3 text-amber-900">
                  <p className="font-medium">ترافعلي هي منصة وسيطة <strong>تربط</strong> بين العملاء والمحامين. نحن:</p>
                  <ul className="space-y-2 mr-4">
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span><strong>لا نقدم</strong> استشارات قانونية</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span><strong>لا نمثل</strong> العملاء أمام المحاكم</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span><strong>لا نتحكم</strong> في جودة الخدمات</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span><strong>لا نضمن</strong> نتائج محددة للقضايا</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">١٠.٢ حدود التعويض</h3>
                <div className="bg-slate-100 rounded-lg p-4">
                  <p className="text-slate-800">
                    في حالة ثبوت مسؤوليتنا، يُحدد التعويض بأقل من:
                  </p>
                  <div className="flex gap-4 mt-3 flex-wrap">
                    <div className="bg-white rounded-lg p-3 border-2 border-slate-300">
                      <p className="text-xs text-slate-600">مبلغ الخدمة المتنازع عليها</p>
                    </div>
                    <span className="text-2xl text-slate-400">أو</span>
                    <div className="bg-emerald-50 rounded-lg p-3 border-2 border-emerald-300">
                      <p className="text-lg font-bold text-emerald-600">١٠٠٠ ريال سعودي</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 11: Disputes */}
          <section id="disputes">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١١. النزاعات وحل الخلافات</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-4">نظام حل النزاعات (٣ مراحل)</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border-r-4 border-green-500 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">١</span>
                      <div>
                        <h4 className="font-bold text-green-900 mb-2">التواصل المباشر (١-٣ أيام)</h4>
                        <p className="text-sm text-green-800">
                          يجب على الطرفين محاولة حل النزاع بالتواصل المباشر عبر نظام المراسلات في المنصة.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-r-4 border-blue-500 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">٢</span>
                      <div>
                        <h4 className="font-bold text-blue-900 mb-2">التصعيد لفريق الدعم (٣-٧ أيام)</h4>
                        <p className="text-sm text-blue-800">
                          تقديم شكوى رسمية عبر قسم الدعم. مراجعة القضية من قبل موظف دعم محايد ومحاولة الوساطة.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-r-4 border-purple-500 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">٣</span>
                      <div>
                        <h4 className="font-bold text-purple-900 mb-2">لجنة التحكيم الداخلية (٧-١٤ يوماً)</h4>
                        <p className="text-sm text-purple-800">
                          إحالة القضية إلى لجنة تحكيم محايدة ومراجعة جميع الأدلة وإصدار قرار ملزم للطرفين.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">١١.٢ القانون الواجب التطبيق</h3>
                <div className="bg-slate-50 rounded-lg p-5">
                  <p className="text-slate-700 leading-relaxed">
                    تخضع هذه الشروط والأحكام للقوانين واللوائح المعمول بها في <strong className="text-emerald-600">المملكة العربية السعودية</strong>، 
                    بما في ذلك نظام التجارة الإلكترونية، نظام حماية البيانات الشخصية (PDPL)، ونظام مزاولة مهنة المحاماة.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 12: Termination */}
          <section id="termination">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١٢. الإنهاء والتعليق</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">١٢.١ إنهاء الحساب من قبل المستخدم</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  يمكنك إنهاء حسابك في أي وقت عبر: <strong>الإعدادات &gt; الخصوصية &gt; إغلاق الحساب</strong>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">عند الإنهاء:</p>
                  <ul className="text-sm text-blue-800 space-y-1 mr-4">
                    <li>• يتم إيقاف الوصول فوراً</li>
                    <li>• تُحذف البيانات الشخصية خلال <strong>٩٠ يوماً</strong></li>
                    <li>• تبقى الالتزامات المالية سارية</li>
                    <li>• لا يمكن استرداد الحساب بعد <strong>٣٠ يوماً</strong></li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-3">١٢.٢ تعليق أو إنهاء الحساب من قبل المنصة</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                  <p className="text-red-900 font-medium mb-3">
                    نحتفظ بالحق في تعليق أو إنهاء حسابك <strong>فوراً ودون إشعار مسبق</strong> في الحالات التالية:
                  </p>
                  <ul className="text-sm text-red-800 space-y-2 mr-4">
                    <li>• انتهاك القوانين السعودية</li>
                    <li>• الاحتيال أو التزوير</li>
                    <li>• انتحال الشخصية</li>
                    <li>• نشاط إجرامي</li>
                    <li>• انتهاكات متكررة لشروط الاستخدام</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 13: PDPL Compliance */}
          <section id="pdpl">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١٣. الامتثال للأنظمة السعودية</h2>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  الامتثال لنظام حماية البيانات الشخصية (PDPL)
                </h3>
                <p className="text-purple-900 mb-4">
                  نلتزم بالكامل بـ <strong>قانون حماية البيانات الشخصية السعودي</strong> 
                  (الصادر بالمرسوم الملكي رقم م/١٩ بتاريخ ٩/٢/١٤٤٣هـ).
                </p>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm font-semibold text-purple-900 mb-2">هذا يشمل:</p>
                  <ul className="text-sm text-purple-800 space-y-1 mr-4">
                    <li>✓ الحصول على موافقة صريحة لمعالجة البيانات</li>
                    <li>✓ احترام حقوق أصحاب البيانات (الوصول، التصحيح، المحو)</li>
                    <li>✓ تعيين مسؤول حماية بيانات (DPO)</li>
                    <li>✓ الإبلاغ عن انتهاكات البيانات خلال <strong>٧٢ ساعة</strong></li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>🏛️</span>
                    نظام التجارة الإلكترونية
                  </h4>
                  <p className="text-sm text-blue-800">
                    نلتزم بنظام التجارة الإلكترونية السعودي (المرسوم الملكي رقم م/١٢٦).
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span>⚖️</span>
                    نظام مزاولة مهنة المحاماة
                  </h4>
                  <p className="text-sm text-green-800">
                    جميع المحامين ملزمون بنظام المحاماة السعودي وقواعد وزارة العدل.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 14: Contact */}
          <section id="contact">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١٤. معلومات الاتصال والدعم</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-5">
                  <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">📧</span>
                    خدمة العملاء
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-emerald-800"><strong>البريد الإلكتروني:</strong> support@traf3li.com</p>
                    <p className="text-emerald-800"><strong>ساعات العمل:</strong> ٢٤/٧</p>
                    <p className="text-emerald-800"><strong>وقت الاستجابة:</strong> خلال ٢٤ ساعة</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">⚖️</span>
                    الاستفسارات القانونية
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-blue-800"><strong>البريد الإلكتروني:</strong> legal@traf3li.com</p>
                    <p className="text-blue-800"><strong>وقت الاستجابة:</strong> خلال ٥ أيام عمل</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🔒</span>
                    استفسارات الخصوصية
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-purple-800"><strong>البريد الإلكتروني:</strong> privacy@traf3li.com</p>
                    <p className="text-purple-800"><strong>مسؤول حماية البيانات:</strong> dpo@traf3li.com</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-5">
                  <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🚨</span>
                    الإبلاغ عن الانتهاكات
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-red-800"><strong>البريد الإلكتروني:</strong> abuse@traf3li.com</p>
                    <p className="text-red-800"><strong>وقت الاستجابة:</strong> خلال ٤٨ ساعة</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 15: FAQ */}
          <section id="faq">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١٥. أسئلة شائعة</h2>
            
            <div className="space-y-4">
              <details className="bg-slate-50 rounded-lg p-5 group">
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                  <span>❓ كيف أتأكد من أن المحامي مرخص؟</span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-slate-700 mt-3 mr-6">
                  جميع المحامين المسجلين يُعرضون رقم ترخيصهم من وزارة العدل. 
                  يمكنك التحقق عبر موقع وزارة العدل.
                </p>
              </details>

              <details className="bg-slate-50 rounded-lg p-5 group">
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                  <span>❓ ماذا لو لم أكن راضياً عن الخدمة؟</span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-slate-700 mt-3 mr-6">
                  يمكنك تقديم شكوى خلال ٧ أيام. سنراجع الحالة وقد نطلب تعديلات أو نسترد المبلغ حسب الحالة.
                </p>
              </details>

              <details className="bg-slate-50 rounded-lg p-5 group">
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                  <span>❓ هل معلوماتي آمنة؟</span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-slate-700 mt-3 mr-6">
                  نعم، نستخدم أعلى معايير التشفير (AES-256-GCM) والأمان. 
                  راجع <Link to="/privacy" className="text-emerald-600 hover:underline">سياسة الخصوصية</Link> للمزيد من التفاصيل.
                </p>
              </details>

              <details className="bg-slate-50 rounded-lg p-5 group">
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                  <span>❓ كم تستغرق عملية حل النزاعات؟</span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-slate-700 mt-3 mr-6">
                  عادة ١-١٤ يوماً حسب تعقيد الحالة ومدى تعاون الطرفين.
                </p>
              </details>

              <details className="bg-slate-50 rounded-lg p-5 group">
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                  <span>❓ كيف يتم تحويل الأموال للمحامي؟</span>
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-slate-700 mt-3 mr-6">
                  بعد تأكيد العميل على اكتمال العمل أو بعد ١٤ يوماً تلقائياً، 
                  تُحول الأموال للمحامي بعد خصم عمولة المنصة (١٠٪).
                </p>
              </details>
            </div>
          </section>

          {/* Final Section */}
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">شكراً لاستخدامك منصة ترافعلي!</h2>
            <p className="text-emerald-800 mb-6 max-w-2xl mx-auto">
              نحن ملتزمون بتوفير تجربة آمنة، شفافة، ومهنية لربط العملاء بأفضل المحامين في المملكة العربية السعودية.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-all border-2 border-emerald-200"
              >
                <span>🔒</span>
                اطلع على سياسة الخصوصية
              </Link>
              <a
                href="mailto:legal@traf3li.com"
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
            © ٢٠٢٥ ترافعلي (TRAF3LI) - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  )
}
