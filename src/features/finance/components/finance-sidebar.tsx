import {
    FileText, AlertCircle, CheckCircle, TrendingUp, ArrowUpRight, ArrowDownLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function FinanceSidebar() {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="space-y-8 lg:col-span-1">

            {/* FINANCIAL SUMMARY WIDGET */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300">
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-navy">الملخص المالي</h3>
                    <div className="bg-emerald-50 p-2 rounded-full">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <Card className="bg-slate-50 border-0 shadow-none rounded-2xl">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-slate-500 mb-1">إجمالي الدخل</div>
                                <div className="text-lg font-bold text-emerald-600">{formatCurrency(150000)}</div>
                            </div>
                            <div className="bg-emerald-100 p-2 rounded-full">
                                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-0 shadow-none rounded-2xl">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-slate-500 mb-1">إجمالي المصروفات</div>
                                <div className="text-lg font-bold text-rose-600">{formatCurrency(45000)}</div>
                            </div>
                            <div className="bg-rose-100 p-2 rounded-full">
                                <ArrowDownLeft className="h-4 w-4 text-rose-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* INVOICE STATS WIDGET */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-navy text-lg">حالة الفواتير</h3>
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3">نوفمبر</Badge>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-navy text-sm">مستحقة</div>
                                <div className="text-xs text-slate-400">5 فواتير</div>
                            </div>
                        </div>
                        <div className="font-bold text-navy">{formatCurrency(52900)}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-rose-600 shadow-sm">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-navy text-sm">متأخرة</div>
                                <div className="text-xs text-slate-400">2 فاتورة</div>
                            </div>
                        </div>
                        <div className="font-bold text-navy">{formatCurrency(12500)}</div>
                    </div>
                </div>
            </div>

            {/* RECENT ACTIVITY WIDGET */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-navy text-lg">آخر النشاطات</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex gap-4 relative pb-4 border-b border-slate-50 last:border-0">
                        <div className="w-14 text-center shrink-0">
                            <div className="text-sm font-bold text-navy">10:30</div>
                            <div className="text-xs text-slate-400">ص</div>
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-navy text-sm mb-1">تم دفع فاتورة #1023</div>
                            <div className="text-xs text-slate-500">شركة الإنشاءات الحديثة</div>
                        </div>
                    </div>
                    <div className="flex gap-4 relative pb-4 border-b border-slate-50 last:border-0">
                        <div className="w-14 text-center shrink-0">
                            <div className="text-sm font-bold text-navy">09:15</div>
                            <div className="text-xs text-slate-400">ص</div>
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-navy text-sm mb-1">تسجيل مصروف جديد</div>
                            <div className="text-xs text-slate-500">ضيافة واجتماعات</div>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" className="w-full mt-2 text-slate-500 hover:text-navy">
                    عرض سجل النشاطات
                </Button>
            </div>

        </div>
    )
}
