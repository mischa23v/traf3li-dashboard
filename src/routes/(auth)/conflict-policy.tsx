import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/conflict-policy')({
  component: ConflictPolicyPage,
})

function ConflictPolicyPage() {
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
          <h1 className="text-4xl font-bold text-[#0f172a] mb-2">سياسة تعارض المصالح</h1>
          <p className="text-slate-500">آخر تحديث: ٢٥ نوفمبر ٢٠٢٥</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 lg:p-12 space-y-12">

          {/* Introduction */}
          <section>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span className="text-3xl">⚖️</span>
                مقدمة
              </h2>
              <p className="text-amber-900 leading-relaxed">
                تلتزم منصة <strong className="text-emerald-600">ترافعلي (TRAF3LI)</strong> بأعلى معايير النزاهة والشفافية في تقديم الخدمات القانونية.
                تهدف هذه السياسة إلى ضمان أن جميع المحامين المسجلين على المنصة يعملون بما يتوافق مع
                <strong> قواعد السلوك المهني للمحاماة</strong> الصادرة عن وزارة العدل في المملكة العربية السعودية.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>📋</span>
                  نطاق السياسة
                </h3>
                <div className="text-sm text-slate-700 space-y-1">
                  <p>تنطبق هذه السياسة على:</p>
                  <ul className="me-4 mt-2 space-y-1">
                    <li>• جميع المحامين المسجلين على المنصة</li>
                    <li>• المستشارين القانونيين</li>
                    <li>• المكاتب القانونية</li>
                  </ul>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-5">
                <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <span>🎯</span>
                  الهدف من السياسة
                </h3>
                <div className="text-sm text-emerald-800 space-y-1">
                  <p>• حماية مصالح العملاء</p>
                  <p>• ضمان استقلالية المحامي</p>
                  <p>• الحفاظ على نزاهة المهنة</p>
                  <p>• تجنب أي تعارض محتمل</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 1: Definition */}
          <section id="definition">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">١. تعريف تعارض المصالح</h2>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">١.١ التعريف العام</h3>
                <p className="text-blue-800 leading-relaxed">
                  يُقصد بتعارض المصالح أي موقف يكون فيه للمحامي مصلحة شخصية أو مهنية أو مالية تتعارض،
                  أو يمكن أن تتعارض، مع مصلحة العميل أو مع قدرته على تقديم تمثيل قانوني مستقل ونزيه.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0f172a] mb-4">١.٢ أنواع تعارض المصالح</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <span>🔴</span>
                      تعارض مباشر
                    </h4>
                    <ul className="text-sm text-red-800 space-y-2">
                      <li>• تمثيل أطراف متنازعة في نفس القضية</li>
                      <li>• وجود علاقة شخصية مع الطرف الآخر</li>
                      <li>• مصلحة مالية في نتيجة القضية</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                    <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <span>🟡</span>
                      تعارض غير مباشر
                    </h4>
                    <ul className="text-sm text-amber-800 space-y-2">
                      <li>• تمثيل سابق للطرف الآخر</li>
                      <li>• علاقة مهنية مع محامي الخصم</li>
                      <li>• معلومات سرية من قضايا سابقة</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Prohibited Actions */}
          <section id="prohibited">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٢. الأفعال المحظورة</h2>

            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 text-xl">
                <span className="text-2xl">🚫</span>
                يُحظر على المحامي
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="text-red-800 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    <span>قبول التوكيل في قضية سبق أن مثّل فيها الطرف الآخر</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    <span>تمثيل أطراف متعددة ذات مصالح متعارضة في نفس القضية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    <span>استخدام معلومات سرية لصالح عميل آخر</span>
                  </li>
                </ul>
                <ul className="text-red-800 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    <span>قبول قضايا قد تؤثر على استقلاليته المهنية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    <span>إخفاء أي تعارض محتمل عن العميل</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    <span>التصرف بما يضر بمصلحة العميل لمصلحته الشخصية</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Disclosure Requirements */}
          <section id="disclosure">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٣. متطلبات الإفصاح</h2>

            <div className="space-y-4">
              <div className="bg-green-50 border-e-4 border-green-500 rounded-lg p-5">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <span>✓</span>
                  الإفصاح الفوري
                </h3>
                <p className="text-sm text-green-800">
                  يجب على المحامي الإفصاح فوراً عن أي تعارض محتمل للمصالح فور علمه به،
                  حتى لو كان التعارض بسيطاً أو غير مؤثر في رأيه.
                </p>
              </div>

              <div className="bg-blue-50 border-e-4 border-blue-500 rounded-lg p-5">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span>📝</span>
                  الإفصاح الكتابي
                </h3>
                <p className="text-sm text-blue-800">
                  يجب أن يكون الإفصاح كتابياً ويتضمن طبيعة التعارض المحتمل وتأثيره على القضية.
                  يتم توثيق الإفصاح في المنصة.
                </p>
              </div>

              <div className="bg-purple-50 border-e-4 border-purple-500 rounded-lg p-5">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <span>📋</span>
                  الموافقة المستنيرة
                </h3>
                <p className="text-sm text-purple-800">
                  في بعض الحالات، يمكن للعميل الموافقة على استمرار التمثيل رغم التعارض المحتمل،
                  شريطة أن تكون الموافقة مستنيرة ومكتوبة.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Platform Obligations */}
          <section id="platform">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٤. التزامات المنصة</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-5">
                <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  المراقبة والفحص
                </h3>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• فحص تلقائي للقضايا المتشابهة</li>
                  <li>• تنبيهات تعارض المصالح</li>
                  <li>• مراجعة دورية للحسابات</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  الحماية والتوثيق
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• حفظ سجلات الإفصاح</li>
                  <li>• توثيق موافقات العملاء</li>
                  <li>• تقارير دورية للجهات المختصة</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Consequences */}
          <section id="consequences">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٥. العواقب والجزاءات</h2>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6">
              <h3 className="font-bold text-amber-900 mb-4 text-xl">في حالة مخالفة هذه السياسة:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">١</span>
                  <div>
                    <h4 className="font-semibold text-amber-900">تحذير رسمي</h4>
                    <p className="text-sm text-amber-800">للمخالفات البسيطة غير المتعمدة</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">٢</span>
                  <div>
                    <h4 className="font-semibold text-amber-900">تعليق مؤقت</h4>
                    <p className="text-sm text-amber-800">للمخالفات المتكررة أو الجسيمة</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">٣</span>
                  <div>
                    <h4 className="font-semibold text-amber-900">إلغاء العضوية</h4>
                    <p className="text-sm text-amber-800">للمخالفات الخطيرة أو المتعمدة</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">٤</span>
                  <div>
                    <h4 className="font-semibold text-amber-900">الإبلاغ للجهات المختصة</h4>
                    <p className="text-sm text-amber-800">في الحالات التي تستوجب ذلك قانوناً</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Reporting */}
          <section id="reporting">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b-2 border-emerald-500">٦. الإبلاغ عن تعارض المصالح</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>📧</span>
                  للمحامين
                </h3>
                <p className="text-sm text-slate-700 mb-3">
                  يمكنك الإفصاح عن تعارض المصالح عبر:
                </p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• نموذج الإفصاح في لوحة التحكم</li>
                  <li>• البريد: ethics@traf3li.com</li>
                </ul>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
                <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <span>🔔</span>
                  للعملاء
                </h3>
                <p className="text-sm text-emerald-800 mb-3">
                  إذا شككت في وجود تعارض مصالح:
                </p>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• تواصل مع الدعم الفني</li>
                  <li>• البريد: complaints@traf3li.com</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Final Section */}
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">التزامنا بالنزاهة المهنية</h2>
            <p className="text-emerald-800 mb-6 max-w-2xl mx-auto">
              نحن في ترافعلي نؤمن بأن النزاهة والشفافية هما أساس الثقة بين المحامي والعميل.
              هذه السياسة تضمن حماية حقوق جميع الأطراف.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/terms"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-all border-2 border-emerald-200"
              >
                <span>📋</span>
                الشروط والأحكام
              </Link>
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
              >
                <span>🔒</span>
                سياسة الخصوصية
              </Link>
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
          <p className="text-slate-500 text-xs">
            © ٢٠٢٥ ترافعلي (TRAF3LI) - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  )
}
