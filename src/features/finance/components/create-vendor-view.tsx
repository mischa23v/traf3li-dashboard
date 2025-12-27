import { useState, useEffect } from 'react'
import {
    Save, Building2, User, Mail, Phone, MapPin,
    Hash, CreditCard, FileText, Loader2, Package, Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useCreateVendor, useUpdateVendor, useVendor } from '@/hooks/useAccounting'
import { ProductivityHero } from '@/components/productivity-hero'
import { Skeleton } from '@/components/ui/skeleton'
import type { CreateVendorData } from '@/services/accountingService'

interface CreateVendorViewProps {
    mode?: 'create' | 'edit'
}

export function CreateVendorView({ mode = 'create' }: CreateVendorViewProps) {
    const navigate = useNavigate()
    const createVendorMutation = useCreateVendor()
    const updateVendorMutation = useUpdateVendor()

    // Get vendorId from params if in edit mode
    const params = useParams({ strict: false }) as { vendorId?: string }
    const vendorId = params?.vendorId

    // Fetch existing vendor data if editing
    const { data: existingVendor, isLoading: isLoadingVendor } = useVendor(vendorId || '', {
        enabled: mode === 'edit' && !!vendorId
    })

    const [formData, setFormData] = useState<CreateVendorData>({
        name: '',
        nameAr: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'السعودية',
        taxNumber: '',
        bankName: '',
        bankAccountNumber: '',
        iban: '',
        category: '',
        notes: '',
    })

    // Populate form with existing vendor data when editing
    useEffect(() => {
        if (mode === 'edit' && existingVendor) {
            setFormData({
                name: existingVendor.name || '',
                nameAr: existingVendor.nameAr || '',
                email: existingVendor.email || '',
                phone: existingVendor.phone || '',
                address: existingVendor.address || '',
                city: existingVendor.city || '',
                country: existingVendor.country || 'السعودية',
                taxNumber: existingVendor.taxNumber || '',
                bankName: existingVendor.bankName || '',
                bankAccountNumber: existingVendor.bankAccountNumber || '',
                iban: existingVendor.iban || '',
                category: existingVendor.category || '',
                notes: existingVendor.notes || '',
            })
        }
    }, [existingVendor, mode])

    const handleInputChange = (field: keyof CreateVendorData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (mode === 'edit' && vendorId) {
            updateVendorMutation.mutate(
                { id: vendorId, data: formData },
                {
                    onSuccess: () => {
                        navigate({ to: '/dashboard/finance/vendors/$vendorId', params: { vendorId } })
                    },
                }
            )
        } else {
            createVendorMutation.mutate(formData, {
                onSuccess: (data) => {
                    navigate({ to: '/dashboard/finance/vendors' })
                },
            })
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'الفواتير المستلمة', href: '/dashboard/finance/bills', isActive: false },
        { title: 'الموردين', href: '/dashboard/finance/vendors', isActive: true },
    ]

    const isLoading = mode === 'edit' && isLoadingVendor

    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>

                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-64" />
                        <Skeleton className="h-[600px] w-full rounded-3xl" />
                    </div>
                </Main>
            </>
        )
    }

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD - Full width */}
                <ProductivityHero
                    badge="الموردين"
                    title={mode === 'edit' ? 'تعديل مورد' : 'إضافة مورد جديد'}
                    type="vendors"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                        المعلومات الأساسية
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                اسم المورد (إنجليزي) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="Vendor Name"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nameAr" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                اسم المورد (عربي)
                                            </Label>
                                            <Input
                                                id="nameAr"
                                                placeholder="اسم المورد"
                                                value={formData.nameAr}
                                                onChange={(e) => handleInputChange('nameAr', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                البريد الإلكتروني<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="vendor@example.com"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                رقم الهاتف<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                            </Label>
                                            <Input
                                                id="phone"
                                                placeholder="+966 5xxxxxxxx"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Package className="w-4 h-4 text-emerald-500" />
                                                الفئة
                                            </Label>
                                            <Input
                                                id="category"
                                                placeholder="مثال: قرطاسية، خدمات، معدات"
                                                value={formData.category}
                                                onChange={(e) => handleInputChange('category', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="taxNumber" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-emerald-500" />
                                                الرقم الضريبي
                                            </Label>
                                            <Input
                                                id="taxNumber"
                                                placeholder="300000000000003"
                                                value={formData.taxNumber}
                                                onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                        معلومات العنوان
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                                                العنوان
                                            </Label>
                                            <Input
                                                id="address"
                                                placeholder="الشارع، الحي، المبنى"
                                                value={formData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="text-sm font-medium text-slate-700">
                                                المدينة
                                            </Label>
                                            <Input
                                                id="city"
                                                placeholder="الرياض"
                                                value={formData.city}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                                                الدولة
                                            </Label>
                                            <Input
                                                id="country"
                                                placeholder="السعودية"
                                                value={formData.country}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Banking Information */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                        المعلومات البنكية
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="bankName" className="text-sm font-medium text-slate-700">
                                                اسم البنك
                                            </Label>
                                            <Input
                                                id="bankName"
                                                placeholder="مثال: البنك الأهلي"
                                                value={formData.bankName}
                                                onChange={(e) => handleInputChange('bankName', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bankAccountNumber" className="text-sm font-medium text-slate-700">
                                                رقم الحساب البنكي<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                            </Label>
                                            <Input
                                                id="bankAccountNumber"
                                                placeholder="12345678"
                                                value={formData.bankAccountNumber}
                                                onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="iban" className="text-sm font-medium text-slate-700">
                                                رقم الآيبان (IBAN)<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                            </Label>
                                            <Input
                                                id="iban"
                                                placeholder="SA00 0000 0000 0000 0000 0000"
                                                value={formData.iban}
                                                onChange={(e) => handleInputChange('iban', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                        ملاحظات
                                    </h3>

                                    <div className="space-y-2">
                                        <Textarea
                                            id="notes"
                                            placeholder="أي ملاحظات إضافية حول المورد..."
                                            value={formData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to={ROUTES.dashboard.finance.vendors.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createVendorMutation.isPending || updateVendorMutation.isPending}
                                    >
                                        {createVendorMutation.isPending || updateVendorMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                {mode === 'edit' ? 'تحديث المورد' : 'حفظ المورد'}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="vendors" />
                </div>
            </Main>
        </>
    )
}
