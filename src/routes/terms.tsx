import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
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
          <h1 className="text-3xl font-bold text-[#0f172a] mb-2">الشروط والأحكام</h1>
          <p className="text-slate-500">آخر تحديث: يناير 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">1. مقدمة</h2>
            <p className="text-slate-600 leading-relaxed">
              مرحباً بكم في منصة ترافلي للخدمات القانونية. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام.
              يرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا. إذا كنت لا توافق على أي جزء من هذه الشروط،
              فيرجى عدم استخدام المنصة.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">2. تعريفات</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li><strong>"المنصة":</strong> تشير إلى موقع ترافلي الإلكتروني وتطبيقاته.</li>
              <li><strong>"المستخدم":</strong> أي شخص يستخدم المنصة سواء كان عميلاً أو محامياً.</li>
              <li><strong>"العميل":</strong> الشخص الذي يبحث عن خدمات قانونية عبر المنصة.</li>
              <li><strong>"المحامي":</strong> المحامي المرخص الذي يقدم خدماته عبر المنصة.</li>
              <li><strong>"الخدمات":</strong> جميع الخدمات المقدمة عبر المنصة.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">3. شروط التسجيل</h2>
            <div className="text-slate-600 space-y-3">
              <p>للتسجيل في المنصة، يجب أن:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تكون قد بلغت السن القانوني (18 عاماً أو أكثر).</li>
                <li>تقدم معلومات صحيحة ودقيقة وكاملة.</li>
                <li>تحافظ على سرية بيانات حسابك وكلمة المرور.</li>
                <li>تخطرنا فوراً بأي استخدام غير مصرح به لحسابك.</li>
              </ul>
              <p className="mt-4">
                بالنسبة للمحامين، يجب أن تكون حاصلاً على رخصة محاماة سارية المفعول من الجهات المختصة في المملكة العربية السعودية.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">4. استخدام الخدمات</h2>
            <div className="text-slate-600 space-y-3">
              <p>عند استخدام المنصة، توافق على:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>عدم استخدام المنصة لأي غرض غير قانوني أو محظور.</li>
                <li>عدم انتهاك حقوق الملكية الفكرية للآخرين.</li>
                <li>عدم نشر محتوى مسيء أو تشهيري أو غير لائق.</li>
                <li>عدم محاولة الوصول غير المصرح به لأنظمة المنصة.</li>
                <li>الالتزام بجميع القوانين واللوائح المعمول بها.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">5. الرسوم والدفع</h2>
            <div className="text-slate-600 space-y-3">
              <p>
                تحتفظ المنصة بحق فرض رسوم على بعض الخدمات. سيتم إخطارك بأي رسوم قبل استخدام الخدمة المعنية.
                جميع الرسوم المدفوعة غير قابلة للاسترداد إلا في الحالات المنصوص عليها صراحة.
              </p>
              <p>
                تتم معالجة جميع المدفوعات عبر بوابات دفع آمنة ومرخصة. المنصة غير مسؤولة عن أي رسوم إضافية
                قد يفرضها البنك أو مزود خدمة الدفع.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">6. العلاقة بين المحامي والعميل</h2>
            <div className="text-slate-600 space-y-3">
              <p>
                المنصة هي وسيط تقني فقط بين المحامين والعملاء. العلاقة التعاقدية القانونية تكون مباشرة بين المحامي والعميل.
                المنصة غير مسؤولة عن جودة الخدمات القانونية المقدمة أو نتائجها.
              </p>
              <p>
                يلتزم المحامون بأخلاقيات المهنة والأنظمة المعمول بها، ويتحملون المسؤولية الكاملة عن خدماتهم.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">7. حدود المسؤولية</h2>
            <div className="text-slate-600 space-y-3">
              <p>
                المنصة غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الخدمات، بما في ذلك على سبيل المثال لا الحصر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>خسارة البيانات أو الأرباح.</li>
                <li>انقطاع الخدمة أو تأخرها.</li>
                <li>الأخطاء أو الإغفالات في المحتوى.</li>
                <li>أي سلوك من قبل أطراف ثالثة.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">8. إنهاء الحساب</h2>
            <p className="text-slate-600 leading-relaxed">
              يحق للمنصة تعليق أو إنهاء حسابك في أي وقت ودون إشعار مسبق في حالة انتهاك هذه الشروط أو لأي سبب آخر تراه المنصة مناسباً.
              كما يحق لك إنهاء حسابك في أي وقت عن طريق التواصل مع الدعم الفني.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">9. التعديلات على الشروط</h2>
            <p className="text-slate-600 leading-relaxed">
              تحتفظ المنصة بحق تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني
              أو من خلال إشعار على المنصة. استمرارك في استخدام المنصة بعد نشر التعديلات يعني موافقتك عليها.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">10. القانون الواجب التطبيق</h2>
            <p className="text-slate-600 leading-relaxed">
              تخضع هذه الشروط وتفسر وفقاً لأنظمة المملكة العربية السعودية. أي نزاع ينشأ عن هذه الشروط أو يتعلق بها
              يخضع للاختصاص القضائي الحصري للمحاكم المختصة في المملكة العربية السعودية.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">11. التواصل معنا</h2>
            <p className="text-slate-600 leading-relaxed">
              إذا كان لديك أي أسئلة أو استفسارات حول هذه الشروط والأحكام، يرجى التواصل معنا عبر:
            </p>
            <div className="mt-4 bg-slate-50 rounded-xl p-4">
              <p className="text-slate-600">البريد الإلكتروني: support@traf3li.com</p>
              <p className="text-slate-600">الهاتف: 920000000</p>
            </div>
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
