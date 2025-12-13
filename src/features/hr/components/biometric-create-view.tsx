import { useState, useEffect } from 'react'
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
    Search, Bell, Fingerprint, MapPin, Network, CheckCircle,
    Loader2, Server, Settings
} from 'lucide-react'

export function BiometricCreateView() {
    const navigate = useNavigate()
    const searchParams = useSearch({ strict: false }) as { editId?: string }
    const editId = searchParams?.editId
    const isEditMode = !!editId

    // Form State
    const [deviceName, setDeviceName] = useState('')
    const [deviceNameAr, setDeviceNameAr] = useState('')
    const [deviceType, setDeviceType] = useState<'fingerprint' | 'face_recognition' | 'card_reader' | 'hybrid'>('fingerprint')
    const [serialNumber, setSerialNumber] = useState('')
    const [manufacturer, setManufacturer] = useState('')
    const [model, setModel] = useState('')
    const [location, setLocation] = useState('')
    const [locationAr, setLocationAr] = useState('')
    const [ipAddress, setIpAddress] = useState('')
    const [port, setPort] = useState('4370')
    const [status, setStatus] = useState<'active' | 'inactive' | 'maintenance'>('active')
    const [isOnline, setIsOnline] = useState(true)
    const [notes, setNotes] = useState('')

    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        // Placeholder: In real app, this would call the API
        const deviceData = {
            deviceName,
            deviceNameAr,
            deviceType,
            serialNumber,
            manufacturer,
            model,
            location,
            locationAr,
            ipAddress,
            port,
            status,
            isOnline,
            notes,
        }

        // TODO: Replace with actual API call
        // Simulate API call
        setTimeout(() => {
            setIsPending(false)
            navigate({ to: '/dashboard/hr/biometric' })
        }, 1000)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'البصمة', href: '/dashboard/hr/biometric', isActive: true },
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
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
                    badge="الموارد البشرية"
                    title={isEditMode ? 'تعديل بيانات جهاز البصمة' : 'إضافة جهاز بصمة جديد'}
                    type="biometric"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* DEVICE INFO - Basic */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Fingerprint className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        معلومات الجهاز
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">
                                                اسم الجهاز (عربي) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={deviceNameAr}
                                                onChange={(e) => setDeviceNameAr(e.target.value)}
                                                placeholder="جهاز البصمة - المدخل الرئيسي"
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">اسم الجهاز (إنجليزي)</Label>
                                            <Input
                                                value={deviceName}
                                                onChange={(e) => setDeviceName(e.target.value)}
                                                placeholder="Biometric Device - Main Entrance"
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">نوع الجهاز <span className="text-red-500">*</span></Label>
                                            <Select value={deviceType} onValueChange={(v: any) => setDeviceType(v)}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fingerprint">بصمة الإصبع</SelectItem>
                                                    <SelectItem value="face_recognition">التعرف على الوجه</SelectItem>
                                                    <SelectItem value="card_reader">قارئ البطاقات</SelectItem>
                                                    <SelectItem value="hybrid">هجين</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">
                                                الرقم التسلسلي <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={serialNumber}
                                                onChange={(e) => setSerialNumber(e.target.value)}
                                                placeholder="SN123456789"
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">الحالة <span className="text-red-500">*</span></Label>
                                            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">نشط</SelectItem>
                                                    <SelectItem value="inactive">غير نشط</SelectItem>
                                                    <SelectItem value="maintenance">صيانة</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">الشركة المصنعة</Label>
                                            <Select value={manufacturer} onValueChange={setManufacturer}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue placeholder="اختر الشركة المصنعة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ZKTeco">ZKTeco</SelectItem>
                                                    <SelectItem value="Suprema">Suprema</SelectItem>
                                                    <SelectItem value="Hikvision">Hikvision</SelectItem>
                                                    <SelectItem value="Anviz">Anviz</SelectItem>
                                                    <SelectItem value="Other">أخرى</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">الموديل</Label>
                                            <Input
                                                value={model}
                                                onChange={(e) => setModel(e.target.value)}
                                                placeholder="K40"
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* LOCATION - Basic */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                        الموقع
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">الموقع (عربي) <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={locationAr}
                                                onChange={(e) => setLocationAr(e.target.value)}
                                                placeholder="المدخل الرئيسي - الطابق الأول"
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">الموقع (إنجليزي)</Label>
                                            <Input
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="Main Entrance - First Floor"
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* NETWORK SETTINGS */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Network className="w-5 h-5 text-purple-500" aria-hidden="true" />
                                        إعدادات الشبكة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium flex items-center gap-1">
                                                عنوان IP <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={ipAddress}
                                                onChange={(e) => setIpAddress(e.target.value)}
                                                placeholder="192.168.1.100"
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium flex items-center gap-1">
                                                المنفذ (Port)
                                            </Label>
                                            <Input
                                                value={port}
                                                onChange={(e) => setPort(e.target.value)}
                                                placeholder="4370"
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <Label className="text-navy font-medium">متصل بالشبكة</Label>
                                        <Switch
                                            checked={isOnline}
                                            onCheckedChange={setIsOnline}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* NOTES */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-amber-500" />
                                        ملاحظات إضافية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-navy font-medium">ملاحظات</Label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="أي ملاحظات أو تفاصيل إضافية حول الجهاز..."
                                            className="w-full h-32 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SUBMIT BUTTONS */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: '/dashboard/hr/biometric' })}
                                    className="h-12 px-8 rounded-xl"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
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
                                            {isEditMode ? 'حفظ التغييرات' : 'إضافة الجهاز'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <HRSidebar context="biometric" />
                </div>
            </Main>
        </>
    )
}
