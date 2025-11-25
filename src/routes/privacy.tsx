import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/sign-up" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6">
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة للتسجيل
          </Link>
          <h1 className="text-3xl font-bold text-[#0f172a] mb-2">سياسة الخصوصية</h1>
          <p className="text-slate-500">آخر تحديث: يناير 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">1. مقدمة</h2>
            <p className="text-slate-600 leading-relaxed">
              نحن في ترافلي نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام
              وحماية معلوماتك عند استخدام منصتنا. نحن ملتزمون بالامتثال لنظام حماية البيانات الشخصية (PDPL)
              في المملكة العربية السعودية.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">2. البيانات التي نجمعها</h2>
            <div className="text-slate-600 space-y-4">
              <div>
                <h3 className="font-semibold text-[#0f172a] mb-2">2.1 البيانات الشخصية</h3>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>الاسم الكامل</li>
                  <li>البريد الإلكتروني</li>
                  <li>رقم الهاتف</li>
                  <li>رقم الهوية الوطنية (للمحامين)</li>
                  <li>العنوان والموقع الجغرافي</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#0f172a] mb-2">2.2 البيانات المهنية (للمحامين)</h3>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>رقم رخصة المحاماة</li>
                  <li>سنوات الخبرة والتخصصات</li>
                  <li>المحاكم التي لديك خبرة بها</li>
                  <li>البيانات البنكية للتحويلات</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#0f172a] mb-2">2.3 بيانات الاستخدام</h3>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>سجلات الدخول وعناوين IP</li>
                  <li>نوع المتصفح والجهاز المستخدم</li>
                  <li>الصفحات التي تمت زيارتها</li>
                  <li>مدة الجلسات</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">3. كيفية استخدام البيانات</h2>
            <div className="text-slate-600 space-y-3">
              <p>نستخدم بياناتك للأغراض التالية:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تقديم خدمات المنصة وتحسينها</li>
                <li>التحقق من هويتك وتأمين حسابك</li>
                <li>التواصل معك بشأن حسابك وخدماتنا</li>
                <li>معالجة المدفوعات والتحويلات المالية</li>
                <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
                <li>منع الاحتيال والأنشطة غير المشروعة</li>
                <li>تحليل وتحسين تجربة المستخدم</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">4. مشاركة البيانات</h2>
            <div className="text-slate-600 space-y-3">
              <p>قد نشارك بياناتك في الحالات التالية:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>مع المحامين/العملاء:</strong> لتسهيل التواصل وتقديم الخدمات القانونية.</li>
                <li><strong>مع مزودي الخدمات:</strong> مثل بوابات الدفع وخدمات الاستضافة.</li>
                <li><strong>للمتطلبات القانونية:</strong> عند الطلب من الجهات الحكومية المختصة.</li>
                <li><strong>لحماية حقوقنا:</strong> في حالات الاحتيال أو انتهاك الشروط.</li>
              </ul>
              <p className="mt-4">
                لن نبيع بياناتك الشخصية لأي طرف ثالث لأغراض تسويقية.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">5. حماية البيانات</h2>
            <div className="text-slate-600 space-y-3">
              <p>نتخذ إجراءات أمنية صارمة لحماية بياناتك، تشمل:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تشفير البيانات أثناء النقل والتخزين (SSL/TLS)</li>
                <li>جدران حماية متقدمة وأنظمة كشف التسلل</li>
                <li>تحديد صلاحيات الوصول للموظفين</li>
                <li>مراجعات أمنية دورية</li>
                <li>نسخ احتياطية منتظمة للبيانات</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">6. حقوقك</h2>
            <div className="text-slate-600 space-y-3">
              <p>وفقاً لنظام حماية البيانات الشخصية، لديك الحقوق التالية:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>الوصول:</strong> طلب نسخة من بياناتك الشخصية.</li>
                <li><strong>التصحيح:</strong> تصحيح أي بيانات غير دقيقة.</li>
                <li><strong>الحذف:</strong> طلب حذف بياناتك (مع مراعاة المتطلبات القانونية).</li>
                <li><strong>تقييد المعالجة:</strong> طلب تقييد كيفية استخدام بياناتك.</li>
                <li><strong>نقل البيانات:</strong> الحصول على بياناتك بصيغة قابلة للنقل.</li>
                <li><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض معينة.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">7. ملفات تعريف الارتباط (Cookies)</h2>
            <div className="text-slate-600 space-y-3">
              <p>نستخدم ملفات تعريف الارتباط لـ:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تذكر تفضيلاتك وإعداداتك</li>
                <li>الحفاظ على تسجيل دخولك</li>
                <li>تحليل استخدام المنصة</li>
                <li>تحسين الأداء والتجربة</li>
              </ul>
              <p className="mt-4">
                يمكنك إدارة ملفات تعريف الارتباط من خلال إعدادات المتصفح، علماً بأن تعطيلها قد يؤثر على بعض وظائف المنصة.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">8. الاحتفاظ بالبيانات</h2>
            <p className="text-slate-600 leading-relaxed">
              نحتفظ ببياناتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات.
              قد نحتفظ ببعض البيانات لفترات أطول للامتثال للمتطلبات القانونية أو لحل النزاعات.
              عند طلب حذف حسابك، سنحذف بياناتك خلال 30 يوماً، مع الاحتفاظ بما يلزم قانونياً.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">9. نقل البيانات</h2>
            <p className="text-slate-600 leading-relaxed">
              قد يتم تخزين بياناتك ومعالجتها في المملكة العربية السعودية أو في دول أخرى حيث توجد مراكز بياناتنا.
              نضمن أن أي نقل للبيانات خارج المملكة يتم وفقاً للضمانات المناسبة ومتطلبات نظام حماية البيانات الشخصية.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">10. خصوصية الأطفال</h2>
            <p className="text-slate-600 leading-relaxed">
              منصتنا غير موجهة للأشخاص دون سن 18 عاماً. لا نجمع عمداً بيانات شخصية من الأطفال.
              إذا علمنا بجمع بيانات من طفل، سنحذفها فوراً.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">11. التحديثات على السياسة</h2>
            <p className="text-slate-600 leading-relaxed">
              قد نحدث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني
              أو إشعار على المنصة. ننصح بمراجعة هذه الصفحة دورياً.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">12. التواصل معنا</h2>
            <p className="text-slate-600 leading-relaxed">
              لأي استفسارات أو طلبات تتعلق بخصوصيتك وبياناتك، يرجى التواصل معنا:
            </p>
            <div className="mt-4 bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-slate-600"><strong>مسؤول حماية البيانات:</strong></p>
              <p className="text-slate-600">البريد الإلكتروني: privacy@traf3li.com</p>
              <p className="text-slate-600">الهاتف: 920000000</p>
              <p className="text-slate-600">العنوان: الرياض، المملكة العربية السعودية</p>
            </div>
          </section>

          {/* PDPL Notice */}
          <section className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
            <h2 className="text-lg font-bold text-emerald-800 mb-3">التزامنا بنظام حماية البيانات الشخصية (PDPL)</h2>
            <p className="text-emerald-700 text-sm leading-relaxed">
              نلتزم بجميع متطلبات نظام حماية البيانات الشخصية الصادر عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).
              إذا كنت تعتقد أن حقوقك قد انتُهكت، يحق لك تقديم شكوى للهيئة.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/sign-up"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            العودة للتسجيل
          </Link>
        </div>
      </div>
    </div>
  )
}
