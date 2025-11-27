import {
    Clock, TrendingUp, FileText, Users,
    BarChart3, PieChart, Calendar, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link } from '@tanstack/react-router'

interface ReportCard {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    href: string
    color: string
    bgColor: string
    borderColor: string
}

const reports: ReportCard[] = [
    {
        id: 'accounts-aging',
        title: 'تقرير أعمار الحسابات',
        description: 'تحليل المستحقات حسب فترات التأخير (0-30، 31-60، 61-90، +90 يوم)',
        icon: <Clock className="w-6 h-6" />,
        href: '/dashboard/finance/reports/accounts-aging',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-100'
    },
    {
        id: 'revenue-by-client',
        title: 'إيرادات العملاء',
        description: 'تحليل الإيرادات والمدفوعات والمستحقات حسب كل عميل',
        icon: <TrendingUp className="w-6 h-6" />,
        href: '/dashboard/finance/reports/revenue-by-client',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-100'
    },
    {
        id: 'outstanding-invoices',
        title: 'الفواتير المستحقة',
        description: 'قائمة شاملة بجميع الفواتير المستحقة مع تفاصيل التأخير',
        icon: <FileText className="w-6 h-6" />,
        href: '/dashboard/finance/reports/outstanding-invoices',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-100'
    },
    {
        id: 'time-entries',
        title: 'تقرير الوقت',
        description: 'تحليل ساعات العمل القابلة للفوترة وغير القابلة',
        icon: <Calendar className="w-6 h-6" />,
        href: '/dashboard/finance/reports/time-entries',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-100'
    }
]

export function ReportsDashboard() {
    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'التقارير', href: '/dashboard/finance/reports', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Hero Header */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <BarChart3 className="w-3 h-3 ml-2" />
                                        التقارير المالية
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    التقارير والتحليلات
                                </h1>
                                <p className="text-indigo-100/80">اختر التقرير المناسب لتحليل بياناتك المالية</p>
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <PieChart className="w-10 h-10 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reports Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reports.map((report) => (
                            <Link key={report.id} to={report.href}>
                                <Card className={`border-0 shadow-sm rounded-3xl hover:shadow-lg transition-all duration-300 cursor-pointer group ${report.bgColor} ${report.borderColor} border`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-14 h-14 rounded-2xl ${report.bgColor} flex items-center justify-center ${report.color} group-hover:scale-110 transition-transform`}>
                                                {report.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-navy mb-2 group-hover:text-brand-blue transition-colors">
                                                    {report.title}
                                                </h3>
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    {report.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-end">
                                            <Button variant="ghost" className={`${report.color} hover:bg-white/50 rounded-xl text-sm`}>
                                                عرض التقرير
                                                <TrendingUp className="w-4 h-4 mr-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <Card className="border-0 shadow-sm rounded-3xl bg-white">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-indigo-500" />
                                ملخص سريع
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-navy">12</div>
                                    <div className="text-sm text-slate-500">فاتورة متأخرة</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-navy">78%</div>
                                    <div className="text-sm text-slate-500">معدل التحصيل</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-navy">24</div>
                                    <div className="text-sm text-slate-500">عميل نشط</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                                        <Calendar className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-navy">156</div>
                                    <div className="text-sm text-slate-500">ساعة هذا الشهر</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </Main>
        </>
    )
}
