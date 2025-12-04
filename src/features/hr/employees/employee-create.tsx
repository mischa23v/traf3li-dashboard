import { useState } from 'react'
import {
    ArrowRight, Save, Loader2, User, Building2, Mail, Phone,
    MapPin, DollarSign, Calendar, CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useCreateEmployee } from '@/hooks/useHR'
import { useNavigate, Link } from '@tanstack/react-router'
import { toast } from '@/hooks/use-toast'
import { ProductivityHero } from '@/components/productivity-hero'

export function EmployeeCreate() {
    const navigate = useNavigate()
    const createMutation = useCreateEmployee()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        firstNameEn: '',
        lastNameEn: '',
        email: '',
        phone: '',
        mobile: '',
        nationalId: '',
        dateOfBirth: '',
        gender: 'male' as 'male' | 'female',
        nationality: 'سعودي',
        address: '',
        city: '',
        department: '',
        position: '',
        employeeType: 'full_time' as 'full_time' | 'part_time' | 'contractor' | 'intern',
        status: 'active' as 'active' | 'probation',
        hireDate: new Date().toISOString().split('T')[0],
        baseSalary: 0,
        housingAllowance: 0,
        transportAllowance: 0,
        otherAllowances: 0,
        bankName: '',
        bankAccount: '',
        iban: '',
        employeeId: '',
    })

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.department || !formData.position) {
            toast({
                title: 'خطأ',
                description: 'يرجى ملء جميع الحقول المطلوبة',
                variant: 'destructive',
            })
            return
        }

        try {
            await createMutation.mutateAsync(formData)
            toast({ title: 'تم إضافة الموظف بنجاح' })
            navigate({ to: '/dashboard/hr/employees' })
        } catch {
            toast({
                title: 'خطأ',
                description: 'فشل في إضافة الموظف',
                variant: 'destructive',
            })
        }
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: true },
    ]

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
                        <span className="text-sm text-slate-600">إضافة موظف جديد</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <ProductivityHero
                    badge="الموارد البشرية"
                    title="إضافة موظف جديد"
                    type="hr"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <User className="w-5 h-5 text-emerald-600" />
                                        المعلومات الشخصية
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>الاسم الأول *</Label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                                placeholder="أدخل الاسم الأول"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>اسم العائلة *</Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                                placeholder="أدخل اسم العائلة"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>البريد الإلكتروني *</Label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                placeholder="example@company.com"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>رقم الجوال</Label>
                                            <Input
                                                value={formData.mobile}
                                                onChange={(e) => handleChange('mobile', e.target.value)}
                                                placeholder="05xxxxxxxx"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>رقم الهوية</Label>
                                            <Input
                                                value={formData.nationalId}
                                                onChange={(e) => handleChange('nationalId', e.target.value)}
                                                placeholder="رقم الهوية الوطنية"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>تاريخ الميلاد</Label>
                                            <Input
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>الجنس</Label>
                                            <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">ذكر</SelectItem>
                                                    <SelectItem value="female">أنثى</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>الجنسية</Label>
                                            <Input
                                                value={formData.nationality}
                                                onChange={(e) => handleChange('nationality', e.target.value)}
                                                placeholder="الجنسية"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>العنوان</Label>
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => handleChange('address', e.target.value)}
                                                placeholder="العنوان الكامل"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Information */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <Building2 className="w-5 h-5 text-emerald-600" />
                                        بيانات التوظيف
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>رقم الموظف</Label>
                                            <Input
                                                value={formData.employeeId}
                                                onChange={(e) => handleChange('employeeId', e.target.value)}
                                                placeholder="EMP001"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>القسم *</Label>
                                            <Input
                                                value={formData.department}
                                                onChange={(e) => handleChange('department', e.target.value)}
                                                placeholder="اسم القسم"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>المسمى الوظيفي *</Label>
                                            <Input
                                                value={formData.position}
                                                onChange={(e) => handleChange('position', e.target.value)}
                                                placeholder="المسمى الوظيفي"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>نوع التوظيف</Label>
                                            <Select value={formData.employeeType} onValueChange={(v) => handleChange('employeeType', v)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full_time">دوام كامل</SelectItem>
                                                    <SelectItem value="part_time">دوام جزئي</SelectItem>
                                                    <SelectItem value="contractor">متعاقد</SelectItem>
                                                    <SelectItem value="intern">متدرب</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>تاريخ التعيين</Label>
                                            <Input
                                                type="date"
                                                value={formData.hireDate}
                                                onChange={(e) => handleChange('hireDate', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>الحالة</Label>
                                            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">نشط</SelectItem>
                                                    <SelectItem value="probation">تحت التجربة</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Salary Information */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                        البيانات المالية
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>الراتب الأساسي</Label>
                                            <Input
                                                type="number"
                                                value={formData.baseSalary}
                                                onChange={(e) => handleChange('baseSalary', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>بدل السكن</Label>
                                            <Input
                                                type="number"
                                                value={formData.housingAllowance}
                                                onChange={(e) => handleChange('housingAllowance', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>بدل المواصلات</Label>
                                            <Input
                                                type="number"
                                                value={formData.transportAllowance}
                                                onChange={(e) => handleChange('transportAllowance', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>بدلات أخرى</Label>
                                            <Input
                                                type="number"
                                                value={formData.otherAllowances}
                                                onChange={(e) => handleChange('otherAllowances', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>اسم البنك</Label>
                                            <Input
                                                value={formData.bankName}
                                                onChange={(e) => handleChange('bankName', e.target.value)}
                                                placeholder="اسم البنك"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>رقم الآيبان</Label>
                                            <Input
                                                value={formData.iban}
                                                onChange={(e) => handleChange('iban', e.target.value)}
                                                placeholder="SA00 0000 0000 0000 0000 0000"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-3">
                                    <Link to="/dashboard/hr/employees">
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
                                        حفظ الموظف
                                    </Button>
                                </div>
                            </form>
                    </div>

                    <HRSidebar context="employees" />
                </div>
            </Main>
        </>
    )
}
