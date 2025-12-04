import { useState } from 'react'
import {
    ArrowRight, Save, Loader2, Calendar, FileText, User
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
import { useCreateLeave, useEmployees } from '@/hooks/useHR'
import { useNavigate, Link } from '@tanstack/react-router'
import { toast } from '@/hooks/use-toast'
import { differenceInDays, parseISO } from 'date-fns'
import { ProductivityHero } from '@/components/productivity-hero'

export function LeaveCreate() {
    const navigate = useNavigate()
    const createMutation = useCreateLeave()
    const { data: employees = [] } = useEmployees()

    const [formData, setFormData] = useState({
        employeeId: '',
        leaveType: 'annual' as 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'emergency' | 'hajj' | 'bereavement' | 'study' | 'other',
        startDate: '',
        endDate: '',
        reason: '',
        status: 'pending' as 'pending',
        days: 0,
    })

    const handleChange = (field: string, value: string | number) => {
        const newData = { ...formData, [field]: value }

        // Calculate days when dates change
        if ((field === 'startDate' || field === 'endDate') && newData.startDate && newData.endDate) {
            const start = parseISO(newData.startDate)
            const end = parseISO(newData.endDate)
            const days = differenceInDays(end, start) + 1
            newData.days = days > 0 ? days : 0
        }

        setFormData(newData)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
            toast({
                title: 'خطأ',
                description: 'يرجى ملء جميع الحقول المطلوبة',
                variant: 'destructive',
            })
            return
        }

        try {
            await createMutation.mutateAsync(formData)
            toast({ title: 'تم تقديم طلب الإجازة بنجاح' })
            navigate({ to: '/dashboard/hr/leaves' })
        } catch {
            toast({
                title: 'خطأ',
                description: 'فشل في تقديم طلب الإجازة',
                variant: 'destructive',
            })
        }
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: true },
    ]

    const leaveTypes = [
        { value: 'annual', label: 'إجازة سنوية' },
        { value: 'sick', label: 'إجازة مرضية' },
        { value: 'maternity', label: 'إجازة أمومة' },
        { value: 'paternity', label: 'إجازة أبوة' },
        { value: 'unpaid', label: 'إجازة بدون راتب' },
        { value: 'emergency', label: 'إجازة طارئة' },
        { value: 'hajj', label: 'إجازة حج' },
        { value: 'bereavement', label: 'إجازة وفاة' },
        { value: 'study', label: 'إجازة دراسية' },
        { value: 'other', label: 'أخرى' },
    ]

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
                        <span className="text-sm text-slate-600">طلب إجازة جديد</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                    {/* Hero Card */}
                    <ProductivityHero
                        badge="الموارد البشرية"
                        title="طلب إجازة جديد"
                        type="hr"
                        listMode={true}
                        hideButtons={true}
                    >
                        <Link to="/dashboard/hr/leaves">
                            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </ProductivityHero>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <FileText className="w-5 h-5 text-emerald-600" />
                                        تفاصيل الإجازة
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label>الموظف *</Label>
                                            <Select value={formData.employeeId} onValueChange={(v) => handleChange('employeeId', v)}>
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
                                        <div className="col-span-2">
                                            <Label>نوع الإجازة *</Label>
                                            <Select value={formData.leaveType} onValueChange={(v) => handleChange('leaveType', v)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leaveTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>تاريخ البداية *</Label>
                                            <Input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => handleChange('startDate', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>تاريخ النهاية *</Label>
                                            <Input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => handleChange('endDate', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-emerald-600" />
                                                <span className="text-emerald-800">
                                                    عدد أيام الإجازة: <strong>{formData.days}</strong> يوم
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <Label>سبب الإجازة *</Label>
                                            <Textarea
                                                value={formData.reason}
                                                onChange={(e) => handleChange('reason', e.target.value)}
                                                placeholder="اكتب سبب طلب الإجازة..."
                                                className="mt-1 min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-3">
                                    <Link to="/dashboard/hr/leaves">
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
                                        تقديم الطلب
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-1">
                            <HRSidebar context="leaves" />
                        </div>
                    </div>
            </Main>
        </>
    )
}
