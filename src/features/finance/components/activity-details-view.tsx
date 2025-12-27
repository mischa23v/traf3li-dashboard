import { useState } from 'react'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, ArrowLeft, Briefcase,
    History, Link as LinkIcon, Flag, Send, Eye, Download, Search, Bell,
    CreditCard, DollarSign, CheckCircle2, AlertCircle, Activity, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Link, useParams } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useActivity } from '@/hooks/useFinance'

export function ActivityDetailsView() {
    const { activityId } = useParams({ from: '/_authenticated/dashboard/finance/activity/$activityId' })
    const { data, isLoading, isError, error } = useActivity(activityId)

    const activity = data?.data

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {isLoading ? (
                    <div className="max-w-[1600px] mx-auto space-y-6">
                        <Skeleton className="h-8 w-48" />
                        <div className="bg-white rounded-3xl p-8">
                            <div className="flex gap-8 mb-8">
                                <Skeleton className="h-16 w-16 rounded-xl" />
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-6 w-64" />
                                    <Skeleton className="h-5 w-96" />
                                </div>
                            </div>
                            <Skeleton className="h-64 w-full" />
                        </div>
                    </div>
                ) : isError ? (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="bg-white rounded-3xl p-12 text-center border border-red-100">
                            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" aria-hidden="true" />
                            <h3 className="text-xl font-bold mb-2 text-slate-900">فشل تحميل النشاط</h3>
                            <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ أثناء تحميل النشاط'}</p>
                            <Button onClick={() => window.location.reload()}>
                                إعادة المحاولة
                            </Button>
                        </div>
                    </div>
                ) : !activity ? (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                            <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-slate-900">النشاط غير موجود</h3>
                            <p className="text-slate-500 mb-4">لم يتم العثور على النشاط المطلوب</p>
                            <Button asChild>
                                <Link to={ROUTES.dashboard.finance.activity.list}>العودة إلى سجل النشاط</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="max-w-[1600px] mx-auto mb-6">
                            <Link to={ROUTES.dashboard.finance.activity.list} className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                                <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                                العودة إلى سجل النشاط
                            </Link>
                        </div>

                        <div className="max-w-[1600px] mx-auto bg-emerald-950 rounded-3xl p-8 shadow-xl shadow-emerald-900/20 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between text-white">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 text-emerald-400">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <span className="text-emerald-100 font-medium">نشاط مالي</span>
                                <span className="text-white/20">•</span>
                                <Badge variant="outline" className="me-2 border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                    {activity.activityId || activity._id}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold mb-4 leading-tight text-white">
                                {activity.title}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                                    <span>المستخدم: <span className="text-white font-medium">{activity.userName}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                                    <span>الوقت: <span className="text-white font-medium">{new Date(activity.date).toLocaleDateString('ar-SA')} - {activity.time}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-white/20 text-white">
                                        {activity.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        {activity.amount !== 0 && (
                            <div className="flex flex-col gap-4 min-w-[250px]">
                                <div className="text-start lg:text-start">
                                    <div className="text-slate-300 text-sm mb-1">المبلغ</div>
                                    <div className={`text-3xl font-bold ${activity.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {activity.amount > 0 ? '+' : ''}{activity.amount.toLocaleString('ar-SA')} ر.س
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto pb-12">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy">تفاصيل النشاط</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="text-sm text-slate-500 block mb-2">الوصف</label>
                                            <div className="font-medium text-navy">{activity.description}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">النوع</label>
                                            <Badge variant="outline">
                                                {activity.type === 'payment_received' ? 'دفعة مستلمة' :
                                                 activity.type === 'payment_sent' ? 'دفعة مرسلة' :
                                                 activity.type === 'invoice_created' ? 'فاتورة منشأة' :
                                                 activity.type === 'invoice_sent' ? 'فاتورة مرسلة' :
                                                 activity.type === 'invoice_paid' ? 'فاتورة مدفوعة' :
                                                 activity.type === 'expense_created' ? 'مصروف منشأ' :
                                                 activity.type === 'expense_approved' ? 'مصروف موافق عليه' :
                                                 activity.type === 'transaction_created' ? 'معاملة منشأة' :
                                                 activity.type}
                                            </Badge>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">المرجع</label>
                                            <div className="font-medium text-navy font-mono">{activity.reference}</div>
                                        </div>
                                        {activity.metadata && (
                                            <>
                                                {activity.metadata.ipAddress && (
                                                    <div>
                                                        <label className="text-sm text-slate-500 block mb-2">عنوان IP</label>
                                                        <div className="font-medium text-navy font-mono">{activity.metadata.ipAddress}</div>
                                                    </div>
                                                )}
                                                {activity.metadata.device && (
                                                    <div>
                                                        <label className="text-sm text-slate-500 block mb-2">الجهاز</label>
                                                        <div className="font-medium text-navy">{activity.metadata.device}</div>
                                                    </div>
                                                )}
                                                {activity.metadata.location && (
                                                    <div className="col-span-2">
                                                        <label className="text-sm text-slate-500 block mb-2">الموقع الجغرافي</label>
                                                        <div className="font-medium text-navy">{activity.metadata.location}</div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <div className="col-span-2">
                                            <label className="text-sm text-slate-500 block mb-2">تاريخ الإنشاء</label>
                                            <div className="font-medium text-navy">{new Date(activity.createdAt).toLocaleString('ar-SA')}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                        </div>
                    </>
                )}
            </Main>
        </>
    )
}
