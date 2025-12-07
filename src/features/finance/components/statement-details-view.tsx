import { useState } from 'react'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, ArrowLeft, Briefcase,
    History, Link as LinkIcon, Flag, Send, Eye, Download, Search, Bell,
    CreditCard, DollarSign, CheckCircle2, AlertCircle, FileBarChart, Loader2
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
import { useStatement } from '@/hooks/useFinance'

export function StatementDetailsView() {
    const { statementId } = useParams({ from: '/_authenticated/dashboard/finance/statements/$statementId' })
    const { data, isLoading, isError, error } = useStatement(statementId)

    const statement = data?.data

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'كشوف الحساب', href: '/dashboard/finance/statements', isActive: true },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
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
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
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
                            <h3 className="text-xl font-bold mb-2 text-slate-900">فشل تحميل الكشف</h3>
                            <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ أثناء تحميل الكشف'}</p>
                            <Button onClick={() => window.location.reload()}>
                                إعادة المحاولة
                            </Button>
                        </div>
                    </div>
                ) : !statement ? (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                            <FileBarChart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-slate-900">الكشف غير موجود</h3>
                            <p className="text-slate-500 mb-4">لم يتم العثور على الكشف المطلوب</p>
                            <Button asChild>
                                <Link to="/dashboard/finance/statements">العودة إلى كشوف الحساب</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/finance/statements" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                        العودة إلى كشوف الحساب
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
                                    <FileBarChart className="h-6 w-6" />
                                </div>
                                <span className="text-emerald-100 font-medium">كشف حساب شهري</span>
                                <span className="text-white/20">•</span>
                                <Badge variant="outline" className="me-2 border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                    {statement.status === 'sent' ? 'تم الإرسال' : statement.status === 'paid' ? 'مدفوع' : statement.status === 'archived' ? 'مؤرشف' : 'مسودة'}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold mb-4 leading-tight text-white">
                                {statement.period}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                                    <span>تاريخ الإصدار: <span className="text-white font-medium">{new Date(statement.generatedDate).toLocaleDateString('ar-SA')}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                                    <span>العميل: <span className="text-white font-medium">{statement.clientName}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[250px]">
                            <div className="text-left lg:text-left">
                                <div className="text-slate-300 text-sm mb-1">المبلغ الإجمالي</div>
                                <div className="text-3xl font-bold text-white">{statement.totalAmount.toLocaleString('ar-SA')} <span className="text-lg text-emerald-400">ر.س</span></div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                    <Download className="h-4 w-4 ms-2" aria-hidden="true" />
                                    تحميل PDF
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto pb-12">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy">ملخص الحركات</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-right">
                                            <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
                                                <tr>
                                                    <th className="px-6 py-4">التاريخ</th>
                                                    <th className="px-6 py-4">النوع</th>
                                                    <th className="px-6 py-4">الوصف</th>
                                                    <th className="px-6 py-4">المرجع</th>
                                                    <th className="px-6 py-4 text-left">المبلغ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {statement.items && statement.items.length > 0 ? (
                                                    statement.items.map((item, index) => (
                                                        <tr key={item._id || index} className="hover:bg-slate-50/50">
                                                            <td className="px-6 py-4 text-slate-600">{new Date(item.date).toLocaleDateString('ar-SA')}</td>
                                                            <td className="px-6 py-4 text-slate-600">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {item.type === 'invoice' ? 'فاتورة' : item.type === 'payment' ? 'دفعة' : item.type === 'expense' ? 'مصروف' : 'تعديل'}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-navy">{item.description}</td>
                                                            <td className="px-6 py-4 text-slate-500 text-sm">{item.reference}</td>
                                                            <td className="px-6 py-4 text-left font-bold text-navy">
                                                                {item.amount.toLocaleString('ar-SA')} ر.س
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-600">
                                                            <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" aria-hidden="true" />
                                                            <p>لا توجد حركات مالية في هذا الكشف</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy">ملخص الفترة</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">عدد العناصر</span>
                                        <span className="font-bold text-navy">{statement.items?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">المبلغ الإجمالي</span>
                                        <span className="font-bold text-emerald-600">{statement.totalAmount.toLocaleString('ar-SA')} ر.س</span>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                        <span className="font-bold text-navy">الحالة</span>
                                        <Badge variant="outline" className={`
                                            ${statement.status === 'paid' ? 'border-emerald-500 text-emerald-600' : ''}
                                            ${statement.status === 'sent' ? 'border-blue-500 text-blue-600' : ''}
                                            ${statement.status === 'draft' ? 'border-slate-500 text-slate-600' : ''}
                                            ${statement.status === 'archived' ? 'border-slate-400 text-slate-500' : ''}
                                        `}>
                                            {statement.status === 'sent' ? 'تم الإرسال' : statement.status === 'paid' ? 'مدفوع' : statement.status === 'archived' ? 'مؤرشف' : 'مسودة'}
                                        </Badge>
                                    </div>
                                    {statement.notes && (
                                        <div className="border-t border-slate-100 pt-4">
                                            <span className="text-slate-500 text-sm block mb-2">ملاحظات</span>
                                            <p className="text-sm text-slate-700">{statement.notes}</p>
                                        </div>
                                    )}
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
