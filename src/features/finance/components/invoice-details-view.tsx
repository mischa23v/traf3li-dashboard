import { useState } from 'react'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, ArrowLeft, Briefcase,
    History, Link as LinkIcon, Flag, Send, Eye, Download, Search, Bell,
    CreditCard, DollarSign, CheckCircle2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function InvoiceDetailsView() {
    const [activeTab, setActiveTab] = useState('details')

    // Mock Data for a single invoice
    const invoice = {
        id: 'INV-2024-001',
        client: 'شركة الإنشاءات المتقدمة',
        amount: '15,000.00',
        currency: 'SAR',
        status: 'pending',
        issueDate: '2024-11-20',
        dueDate: '2024-12-20',
        items: [
            { description: 'استشارات قانونية - عقد تأسيس', quantity: 1, rate: '5,000.00', amount: '5,000.00' },
            { description: 'تمثيل قضائي - قضية رقم 402', quantity: 1, rate: '10,000.00', amount: '10,000.00' }
        ],
        history: [
            { date: '2024-11-20', action: 'تم إنشاء الفاتورة', user: 'النظام' },
            { date: '2024-11-20', action: 'تم إرسال الفاتورة للعميل', user: 'أحمد المحامي' }
        ]
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center space-x-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
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
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/finance/invoices" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        العودة إلى الفواتير
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
                                    <FileText className="h-6 w-6" />
                                </div>
                                <span className="text-emerald-100 font-medium">فاتورة ضريبية</span>
                                <span className="text-white/20">•</span>
                                <Badge variant="outline" className="mr-2 border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                    {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'pending' ? 'قيد الانتظار' : 'متأخرة'}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold mb-4 leading-tight text-white">
                                {invoice.id}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-emerald-400" />
                                    <span>العميل: <span className="text-white font-medium">{invoice.client}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-emerald-400" />
                                    <span>تاريخ الإصدار: <span className="text-white font-medium">{invoice.issueDate}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-emerald-400" />
                                    <span>تاريخ الاستحقاق: <span className="text-white font-medium">{invoice.dueDate}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[250px]">
                            <div className="text-left lg:text-left">
                                <div className="text-slate-300 text-sm mb-1">الإجمالي المستحق</div>
                                <div className="text-3xl font-bold text-white">{invoice.amount} <span className="text-lg text-emerald-400">{invoice.currency}</span></div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                    <Download className="h-4 w-4 ml-2" />
                                    تحميل PDF
                                </Button>
                                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0">
                                    <Send className="h-4 w-4 ml-2" />
                                    إرسال
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
                                    <CardTitle className="text-lg font-bold text-navy">بنود الفاتورة</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-right">
                                            <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
                                                <tr>
                                                    <th className="px-6 py-4">الوصف</th>
                                                    <th className="px-6 py-4 text-center">الكمية</th>
                                                    <th className="px-6 py-4 text-center">السعر</th>
                                                    <th className="px-6 py-4 text-left">المجموع</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {invoice.items.map((item, index) => (
                                                    <tr key={index} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-medium text-navy">{item.description}</td>
                                                        <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                                                        <td className="px-6 py-4 text-center text-slate-600">{item.rate}</td>
                                                        <td className="px-6 py-4 text-left font-bold text-navy">{item.amount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-slate-50">
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 font-bold text-navy text-left">الإجمالي</td>
                                                    <td className="px-6 py-4 font-bold text-emerald-600 text-left text-lg">{invoice.amount} {invoice.currency}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <History className="h-5 w-5 text-brand-blue" />
                                        سجل النشاط
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[300px]">
                                        <div className="relative p-6">
                                            <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>
                                            <div className="space-y-8 relative">
                                                {invoice.history.map((event, i) => (
                                                    <div key={i} className="flex gap-4 relative">
                                                        <div className="w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white bg-blue-500"></div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-bold text-navy">{event.action}</div>
                                                            <div className="text-xs text-slate-500 mb-1">{event.date} • {event.user}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
