import { useState } from 'react'
import {
    Save, User, Briefcase, DollarSign, FileText, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useCreateRetainer } from '@/hooks/useAccounting'
import { useClients, useCases } from '@/hooks/useCasesAndClients'
import { ProductivityHero } from '@/components/productivity-hero'

export function CreateRetainerView() {
    const navigate = useNavigate()
    const createRetainerMutation = useCreateRetainer()

    // Load clients and cases from API
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: casesData, isLoading: loadingCases } = useCases()

    const [formData, setFormData] = useState({
        clientId: '',
        caseId: '',
        initialAmount: '',
        minimumBalance: '',
        notes: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const retainerData = {
            clientId: formData.clientId,
            ...(formData.caseId && formData.caseId !== 'none' && { caseId: formData.caseId }),
            initialAmount: Number(formData.initialAmount),
            ...(formData.minimumBalance && { minimumBalance: Number(formData.minimumBalance) }),
            ...(formData.notes && { notes: formData.notes }),
        }

        createRetainerMutation.mutate(retainerData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/finance/retainers' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'حسابات الأمانة', href: '/dashboard/finance/retainers', isActive: true },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: false },
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
                {/* HERO CARD - Full width */}
                <ProductivityHero badge="حسابات الأمانة" title="إنشاء حساب أمانة جديد" type="retainers" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    {/* Client & Case Selection */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" />
                                                العميل <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.clientId}
                                                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                                disabled={loadingClients}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={loadingClients ? "جاري التحميل..." : "اختر العميل"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientsData?.data?.map((client: any) => (
                                                        <SelectItem key={client._id} value={client._id}>
                                                            {client.fullName || client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-emerald-500" />
                                                القضية (اختياري)
                                            </label>
                                            <Select
                                                value={formData.caseId}
                                                onValueChange={(value) => setFormData({ ...formData, caseId: value })}
                                                disabled={loadingCases}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={loadingCases ? "جاري التحميل..." : "اختر القضية"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">بدون قضية</SelectItem>
                                                    {casesData?.data?.map((caseItem: any) => (
                                                        <SelectItem key={caseItem._id} value={caseItem._id}>
                                                            {caseItem.caseNumber} - {caseItem.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Amount Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                المبلغ الأولي <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={formData.initialAmount}
                                                onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                            />
                                            <p className="text-xs text-slate-500">المبلغ الأولي للإيداع في حساب الأمانة</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                الحد الأدنى للرصيد (اختياري)
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={formData.minimumBalance}
                                                onChange={(e) => setFormData({ ...formData, minimumBalance: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                            <p className="text-xs text-slate-500">الحد الأدنى المسموح به للرصيد</p>
                                        </div>
                                    </div>

                                    {/* Information Card */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <div className="flex gap-3">
                                            <div className="shrink-0">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-medium text-blue-900 text-sm">حول حسابات الأمانة</h4>
                                                <p className="text-xs text-blue-700 leading-relaxed">
                                                    حساب الأمانة هو حساب خاص يتم فيه إيداع أموال العميل بشكل مؤقت. يمكن سحب المبالغ من هذا الحساب عند تقديم الخدمات أو إصدار الفواتير. يتم تتبع جميع المعاملات بشكل تلقائي.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            ملاحظات
                                        </label>
                                        <Textarea
                                            placeholder="أدخل أي ملاحظات إضافية حول حساب الأمانة..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {/* Summary Card */}
                                    {formData.initialAmount && (
                                        <div className="bg-emerald-50 rounded-xl p-6 space-y-3">
                                            <h3 className="font-bold text-emerald-900 text-sm mb-4">ملخص حساب الأمانة</h3>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">المبلغ الأولي</span>
                                                <span className="font-medium">{Number(formData.initialAmount).toLocaleString('ar-SA')} ر.س</span>
                                            </div>
                                            {formData.minimumBalance && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">الحد الأدنى للرصيد</span>
                                                    <span className="font-medium">{Number(formData.minimumBalance).toLocaleString('ar-SA')} ر.س</span>
                                                </div>
                                            )}
                                            <hr className="border-emerald-200" />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span className="text-emerald-800">الرصيد الافتتاحي</span>
                                                <span className="text-emerald-600">{Number(formData.initialAmount).toLocaleString('ar-SA')} ر.س</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/finance/retainers">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createRetainerMutation.isPending}
                                    >
                                        {createRetainerMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                حفظ حساب الأمانة
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="retainers" />
                </div>
            </Main>
        </>
    )
}
