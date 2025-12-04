import { useState } from 'react'
import {
    ArrowRight, Save, Loader2, Clock, User, Calendar
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
import { useCreateAttendance, useEmployees } from '@/hooks/useHR'
import { useNavigate, Link } from '@tanstack/react-router'
import { toast } from '@/hooks/use-toast'
import { ProductivityHero } from '@/components/productivity-hero'

export function AttendanceCreate() {
    const navigate = useNavigate()
    const createMutation = useCreateAttendance()
    const { data: employees = [] } = useEmployees()

    const [formData, setFormData] = useState({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present' as 'present' | 'absent' | 'late' | 'excused',
        checkIn: '08:00',
        checkOut: '17:00',
        workHours: 8,
        notes: '',
    })

    const handleChange = (field: string, value: string | number | null) => {
        const newData = { ...formData, [field]: value }

        // Calculate work hours when times change
        if ((field === 'checkIn' || field === 'checkOut') && newData.checkIn && newData.checkOut) {
            const [inH, inM] = newData.checkIn.split(':').map(Number)
            const [outH, outM] = newData.checkOut.split(':').map(Number)
            const hours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60
            newData.workHours = Math.max(0, Math.round(hours * 10) / 10)
        }

        setFormData(newData)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.employeeId || !formData.date) {
            toast({
                title: 'خطأ',
                description: 'يرجى ملء جميع الحقول المطلوبة',
                variant: 'destructive',
            })
            return
        }

        try {
            await createMutation.mutateAsync(formData)
            toast({ title: 'تم تسجيل الحضور بنجاح' })
            navigate({ to: '/dashboard/hr/attendance' })
        } catch {
            toast({
                title: 'خطأ',
                description: 'فشل في تسجيل الحضور',
                variant: 'destructive',
            })
        }
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: true },
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
                        <span className="text-sm text-slate-600">تسجيل حضور جديد</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* Hero Card */}
                <ProductivityHero
                    badge="الموارد البشرية"
                    title="تسجيل حضور"
                    type="hr"
                    listMode={true}
                    hideButtons={true}
                >
                        <Link to="/dashboard/hr/attendance">
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
                                        <Clock className="w-5 h-5 text-emerald-600" />
                                        بيانات الحضور
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
                                        <div>
                                            <Label>التاريخ *</Label>
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleChange('date', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>الحالة *</Label>
                                            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="present">حاضر</SelectItem>
                                                    <SelectItem value="absent">غائب</SelectItem>
                                                    <SelectItem value="late">متأخر</SelectItem>
                                                    <SelectItem value="excused">مستأذن</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>وقت الدخول</Label>
                                            <Input
                                                type="time"
                                                value={formData.checkIn}
                                                onChange={(e) => handleChange('checkIn', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>وقت الخروج</Label>
                                            <Input
                                                type="time"
                                                value={formData.checkOut}
                                                onChange={(e) => handleChange('checkOut', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-emerald-600" />
                                                <span className="text-emerald-800">
                                                    ساعات العمل: <strong>{formData.workHours}</strong> ساعة
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <Label>ملاحظات</Label>
                                            <Textarea
                                                value={formData.notes}
                                                onChange={(e) => handleChange('notes', e.target.value)}
                                                placeholder="ملاحظات إضافية..."
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-3">
                                    <Link to="/dashboard/hr/attendance">
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

                        <div className="lg:col-span-1">
                            <HRSidebar context="attendance" />
                    </div>
                </div>
            </Main>
        </>
    )
}
