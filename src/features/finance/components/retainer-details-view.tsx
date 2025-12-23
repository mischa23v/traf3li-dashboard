import { useState } from 'react'
import {
    ArrowRight, Download, Printer, Plus, Minus,
    Calendar, User, Briefcase, DollarSign,
    AlertCircle, CheckCircle, Clock, Loader2,
    TrendingUp, TrendingDown, Receipt, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useParams } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useRetainer, useRetainerTransactions, useDepositToRetainer, useConsumeFromRetainer } from '@/hooks/useAccounting'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    exhausted: { label: 'مستنفد', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    refunded: { label: 'مسترد', color: 'bg-purple-100 text-purple-700', icon: Receipt },
    closed: { label: 'مغلق', color: 'bg-slate-100 text-slate-700', icon: Clock },
}

export default function RetainerDetailsView() {
    const { retainerId } = useParams({ from: '/_authenticated/dashboard/finance/retainers/$retainerId' })

    const { data: retainerData, isLoading, isError, error } = useRetainer(retainerId)
    const { data: transactionsData, isLoading: isLoadingTransactions } = useRetainerTransactions(retainerId)
    const depositMutation = useDepositToRetainer()
    const consumeMutation = useConsumeFromRetainer()

    const [depositDialogOpen, setDepositDialogOpen] = useState(false)
    const [consumeDialogOpen, setConsumeDialogOpen] = useState(false)

    const [depositForm, setDepositForm] = useState({
        amount: '',
        paymentMethod: 'bank_transfer' as 'cash' | 'bank_transfer' | 'credit_card' | 'check',
        notes: ''
    })

    const [consumeForm, setConsumeForm] = useState({
        amount: '',
        description: '',
        caseId: '',
        invoiceId: ''
    })

    const retainer = retainerData?.data
    const transactions = transactionsData?.data || []

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'عروض الأسعار', href: '/dashboard/finance/quotes', isActive: false },
        { title: 'حسابات الأمانة', href: '/dashboard/finance/retainers', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
    ]

    const formatCurrency = (amount: number, currency: string = 'SAR') => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault()
        depositMutation.mutate({
            id: retainerId,
            data: {
                amount: Number(depositForm.amount),
                paymentMethod: depositForm.paymentMethod,
                notes: depositForm.notes
            }
        }, {
            onSuccess: () => {
                setDepositDialogOpen(false)
                setDepositForm({ amount: '', paymentMethod: 'bank_transfer', notes: '' })
            }
        })
    }

    const handleConsume = async (e: React.FormEvent) => {
        e.preventDefault()
        consumeMutation.mutate({
            id: retainerId,
            data: {
                amount: Number(consumeForm.amount),
                description: consumeForm.description,
                caseId: consumeForm.caseId || undefined,
                invoiceId: consumeForm.invoiceId || undefined
            }
        }, {
            onSuccess: () => {
                setConsumeDialogOpen(false)
                setConsumeForm({ amount: '', description: '', caseId: '', invoiceId: '' })
            }
        })
    }

    // Loading State
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-48" />
                        <Skeleton className="h-[400px] w-full rounded-3xl" />
                    </div>
                </Main>
            </>
        )
    }

    // Error State
    if (isError || !retainer) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Button asChild variant="ghost" className="mb-6">
                            <Link to="/dashboard/finance/retainers">
                                <ArrowRight className="h-4 w-4 ms-2" />
                                العودة لحسابات الأمانة
                            </Link>
                        </Button>
                        <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
                            <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" aria-hidden="true" />
                            <h3 className="text-xl font-bold text-navy mb-2">Failed to Load Retainer Account | فشل تحميل حساب الأمانة</h3>
                            <p className="text-slate-500">{error?.message || 'Retainer account not found | حساب الأمانة غير موجود'}</p>
                        </Card>
                    </div>
                </Main>
            </>
        )
    }

    const status = statusConfig[retainer.status] || statusConfig.active
    const StatusIcon = status.icon
    const balancePercentage = retainer.initialAmount > 0
        ? (retainer.currentBalance / retainer.initialAmount) * 100
        : 0

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* Hero Card */}
                <ProductivityHero
                    badge={`حساب أمانة #${retainer.retainerNumber}`}
                    title={formatCurrency(retainer.currentBalance)}
                    type="retainers"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Back Button & Actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <Button asChild variant="ghost" className="text-slate-600 hover:text-navy">
                                <Link to="/dashboard/finance/retainers">
                                    <ArrowRight className="h-4 w-4 ms-2" />
                                    العودة لحسابات الأمانة
                                </Link>
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Download className="h-4 w-4 ms-2" aria-hidden="true" />
                                    تحميل كشف
                                </Button>
                                <Button variant="outline">
                                    <Printer className="h-4 w-4 ms-2" aria-hidden="true" />
                                    طباعة
                                </Button>
                            </div>
                        </div>

                        {/* Balance Overview */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-brand-blue" />
                                        نظرة عامة على الرصيد
                                    </CardTitle>
                                    <Badge className={status.color}>
                                        <StatusIcon className="h-3 w-3 ms-1" />
                                        {status.label}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">الرصيد الحالي</p>
                                        <p className="text-lg font-bold text-emerald-600">
                                            {formatCurrency(retainer.currentBalance)}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">المبلغ الأولي</p>
                                        <p className="text-lg font-bold text-blue-600">
                                            {formatCurrency(retainer.initialAmount)}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">إجمالي الإيداعات</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            {formatCurrency(retainer.totalDeposits)}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-rose-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">إجمالي السحوبات</p>
                                        <p className="text-lg font-bold text-rose-600">
                                            {formatCurrency(retainer.totalConsumptions)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">نسبة الرصيد المتبقي</span>
                                        <span className="font-medium">{balancePercentage.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={balancePercentage} className="h-3" />
                                </div>

                                {retainer.minimumBalance && retainer.currentBalance <= retainer.minimumBalance && (
                                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                        <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                                        <p className="text-sm text-amber-800">
                                            الرصيد أقل من الحد الأدنى ({formatCurrency(retainer.minimumBalance)})
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Client & Case Info */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <User className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                    معلومات العميل والقضية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">العميل</p>
                                        <p className="font-medium text-navy">
                                            {typeof retainer.clientId === 'object'
                                                ? `${retainer.clientId.firstName || ''} ${retainer.clientId.lastName || ''}`.trim()
                                                : 'غير محدد'}
                                        </p>
                                    </div>
                                    {retainer.caseId && (
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">القضية</p>
                                            <p className="font-medium text-navy">
                                                {typeof retainer.caseId === 'object'
                                                    ? retainer.caseId.caseNumber
                                                    : 'غير محدد'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction History */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                    سجل المعاملات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {isLoadingTransactions ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden="true" />
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-8 text-slate-600">
                                        <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" aria-hidden="true" />
                                        <p className="text-sm">لا توجد معاملات</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {transactions.map((transaction: any) => (
                                            <div key={transaction._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        transaction.type === 'deposit' ? 'bg-emerald-100' :
                                                        transaction.type === 'consumption' ? 'bg-rose-100' :
                                                        'bg-slate-100'
                                                    }`}>
                                                        {transaction.type === 'deposit' ? (
                                                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                                                        ) : (
                                                            <TrendingDown className="h-5 w-5 text-rose-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-navy">{transaction.description}</p>
                                                        <p className="text-xs text-slate-500">{formatDate(transaction.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-start">
                                                    <p className={`font-bold ${
                                                        transaction.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'
                                                    }`}>
                                                        {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        الرصيد: {formatCurrency(transaction.balanceAfter)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {retainer.notes && (
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        ملاحظات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-slate-600 whitespace-pre-wrap">{retainer.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold text-navy">إجراءات سريعة</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                <Button
                                    onClick={() => setDepositDialogOpen(true)}
                                    className="w-full justify-start bg-emerald-500 hover:bg-emerald-600 text-white"
                                    disabled={retainer.status === 'closed'}
                                >
                                    <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                                    إيداع مبلغ
                                </Button>
                                <Button
                                    onClick={() => setConsumeDialogOpen(true)}
                                    variant="outline"
                                    className="w-full justify-start"
                                    disabled={retainer.status === 'closed' || retainer.currentBalance <= 0}
                                >
                                    <Minus className="h-4 w-4 ms-2" />
                                    سحب مبلغ
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                    التواريخ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">تاريخ الإنشاء</p>
                                    <p className="font-medium text-navy">{formatDate(retainer.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">آخر تحديث</p>
                                    <p className="font-medium text-navy">{formatDate(retainer.updatedAt)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Finance Sidebar Widget */}
                        <FinanceSidebar context="retainers" />
                    </div>
                </div>
            </Main>

            {/* Deposit Dialog */}
            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>إيداع مبلغ</DialogTitle>
                        <DialogDescription>
                            إضافة مبلغ جديد إلى حساب الأمانة
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleDeposit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">المبلغ *</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={depositForm.amount}
                                onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                                required
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">طريقة الدفع *</label>
                            <Select
                                value={depositForm.paymentMethod}
                                onValueChange={(value: any) => setDepositForm({ ...depositForm, paymentMethod: value })}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">نقدي</SelectItem>
                                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                                    <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                                    <SelectItem value="check">شيك</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ملاحظات</label>
                            <Textarea
                                placeholder="ملاحظات إضافية..."
                                value={depositForm.notes}
                                onChange={(e) => setDepositForm({ ...depositForm, notes: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDepositDialogOpen(false)}
                            >
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-500 hover:bg-emerald-600"
                                disabled={depositMutation.isPending}
                            >
                                {depositMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        جاري الإيداع...
                                    </span>
                                ) : (
                                    'إيداع'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Consume Dialog */}
            <Dialog open={consumeDialogOpen} onOpenChange={setConsumeDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>سحب مبلغ</DialogTitle>
                        <DialogDescription>
                            سحب مبلغ من حساب الأمانة
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleConsume} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">المبلغ *</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={retainer.currentBalance}
                                placeholder="0.00"
                                value={consumeForm.amount}
                                onChange={(e) => setConsumeForm({ ...consumeForm, amount: e.target.value })}
                                required
                                className="rounded-xl"
                            />
                            <p className="text-xs text-slate-500">
                                الرصيد المتاح: {formatCurrency(retainer.currentBalance)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">الوصف *</label>
                            <Input
                                placeholder="وصف السحب..."
                                value={consumeForm.description}
                                onChange={(e) => setConsumeForm({ ...consumeForm, description: e.target.value })}
                                required
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">رقم القضية (اختياري)</label>
                            <Input
                                placeholder="رقم القضية..."
                                value={consumeForm.caseId}
                                onChange={(e) => setConsumeForm({ ...consumeForm, caseId: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">رقم الفاتورة (اختياري)</label>
                            <Input
                                placeholder="رقم الفاتورة..."
                                value={consumeForm.invoiceId}
                                onChange={(e) => setConsumeForm({ ...consumeForm, invoiceId: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setConsumeDialogOpen(false)}
                            >
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                className="bg-rose-500 hover:bg-rose-600"
                                disabled={consumeMutation.isPending}
                            >
                                {consumeMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        جاري السحب...
                                    </span>
                                ) : (
                                    'سحب'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
