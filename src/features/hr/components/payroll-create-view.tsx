import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { HRSidebar } from './hr-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { useCreateSalarySlip, useUpdateSalarySlip, useSalarySlip } from '@/hooks/usePayroll'
import { useEmployees } from '@/hooks/useHR'
import { cn } from '@/lib/utils'
import {
    Search, Bell, User, Wallet, Calendar, Briefcase, CreditCard, Loader2, CheckCircle,
    DollarSign, Clock, FileText, Building, Users, ChevronDown, Plus, Trash2, AlertCircle,
    Building2, Calculator, Minus, TrendingDown, Lock
} from 'lucide-react'
import type { CreateSalarySlipData, PaymentMethod } from '@/services/payrollService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

interface Allowance {
    id: string
    name: string
    nameAr: string
    amount: number
}

interface Deduction {
    id: string
    name: string
    nameAr: string
    amount: number
}

const COMMON_ALLOWANCES = [
    { name: 'Housing Allowance', nameAr: 'بدل سكن' },
    { name: 'Transportation Allowance', nameAr: 'بدل نقل' },
    { name: 'Food Allowance', nameAr: 'بدل طعام' },
    { name: 'Phone Allowance', nameAr: 'بدل هاتف' },
    { name: 'Medical Allowance', nameAr: 'بدل طبي' },
    { name: 'Overtime', nameAr: 'أجر إضافي' },
    { name: 'Bonus', nameAr: 'مكافأة' },
    { name: 'Commission', nameAr: 'عمولة' },
]

const COMMON_DEDUCTIONS = [
    { name: 'GOSI', nameAr: 'التأمينات الاجتماعية' },
    { name: 'Loan Repayment', nameAr: 'سداد قرض' },
    { name: 'Advance Recovery', nameAr: 'استرداد سلفة' },
    { name: 'Absence', nameAr: 'غياب' },
    { name: 'Late Deduction', nameAr: 'خصم تأخير' },
    { name: 'Violation', nameAr: 'مخالفة' },
    { name: 'Other', nameAr: 'أخرى' },
]

const OFFICE_TYPES = [
    { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
    { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
    { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building },
    { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

const MONTHS = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' },
]

export function PayrollCreateView() {
    const navigate = useNavigate()
    const searchParams = useSearch({ strict: false }) as { editId?: string }
    const editId = searchParams?.editId
    const isEditMode = !!editId

    const { data: existingSlip, isLoading: isLoadingSlip } = useSalarySlip(editId || '')
    const createMutation = useCreateSalarySlip()
    const updateMutation = useUpdateSalarySlip()

    // Fetch employees for selection
    const { data: employeesData } = useEmployees({ status: 'active' })

    // Current date for defaults
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Office Type
    const [officeType, setOfficeType] = useState<OfficeType>('solo')

    // Collapsible sections state
    const [openSections, setOpenSections] = useState<string[]>([])

    // Form State - Employee Selection (Basic)
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

    // Form State - Pay Period (Basic)
    const [month, setMonth] = useState<number>(currentMonth)
    const [year, setYear] = useState<number>(currentYear)
    const [workingDays, setWorkingDays] = useState<number>(22)
    const [daysWorked, setDaysWorked] = useState<number>(22)

    // Form State - Earnings (Basic)
    const [basicSalary, setBasicSalary] = useState<number>(0)
    const [allowances, setAllowances] = useState<Allowance[]>([])

    // Form State - Deductions (Basic)
    const [gosiDeduction, setGosiDeduction] = useState<number>(0)
    const [autoCalculateGosi, setAutoCalculateGosi] = useState(true)
    const [deductions, setDeductions] = useState<Deduction[]>([])

    // Advanced - Overtime
    const [overtimeHours, setOvertimeHours] = useState<number>(0)
    const [overtimeRate, setOvertimeRate] = useState<number>(1.5)

    // Advanced - Payment Details
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
    const [bankName, setBankName] = useState('')
    const [iban, setIban] = useState('')
    const [paymentDate, setPaymentDate] = useState('')

    // Advanced - Notes
    const [notes, setNotes] = useState('')

    // Update selected employee details when selection changes
    useEffect(() => {
        if (selectedEmployeeId && employeesData?.employees) {
            const emp = employeesData.employees.find((e: any) => e._id === selectedEmployeeId)
            if (emp) {
                setSelectedEmployee(emp)
                setBasicSalary(emp.compensation?.basicSalary || 0)
                setBankName(emp.compensation?.bankDetails?.bankName || '')
                setIban(emp.compensation?.bankDetails?.iban || '')

                // Auto-populate allowances from employee
                if (emp.compensation?.allowances) {
                    const empAllowances: Allowance[] = []
                    if (emp.compensation.allowances.housingAllowance) {
                        empAllowances.push({ id: 'housing', name: 'Housing Allowance', nameAr: 'بدل سكن', amount: emp.compensation.allowances.housingAllowance })
                    }
                    if (emp.compensation.allowances.transportationAllowance) {
                        empAllowances.push({ id: 'transport', name: 'Transportation Allowance', nameAr: 'بدل نقل', amount: emp.compensation.allowances.transportationAllowance })
                    }
                    if (emp.compensation.allowances.foodAllowance) {
                        empAllowances.push({ id: 'food', name: 'Food Allowance', nameAr: 'بدل طعام', amount: emp.compensation.allowances.foodAllowance })
                    }
                    setAllowances(empAllowances)
                }
            }
        }
    }, [selectedEmployeeId, employeesData])

    // Auto-calculate GOSI
    useEffect(() => {
        if (autoCalculateGosi && selectedEmployee) {
            const isSaudi = selectedEmployee.personalInfo?.isSaudi
            const gosiRate = isSaudi ? 9.75 : 0
            setGosiDeduction(Math.round(basicSalary * (gosiRate / 100)))
        }
    }, [autoCalculateGosi, basicSalary, selectedEmployee])

    // Populate form when editing
    useEffect(() => {
        if (existingSlip && isEditMode) {
            setSelectedEmployeeId(existingSlip.employeeId)
            setMonth(existingSlip.payPeriod.month)
            setYear(existingSlip.payPeriod.year)
            setWorkingDays(existingSlip.payPeriod.workingDays)
            setDaysWorked(existingSlip.payPeriod.daysWorked)
            setBasicSalary(existingSlip.earnings.basicSalary)
            setGosiDeduction(existingSlip.deductions.gosi)
            setPaymentMethod(existingSlip.payment.paymentMethod)
            setBankName(existingSlip.payment.bankName || '')
            setIban(existingSlip.payment.iban || '')
        }
    }, [existingSlip, isEditMode])

    // Calculations
    const totalAllowances = useMemo(() => {
        return allowances.reduce((sum, a) => sum + a.amount, 0)
    }, [allowances])

    const overtimeAmount = useMemo(() => {
        const hourlyRate = basicSalary / (8 * 22) // Assuming 8 hours/day, 22 days/month
        return Math.round(overtimeHours * hourlyRate * overtimeRate)
    }, [basicSalary, overtimeHours, overtimeRate])

    const totalEarnings = useMemo(() => {
        return basicSalary + totalAllowances + overtimeAmount
    }, [basicSalary, totalAllowances, overtimeAmount])

    const totalOtherDeductions = useMemo(() => {
        return deductions.reduce((sum, d) => sum + d.amount, 0)
    }, [deductions])

    const totalDeductions = useMemo(() => {
        return gosiDeduction + totalOtherDeductions
    }, [gosiDeduction, totalOtherDeductions])

    const netPay = useMemo(() => {
        return totalEarnings - totalDeductions
    }, [totalEarnings, totalDeductions])

    // Allowance handlers
    const addAllowance = () => {
        setAllowances([...allowances, { id: Date.now().toString(), name: '', nameAr: '', amount: 0 }])
    }

    const removeAllowance = (id: string) => {
        setAllowances(allowances.filter(a => a.id !== id))
    }

    const updateAllowance = (id: string, field: keyof Allowance, value: string | number) => {
        setAllowances(allowances.map(a => {
            if (a.id === id) {
                if (field === 'name') {
                    const preset = COMMON_ALLOWANCES.find(c => c.name === value)
                    if (preset) {
                        return { ...a, name: preset.name, nameAr: preset.nameAr }
                    }
                }
                return { ...a, [field]: value }
            }
            return a
        }))
    }

    // Deduction handlers
    const addDeduction = () => {
        setDeductions([...deductions, { id: Date.now().toString(), name: '', nameAr: '', amount: 0 }])
    }

    const removeDeduction = (id: string) => {
        setDeductions(deductions.filter(d => d.id !== id))
    }

    const updateDeduction = (id: string, field: keyof Deduction, value: string | number) => {
        setDeductions(deductions.map(d => {
            if (d.id === id) {
                if (field === 'name') {
                    const preset = COMMON_DEDUCTIONS.find(c => c.name === value)
                    if (preset) {
                        return { ...d, name: preset.name, nameAr: preset.nameAr }
                    }
                }
                return { ...d, [field]: value }
            }
            return d
        }))
    }

    const toggleSection = (section: string) => {
        setOpenSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const slipData: CreateSalarySlipData = {
            employeeId: selectedEmployeeId,
            payPeriod: {
                month,
                year,
                workingDays,
                daysWorked,
                paymentDate: paymentDate || undefined,
            },
            earnings: {
                basicSalary,
                allowances: allowances.map(a => ({ name: a.name, nameAr: a.nameAr, amount: a.amount })),
                overtime: overtimeHours > 0 ? { hours: overtimeHours, rate: overtimeRate } : undefined,
            },
            deductions: {
                loans: deductions.find(d => d.name === 'Loan Repayment')?.amount || 0,
                advances: deductions.find(d => d.name === 'Advance Recovery')?.amount || 0,
                absences: deductions.find(d => d.name === 'Absence')?.amount || 0,
                lateDeductions: deductions.find(d => d.name === 'Late Deduction')?.amount || 0,
                violations: deductions.find(d => d.name === 'Violation')?.amount || 0,
                otherDeductions: deductions.filter(d => !['Loan Repayment', 'Advance Recovery', 'Absence', 'Late Deduction', 'Violation'].includes(d.name)).reduce((s, d) => s + d.amount, 0),
            },
            payment: {
                paymentMethod,
                bankName: bankName || undefined,
                iban: iban || undefined,
            },
        }

        if (isEditMode && editId) {
            updateMutation.mutate(
                { id: editId, data: slipData },
                {
                    onSuccess: () => {
                        navigate({ to: '/dashboard/hr/payroll/$slipId', params: { slipId: editId } })
                    }
                }
            )
        } else {
            createMutation.mutate(slipData, {
                onSuccess: (data) => {
                    navigate({ to: '/dashboard/hr/payroll/$slipId', params: { slipId: data._id } })
                }
            })
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'قسائم الرواتب', href: '/dashboard/hr/payroll', isActive: true },
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
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
                <ProductivityHero
                    badge="الموارد البشرية"
                    title={isEditMode ? 'تعديل قسيمة راتب' : 'إنشاء قسيمة راتب جديدة'}
                    type="payroll"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* OFFICE TYPE SELECTOR */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        نوع المكتب
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {OFFICE_TYPES.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setOfficeType(option.value as OfficeType)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 transition-all text-center",
                                                    officeType === option.value
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                                                )}
                                            >
                                                <option.icon className="w-6 h-6 mx-auto mb-2" />
                                                <span className="text-sm font-medium block">{option.labelAr}</span>
                                                <span className="text-xs opacity-75">{option.descriptionAr}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ===================== BASIC SECTIONS (Always Visible) ===================== */}

                            {/* EMPLOYEE SELECTION - Basic */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        اختيار الموظف
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-navy font-medium">
                                            الموظف <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue placeholder="اختر الموظف" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employeesData?.employees?.map((emp: any) => (
                                                    <SelectItem key={emp._id} value={emp._id}>
                                                        {emp.personalInfo?.fullNameArabic} - {emp.employeeNumber}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedEmployee && (
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-500 block">المسمى الوظيفي</span>
                                                    <span className="font-medium text-navy">{selectedEmployee.employment?.jobTitleArabic || selectedEmployee.employment?.jobTitle}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 block">القسم</span>
                                                    <span className="font-medium text-navy">{selectedEmployee.employment?.departmentName || 'غير محدد'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 block">الجنسية</span>
                                                    <span className="font-medium text-navy">{selectedEmployee.personalInfo?.isSaudi ? 'سعودي' : 'غير سعودي'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 block">الراتب الأساسي</span>
                                                    <span className="font-medium text-emerald-600">{(selectedEmployee.compensation?.basicSalary || 0).toLocaleString('ar-SA')} ر.س</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* PAY PERIOD - Basic */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                        فترة الراتب
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">الشهر <span className="text-red-500">*</span></Label>
                                            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MONTHS.map((m) => (
                                                        <SelectItem key={m.value} value={String(m.value)}>
                                                            {m.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">السنة <span className="text-red-500">*</span></Label>
                                            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                                                        <SelectItem key={y} value={String(y)}>
                                                            {y}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">أيام العمل</Label>
                                            <Input
                                                type="number"
                                                value={workingDays}
                                                onChange={(e) => setWorkingDays(parseInt(e.target.value) || 22)}
                                                min={0}
                                                max={31}
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">أيام الحضور</Label>
                                            <Input
                                                type="number"
                                                value={daysWorked}
                                                onChange={(e) => setDaysWorked(parseInt(e.target.value) || 22)}
                                                min={0}
                                                max={workingDays}
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* EARNINGS - Basic */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                        الاستحقاقات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-navy font-medium">
                                            الراتب الأساسي (ر.س) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={basicSalary}
                                            onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                                            min={0}
                                            step={100}
                                            required
                                            className="h-11 rounded-xl max-w-xs"
                                        />
                                    </div>

                                    {/* Dynamic Allowances */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-navy">البدلات والإضافات</h4>
                                            <Button type="button" variant="outline" size="sm" onClick={addAllowance} className="rounded-xl">
                                                <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                                                إضافة
                                            </Button>
                                        </div>

                                        {allowances.length === 0 ? (
                                            <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">لا توجد بدلات</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {allowances.map((allowance) => (
                                                    <div key={allowance.id} className="flex gap-3 items-start p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                                        <div className="flex-1">
                                                            <Select
                                                                value={allowance.name}
                                                                onValueChange={(v) => updateAllowance(allowance.id, 'name', v)}
                                                            >
                                                                <SelectTrigger className="h-10 rounded-lg bg-white">
                                                                    <SelectValue placeholder="اختر البدل" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {COMMON_ALLOWANCES.map((a) => (
                                                                        <SelectItem key={a.name} value={a.name}>
                                                                            {a.nameAr}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="w-32">
                                                            <Input
                                                                type="number"
                                                                value={allowance.amount}
                                                                onChange={(e) => updateAllowance(allowance.id, 'amount', parseFloat(e.target.value) || 0)}
                                                                min={0}
                                                                placeholder="المبلغ"
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeAllowance(allowance.id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {allowances.length > 0 && (
                                            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">إجمالي البدلات:</span>
                                                    <span className="font-bold text-emerald-600">{totalAllowances.toLocaleString('ar-SA')} ر.س</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total Earnings Summary */}
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-navy">إجمالي الاستحقاقات</span>
                                            <span className="text-2xl font-bold text-emerald-600">
                                                {totalEarnings.toLocaleString('ar-SA')} ر.س
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* DEDUCTIONS - Basic */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <TrendingDown className="w-5 h-5 text-red-500" />
                                        الخصومات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* GOSI */}
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                                <span className="font-semibold text-blue-800">التأمينات الاجتماعية (GOSI)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm text-blue-600">حساب تلقائي</Label>
                                                <Switch
                                                    checked={autoCalculateGosi}
                                                    onCheckedChange={setAutoCalculateGosi}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="number"
                                                value={gosiDeduction}
                                                onChange={(e) => setGosiDeduction(parseFloat(e.target.value) || 0)}
                                                disabled={autoCalculateGosi}
                                                min={0}
                                                className="h-11 rounded-xl max-w-[200px]"
                                            />
                                            <span className="text-sm text-blue-700">
                                                {selectedEmployee?.personalInfo?.isSaudi ? '9.75% من الراتب الأساسي (سعودي)' : '0% (غير سعودي)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dynamic Deductions */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-navy">خصومات أخرى</h4>
                                            <Button type="button" variant="outline" size="sm" onClick={addDeduction} className="rounded-xl">
                                                <Minus className="w-4 h-4 ms-1" />
                                                إضافة خصم
                                            </Button>
                                        </div>

                                        {deductions.length === 0 ? (
                                            <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                <Minus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">لا توجد خصومات إضافية</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {deductions.map((deduction) => (
                                                    <div key={deduction.id} className="flex gap-3 items-start p-3 bg-red-50/50 rounded-xl border border-red-100">
                                                        <div className="flex-1">
                                                            <Select
                                                                value={deduction.name}
                                                                onValueChange={(v) => updateDeduction(deduction.id, 'name', v)}
                                                            >
                                                                <SelectTrigger className="h-10 rounded-lg bg-white">
                                                                    <SelectValue placeholder="نوع الخصم" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {COMMON_DEDUCTIONS.filter(d => d.name !== 'GOSI').map((d) => (
                                                                        <SelectItem key={d.name} value={d.name}>
                                                                            {d.nameAr}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="w-32">
                                                            <Input
                                                                type="number"
                                                                value={deduction.amount}
                                                                onChange={(e) => updateDeduction(deduction.id, 'amount', parseFloat(e.target.value) || 0)}
                                                                min={0}
                                                                placeholder="المبلغ"
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeDeduction(deduction.id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Total Deductions Summary */}
                                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-navy">إجمالي الخصومات</span>
                                            <span className="text-2xl font-bold text-red-600">
                                                {totalDeductions.toLocaleString('ar-SA')} ر.س
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* NET PAY SUMMARY */}
                            <Card className="rounded-3xl shadow-sm border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-slate-600 block mb-1">صافي الراتب المستحق</span>
                                            <div className="text-sm text-slate-500">
                                                {totalEarnings.toLocaleString('ar-SA')} - {totalDeductions.toLocaleString('ar-SA')}
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-4xl font-bold text-emerald-600">
                                                {netPay.toLocaleString('ar-SA')}
                                            </span>
                                            <span className="text-lg text-emerald-600 me-2">ر.س</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

                            {/* Overtime */}
                            <Collapsible open={openSections.includes('overtime')} onOpenChange={() => toggleSection('overtime')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-purple-500" />
                                                    العمل الإضافي
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('overtime') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">عدد الساعات الإضافية</Label>
                                                    <Input
                                                        type="number"
                                                        value={overtimeHours}
                                                        onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                                                        min={0}
                                                        step={0.5}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">معامل الأجر الإضافي</Label>
                                                    <Select value={String(overtimeRate)} onValueChange={(v) => setOvertimeRate(Number(v))}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1.25">1.25x (125%)</SelectItem>
                                                            <SelectItem value="1.5">1.5x (150%)</SelectItem>
                                                            <SelectItem value="2">2x (200%)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">مبلغ العمل الإضافي</Label>
                                                    <div className="h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center px-4">
                                                        <span className="font-bold text-purple-600">{overtimeAmount.toLocaleString('ar-SA')} ر.س</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Payment Details */}
                            <Collapsible open={openSections.includes('payment')} onOpenChange={() => toggleSection('payment')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5 text-green-500" />
                                                    تفاصيل الدفع
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('payment') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">طريقة الدفع</Label>
                                                    <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                                                            <SelectItem value="cash">نقدي</SelectItem>
                                                            <SelectItem value="check">شيك</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">تاريخ الدفع</Label>
                                                    <Input
                                                        type="date"
                                                        value={paymentDate}
                                                        onChange={(e) => setPaymentDate(e.target.value)}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">اسم البنك</Label>
                                                    <Input
                                                        value={bankName}
                                                        onChange={(e) => setBankName(e.target.value)}
                                                        placeholder="اسم البنك"
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">رقم الآيبان (IBAN)<Lock className="h-3 w-3 text-muted-foreground inline ms-1" /></Label>
                                                    <Input
                                                        value={iban}
                                                        onChange={(e) => setIban(e.target.value)}
                                                        placeholder="SA0000000000000000000000"
                                                        className="h-11 rounded-xl"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Notes */}
                            <Collapsible open={openSections.includes('notes')} onOpenChange={() => toggleSection('notes')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-amber-500" />
                                                    ملاحظات
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('notes') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0">
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="أضف أي ملاحظات..."
                                                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                                            />
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* SUBMIT BUTTONS */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: '/dashboard/hr/payroll' })}
                                    className="h-12 px-8 rounded-xl"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending || !selectedEmployeeId}
                                    className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 ms-2 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-5 w-5 ms-2" />
                                            {isEditMode ? 'حفظ التغييرات' : 'إنشاء القسيمة'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <HRSidebar context="payroll" />
                </div>
            </Main>
        </>
    )
}
