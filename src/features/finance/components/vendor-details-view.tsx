import {
    ArrowRight, Edit, Download, Printer,
    Calendar, User, CreditCard, Receipt,
    AlertCircle, CheckCircle, Clock, Loader2,
    Mail, FileText, DollarSign, Building2, Phone,
    MapPin, Hash, Trash2, Package, Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useVendor, useDeleteVendor, useBills } from '@/hooks/useAccounting'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'
import { maskIBAN, maskAccountNumber, maskEmail, maskPhone } from '@/utils/data-masking'

export default function VendorDetailsView() {
    const { vendorId } = useParams({ from: '/_authenticated/dashboard/finance/vendors/$vendorId' })
    const navigate = useNavigate()

    const { data: vendor, isLoading, isError, error } = useVendor(vendorId)
    const deleteVendorMutation = useDeleteVendor()

    // Fetch recent bills from this vendor
    const { data: billsData } = useBills({ vendorId, limit: 5 })
    const recentBills = billsData?.data || []

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'الفواتير المستلمة', href: '/dashboard/finance/bills', isActive: false },
        { title: 'الموردين', href: '/dashboard/finance/vendors', isActive: true },
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleDelete = () => {
        if (window.confirm('هل أنت متأكد من حذف هذا المورد؟')) {
            deleteVendorMutation.mutate(vendorId, {
                onSuccess: () => {
                    navigate({ to: '/dashboard/finance/vendors' })
                }
            })
        }
    }

    // Loading State
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-48" />
                        <Skeleton className="h-[400px] w-full rounded-3xl" />
                    </div>
                </Main>
            </>
        )
    }

    // Error State
    if (isError || !vendor) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Button asChild variant="ghost" className="mb-6">
                            <Link to="/dashboard/finance/vendors">
                                <ArrowRight className="h-4 w-4 ms-2" />
                                العودة للموردين
                            </Link>
                        </Button>
                        <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
                            <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" aria-hidden="true" />
                            <h3 className="text-xl font-bold text-navy mb-2">فشل تحميل المورد</h3>
                            <p className="text-slate-500">{error?.message || 'المورد غير موجود'}</p>
                        </Card>
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
                <div className='ms-auto flex items-center gap-4'>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] p-6 lg:p-8 space-y-6">
                <div className="max-w-7xl mx-auto">
                    {/* Back Button & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <Button asChild variant="ghost" className="text-slate-600 hover:text-navy">
                            <Link to="/dashboard/finance/vendors">
                                <ArrowRight className="h-4 w-4 ms-2" />
                                العودة للموردين
                            </Link>
                        </Button>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link to="/dashboard/finance/vendors/$vendorId/edit" params={{ vendorId }}>
                                    <Edit className="h-4 w-4 ms-2" aria-hidden="true" />
                                    تعديل
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={handleDelete}
                                disabled={deleteVendorMutation.isPending}
                            >
                                {deleteVendorMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" aria-hidden="true" />
                                ) : (
                                    <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                )}
                                حذف
                            </Button>
                        </div>
                    </div>

                    {/* Vendor Header Card */}
                    <ProductivityHero
                        badge="المورد"
                        title={vendor.nameAr || vendor.name}
                        type="vendors"
                        listMode={true}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Financial Summary */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-brand-blue" />
                                        الملخص المالي
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-blue-50 rounded-2xl p-4">
                                            <p className="text-sm text-blue-600 mb-1">إجمالي الفواتير</p>
                                            <p className="font-bold text-blue-700 text-xl">
                                                {formatCurrency(vendor.totalBilled || 0)}
                                            </p>
                                        </div>
                                        <div className="bg-emerald-50 rounded-2xl p-4">
                                            <p className="text-sm text-emerald-600 mb-1">المدفوع</p>
                                            <p className="font-bold text-emerald-700 text-xl">
                                                {formatCurrency(vendor.totalPaid || 0)}
                                            </p>
                                        </div>
                                        <div className="bg-amber-50 rounded-2xl p-4">
                                            <p className="text-sm text-amber-600 mb-1">الرصيد المستحق</p>
                                            <p className="font-bold text-amber-700 text-xl">
                                                {formatCurrency(vendor.balance || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Vendor Details */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        معلومات المورد
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">الاسم بالإنجليزية</p>
                                            <p className="font-medium text-navy">{vendor.name || 'غير محدد'}</p>
                                        </div>
                                        {vendor.nameAr && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">الاسم بالعربية</p>
                                                <p className="font-medium text-navy">{vendor.nameAr}</p>
                                            </div>
                                        )}
                                        {vendor.email && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                                    البريد الإلكتروني<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                                </p>
                                                <p className="font-medium text-navy">{maskEmail(vendor.email)}</p>
                                            </div>
                                        )}
                                        {vendor.phone && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                                    <Phone className="h-4 w-4" aria-hidden="true" />
                                                    رقم الهاتف<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                                </p>
                                                <p className="font-medium text-navy">{maskPhone(vendor.phone)}</p>
                                            </div>
                                        )}
                                        {vendor.category && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                                    <Package className="h-4 w-4" />
                                                    الفئة
                                                </p>
                                                <Badge variant="outline">{vendor.category}</Badge>
                                            </div>
                                        )}
                                        {vendor.taxNumber && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                                    <Hash className="h-4 w-4" />
                                                    الرقم الضريبي
                                                </p>
                                                <p className="font-medium text-navy font-mono">{vendor.taxNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Address Information */}
                            {(vendor.address || vendor.city || vendor.country) && (
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                            معلومات العنوان
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {vendor.address && (
                                                <div className="col-span-2">
                                                    <p className="text-sm text-slate-500 mb-1">العنوان</p>
                                                    <p className="font-medium text-navy">{vendor.address}</p>
                                                </div>
                                            )}
                                            {vendor.city && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">المدينة</p>
                                                    <p className="font-medium text-navy">{vendor.city}</p>
                                                </div>
                                            )}
                                            {vendor.country && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">الدولة</p>
                                                    <p className="font-medium text-navy">{vendor.country}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Banking Details */}
                            {(vendor.bankName || vendor.bankAccountNumber || vendor.iban) && (
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                            المعلومات البنكية
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {vendor.bankName && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">اسم البنك</p>
                                                    <p className="font-medium text-navy">{vendor.bankName}</p>
                                                </div>
                                            )}
                                            {vendor.bankAccountNumber && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">رقم الحساب<Lock className="h-3 w-3 text-muted-foreground inline ms-1" /></p>
                                                    <p className="font-medium text-navy font-mono">{maskAccountNumber(vendor.bankAccountNumber)}</p>
                                                </div>
                                            )}
                                            {vendor.iban && (
                                                <div className="col-span-2">
                                                    <p className="text-sm text-slate-500 mb-1">رقم الآيبان (IBAN)<Lock className="h-3 w-3 text-muted-foreground inline ms-1" /></p>
                                                    <p className="font-medium text-navy font-mono">{maskIBAN(vendor.iban)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            {vendor.notes && (
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-navy">ملاحظات</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <p className="text-slate-600 whitespace-pre-wrap">{vendor.notes}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Recent Bills */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        الفواتير المستلمة الأخيرة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {recentBills.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" aria-hidden="true" />
                                            <p>لا توجد فواتير مستلمة من هذا المورد</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentBills.map((bill: any) => (
                                                <Link
                                                    key={bill._id}
                                                    to="/dashboard/finance/bills/$billId"
                                                    params={{ billId: bill._id }}
                                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                                >
                                                    <div>
                                                        <p className="font-medium text-navy">{bill.billNumber}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {formatDate(bill.billDate)}
                                                        </p>
                                                    </div>
                                                    <div className="text-start">
                                                        <p className="font-bold text-navy">
                                                            {formatCurrency(bill.totalAmount)}
                                                        </p>
                                                        <Badge variant={bill.status === 'paid' ? 'default' : 'secondary'}>
                                                            {bill.status === 'paid' ? 'مدفوع' : bill.status === 'pending' ? 'معلق' : 'غير مدفوع'}
                                                        </Badge>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <FinanceSidebar context="vendors" />
                    </div>
                </div>
            </Main>
        </>
    )
}
