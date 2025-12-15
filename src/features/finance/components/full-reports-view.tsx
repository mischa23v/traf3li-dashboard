import { useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    FileText, Download, Printer, Calendar, Building2, TrendingUp, TrendingDown,
    Receipt, CreditCard, Clock, DollarSign, PieChart, BarChart3, Users,
    ChevronLeft, ChevronRight, Search, Bell, Filter, Loader2, CheckCircle,
    AlertCircle, Wallet, FileSpreadsheet, Scale, Target, Truck, UserCheck,
    Briefcase, LineChart, Layers, Megaphone, Zap, Timer, UserCog, XCircle,
    GitBranch, Hourglass
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'
import { useCompanySettings } from '@/hooks/useBillingSettings'
import {
    useProfitLossReport,
    useBalanceSheetReport,
    useTrialBalanceReport,
    useARAgingReport,
    useCaseProfitabilityReport,
} from '@/hooks/useAccounting'
import { formatSAR } from '@/lib/currency'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfQuarter, endOfQuarter, subMonths } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'

// Report Types
type ReportType =
    | 'profit-loss'
    | 'balance-sheet'
    | 'cash-flow'
    | 'trial-balance'
    | 'budget-variance'
    | 'gross-profit'
    | 'cost-center'
    | 'aged-receivables'
    | 'client-statement'
    | 'invoice-summary'
    | 'ap-aging'
    | 'vendor-ledger'
    | 'expense-summary'
    | 'timesheet-summary'
    | 'vat-report'
    | 'campaign-efficiency'
    | 'lead-owner-efficiency'
    | 'first-response-time'
    | 'lost-opportunity-analysis'
    | 'sales-pipeline-analytics'
    | 'prospects-engaged-not-converted'
    | 'lead-conversion-time'

interface ReportConfig {
    id: ReportType
    nameAr: string
    nameEn: string
    descriptionAr: string
    descriptionEn: string
    icon: React.ReactNode
    color: string
    bgColor: string
    category: 'core' | 'invoices' | 'payables' | 'expenses' | 'time' | 'tax' | 'analytics' | 'crm'
}

const reportConfigs: ReportConfig[] = [
    {
        id: 'profit-loss',
        nameAr: 'قائمة الدخل',
        nameEn: 'Profit & Loss',
        descriptionAr: 'تقرير شامل للإيرادات والمصروفات وصافي الربح',
        descriptionEn: 'Comprehensive income, expenses and net profit report',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        category: 'core'
    },
    {
        id: 'balance-sheet',
        nameAr: 'الميزانية العمومية',
        nameEn: 'Balance Sheet',
        descriptionAr: 'قائمة المركز المالي (الأصول والخصوم وحقوق الملكية)',
        descriptionEn: 'Statement of financial position (assets, liabilities, equity)',
        icon: <Scale className="w-5 h-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        category: 'core'
    },
    {
        id: 'trial-balance',
        nameAr: 'ميزان المراجعة',
        nameEn: 'Trial Balance',
        descriptionAr: 'قائمة بجميع الحسابات وأرصدتها المدينة والدائنة',
        descriptionEn: 'List of all accounts with debit and credit balances',
        icon: <FileSpreadsheet className="w-5 h-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        category: 'core'
    },
    {
        id: 'aged-receivables',
        nameAr: 'تقاعد الذمم المدينة',
        nameEn: 'Aged Receivables',
        descriptionAr: 'تحليل المستحقات حسب فترات التأخير',
        descriptionEn: 'Receivables analysis by aging periods',
        icon: <Clock className="w-5 h-5" aria-hidden="true" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        category: 'invoices'
    },
    {
        id: 'invoice-summary',
        nameAr: 'ملخص الفواتير',
        nameEn: 'Invoice Summary',
        descriptionAr: 'ملخص شامل للفواتير المصدرة والمحصلة',
        descriptionEn: 'Summary of issued and collected invoices',
        icon: <Receipt className="w-5 h-5" aria-hidden="true" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        category: 'invoices'
    },
    {
        id: 'expense-summary',
        nameAr: 'ملخص المصروفات',
        nameEn: 'Expense Summary',
        descriptionAr: 'تقرير تفصيلي للمصروفات حسب الفئة',
        descriptionEn: 'Detailed expense report by category',
        icon: <CreditCard className="w-5 h-5" aria-hidden="true" />,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        category: 'expenses'
    },
    {
        id: 'timesheet-summary',
        nameAr: 'ملخص الوقت',
        nameEn: 'Timesheet Summary',
        descriptionAr: 'تقرير ساعات العمل والفوترة',
        descriptionEn: 'Working hours and billing report',
        icon: <Clock className="w-5 h-5" aria-hidden="true" />,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        category: 'time'
    },
    {
        id: 'vat-report',
        nameAr: 'تقرير ضريبة القيمة المضافة',
        nameEn: 'VAT Report',
        descriptionAr: 'تقرير الضريبة للفترة المحددة',
        descriptionEn: 'Tax report for the selected period',
        icon: <DollarSign className="w-5 h-5" aria-hidden="true" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        category: 'tax'
    },
    // New ERPNext-equivalent reports
    {
        id: 'budget-variance',
        nameAr: 'تحليل انحراف الميزانية',
        nameEn: 'Budget Variance',
        descriptionAr: 'مقارنة المبالغ المدرجة في الميزانية مع الفعلية',
        descriptionEn: 'Compare budgeted vs actual amounts',
        icon: <Target className="w-5 h-5" aria-hidden="true" />,
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
        category: 'analytics'
    },
    {
        id: 'gross-profit',
        nameAr: 'إجمالي الربح',
        nameEn: 'Gross Profit',
        descriptionAr: 'تحليل الربحية حسب العميل أو القضية أو الشهر',
        descriptionEn: 'Profitability analysis by client, case, or month',
        icon: <LineChart className="w-5 h-5" aria-hidden="true" />,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        category: 'analytics'
    },
    {
        id: 'cost-center',
        nameAr: 'مراكز التكلفة',
        nameEn: 'Cost Center',
        descriptionAr: 'قائمة الدخل حسب القسم أو القضية',
        descriptionEn: 'P&L by department or case',
        icon: <Layers className="w-5 h-5" aria-hidden="true" />,
        color: 'text-sky-600',
        bgColor: 'bg-sky-50',
        category: 'analytics'
    },
    {
        id: 'client-statement',
        nameAr: 'كشف حساب العميل',
        nameEn: 'Client Statement',
        descriptionAr: 'دفتر أستاذ العميل / كشف الحساب',
        descriptionEn: 'Customer ledger / Statement of account',
        icon: <UserCheck className="w-5 h-5" aria-hidden="true" />,
        color: 'text-fuchsia-600',
        bgColor: 'bg-fuchsia-50',
        category: 'invoices'
    },
    {
        id: 'ap-aging',
        nameAr: 'تقادم الذمم الدائنة',
        nameEn: 'AP Aging',
        descriptionAr: 'تحليل المستحقات للموردين حسب فترات التأخير',
        descriptionEn: 'Accounts Payable aging analysis',
        icon: <Truck className="w-5 h-5" aria-hidden="true" />,
        color: 'text-lime-600',
        bgColor: 'bg-lime-50',
        category: 'payables'
    },
    {
        id: 'vendor-ledger',
        nameAr: 'دفتر أستاذ المورد',
        nameEn: 'Vendor Ledger',
        descriptionAr: 'كشف حساب المورد / دفتر الأستاذ',
        descriptionEn: 'Supplier statement / ledger',
        icon: <Briefcase className="w-5 h-5" aria-hidden="true" />,
        color: 'text-stone-600',
        bgColor: 'bg-stone-50',
        category: 'payables'
    },
    // CRM Reports
    {
        id: 'campaign-efficiency',
        nameAr: 'تقرير كفاءة الحملات',
        nameEn: 'Campaign Efficiency Report',
        descriptionAr: 'تحليل أداء الحملات التسويقية ومعدل التحويل',
        descriptionEn: 'Analyze marketing campaign performance and conversion rates',
        icon: <Megaphone className="w-5 h-5" aria-hidden="true" />,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        category: 'crm'
    },
    {
        id: 'lead-owner-efficiency',
        nameAr: 'تقرير كفاءة مسؤول العملاء المحتملين',
        nameEn: 'Lead Owner Efficiency Report',
        descriptionAr: 'تقييم أداء مسؤولي المبيعات في إدارة العملاء المحتملين',
        descriptionEn: 'Evaluate sales team performance in managing leads',
        icon: <UserCog className="w-5 h-5" aria-hidden="true" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        category: 'crm'
    },
    {
        id: 'first-response-time',
        nameAr: 'تقرير وقت الاستجابة الأول',
        nameEn: 'First Response Time Report',
        descriptionAr: 'قياس سرعة الاستجابة الأولى للعملاء المحتملين',
        descriptionEn: 'Measure first response time to leads',
        icon: <Timer className="w-5 h-5" aria-hidden="true" />,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        category: 'crm'
    },
    {
        id: 'lost-opportunity-analysis',
        nameAr: 'تقرير تحليل الفرص الضائعة',
        nameEn: 'Lost Opportunity Analysis Report',
        descriptionAr: 'تحليل أسباب خسارة الفرص البيعية',
        descriptionEn: 'Analyze reasons for lost sales opportunities',
        icon: <XCircle className="w-5 h-5" aria-hidden="true" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        category: 'crm'
    },
    {
        id: 'sales-pipeline-analytics',
        nameAr: 'تقرير تحليل مسار المبيعات',
        nameEn: 'Sales Pipeline Analytics Report',
        descriptionAr: 'تحليل شامل لمراحل مسار المبيعات ومعدلات التحويل',
        descriptionEn: 'Comprehensive analysis of sales pipeline stages and conversion rates',
        icon: <GitBranch className="w-5 h-5" aria-hidden="true" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        category: 'crm'
    },
    {
        id: 'prospects-engaged-not-converted',
        nameAr: 'تقرير العملاء المحتملين المتفاعلين غير المحولين',
        nameEn: 'Prospects Engaged Not Converted Report',
        descriptionAr: 'تتبع العملاء المحتملين الذين تفاعلوا لكن لم يتحولوا',
        descriptionEn: 'Track engaged prospects who have not converted',
        icon: <Users className="w-5 h-5" aria-hidden="true" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        category: 'crm'
    },
    {
        id: 'lead-conversion-time',
        nameAr: 'تقرير وقت تحويل العملاء المحتملين',
        nameEn: 'Lead Conversion Time Report',
        descriptionAr: 'قياس المدة الزمنية من العميل المحتمل إلى العميل الفعلي',
        descriptionEn: 'Measure time taken from lead to customer conversion',
        icon: <Hourglass className="w-5 h-5" aria-hidden="true" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        category: 'crm'
    },
]

type PeriodType = 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'custom'

export function FullReportsView() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const dateLocale = isRTL ? arSA : enUS
    const reportRef = useRef<HTMLDivElement>(null)

    // State
    const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
    const [period, setPeriod] = useState<PeriodType>('this-month')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    // Calculate date ranges
    const dateRange = useMemo(() => {
        const now = new Date()
        switch (period) {
            case 'this-month':
                return {
                    start: format(startOfMonth(now), 'yyyy-MM-dd'),
                    end: format(endOfMonth(now), 'yyyy-MM-dd')
                }
            case 'last-month':
                const lastMonth = subMonths(now, 1)
                return {
                    start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
                    end: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
                }
            case 'this-quarter':
                return {
                    start: format(startOfQuarter(now), 'yyyy-MM-dd'),
                    end: format(endOfQuarter(now), 'yyyy-MM-dd')
                }
            case 'this-year':
                return {
                    start: format(startOfYear(now), 'yyyy-MM-dd'),
                    end: format(endOfYear(now), 'yyyy-MM-dd')
                }
            case 'custom':
                return {
                    start: customStartDate || format(startOfMonth(now), 'yyyy-MM-dd'),
                    end: customEndDate || format(endOfMonth(now), 'yyyy-MM-dd')
                }
            default:
                return {
                    start: format(startOfMonth(now), 'yyyy-MM-dd'),
                    end: format(endOfMonth(now), 'yyyy-MM-dd')
                }
        }
    }, [period, customStartDate, customEndDate])

    // Fetch company settings
    const { data: companyData, isLoading: isCompanyLoading } = useCompanySettings()

    // Fetch report data based on selected report
    const { data: profitLossData, isLoading: isPLLoading } = useProfitLossReport(
        dateRange.start,
        dateRange.end
    )
    const { data: balanceSheetData, isLoading: isBalanceLoading } = useBalanceSheetReport()
    const { data: trialBalanceData, isLoading: isTrialLoading } = useTrialBalanceReport()
    const { data: arAgingData, isLoading: isAgingLoading } = useARAgingReport()

    const isLoading = isPLLoading || isBalanceLoading || isTrialLoading || isAgingLoading || isCompanyLoading

    // Filter reports by search
    const filteredReports = useMemo(() => {
        if (!searchQuery) return reportConfigs
        const query = searchQuery.toLowerCase()
        return reportConfigs.filter(r =>
            r.nameAr.includes(query) ||
            r.nameEn.toLowerCase().includes(query) ||
            r.descriptionAr.includes(query) ||
            r.descriptionEn.toLowerCase().includes(query)
        )
    }, [searchQuery])

    // Group reports by category
    const reportsByCategory = useMemo(() => {
        return {
            core: filteredReports.filter(r => r.category === 'core'),
            analytics: filteredReports.filter(r => r.category === 'analytics'),
            invoices: filteredReports.filter(r => r.category === 'invoices'),
            payables: filteredReports.filter(r => r.category === 'payables'),
            expenses: filteredReports.filter(r => r.category === 'expenses'),
            time: filteredReports.filter(r => r.category === 'time'),
            tax: filteredReports.filter(r => r.category === 'tax'),
            crm: filteredReports.filter(r => r.category === 'crm'),
        }
    }, [filteredReports])

    const formatCurrency = (amount: number) => {
        return formatSAR(amount / 100)
    }

    // Print handler
    const handlePrint = () => {
        const printContent = reportRef.current
        if (!printContent) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const styles = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'IBM Plex Sans Arabic', sans-serif;
                    direction: ${isRTL ? 'rtl' : 'ltr'};
                    padding: 40px;
                    background: white;
                    color: #1e293b;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 32px;
                    padding-bottom: 24px;
                    border-bottom: 2px solid #e2e8f0;
                }

                .company-info {
                    flex: 1;
                }

                .company-logo {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    margin-bottom: 12px;
                }

                .company-name {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 4px;
                }

                .company-details {
                    font-size: 11px;
                    color: #64748b;
                }

                .report-title {
                    text-align: ${isRTL ? 'left' : 'right'};
                }

                .report-title h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 8px;
                }

                .report-period {
                    font-size: 12px;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 6px 12px;
                    border-radius: 8px;
                    display: inline-block;
                }

                .report-content {
                    margin-top: 24px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 16px 0;
                }

                th, td {
                    padding: 12px 16px;
                    text-align: ${isRTL ? 'right' : 'left'};
                    border-bottom: 1px solid #e2e8f0;
                }

                th {
                    background: #f8fafc;
                    font-weight: 600;
                    color: #475569;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                tr:hover {
                    background: #f8fafc;
                }

                .amount {
                    text-align: ${isRTL ? 'left' : 'right'};
                    font-weight: 600;
                    font-family: 'IBM Plex Sans Arabic', monospace;
                }

                .amount.positive {
                    color: #059669;
                }

                .amount.negative {
                    color: #dc2626;
                }

                .section-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 24px 0 12px;
                    padding: 8px 12px;
                    background: #f1f5f9;
                    border-radius: 6px;
                }

                .total-row {
                    font-weight: 700;
                    background: #f8fafc !important;
                    border-top: 2px solid #e2e8f0;
                }

                .grand-total {
                    font-size: 16px;
                    color: #0f172a;
                    background: #e0f2fe !important;
                }

                .report-footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: #94a3b8;
                }

                @media print {
                    body {
                        padding: 20px;
                    }

                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                }
            </style>
        `

        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="${isRTL ? 'rtl' : 'ltr'}">
            <head>
                <meta charset="utf-8">
                <title>${isRTL ? 'تقرير مالي' : 'Financial Report'}</title>
                ${styles}
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `)

        printWindow.document.close()
        printWindow.focus()

        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }

    const topNav = [
        { title: isRTL ? 'نظرة عامة' : 'Overview', href: '/dashboard/finance/overview', isActive: false },
        { title: isRTL ? 'الفواتير' : 'Invoices', href: '/dashboard/finance/invoices', isActive: false },
        { title: isRTL ? 'المصروفات' : 'Expenses', href: '/dashboard/finance/expenses', isActive: false },
        { title: isRTL ? 'التقارير الكاملة' : 'Full Reports', href: '/dashboard/finance/full-reports', isActive: true },
    ]

    // Get selected report config
    const selectedReportConfig = reportConfigs.find(r => r.id === selectedReport)

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-2 sm:gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder={isRTL ? "بحث..." : "Search..."} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label={isRTL ? "الإشعارات" : "Notifications"}>
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
                <ProductivityHero
                    badge={isRTL ? "التقارير المالية" : "Financial Reports"}
                    title={isRTL ? "التقارير الكاملة" : "Full Reports"}
                    type="finance-reports"
                    listMode={!selectedReport}
                >
                    {selectedReport && (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedReport(null)}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-10 px-5 backdrop-blur-sm"
                            >
                                <ChevronRight className="w-4 h-4 ms-2 rtl:rotate-180" aria-hidden="true" />
                                {isRTL ? 'رجوع' : 'Back'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-10 px-5 backdrop-blur-sm"
                            >
                                <Printer className="w-4 h-4 ms-2" aria-hidden="true" />
                                {isRTL ? 'طباعة PDF' : 'Print PDF'}
                            </Button>
                        </div>
                    )}
                </ProductivityHero>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">

                        {/* Report Selection or Report View */}
                        {!selectedReport ? (
                            <>
                                {/* Period Selector */}
                                <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-slate-500" aria-hidden="true" />
                                                <span className="text-sm font-bold text-navy">
                                                    {isRTL ? 'الفترة المالية:' : 'Financial Period:'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
                                                    <SelectTrigger className="w-[180px] rounded-xl">
                                                        <SelectValue placeholder={isRTL ? "اختر الفترة" : "Select period"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="this-month">{isRTL ? 'هذا الشهر' : 'This Month'}</SelectItem>
                                                        <SelectItem value="last-month">{isRTL ? 'الشهر الماضي' : 'Last Month'}</SelectItem>
                                                        <SelectItem value="this-quarter">{isRTL ? 'هذا الربع' : 'This Quarter'}</SelectItem>
                                                        <SelectItem value="this-year">{isRTL ? 'هذه السنة' : 'This Year'}</SelectItem>
                                                        <SelectItem value="custom">{isRTL ? 'فترة مخصصة' : 'Custom Period'}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {period === 'custom' && (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="date"
                                                            value={customStartDate}
                                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                                            className="h-10 px-3 rounded-xl"
                                                        />
                                                        <span className="text-slate-500">{isRTL ? 'إلى' : 'to'}</span>
                                                        <Input
                                                            type="date"
                                                            value={customEndDate}
                                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                                            className="h-10 px-3 rounded-xl"
                                                        />
                                                    </div>
                                                )}
                                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 px-3">
                                                    {format(new Date(dateRange.start), 'dd/MM/yyyy')} - {format(new Date(dateRange.end), 'dd/MM/yyyy')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Search */}
                                <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="relative">
                                            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                                            <Input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder={isRTL ? "البحث عن تقرير..." : "Search for a report..."}
                                                className="pe-10 rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Core Financial Reports */}
                                {reportsByCategory.core.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                                            {isRTL ? 'التقارير المالية الأساسية' : 'Core Financial Reports'}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reportsByCategory.core.map((report) => (
                                                <Card
                                                    key={report.id}
                                                    className={`border-0 shadow-sm rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ${report.bgColor} group`}
                                                    onClick={() => setSelectedReport(report.id)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-2xl bg-white/80 ${report.color} group-hover:scale-110 transition-transform`}>
                                                                {report.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                                                                    {isRTL ? report.nameAr : report.nameEn}
                                                                </h3>
                                                                <p className="text-sm text-slate-600">
                                                                    {isRTL ? report.descriptionAr : report.descriptionEn}
                                                                </p>
                                                            </div>
                                                            <ChevronLeft className={`w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors ${isRTL ? '' : 'rotate-180'}`} aria-hidden="true" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Analytics Reports */}
                                {reportsByCategory.analytics.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                                            <LineChart className="w-5 h-5 text-violet-600" aria-hidden="true" />
                                            {isRTL ? 'تقارير التحليلات' : 'Analytics Reports'}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reportsByCategory.analytics.map((report) => (
                                                <Card
                                                    key={report.id}
                                                    className={`border-0 shadow-sm rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ${report.bgColor} group`}
                                                    onClick={() => setSelectedReport(report.id)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-2xl bg-white/80 ${report.color} group-hover:scale-110 transition-transform`}>
                                                                {report.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                                                                    {isRTL ? report.nameAr : report.nameEn}
                                                                </h3>
                                                                <p className="text-sm text-slate-600">
                                                                    {isRTL ? report.descriptionAr : report.descriptionEn}
                                                                </p>
                                                            </div>
                                                            <ChevronLeft className={`w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors ${isRTL ? '' : 'rotate-180'}`} aria-hidden="true" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Invoice Reports */}
                                {reportsByCategory.invoices.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Receipt className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                                            {isRTL ? 'تقارير الفواتير والذمم المدينة' : 'Receivables Reports'}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reportsByCategory.invoices.map((report) => (
                                                <Card
                                                    key={report.id}
                                                    className={`border-0 shadow-sm rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ${report.bgColor} group`}
                                                    onClick={() => setSelectedReport(report.id)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-2xl bg-white/80 ${report.color} group-hover:scale-110 transition-transform`}>
                                                                {report.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                                                                    {isRTL ? report.nameAr : report.nameEn}
                                                                </h3>
                                                                <p className="text-sm text-slate-600">
                                                                    {isRTL ? report.descriptionAr : report.descriptionEn}
                                                                </p>
                                                            </div>
                                                            <ChevronLeft className={`w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors ${isRTL ? '' : 'rotate-180'}`} aria-hidden="true" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Payables Reports */}
                                {reportsByCategory.payables.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-lime-600" aria-hidden="true" />
                                            {isRTL ? 'تقارير الذمم الدائنة' : 'Payables Reports'}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reportsByCategory.payables.map((report) => (
                                                <Card
                                                    key={report.id}
                                                    className={`border-0 shadow-sm rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ${report.bgColor} group`}
                                                    onClick={() => setSelectedReport(report.id)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-2xl bg-white/80 ${report.color} group-hover:scale-110 transition-transform`}>
                                                                {report.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                                                                    {isRTL ? report.nameAr : report.nameEn}
                                                                </h3>
                                                                <p className="text-sm text-slate-600">
                                                                    {isRTL ? report.descriptionAr : report.descriptionEn}
                                                                </p>
                                                            </div>
                                                            <ChevronLeft className={`w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors ${isRTL ? '' : 'rotate-180'}`} aria-hidden="true" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Expense Reports */}
                                {reportsByCategory.expenses.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-rose-600" aria-hidden="true" />
                                            {isRTL ? 'تقارير المصروفات' : 'Expense Reports'}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reportsByCategory.expenses.map((report) => (
                                                <Card
                                                    key={report.id}
                                                    className={`border-0 shadow-sm rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ${report.bgColor} group`}
                                                    onClick={() => setSelectedReport(report.id)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-2xl bg-white/80 ${report.color} group-hover:scale-110 transition-transform`}>
                                                                {report.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                                                                    {isRTL ? report.nameAr : report.nameEn}
                                                                </h3>
                                                                <p className="text-sm text-slate-600">
                                                                    {isRTL ? report.descriptionAr : report.descriptionEn}
                                                                </p>
                                                            </div>
                                                            <ChevronLeft className={`w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors ${isRTL ? '' : 'rotate-180'}`} aria-hidden="true" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Time Reports */}
                                {reportsByCategory.time.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-cyan-600" aria-hidden="true" />
                                            {isRTL ? 'تقارير الوقت' : 'Time Reports'}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reportsByCategory.time.map((report) => (
                                                <Card
                                                    key={report.id}
                                                    className={`border-0 shadow-sm rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ${report.bgColor} group`}
                                                    onClick={() => setSelectedReport(report.id)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-2xl bg-white/80 ${report.color} group-hover:scale-110 transition-transform`}>
                                                                {report.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                                                                    {isRTL ? report.nameAr : report.nameEn}
                                                                </h3>
                                                                <p className="text-sm text-slate-600">
                                                                    {isRTL ? report.descriptionAr : report.descriptionEn}
                                                                </p>
                                                            </div>
                                                            <ChevronLeft className={`w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors ${isRTL ? '' : 'rotate-180'}`} aria-hidden="true" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tax Reports */}
                                {reportsByCategory.tax.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-orange-600" aria-hidden="true" />
                                            {isRTL ? 'تقارير الضرائب' : 'Tax Reports'}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reportsByCategory.tax.map((report) => (
                                                <Card
                                                    key={report.id}
                                                    className={`border-0 shadow-sm rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ${report.bgColor} group`}
                                                    onClick={() => setSelectedReport(report.id)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-2xl bg-white/80 ${report.color} group-hover:scale-110 transition-transform`}>
                                                                {report.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                                                                    {isRTL ? report.nameAr : report.nameEn}
                                                                </h3>
                                                                <p className="text-sm text-slate-600">
                                                                    {isRTL ? report.descriptionAr : report.descriptionEn}
                                                                </p>
                                                            </div>
                                                            <ChevronLeft className={`w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors ${isRTL ? '' : 'rotate-180'}`} aria-hidden="true" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CRM Reports */}
                                {reportsByCategory.crm.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Megaphone className="w-5 h-5 text-pink-600" aria-hidden="true" />
                                            {isRTL ? 'تقارير إدارة علاقات العملاء' : 'CRM Reports'}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reportsByCategory.crm.map((report) => (
                                                <Card
                                                    key={report.id}
                                                    className={`border-0 shadow-sm rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ${report.bgColor} group`}
                                                    onClick={() => setSelectedReport(report.id)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-2xl bg-white/80 ${report.color} group-hover:scale-110 transition-transform`}>
                                                                {report.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                                                                    {isRTL ? report.nameAr : report.nameEn}
                                                                </h3>
                                                                <p className="text-sm text-slate-600">
                                                                    {isRTL ? report.descriptionAr : report.descriptionEn}
                                                                </p>
                                                            </div>
                                                            <ChevronLeft className={`w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors ${isRTL ? '' : 'rotate-180'}`} aria-hidden="true" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Report View */
                            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                                <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl font-bold text-navy flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${selectedReportConfig?.bgColor}`}>
                                                <span className={selectedReportConfig?.color}>
                                                    {selectedReportConfig?.icon}
                                                </span>
                                            </div>
                                            {isRTL ? selectedReportConfig?.nameAr : selectedReportConfig?.nameEn}
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 px-3">
                                            {format(new Date(dateRange.start), 'dd/MM/yyyy')} - {format(new Date(dateRange.end), 'dd/MM/yyyy')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    {isLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-3/4" />
                                        </div>
                                    ) : (
                                        /* Print-ready report content */
                                        <div ref={reportRef} className="report-container">
                                            {/* Report Header for Print */}
                                            <div className="report-header flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-200 print:block">
                                                <div className="company-info">
                                                    {companyData?.logo && (
                                                        <img
                                                            src={companyData.logo}
                                                            alt="Company Logo"
                                                            className="company-logo w-20 h-20 object-contain mb-3"
                                                        />
                                                    )}
                                                    <h2 className="company-name text-xl font-bold text-navy">
                                                        {isRTL ? companyData?.nameAr || companyData?.name : companyData?.name || 'Company Name'}
                                                    </h2>
                                                    <div className="company-details text-sm text-slate-500 space-y-1">
                                                        {companyData?.address && <p>{isRTL ? companyData.addressAr || companyData.address : companyData.address}</p>}
                                                        {companyData?.phone && <p>{companyData.phone}</p>}
                                                        {companyData?.vatNumber && (
                                                            <p>{isRTL ? 'الرقم الضريبي: ' : 'VAT: '}{companyData.vatNumber}</p>
                                                        )}
                                                        {companyData?.crNumber && (
                                                            <p>{isRTL ? 'السجل التجاري: ' : 'CR: '}{companyData.crNumber}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`report-title ${isRTL ? 'text-left' : 'text-right'}`}>
                                                    <h1 className="text-2xl font-bold text-navy mb-2">
                                                        {isRTL ? selectedReportConfig?.nameAr : selectedReportConfig?.nameEn}
                                                    </h1>
                                                    <div className="report-period inline-block bg-slate-100 px-3 py-1 rounded-lg text-sm text-slate-600">
                                                        {format(new Date(dateRange.start), 'dd/MM/yyyy')} - {format(new Date(dateRange.end), 'dd/MM/yyyy')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Report Content based on type */}
                                            <div className="report-content">
                                                {selectedReport === 'profit-loss' && profitLossData && (
                                                    <ProfitLossContent data={profitLossData} isRTL={isRTL} formatCurrency={formatCurrency} />
                                                )}
                                                {selectedReport === 'balance-sheet' && balanceSheetData && (
                                                    <BalanceSheetContent data={balanceSheetData} isRTL={isRTL} formatCurrency={formatCurrency} />
                                                )}
                                                {selectedReport === 'trial-balance' && trialBalanceData && (
                                                    <TrialBalanceContent data={trialBalanceData} isRTL={isRTL} formatCurrency={formatCurrency} />
                                                )}
                                                {selectedReport === 'aged-receivables' && arAgingData && (
                                                    <AgedReceivablesContent data={arAgingData} isRTL={isRTL} formatCurrency={formatCurrency} />
                                                )}
                                                {(selectedReport === 'invoice-summary' || selectedReport === 'expense-summary' ||
                                                  selectedReport === 'timesheet-summary' || selectedReport === 'vat-report' ||
                                                  selectedReport === 'budget-variance' || selectedReport === 'gross-profit' ||
                                                  selectedReport === 'cost-center' || selectedReport === 'client-statement' ||
                                                  selectedReport === 'ap-aging' || selectedReport === 'vendor-ledger' ||
                                                  selectedReport === 'campaign-efficiency' || selectedReport === 'lead-owner-efficiency' ||
                                                  selectedReport === 'first-response-time' || selectedReport === 'lost-opportunity-analysis' ||
                                                  selectedReport === 'sales-pipeline-analytics' || selectedReport === 'prospects-engaged-not-converted' ||
                                                  selectedReport === 'lead-conversion-time') && (
                                                    <PlaceholderContent reportName={isRTL ? selectedReportConfig?.nameAr || '' : selectedReportConfig?.nameEn || ''} isRTL={isRTL} />
                                                )}
                                            </div>

                                            {/* Report Footer for Print */}
                                            <div className="report-footer mt-10 pt-5 border-t border-slate-200 flex justify-between text-xs text-slate-400">
                                                <span>{isRTL ? 'تم إنشاء التقرير بواسطة نظام TRAF3LI' : 'Report generated by TRAF3LI System'}</span>
                                                <span>{format(new Date(), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <FinanceSidebar context="reports" />
                </div>
            </Main>
        </>
    )
}

// Profit & Loss Report Content
function ProfitLossContent({ data, isRTL, formatCurrency }: {
    data: any
    isRTL: boolean
    formatCurrency: (amount: number) => string
}) {
    return (
        <div className="space-y-6">
            {/* Income Section */}
            <div>
                <h3 className="section-title text-sm font-bold text-navy bg-emerald-50 p-3 rounded-lg mb-4">
                    {isRTL ? 'الإيرادات' : 'Income'}
                </h3>
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="text-start py-2 text-sm font-semibold text-slate-600">
                                {isRTL ? 'الحساب' : 'Account'}
                            </th>
                            <th className={`${isRTL ? 'text-start' : 'text-end'} py-2 text-sm font-semibold text-slate-600`}>
                                {isRTL ? 'المبلغ' : 'Amount'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.income?.items?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-3 text-slate-700">{isRTL ? item.accountAr : item.account}</td>
                                <td className={`py-3 ${isRTL ? 'text-start' : 'text-end'} font-medium text-emerald-600`}>
                                    {formatCurrency(item.amount)}
                                </td>
                            </tr>
                        ))}
                        <tr className="total-row border-t-2 border-slate-300 bg-emerald-50">
                            <td className="py-3 font-bold text-navy">{isRTL ? 'إجمالي الإيرادات' : 'Total Income'}</td>
                            <td className={`py-3 ${isRTL ? 'text-start' : 'text-end'} font-bold text-emerald-700`}>
                                {formatCurrency(data.income?.total || 0)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Expenses Section */}
            <div>
                <h3 className="section-title text-sm font-bold text-navy bg-rose-50 p-3 rounded-lg mb-4">
                    {isRTL ? 'المصروفات' : 'Expenses'}
                </h3>
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="text-start py-2 text-sm font-semibold text-slate-600">
                                {isRTL ? 'الحساب' : 'Account'}
                            </th>
                            <th className={`${isRTL ? 'text-start' : 'text-end'} py-2 text-sm font-semibold text-slate-600`}>
                                {isRTL ? 'المبلغ' : 'Amount'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.expenses?.items?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-3 text-slate-700">{isRTL ? item.accountAr : item.account}</td>
                                <td className={`py-3 ${isRTL ? 'text-start' : 'text-end'} font-medium text-rose-600`}>
                                    {formatCurrency(item.amount)}
                                </td>
                            </tr>
                        ))}
                        <tr className="total-row border-t-2 border-slate-300 bg-rose-50">
                            <td className="py-3 font-bold text-navy">{isRTL ? 'إجمالي المصروفات' : 'Total Expenses'}</td>
                            <td className={`py-3 ${isRTL ? 'text-start' : 'text-end'} font-bold text-rose-700`}>
                                {formatCurrency(data.expenses?.total || 0)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Net Income */}
            <div className={`grand-total p-6 rounded-2xl ${data.netIncome >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-navy">{isRTL ? 'صافي الربح / الخسارة' : 'Net Income / Loss'}</span>
                    <span className={`text-2xl font-bold ${data.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(data.netIncome || 0)}
                    </span>
                </div>
            </div>
        </div>
    )
}

// Balance Sheet Content
function BalanceSheetContent({ data, isRTL, formatCurrency }: {
    data: any
    isRTL: boolean
    formatCurrency: (amount: number) => string
}) {
    return (
        <div className="space-y-6">
            {/* Assets */}
            <div>
                <h3 className="section-title text-sm font-bold text-navy bg-blue-50 p-3 rounded-lg mb-4">
                    {isRTL ? 'الأصول' : 'Assets'}
                </h3>

                {/* Current Assets */}
                <h4 className="text-sm font-semibold text-slate-600 mt-4 mb-2 ps-4">
                    {isRTL ? 'الأصول المتداولة' : 'Current Assets'}
                </h4>
                <table className="w-full">
                    <tbody>
                        {data.assets?.currentAssets?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2 ps-8 text-slate-700">{isRTL ? item.accountAr : item.account}</td>
                                <td className={`py-2 ${isRTL ? 'text-start' : 'text-end'} font-medium text-slate-700`}>
                                    {formatCurrency(item.balance)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Fixed Assets */}
                <h4 className="text-sm font-semibold text-slate-600 mt-4 mb-2 ps-4">
                    {isRTL ? 'الأصول الثابتة' : 'Fixed Assets'}
                </h4>
                <table className="w-full">
                    <tbody>
                        {data.assets?.fixedAssets?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2 ps-8 text-slate-700">{isRTL ? item.accountAr : item.account}</td>
                                <td className={`py-2 ${isRTL ? 'text-start' : 'text-end'} font-medium text-slate-700`}>
                                    {formatCurrency(item.balance)}
                                </td>
                            </tr>
                        ))}
                        <tr className="total-row border-t-2 border-slate-300 bg-blue-50">
                            <td className="py-3 font-bold text-navy">{isRTL ? 'إجمالي الأصول' : 'Total Assets'}</td>
                            <td className={`py-3 ${isRTL ? 'text-start' : 'text-end'} font-bold text-blue-700`}>
                                {formatCurrency(data.assets?.total || 0)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Liabilities */}
            <div>
                <h3 className="section-title text-sm font-bold text-navy bg-amber-50 p-3 rounded-lg mb-4">
                    {isRTL ? 'الخصوم' : 'Liabilities'}
                </h3>
                <table className="w-full">
                    <tbody>
                        {data.liabilities?.currentLiabilities?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2 ps-4 text-slate-700">{isRTL ? item.accountAr : item.account}</td>
                                <td className={`py-2 ${isRTL ? 'text-start' : 'text-end'} font-medium text-slate-700`}>
                                    {formatCurrency(item.balance)}
                                </td>
                            </tr>
                        ))}
                        <tr className="total-row border-t-2 border-slate-300 bg-amber-50">
                            <td className="py-3 font-bold text-navy">{isRTL ? 'إجمالي الخصوم' : 'Total Liabilities'}</td>
                            <td className={`py-3 ${isRTL ? 'text-start' : 'text-end'} font-bold text-amber-700`}>
                                {formatCurrency(data.liabilities?.total || 0)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Equity */}
            <div>
                <h3 className="section-title text-sm font-bold text-navy bg-purple-50 p-3 rounded-lg mb-4">
                    {isRTL ? 'حقوق الملكية' : 'Equity'}
                </h3>
                <table className="w-full">
                    <tbody>
                        {data.equity?.items?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2 ps-4 text-slate-700">{isRTL ? item.accountAr : item.account}</td>
                                <td className={`py-2 ${isRTL ? 'text-start' : 'text-end'} font-medium text-slate-700`}>
                                    {formatCurrency(item.balance)}
                                </td>
                            </tr>
                        ))}
                        <tr className="total-row border-t-2 border-slate-300 bg-purple-50">
                            <td className="py-3 font-bold text-navy">{isRTL ? 'إجمالي حقوق الملكية' : 'Total Equity'}</td>
                            <td className={`py-3 ${isRTL ? 'text-start' : 'text-end'} font-bold text-purple-700`}>
                                {formatCurrency(data.equity?.total || 0)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Trial Balance Content
function TrialBalanceContent({ data, isRTL, formatCurrency }: {
    data: any
    isRTL: boolean
    formatCurrency: (amount: number) => string
}) {
    return (
        <div>
            <table className="w-full">
                <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-50">
                        <th className="text-start py-3 px-4 text-sm font-semibold text-slate-600">
                            {isRTL ? 'رقم الحساب' : 'Account No.'}
                        </th>
                        <th className="text-start py-3 px-4 text-sm font-semibold text-slate-600">
                            {isRTL ? 'اسم الحساب' : 'Account Name'}
                        </th>
                        <th className={`${isRTL ? 'text-start' : 'text-end'} py-3 px-4 text-sm font-semibold text-slate-600`}>
                            {isRTL ? 'مدين' : 'Debit'}
                        </th>
                        <th className={`${isRTL ? 'text-start' : 'text-end'} py-3 px-4 text-sm font-semibold text-slate-600`}>
                            {isRTL ? 'دائن' : 'Credit'}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.accounts?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-2 px-4 text-slate-600 font-mono text-sm">{item.accountNumber}</td>
                            <td className="py-2 px-4 text-slate-700">{isRTL ? item.accountAr : item.account}</td>
                            <td className={`py-2 px-4 ${isRTL ? 'text-start' : 'text-end'} font-medium text-emerald-600`}>
                                {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                            </td>
                            <td className={`py-2 px-4 ${isRTL ? 'text-start' : 'text-end'} font-medium text-rose-600`}>
                                {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                            </td>
                        </tr>
                    ))}
                    <tr className="total-row border-t-2 border-slate-300 bg-slate-100">
                        <td colSpan={2} className="py-3 px-4 font-bold text-navy">
                            {isRTL ? 'الإجمالي' : 'Total'}
                        </td>
                        <td className={`py-3 px-4 ${isRTL ? 'text-start' : 'text-end'} font-bold text-emerald-700`}>
                            {formatCurrency(data.totalDebit || 0)}
                        </td>
                        <td className={`py-3 px-4 ${isRTL ? 'text-start' : 'text-end'} font-bold text-rose-700`}>
                            {formatCurrency(data.totalCredit || 0)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Balance Check */}
            <div className={`mt-6 p-4 rounded-xl ${data.isBalanced ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <div className="flex items-center gap-2">
                    {data.isBalanced ? (
                        <>
                            <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                            <span className="font-semibold text-emerald-700">
                                {isRTL ? 'ميزان المراجعة متوازن' : 'Trial Balance is Balanced'}
                            </span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-5 h-5 text-rose-600" aria-hidden="true" />
                            <span className="font-semibold text-rose-700">
                                {isRTL ? 'يوجد فرق في ميزان المراجعة' : 'Trial Balance has Difference'}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// Aged Receivables Content
function AgedReceivablesContent({ data, isRTL, formatCurrency }: {
    data: any
    isRTL: boolean
    formatCurrency: (amount: number) => string
}) {
    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-600 mb-1">{isRTL ? 'حالي' : 'Current'}</p>
                    <p className="text-lg font-bold text-emerald-700">{formatCurrency(data.summary?.current || 0)}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-600 mb-1">{isRTL ? '1-30 يوم' : '1-30 Days'}</p>
                    <p className="text-lg font-bold text-amber-700">{formatCurrency(data.summary?.days1to30 || 0)}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-600 mb-1">{isRTL ? '31-60 يوم' : '31-60 Days'}</p>
                    <p className="text-lg font-bold text-orange-700">{formatCurrency(data.summary?.days31to60 || 0)}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-600 mb-1">{isRTL ? '61-90 يوم' : '61-90 Days'}</p>
                    <p className="text-lg font-bold text-rose-700">{formatCurrency(data.summary?.days61to90 || 0)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-600 mb-1">{isRTL ? '+90 يوم' : '90+ Days'}</p>
                    <p className="text-lg font-bold text-red-700">{formatCurrency(data.summary?.over90 || 0)}</p>
                </div>
            </div>

            {/* Client Details */}
            <table className="w-full">
                <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-50">
                        <th className="text-start py-3 px-4 text-sm font-semibold text-slate-600">
                            {isRTL ? 'العميل' : 'Client'}
                        </th>
                        <th className={`${isRTL ? 'text-start' : 'text-end'} py-3 px-4 text-sm font-semibold text-emerald-600`}>
                            {isRTL ? 'حالي' : 'Current'}
                        </th>
                        <th className={`${isRTL ? 'text-start' : 'text-end'} py-3 px-4 text-sm font-semibold text-amber-600`}>
                            {isRTL ? '1-30' : '1-30'}
                        </th>
                        <th className={`${isRTL ? 'text-start' : 'text-end'} py-3 px-4 text-sm font-semibold text-orange-600`}>
                            {isRTL ? '31-60' : '31-60'}
                        </th>
                        <th className={`${isRTL ? 'text-start' : 'text-end'} py-3 px-4 text-sm font-semibold text-rose-600`}>
                            {isRTL ? '61-90' : '61-90'}
                        </th>
                        <th className={`${isRTL ? 'text-start' : 'text-end'} py-3 px-4 text-sm font-semibold text-red-600`}>
                            {isRTL ? '+90' : '90+'}
                        </th>
                        <th className={`${isRTL ? 'text-start' : 'text-end'} py-3 px-4 text-sm font-semibold text-slate-700`}>
                            {isRTL ? 'الإجمالي' : 'Total'}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.clients?.map((client: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-2 px-4 font-medium text-slate-700">{client.clientName}</td>
                            <td className={`py-2 px-4 ${isRTL ? 'text-start' : 'text-end'} text-emerald-600`}>
                                {client.current > 0 ? formatCurrency(client.current) : '-'}
                            </td>
                            <td className={`py-2 px-4 ${isRTL ? 'text-start' : 'text-end'} text-amber-600`}>
                                {client.days1to30 > 0 ? formatCurrency(client.days1to30) : '-'}
                            </td>
                            <td className={`py-2 px-4 ${isRTL ? 'text-start' : 'text-end'} text-orange-600`}>
                                {client.days31to60 > 0 ? formatCurrency(client.days31to60) : '-'}
                            </td>
                            <td className={`py-2 px-4 ${isRTL ? 'text-start' : 'text-end'} text-rose-600`}>
                                {client.days61to90 > 0 ? formatCurrency(client.days61to90) : '-'}
                            </td>
                            <td className={`py-2 px-4 ${isRTL ? 'text-start' : 'text-end'} text-red-600`}>
                                {client.over90 > 0 ? formatCurrency(client.over90) : '-'}
                            </td>
                            <td className={`py-2 px-4 ${isRTL ? 'text-start' : 'text-end'} font-bold text-slate-700`}>
                                {formatCurrency(client.total)}
                            </td>
                        </tr>
                    ))}
                    <tr className="total-row border-t-2 border-slate-300 bg-slate-100">
                        <td className="py-3 px-4 font-bold text-navy">{isRTL ? 'الإجمالي' : 'Total'}</td>
                        <td className={`py-3 px-4 ${isRTL ? 'text-start' : 'text-end'} font-bold text-emerald-700`}>
                            {formatCurrency(data.summary?.current || 0)}
                        </td>
                        <td className={`py-3 px-4 ${isRTL ? 'text-start' : 'text-end'} font-bold text-amber-700`}>
                            {formatCurrency(data.summary?.days1to30 || 0)}
                        </td>
                        <td className={`py-3 px-4 ${isRTL ? 'text-start' : 'text-end'} font-bold text-orange-700`}>
                            {formatCurrency(data.summary?.days31to60 || 0)}
                        </td>
                        <td className={`py-3 px-4 ${isRTL ? 'text-start' : 'text-end'} font-bold text-rose-700`}>
                            {formatCurrency(data.summary?.days61to90 || 0)}
                        </td>
                        <td className={`py-3 px-4 ${isRTL ? 'text-start' : 'text-end'} font-bold text-red-700`}>
                            {formatCurrency(data.summary?.over90 || 0)}
                        </td>
                        <td className={`py-3 px-4 ${isRTL ? 'text-start' : 'text-end'} font-bold text-navy`}>
                            {formatCurrency(data.summary?.total || 0)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

// Placeholder for reports without data yet
function PlaceholderContent({ reportName, isRTL }: { reportName: string; isRTL: boolean }) {
    return (
        <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
                {isRTL ? 'قريباً' : 'Coming Soon'}
            </h3>
            <p className="text-slate-500">
                {isRTL
                    ? `تقرير ${reportName} سيكون متاحاً قريباً`
                    : `${reportName} report will be available soon`}
            </p>
        </div>
    )
}

export default FullReportsView
