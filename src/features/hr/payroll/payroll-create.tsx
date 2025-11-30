import { useState } from 'react'
import {
    ArrowRight, Save, Loader2, DollarSign, Calendar, Users
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
import { useCreatePayroll, useEmployees } from '@/hooks/useHR'
import { useNavigate, Link } from '@tanstack/react-router'
import { toast } from '@/hooks/use-toast'
import { ProductivityHero } from '@/components/productivity-hero'

export function PayrollCreate() {
    const navigate = useNavigate()
    const createMutation = useCreatePayroll()
    const { data: employees = [] } = useEmployees()

    const currentDate = new Date()
    const [formData, setFormData] = useState({
        title: '',
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        status: 'draft' as 'draft',
        periodStart: '',
        periodEnd: '',
        paymentDate: '',
        totalEmployees: employees.length,
        totalGrossSalary: 0,
        totalDeductions: 0,
        totalNetSalary: 0,
        notes: '',
    })

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.periodStart || !formData.periodEnd) {
            toast({
                title: 'خطأ',
                description: 'يرجى ملء جميع الحقول المطلوبة',
                variant: 'destructive',
            })
            return
        }

        try {
            await createMutation.mutateAsync(formData)
            toast({ title: 'تم إنشاء مسير الرواتب بنجاح' })
            navigate({ to: '/dashboard/hr/payroll' })
        } catch {
            toast({
                title: 'خطأ',
                description: 'فشل في إنشاء مسير الرواتب',
                variant: 'destructive',
            })
        }
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'مسيرات الرواتب', href: '/dashboard/hr/payroll', isActive: true },
    ]

    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

    return (
        <>
            <Header>
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
                        <span className="text-sm text-slate-600">إنشاء مسير رواتب</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main className="bg-[#f8f9fa] min-h-screen">
                <div className="bg-[#022c22] rounded-tr-3xl min-h-screen -mt-4 -mr-4 -ml-4 p-6">
                    {/* Hero Card */}
                    <ProductivityHero
                        badge="الموارد البشرية"
                        title="إنشاء مسير رواتب"
                        type="hr"
                        hideButtons={true}
                    >
                        <Link to="/dashboard/hr/payroll">
                            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </ProductivityHero>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                        بيانات المسير
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label>عنوان المسير *</Label>
                                            <Input
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                                placeholder={`مسير رواتب ${months[formData.month - 1]} ${formData.year}`}
                                                className="mt-1"
                                            />
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
                                        <div>
                                            <Label>بداية الفترة *</Label>
                                            <Input
                                                type="date"
                                                value={formData.periodStart}
                                                onChange={(e) => handleChange('periodStart', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>نهاية الفترة *</Label>
                                            <Input
                                                type="date"
                                                value={formData.periodEnd}
                                                onChange={(e) => handleChange('periodEnd', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>تاريخ الدفع</Label>
                                            <Input
                                                type="date"
                                                value={formData.paymentDate}
                                                onChange={(e) => handleChange('paymentDate', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Employees Info */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="w-5 h-5 text-emerald-600" />
                                        <h3 className="text-lg font-semibold">الموظفين</h3>
                                    </div>
                                    <div className="bg-white rounded-xl p-4">
                                        <p className="text-sm text-slate-500 mb-2">سيتم تضمين جميع الموظفين النشطين في هذا المسير</p>
                                        <p className="text-2xl font-bold text-emerald-600">{employees.filter(e => e.status === 'active').length} موظف</p>
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
                                    <Link to="/dashboard/hr/payroll">
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
                                        إنشاء المسير
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-1">
                            <HRSidebar context="payroll" />
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
