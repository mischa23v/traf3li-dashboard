import { useState } from 'react'
import { AlertCircle, Gavel, Scale, ShieldAlert, ChevronLeft, Calendar, MapPin, Clock, Filter, X } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function CasesDashboard() {
    const [showOnlyMyCases, setShowOnlyMyCases] = useState(false)

    // Mock Data
    const cases = [
        {
            id: '405',
            type: 'labor',
            typeLabel: 'عمالية',
            icon: Gavel,
            iconColor: 'text-brand-blue',
            iconBg: 'bg-blue-50',
            status: 'jar',
            statusLabel: 'جارية',
            statusColor: 'bg-blue-50 text-blue-700 border-blue-100',
            plaintiff: 'شركة الإنشاءات',
            defendant: 'محمد أحمد',
            location: 'المحكمة العمالية - الرياض',
            time: '09:00 ص',
            timeValue: 900,
            lawyer: 'ahmed',
            actionRequired: 'مطلوب مراجعة',
            actionColor: 'text-brand-blue'
        },
        {
            id: '409',
            type: 'commercial',
            typeLabel: 'تجارية',
            icon: Scale,
            iconColor: 'text-indigo-600',
            iconBg: 'bg-indigo-50',
            status: 'settlement',
            statusLabel: 'تسوية',
            statusColor: 'bg-amber-50 text-amber-700 border-amber-100',
            plaintiff: 'مؤسسة الرياض',
            defendant: 'شركة التوريد السريع',
            location: 'المحكمة التجارية - جدة',
            time: '10:30 ص',
            timeValue: 1030,
            lawyer: 'sara',
            actionRequired: 'لا يوجد إجراء',
            actionColor: 'text-slate-500'
        },
        {
            id: '411',
            type: 'criminal',
            typeLabel: 'جنائية',
            icon: ShieldAlert,
            iconColor: 'text-rose-600',
            iconBg: 'bg-rose-50',
            status: 'appeal',
            statusLabel: 'استئناف',
            statusColor: 'bg-blue-50 text-blue-600 border-blue-100',
            plaintiff: 'النيابة العامة',
            defendant: 'خالد عبدالله',
            location: 'المحكمة الجزائية - الدمام',
            time: '13:00 م',
            timeValue: 1300,
            lawyer: 'mohammed',
            actionRequired: 'مطلوب مستندات',
            actionColor: 'text-brand-blue'
        }
    ].sort((a, b) => a.timeValue - b.timeValue)

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans pb-20" dir="rtl">

            {/* Top Blue Line */}
            <div className="fixed top-0 start-0 end-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 z-[60] shadow-sm"></div>

            <div className="p-6 lg:p-8 space-y-8 pt-10 max-w-[1600px] mx-auto">

                {/* HERO BANNER */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-navy rounded-3xl p-8 relative overflow-hidden text-white flex flex-col justify-between min-h-[280px] shadow-xl shadow-navy/20 group">
                        <div className="absolute -bottom-32 -start-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">صباح الخير، مشاري 👋</h1>
                            <p className="text-slate-300 text-lg font-medium">لديك <span className="text-white font-bold">3 جلسات مرافعة</span> و <span className="text-white font-bold">5 مهام</span> تتطلب انتباهك اليوم.</p>
                        </div>
                        <div className="relative z-10 flex flex-wrap gap-4 mt-8">
                            <button className="px-8 py-3.5 bg-brand-blue text-white rounded-2xl font-bold shadow-lg shadow-blue-600/30 hover:scale-105 hover:shadow-blue-600/40 transition-all duration-300">إضافة قضية</button>
                            <button className="px-8 py-3.5 bg-white/10 text-white rounded-2xl font-bold backdrop-blur-md hover:bg-white/20 border border-white/10 transition-all duration-300">التقويم</button>
                        </div>
                    </div>

                    {/* Urgent Tasks Card */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-navy text-xl">المهام العاجلة</h3>
                                <p className="text-slate-500 text-sm mt-1">تستحق الانتباه</p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center shadow-sm"><AlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" /></div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer group">
                                <div className="w-3 h-3 bg-red-500 rounded-full ring-4 ring-red-100 group-hover:ring-red-200 transition-all"></div>
                                <div className="flex-1">
                                    <div className="text-base font-bold text-slate-800 group-hover:text-brand-blue transition-colors">تحضير مذكرة دفاع</div>
                                    <div className="text-xs font-medium text-slate-500 mt-1">الموعد: اليوم 4:00 م</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FILTERS SECTION */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6 text-navy">
                        <div className="p-2 bg-blue-50 rounded-xl"><Filter className="h-5 w-5 text-brand-blue" aria-hidden="true" /></div>
                        <span className="font-bold text-lg">تصفية القضايا</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Filter Item */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 block px-1">نوع القضية</label>
                            <Select>
                                <SelectTrigger className="w-full h-12 text-start rounded-2xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 font-medium text-slate-700" dir="rtl">
                                    <SelectValue placeholder="الكل" />
                                </SelectTrigger>
                                <SelectContent dir="rtl" className="rounded-2xl border-slate-100 shadow-lg">
                                    <SelectItem value="labor">عمالية</SelectItem>
                                    <SelectItem value="commercial">تجارية</SelectItem>
                                    <SelectItem value="criminal">جنائية</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 block px-1">المحامي المسؤول</label>
                            <Select>
                                <SelectTrigger className="w-full h-12 text-start rounded-2xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 font-medium text-slate-700" dir="rtl">
                                    <SelectValue placeholder="الكل" />
                                </SelectTrigger>
                                <SelectContent dir="rtl" className="rounded-2xl border-slate-100 shadow-lg">
                                    <SelectItem value="ahmed">أحمد المحامي</SelectItem>
                                    <SelectItem value="sara">سارة المحامية</SelectItem>
                                    <SelectItem value="mohammed">محمد المحامي</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 block px-1">الحالة</label>
                            <Select>
                                <SelectTrigger className="w-full h-12 text-start rounded-2xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 font-medium text-slate-700" dir="rtl">
                                    <SelectValue placeholder="الكل" />
                                </SelectTrigger>
                                <SelectContent dir="rtl" className="rounded-2xl border-slate-100 shadow-lg">
                                    <SelectItem value="jar">جارية</SelectItem>
                                    <SelectItem value="settlement">تسوية</SelectItem>
                                    <SelectItem value="appeal">استئناف</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-3 cursor-pointer group w-full p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${showOnlyMyCases ? 'bg-brand-blue border-brand-blue' : 'border-slate-300 bg-white'}`}>
                                    {showOnlyMyCases && <div className="w-2.5 h-2.5 bg-white rounded-md" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={showOnlyMyCases}
                                    onChange={(e) => setShowOnlyMyCases(e.target.checked)}
                                />
                                <span className="text-sm font-bold text-slate-700 group-hover:text-brand-blue transition-colors">عرض قضاياي فقط</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                        <Button className="bg-brand-blue hover:bg-blue-700 text-white rounded-xl px-8 h-11 font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">تطبيق التصفية</Button>
                        <Button variant="ghost" className="text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl px-6 h-11 font-medium transition-colors">
                            <X className="h-4 w-4 ms-2" aria-hidden="true" />
                            مسح الكل
                        </Button>
                    </div>
                </div>

                {/* SECTION HEADER */}
                <div className="flex items-center justify-between mt-4 px-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-navy">جلسات اليوم</h2>
                        <span className="px-3 py-1 bg-blue-50 text-brand-blue text-xs font-bold rounded-full border border-blue-100">{cases.length} جلسات</span>
                    </div>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                        <Clock className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                        <span>مرتبة حسب الوقت</span>
                    </div>
                </div>

                {/* CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {cases.map((caseItem) => (
                        <div key={caseItem.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
                            <div className="p-6 flex-1 relative">
                                {/* Hover Accent Line */}
                                <div className="absolute top-0 end-0 w-1.5 h-full bg-brand-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-16 w-16 rounded-2xl ${caseItem.iconBg} ${caseItem.iconColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                            <caseItem.icon className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-xl text-navy mb-1">قضية #{caseItem.id}</div>
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{caseItem.typeLabel}</div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${caseItem.statusColor}`}>{caseItem.statusLabel}</span>
                                </div>

                                <div className="space-y-4">
                                    {/* Plaintiff */}
                                    <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-50 border-dashed">
                                        <span className="text-slate-500 font-medium">المدعي</span>
                                        <span className="font-bold text-slate-800">{caseItem.plaintiff}</span>
                                    </div>

                                    {/* Defendant */}
                                    <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-50 border-dashed">
                                        <span className="text-slate-500 font-medium">المدعى عليه</span>
                                        <span className="font-bold text-slate-800">{caseItem.defendant}</span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-50 border-dashed">
                                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                            الموقع
                                        </span>
                                        <span className="font-bold text-slate-800 text-xs bg-slate-50 px-2 py-1 rounded-lg">{typeof caseItem.location === 'string' ? caseItem.location : (caseItem.location?.name || caseItem.location?.address || 'عن بعد')}</span>
                                    </div>

                                    {/* Time */}
                                    <div className="flex justify-between items-center text-sm pt-1">
                                        <span className="text-slate-500 font-medium">الوقت</span>
                                        <span className="font-bold text-brand-blue flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                            <Clock className="h-4 w-4" aria-hidden="true" />
                                            {caseItem.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50/80 p-4 flex justify-between items-center border-t border-slate-100 backdrop-blur-sm">
                                <span className={`text-xs font-bold flex items-center gap-1.5 ${caseItem.actionColor}`}>
                                    <div className={`w-2 h-2 rounded-full ${caseItem.actionColor === 'text-brand-blue' ? 'bg-brand-blue animate-pulse' : 'bg-slate-300'}`}></div>
                                    {caseItem.actionRequired}
                                </span>
                                <button className="h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-brand-blue hover:text-white hover:border-transparent transition-all duration-300 shadow-sm">
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ))}

                </div>

            </div>
        </div>
    )
}
