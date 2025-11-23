import {
    Clock, Bell, CheckCircle2, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function TasksSidebar() {
    return (
        <div className="space-y-8 lg:col-span-1">

            {/* REMINDER STATS WIDGET */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300">
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-navy">حالة التذكيرات</h3>
                    <div className="bg-emerald-50 p-2 rounded-full">
                        <Bell className="h-5 w-5 text-emerald-500" />
                    </div>
                </div>
                <div className="p-6 text-center">
                    <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                            <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                            <circle cx="80" cy="80" r="70" stroke="#10b981" strokeWidth="12" fill="transparent" strokeDasharray="439.8" strokeDashoffset="110" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-navy">12</span>
                            <span className="text-sm text-slate-400 mt-1">تذكير نشط</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 rounded-xl p-3">
                            <div className="text-red-500 font-bold text-lg">3</div>
                            <div className="text-xs text-slate-500">عاجلة</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                            <div className="text-emerald-500 font-bold text-lg">9</div>
                            <div className="text-xs text-slate-500">عادية</div>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl h-12 font-bold">
                        <CheckCircle2 className="h-4 w-4 ml-2" />
                        تحديد الكل كمقروء
                    </Button>
                </div>
            </div>

            {/* UPCOMING CALENDAR WIDGET */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-navy text-lg">تقويم الأسبوع</h3>
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3">نوفمبر</Badge>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center">
                    {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, i) => (
                        <div key={i} className={`rounded-xl p-2 ${i === 1 ? 'bg-navy text-white shadow-lg shadow-navy/30' : 'hover:bg-slate-50'}`}>
                            <div className={`text-[10px] mb-1 ${i === 1 ? 'text-blue-200' : 'text-slate-400'}`}>{day}</div>
                            <div className="font-bold text-lg">{19 + i}</div>
                            {i === 1 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto mt-1"></div>}
                        </div>
                    ))}
                </div>
                <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-bold text-navy text-sm">اجتماع الفريق</div>
                            <div className="text-xs text-slate-400">02:00 م - غرفة الاجتماعات</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TODAY'S AGENDA WIDGET */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-navy text-lg">أجندة اليوم</h3>
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3">نشط</Badge>
                </div>
                <div className="space-y-4">
                    <div className="flex gap-4 relative pb-4 border-b border-slate-50 last:border-0">
                        <div className="w-14 text-center shrink-0">
                            <div className="text-sm font-bold text-navy">09:00</div>
                            <div className="text-xs text-slate-400">صباحاً</div>
                        </div>
                        <div className="flex-1 bg-blue-50 rounded-xl p-3 border-r-4 border-blue-500">
                            <div className="font-bold text-navy text-sm mb-1">جلسة مرافعة</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                المحكمة العامة
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 relative pb-4 border-b border-slate-50 last:border-0">
                        <div className="w-14 text-center shrink-0">
                            <div className="text-sm font-bold text-navy">02:00</div>
                            <div className="text-xs text-slate-400">مساءً</div>
                        </div>
                        <div className="flex-1 bg-purple-50 rounded-xl p-3 border-r-4 border-purple-500">
                            <div className="font-bold text-navy text-sm mb-1">غداء عمل</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                مطعم الشرفة
                            </div>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" className="w-full mt-2 text-slate-500 hover:text-navy">
                    عرض الجدول الكامل
                </Button>
            </div>

        </div>
    )
}
