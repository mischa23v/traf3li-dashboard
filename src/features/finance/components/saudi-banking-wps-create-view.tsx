import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search, Bell, FileText, ChevronLeft, Building2, Users, Banknote,
    Calendar, CheckCircle, AlertCircle, Plus, Trash2, Upload, Download,
    Loader2
} from 'lucide-react'
import { useSARIEBanks, useGenerateWPS, useValidateWPS, type WPSEmployee, type WPSEstablishment } from '@/hooks/useSaudiBanking'

// Sidebar Component
function CreateWPSSidebar({ onImport }: { onImport: () => void }) {
    return (
        <div className="space-y-6">
            {/* Import Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy">استيراد البيانات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full rounded-xl" onClick={onImport}>
                        <Upload className="h-4 w-4 ms-2" />
                        استيراد من Excel
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl">
                        <Download className="h-4 w-4 ms-2" />
                        تحميل نموذج Excel
                    </Button>
                </CardContent>
            </Card>

            {/* Tips Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        ملاحظات مهمة
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>رقم المنشأة يجب أن يكون 10 أرقام</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>IBAN يجب أن يبدأ بـ SA</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>رقم الهوية 10 أرقام للسعودي، والإقامة للمقيم</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>صافي الراتب = الأساسي + البدلات - الخصومات</span>
                    </div>
                </CardContent>
            </Card>

            {/* Help Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-gradient-to-br from-blue-500 to-blue-600">
                <CardContent className="p-6 text-white">
                    <FileText className="h-10 w-10 mb-4 text-white/80" />
                    <h3 className="font-bold text-lg mb-2">تنسيق ملف WPS</h3>
                    <p className="text-sm text-white/80 mb-4">
                        يتم إنشاء الملف بتنسيق SARIE المعتمد من مؤسسة النقد العربي السعودي
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export function SaudiBankingWPSCreateView() {
    const navigate = useNavigate()

    // Establishment data
    const [establishment, setEstablishment] = useState<WPSEstablishment>({
        molId: '',
        name: '',
        iban: '',
        bankCode: '',
    })

    // Employees list
    const [employees, setEmployees] = useState<WPSEmployee[]>([
        {
            name: '',
            molId: '',
            nationality: 'SA',
            iban: '',
            salary: {
                basic: 0,
                housing: 0,
                otherEarnings: 0,
                deductions: 0,
                netSalary: 0,
            },
        },
    ])

    // Payment details
    const [paymentDate, setPaymentDate] = useState('')
    const [batchReference, setBatchReference] = useState('')

    // Selection for bulk actions
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])

    // Mutations
    const generateWPSMutation = useGenerateWPS()
    const validateWPSMutation = useValidateWPS()
    const { data: banksData } = useSARIEBanks()

    // Calculate totals
    const totals = useMemo(() => {
        return employees.reduce(
            (acc, emp) => ({
                basic: acc.basic + emp.salary.basic,
                housing: acc.housing + emp.salary.housing,
                otherEarnings: acc.otherEarnings + emp.salary.otherEarnings,
                deductions: acc.deductions + emp.salary.deductions,
                netSalary: acc.netSalary + emp.salary.netSalary,
            }),
            { basic: 0, housing: 0, otherEarnings: 0, deductions: 0, netSalary: 0 }
        )
    }, [employees])

    // Hero stats
    const heroStats = useMemo(() => {
        return [
            { label: 'عدد الموظفين', value: employees.length, icon: Users, status: 'normal' as const },
            { label: 'إجمالي الرواتب', value: `${totals.netSalary.toLocaleString()} ر.س`, icon: Banknote, status: 'normal' as const },
            { label: 'تاريخ الدفع', value: paymentDate || 'غير محدد', icon: Calendar, status: 'normal' as const },
        ]
    }, [employees, totals, paymentDate])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
    ]

    // Add new employee row
    const addEmployee = () => {
        setEmployees([
            ...employees,
            {
                name: '',
                molId: '',
                nationality: 'SA',
                iban: '',
                salary: {
                    basic: 0,
                    housing: 0,
                    otherEarnings: 0,
                    deductions: 0,
                    netSalary: 0,
                },
            },
        ])
    }

    // Remove employee
    const removeEmployee = (index: number) => {
        if (employees.length === 1) return
        setEmployees(employees.filter((_, i) => i !== index))
    }

    // Update employee data
    const updateEmployee = (index: number, field: string, value: any) => {
        const updated = [...employees]
        if (field.startsWith('salary.')) {
            const salaryField = field.replace('salary.', '')
            updated[index] = {
                ...updated[index],
                salary: {
                    ...updated[index].salary,
                    [salaryField]: value,
                },
            }
            // Auto-calculate net salary
            const s = updated[index].salary
            updated[index].salary.netSalary = s.basic + s.housing + s.otherEarnings - s.deductions
        } else {
            updated[index] = { ...updated[index], [field]: value }
        }
        setEmployees(updated)
    }

    // Handle form submission
    const handleSubmit = async () => {
        // Validate first
        const validation = await validateWPSMutation.mutateAsync({ establishment, employees })

        if (!validation.isValid) {
            alert('يوجد أخطاء في البيانات. يرجى مراجعة البيانات وإعادة المحاولة.')
            return
        }

        // Generate WPS file
        await generateWPSMutation.mutateAsync({
            establishment,
            employees,
            paymentDate,
            batchReference,
        })

        navigate({ to: '/dashboard/finance/saudi-banking/wps' })
    }

    const handleImport = () => {
        // TODO: Implement Excel import
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA').format(amount)
    }

    const isLoading = generateWPSMutation.isPending || validateWPSMutation.isPending

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/finance/saudi-banking" className="text-slate-500 hover:text-emerald-600">
                        الخدمات المصرفية
                    </Link>
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                    <Link to="/dashboard/finance/saudi-banking/wps" className="text-slate-500 hover:text-emerald-600">
                        WPS
                    </Link>
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                    <span className="text-navy font-medium">إنشاء ملف جديد</span>
                </div>

                {/* HERO CARD */}
                <ProductivityHero badge="WPS" title="إنشاء ملف WPS جديد" type="finance" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Establishment Info */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    بيانات المنشأة
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-navy font-medium mb-2 block">رقم المنشأة (MOL ID)</Label>
                                        <Input
                                            placeholder="1234567890"
                                            value={establishment.molId}
                                            onChange={(e) => setEstablishment({ ...establishment, molId: e.target.value })}
                                            className="rounded-xl"
                                            maxLength={10}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-navy font-medium mb-2 block">اسم المنشأة</Label>
                                        <Input
                                            placeholder="اسم الشركة"
                                            value={establishment.name}
                                            onChange={(e) => setEstablishment({ ...establishment, name: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-navy font-medium mb-2 block">IBAN المنشأة</Label>
                                        <Input
                                            placeholder="SA0380000000608010167519"
                                            value={establishment.iban}
                                            onChange={(e) => setEstablishment({ ...establishment, iban: e.target.value })}
                                            className="rounded-xl font-mono"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-navy font-medium mb-2 block">رمز البنك</Label>
                                        <Select value={establishment.bankCode} onValueChange={(v) => setEstablishment({ ...establishment, bankCode: v })}>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder="اختر البنك" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="80">الراجحي (80)</SelectItem>
                                                <SelectItem value="10">البنك الأهلي (10)</SelectItem>
                                                <SelectItem value="45">بنك الرياض (45)</SelectItem>
                                                <SelectItem value="20">بنك الإنماء (20)</SelectItem>
                                                <SelectItem value="55">البنك السعودي الفرنسي (55)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    تفاصيل الدفع
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-navy font-medium mb-2 block">تاريخ الدفع</Label>
                                        <Input
                                            type="date"
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-navy font-medium mb-2 block">مرجع الدفعة</Label>
                                        <Input
                                            placeholder="DEC2025-001"
                                            value={batchReference}
                                            onChange={(e) => setBatchReference(e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employees List */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        بيانات الموظفين
                                    </CardTitle>
                                    <Button onClick={addEmployee} size="sm" className="bg-blue-500 hover:bg-blue-600 rounded-xl">
                                        <Plus className="h-4 w-4 ms-2" />
                                        إضافة موظف
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {employees.map((emp, index) => (
                                        <div key={index} className="bg-slate-50 rounded-2xl p-4 relative">
                                            <div className="absolute top-4 left-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeEmployee(index)}
                                                    disabled={employees.length === 1}
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                <div className="md:col-span-2">
                                                    <Label className="text-sm text-slate-600 mb-1 block">اسم الموظف</Label>
                                                    <Input
                                                        placeholder="الاسم الكامل"
                                                        value={emp.name}
                                                        onChange={(e) => updateEmployee(index, 'name', e.target.value)}
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-slate-600 mb-1 block">رقم الهوية/الإقامة</Label>
                                                    <Input
                                                        placeholder="1234567890"
                                                        value={emp.molId}
                                                        onChange={(e) => updateEmployee(index, 'molId', e.target.value)}
                                                        className="rounded-lg"
                                                        maxLength={10}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-slate-600 mb-1 block">الجنسية</Label>
                                                    <Select value={emp.nationality} onValueChange={(v) => updateEmployee(index, 'nationality', v)}>
                                                        <SelectTrigger className="rounded-lg">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="SA">سعودي</SelectItem>
                                                            <SelectItem value="OTHER">غير سعودي</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <Label className="text-sm text-slate-600 mb-1 block">IBAN الموظف</Label>
                                                    <Input
                                                        placeholder="SA0380000000608010167519"
                                                        value={emp.iban}
                                                        onChange={(e) => updateEmployee(index, 'iban', e.target.value)}
                                                        className="rounded-lg font-mono"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                <div>
                                                    <Label className="text-xs text-slate-500 mb-1 block">الراتب الأساسي</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={emp.salary.basic || ''}
                                                        onChange={(e) => updateEmployee(index, 'salary.basic', parseFloat(e.target.value) || 0)}
                                                        className="rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-500 mb-1 block">بدل السكن</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={emp.salary.housing || ''}
                                                        onChange={(e) => updateEmployee(index, 'salary.housing', parseFloat(e.target.value) || 0)}
                                                        className="rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-500 mb-1 block">بدلات أخرى</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={emp.salary.otherEarnings || ''}
                                                        onChange={(e) => updateEmployee(index, 'salary.otherEarnings', parseFloat(e.target.value) || 0)}
                                                        className="rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-500 mb-1 block">الخصومات</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={emp.salary.deductions || ''}
                                                        onChange={(e) => updateEmployee(index, 'salary.deductions', parseFloat(e.target.value) || 0)}
                                                        className="rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-500 mb-1 block">صافي الراتب</Label>
                                                    <Input
                                                        type="number"
                                                        value={emp.salary.netSalary}
                                                        disabled
                                                        className="rounded-lg text-sm bg-emerald-50 font-bold text-emerald-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                                        <div>
                                            <p className="text-xs text-blue-600 mb-1">إجمالي الأساسي</p>
                                            <p className="font-bold text-navy">{formatCurrency(totals.basic)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600 mb-1">إجمالي السكن</p>
                                            <p className="font-bold text-navy">{formatCurrency(totals.housing)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600 mb-1">إجمالي البدلات</p>
                                            <p className="font-bold text-navy">{formatCurrency(totals.otherEarnings)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600 mb-1">إجمالي الخصومات</p>
                                            <p className="font-bold text-navy">{formatCurrency(totals.deductions)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600 mb-1">إجمالي الصافي</p>
                                            <p className="font-bold text-emerald-600 text-lg">{formatCurrency(totals.netSalary)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-4 justify-end">
                            <Link to="/dashboard/finance/saudi-banking/wps">
                                <Button variant="outline" className="rounded-xl px-8">
                                    إلغاء
                                </Button>
                            </Link>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-blue-500 hover:bg-blue-600 rounded-xl px-8 shadow-lg shadow-blue-500/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        جاري الإنشاء...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4 ms-2" />
                                        إنشاء ملف WPS
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <CreateWPSSidebar onImport={handleImport} />
                </div>
            </Main>
        </>
    )
}
