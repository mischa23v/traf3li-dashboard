import { useState, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
    CheckCircle, XCircle, AlertCircle, FileText, Plus, Search, Filter,
    Link as LinkIcon, User, DollarSign, Calendar, ShoppingBag, Receipt,
    ArrowRight, Loader2, Eye, Ban, Bell
} from 'lucide-react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import {
    useCardTransactions,
    useCorporateCard,
    useReconcileTransaction,
    usePotentialMatches,
    useDisputeTransaction,
} from '@/hooks/useCorporateCards'
import { useExpenses } from '@/hooks/useFinance'
import { TRANSACTION_STATUSES, RECONCILIATION_TYPES } from '@/features/finance/types/corporate-card-types'
import type { CardTransaction } from '@/features/finance/types/corporate-card-types'

interface ReconcileDialogState {
    isOpen: boolean
    transaction: CardTransaction | null
}

export function CardReconciliationView() {
    const params = useParams({ from: '/_authenticated/dashboard/finance/corporate-cards/$cardId/reconcile' })
    const cardId = params.cardId
    const navigate = useNavigate()

    const [searchQuery, setSearchQuery] = useState('')
    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
    const [reconcileDialog, setReconcileDialog] = useState<ReconcileDialogState>({ isOpen: false, transaction: null })

    // Reconciliation form state
    const [reconciliationType, setReconciliationType] = useState<'expense_claim' | 'personal' | 'corporate' | 'disputed'>('expense_claim')
    const [selectedExpenseId, setSelectedExpenseId] = useState<string>('')
    const [notes, setNotes] = useState('')
    const [disputeReason, setDisputeReason] = useState('')

    // Fetch data
    const { data: cardData } = useCorporateCard(cardId as string)
    const { data: transactionsData, isLoading: loadingTransactions } = useCardTransactions({
        cardId: cardId as string,
        reconciled: false
    })
    const { data: expensesData } = useExpenses({ limit: 100 })
    const { data: potentialMatches } = usePotentialMatches(selectedTransactionId || '')

    // Mutations
    const reconcileMutation = useReconcileTransaction()
    const disputeMutation = useDisputeTransaction()

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        if (!transactionsData?.transactions) return []

        return transactionsData.transactions.filter(txn => {
            const matchesSearch = txn.merchantName.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === 'all' || txn.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [transactionsData, searchQuery, statusFilter])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' ر.س'
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleReconcile = (transaction: CardTransaction) => {
        setReconcileDialog({ isOpen: true, transaction })
        setSelectedTransactionId(transaction._id)
        setReconciliationType('expense_claim')
        setSelectedExpenseId('')
        setNotes('')
        setDisputeReason('')
    }

    const handleSubmitReconciliation = async () => {
        if (!reconcileDialog.transaction) return

        const data = {
            transactionId: reconcileDialog.transaction._id,
            reconciliationType,
            ...(reconciliationType === 'expense_claim' && selectedExpenseId && { expenseClaimId: selectedExpenseId }),
            ...(notes && { notes }),
            ...(reconciliationType === 'disputed' && disputeReason && { disputeReason }),
        }

        if (reconciliationType === 'disputed') {
            await disputeMutation.mutateAsync({
                transactionId: reconcileDialog.transaction._id,
                reason: disputeReason
            })
        } else {
            await reconcileMutation.mutateAsync(data)
        }

        setReconcileDialog({ isOpen: false, transaction: null })
    }

    const getStatusColor = (status: string) => {
        const statusConfig = TRANSACTION_STATUSES.find(s => s.value === status)
        return statusConfig?.color || 'gray'
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'البطاقات الائتمانية', href: '/dashboard/finance/corporate-cards', isActive: true },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
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
                        <input
                            type="text"
                            placeholder="بحث في المعاملات..."
                            defaultValue={searchQuery}
                            onChange={(e) => debouncedSetSearch(e.target.value)}
                            className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-[1600px] mx-auto space-y-8">
                    {/* Hero Section */}
                    <ProductivityHero
                        badge="التطابق"
                        title={`تطابق معاملات البطاقة: ${cardData?.cardholderName || ''}`}
                        type="reconciliation"
                    />

                    {/* Card Info Banner */}
                    {cardData && (
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <Receipt className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{cardData.cardholderName}</h3>
                                            <p className="text-sm text-slate-600">•••• {cardData.cardNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-left">
                                            <p className="text-sm text-slate-500">المعاملات غير المتطابقة</p>
                                            <p className="text-2xl font-bold text-slate-800">{filteredTransactions.length}</p>
                                        </div>
                                        <Link to={`/dashboard/finance/corporate-cards/${cardId}`}>
                                            <Button variant="outline" className="rounded-xl">
                                                <Eye className="h-4 w-4 ms-2" />
                                                عرض البطاقة
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Filters */}
                    <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] rounded-xl">
                                    <SelectValue placeholder="الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل الحالات</SelectItem>
                                    {TRANSACTION_STATUSES.map(status => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-sm text-slate-600">
                            عرض {filteredTransactions.length} من {transactionsData?.total || 0} معاملة
                        </div>
                    </div>

                    {/* Transactions List */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">المعاملات غير المتطابقة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loadingTransactions ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto" />
                                        <p className="text-slate-500 mt-4">جاري التحميل...</p>
                                    </div>
                                ) : filteredTransactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                        <p className="text-slate-600 font-medium">رائع! جميع المعاملات متطابقة</p>
                                        <p className="text-slate-500 text-sm mt-2">لا توجد معاملات تحتاج إلى تطابق</p>
                                    </div>
                                ) : (
                                    filteredTransactions.map(transaction => {
                                        const statusColor = getStatusColor(transaction.status)
                                        const statusConfig = TRANSACTION_STATUSES.find(s => s.value === transaction.status)

                                        return (
                                            <div key={transaction._id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                                <ShoppingBag className="h-5 w-5 text-slate-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-slate-800">{transaction.merchantName}</h3>
                                                                <p className="text-sm text-slate-500">{transaction.merchantCategory}</p>
                                                            </div>
                                                            <Badge variant="secondary">
                                                                {statusConfig?.label}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(transaction.transactionDate)}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="h-4 w-4" />
                                                                {formatCurrency(transaction.amount)}
                                                            </div>
                                                            {transaction.originalCurrency && transaction.originalCurrency !== transaction.currency && (
                                                                <div className="text-xs text-slate-500">
                                                                    ({formatCurrency(transaction.originalAmount || 0)} {transaction.originalCurrency})
                                                                </div>
                                                            )}
                                                        </div>

                                                        {transaction.notes && (
                                                            <p className="text-sm text-slate-500 mt-2">{transaction.notes}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            onClick={() => handleReconcile(transaction)}
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                                                        >
                                                            <CheckCircle className="h-4 w-4 ms-2" />
                                                            تطابق
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Main>

            {/* Reconciliation Dialog */}
            <Dialog open={reconcileDialog.isOpen} onOpenChange={(open) => setReconcileDialog({ isOpen: open, transaction: null })}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>تطابق المعاملة</DialogTitle>
                        <DialogDescription>
                            اختر كيفية تطابق هذه المعاملة مع سجلاتك
                        </DialogDescription>
                    </DialogHeader>

                    {reconcileDialog.transaction && (
                        <div className="space-y-6 py-4">
                            {/* Transaction Details */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{reconcileDialog.transaction.merchantName}</h4>
                                        <p className="text-sm text-slate-500">{formatDate(reconcileDialog.transaction.transactionDate)}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(reconcileDialog.transaction.amount)}</p>
                                        <p className="text-sm text-slate-500">{reconcileDialog.transaction.currency}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reconciliation Type */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">نوع التطابق</Label>
                                <RadioGroup value={reconciliationType} onValueChange={(value: any) => setReconciliationType(value)}>
                                    {RECONCILIATION_TYPES.map(type => (
                                        <div key={type.value} className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-slate-50">
                                            <RadioGroupItem value={type.value} id={type.value} />
                                            <Label htmlFor={type.value} className="flex-1 cursor-pointer">
                                                {type.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Expense Selection (if expense_claim) */}
                            {reconciliationType === 'expense_claim' && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">اختر المصروف المرتبط</Label>
                                    <Select value={selectedExpenseId} onValueChange={setSelectedExpenseId}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="اختر المصروف..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expensesData?.data?.map((expense: any) => (
                                                <SelectItem key={expense._id} value={expense._id}>
                                                    {expense.description} - {formatCurrency(expense.amount)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Potential Matches */}
                                    {potentialMatches && potentialMatches.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            <Label className="text-sm font-medium text-amber-600">تطابقات محتملة</Label>
                                            {potentialMatches.slice(0, 3).map((match, index) => (
                                                <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100"
                                                    onClick={() => setSelectedExpenseId(match.expenseClaimId)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">تطابق {match.matchType === 'exact' ? 'دقيق' : 'جزئي'}</p>
                                                            <p className="text-xs text-slate-600">نسبة التطابق: {match.matchScore}%</p>
                                                        </div>
                                                        <Badge variant="secondary">{match.matchScore}%</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <Button variant="outline" className="w-full rounded-xl" asChild>
                                        <Link to="/dashboard/finance/expenses/new">
                                            <Plus className="h-4 w-4 ms-2" />
                                            إنشاء مصروف جديد من هذه المعاملة
                                        </Link>
                                    </Button>
                                </div>
                            )}

                            {/* Dispute Reason (if disputed) */}
                            {reconciliationType === 'disputed' && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">سبب الاعتراض</Label>
                                    <Textarea
                                        value={disputeReason}
                                        onChange={(e) => setDisputeReason(e.target.value)}
                                        placeholder="اكتب سبب الاعتراض على هذه المعاملة..."
                                        className="rounded-xl min-h-[100px]"
                                    />
                                </div>
                            )}

                            {/* Notes */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">ملاحظات (اختياري)</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="أضف أي ملاحظات إضافية..."
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReconcileDialog({ isOpen: false, transaction: null })}
                            className="rounded-xl"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleSubmitReconciliation}
                            disabled={reconcileMutation.isPending || disputeMutation.isPending}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                        >
                            {(reconcileMutation.isPending || disputeMutation.isPending) ? (
                                <>
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 ms-2" />
                                    تأكيد التطابق
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
