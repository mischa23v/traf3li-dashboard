import { useState, useEffect } from 'react'
import {
    ArrowRight, Save, Loader2, DollarSign, User, Calculator
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { HRSidebar } from '../components/hr-sidebar'
import { useCreateSalary, useEmployees, useEmployee } from '@/hooks/useHR'
import { useNavigate, Link } from '@tanstack/react-router'
import { toast } from '@/hooks/use-toast'
import { ProductivityHero } from '@/components/productivity-hero'

export function SalaryCreate() {
    const navigate = useNavigate()
    const createMutation = useCreateSalary()
    const { data: employees = [] } = useEmployees()

    const currentDate = new Date()
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
    const { data: selectedEmployee } = useEmployee(selectedEmployeeId)

    const [formData, setFormData] = useState({
        employeeId: '',
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        status: 'draft' as 'draft',
        baseSalary: 0,
        housingAllowance: 0,
        transportAllowance: 0,
        otherAllowances: 0,
        overtime: 0,
        bonus: 0,
        socialInsurance: 0,
        tax: 0,
        loanDeduction: 0,
        otherDeductions: 0,
        grossSalary: 0,
        totalDeductions: 0,
        netSalary: 0,
        notes: '',
    })

    // Update salary fields when employee is selected
    useEffect(() => {
        if (selectedEmployee) {
            const baseSalary = selectedEmployee.baseSalary || 0
            const housingAllowance = selectedEmployee.housingAllowance || 0
            const transportAllowance = selectedEmployee.transportAllowance || 0
            const otherAllowances = selectedEmployee.otherAllowances || 0

            setFormData(prev => ({
                ...prev,
                employeeId: selectedEmployee.id,
                baseSalary,
                housingAllowance,
                transportAllowance,
                otherAllowances,
            }))
        }
    }, [selectedEmployee])

    // Calculate totals
    useEffect(() => {
        const grossSalary = formData.baseSalary + formData.housingAllowance + formData.transportAllowance +
            formData.otherAllowances + formData.overtime + formData.bonus
        const totalDeductions = formData.socialInsurance + formData.tax + formData.loanDeduction + formData.otherDeductions
        const netSalary = grossSalary - totalDeductions

        setFormData(prev => ({
            ...prev,
            grossSalary,
            totalDeductions,
            netSalary,
        }))
    }, [formData.baseSalary, formData.housingAllowance, formData.transportAllowance, formData.otherAllowances,
    formData.overtime, formData.bonus, formData.socialInsurance, formData.tax, formData.loanDeduction, formData.otherDeductions])

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleEmployeeSelect = (employeeId: string) => {
        setSelectedEmployeeId(employeeId)
        handleChange('employeeId', employeeId)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.employeeId) {
            toast({
                title: 'خطأ',
                description: 'يرجى اختيار الموظف',
                variant: 'destructive',
            })
            return
        }

        try {
            await createMutation.mutateAsync(formData)
            toast({ title: 'تم إنشاء سجل الراتب بنجاح' })
            navigate({ to: '/dashboard/hr/salaries' })
        } catch {
            toast({
                title: 'خطأ',
                description: 'فشل في إنشاء سجل الراتب',
                variant: 'destructive',
            })
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount)
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الرواتب', href: '/dashboard/hr/salaries', isActive: true },
    ]

    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

    return (
        <>
            <Header className="bg-navy">
                <TopNav links={topLinks} />
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <DynamicIsland>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-slate-600">إنشاء سجل راتب</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* Hero Card */}
                <ProductivityHero
                    badge="الموارد البشرية"
                    title="إنشاء سجل راتب"
                    type="hr"
                    listMode={true}
                    hideButtons={true}
                >
                        <Link to="/dashboard/hr/salaries">
                            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </ProductivityHero>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Employee & Period */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <User className="w-5 h-5 text-emerald-600" />
                                        الموظف والفترة
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-3">
                                            <Label>الموظف *</Label>
                                            <Select value={formData.employeeId} onValueChange={handleEmployeeSelect}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="اختر الموظف" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employees.map((emp) => (
                                                        <SelectItem key={emp.id} value={emp.id}>
                                                            {emp.firstName} {emp.lastName} - {emp.department}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>الشهر</Label>
                                            <Select value={String(formData.month)} onValueChange={(v) => handleChange('month', parseInt(v))}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((month, index) => (
                                                        <SelectItem key={index} value={String(index + 1)}>
                                                            {month}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>السنة</Label>
                                            <Input
                                                type="number"
                                                value={formData.year}
                                                onChange={(e) => handleChange('year', parseInt(e.target.value))}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Earnings */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                        المستحقات
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>الراتب الأساسي</Label>
                                            <Input
                                                type="number"
                                                value={formData.baseSalary}
                                                onChange={(e) => handleChange('baseSalary', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>بدل السكن</Label>
                                            <Input
                                                type="number"
                                                value={formData.housingAllowance}
                                                onChange={(e) => handleChange('housingAllowance', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>بدل المواصلات</Label>
                                            <Input
                                                type="number"
                                                value={formData.transportAllowance}
                                                onChange={(e) => handleChange('transportAllowance', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>بدلات أخرى</Label>
                                            <Input
                                                type="number"
                                                value={formData.otherAllowances}
                                                onChange={(e) => handleChange('otherAllowances', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>العمل الإضافي</Label>
                                            <Input
                                                type="number"
                                                value={formData.overtime}
                                                onChange={(e) => handleChange('overtime', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>المكافأة</Label>
                                            <Input
                                                type="number"
                                                value={formData.bonus}
                                                onChange={(e) => handleChange('bonus', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Deductions */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-red-600">
                                        <Calculator className="w-5 h-5" />
                                        الاستقطاعات
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>التأمينات الاجتماعية</Label>
                                            <Input
                                                type="number"
                                                value={formData.socialInsurance}
                                                onChange={(e) => handleChange('socialInsurance', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>الضريبة</Label>
                                            <Input
                                                type="number"
                                                value={formData.tax}
                                                onChange={(e) => handleChange('tax', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>خصم القرض</Label>
                                            <Input
                                                type="number"
                                                value={formData.loanDeduction}
                                                onChange={(e) => handleChange('loanDeduction', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>خصومات أخرى</Label>
                                            <Input
                                                type="number"
                                                value={formData.otherDeductions}
                                                onChange={(e) => handleChange('otherDeductions', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                                    <h3 className="text-lg font-semibold mb-4">ملخص الراتب</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white rounded-xl p-4 text-center">
                                            <p className="text-sm text-slate-500">إجمالي المستحقات</p>
                                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(formData.grossSalary)}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 text-center">
                                            <p className="text-sm text-slate-500">إجمالي الاستقطاعات</p>
                                            <p className="text-xl font-bold text-red-600">{formatCurrency(formData.totalDeductions)}</p>
                                        </div>
                                        <div className="bg-emerald-600 rounded-xl p-4 text-center text-white">
                                            <p className="text-sm text-emerald-100">صافي الراتب</p>
                                            <p className="text-xl font-bold">{formatCurrency(formData.netSalary)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <Label>ملاحظات</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        placeholder="ملاحظات إضافية..."
                                        className="mt-1"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-3">
                                    <Link to="/dashboard/hr/salaries">
                                        <Button variant="outline" type="button" className="rounded-xl">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
                                        disabled={createMutation.isPending}
                                    >
                                        {createMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        حفظ السجل
                                    </Button>
                                </div>
                            </form>
                        </div>

                    <HRSidebar context="salaries" />
                </div>
            </Main>
        </>
    )
}
