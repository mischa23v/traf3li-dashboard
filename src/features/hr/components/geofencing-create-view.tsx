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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { useCreateGeofence, useUpdateGeofence, useGeofence } from '@/hooks/useBiometric'
import { cn } from '@/lib/utils'
import {
    Search, Bell, MapPin, Loader2, CheckCircle, Circle, Hexagon, Plus, Trash2, AlertCircle, Clock
} from 'lucide-react'
import type { CreateGeofenceData, GeofenceType } from '@/types/biometric'
import { MapContainer, TileLayer, Circle as LeafletCircle, Polygon as LeafletPolygon, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface CoordinatePoint {
    id: string
    latitude: number
    longitude: number
}

// Map Click Handler Component
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onClick(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

export function GeofencingCreateView() {
    const navigate = useNavigate()
    const searchParams = useSearch({ strict: false }) as { editId?: string }
    const editId = searchParams?.editId
    const isEditMode = !!editId

    const { data: existingZone, isLoading: isLoadingZone } = useGeofence(editId || '')
    const createMutation = useCreateGeofence()
    const updateMutation = useUpdateGeofence()

    // Form State
    const [name, setName] = useState('')
    const [type, setType] = useState<GeofenceType>('circle')
    const [centerLat, setCenterLat] = useState<number>(24.7136) // Default: Riyadh
    const [centerLng, setCenterLng] = useState<number>(46.6753)
    const [radius, setRadius] = useState<number>(500)
    const [coordinates, setCoordinates] = useState<CoordinatePoint[]>([])
    const [isActive, setIsActive] = useState(true)

    // Settings
    const [allowClockIn, setAllowClockIn] = useState(true)
    const [allowClockOut, setAllowClockOut] = useState(true)
    const [alertOnEntry, setAlertOnEntry] = useState(false)
    const [alertOnExit, setAlertOnExit] = useState(false)
    const [restrictedHours, setRestrictedHours] = useState(false)
    const [startTime, setStartTime] = useState('08:00')
    const [endTime, setEndTime] = useState('17:00')

    // Populate form when editing
    useEffect(() => {
        if (existingZone && isEditMode) {
            setName(existingZone.name)
            setType(existingZone.type)
            setIsActive(existingZone.isActive)

            if (existingZone.center) {
                setCenterLat(existingZone.center.latitude)
                setCenterLng(existingZone.center.longitude)
            }

            if (existingZone.radius) {
                setRadius(existingZone.radius)
            }

            if (existingZone.coordinates) {
                setCoordinates(existingZone.coordinates.map((coord, idx) => ({
                    id: `coord-${idx}`,
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                })))
            }

            setAllowClockIn(existingZone.settings.allowClockIn)
            setAllowClockOut(existingZone.settings.allowClockOut)
            setAlertOnEntry(existingZone.settings.alertOnEntry)
            setAlertOnExit(existingZone.settings.alertOnExit)

            if (existingZone.settings.restrictedHours) {
                setRestrictedHours(true)
                setStartTime(existingZone.settings.restrictedHours.start)
                setEndTime(existingZone.settings.restrictedHours.end)
            }
        }
    }, [existingZone, isEditMode])

    // Handle map click for polygon
    const handleMapClick = (lat: number, lng: number) => {
        if (type === 'polygon') {
            setCoordinates([...coordinates, {
                id: `coord-${Date.now()}`,
                latitude: lat,
                longitude: lng,
            }])
        } else if (type === 'circle') {
            setCenterLat(lat)
            setCenterLng(lng)
        }
    }

    // Remove polygon point
    const removeCoordinate = (id: string) => {
        setCoordinates(coordinates.filter(c => c.id !== id))
    }

    // Clear all polygon points
    const clearCoordinates = () => {
        setCoordinates([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const zoneData: CreateGeofenceData = {
            name,
            type,
            settings: {
                allowClockIn,
                allowClockOut,
                alertOnEntry,
                alertOnExit,
                restrictedHours: restrictedHours ? {
                    start: startTime,
                    end: endTime,
                } : undefined,
            },
        }

        if (type === 'circle') {
            zoneData.center = {
                latitude: centerLat,
                longitude: centerLng,
            }
            zoneData.radius = radius
        } else if (type === 'polygon') {
            zoneData.coordinates = coordinates.map(c => ({
                latitude: c.latitude,
                longitude: c.longitude,
            }))
        }

        if (isEditMode && editId) {
            updateMutation.mutate(
                { id: editId, data: zoneData },
                {
                    onSuccess: () => {
                        navigate({ to: '/dashboard/hr/geofencing/$zoneId', params: { zoneId: editId } })
                    }
                }
            )
        } else {
            createMutation.mutate(zoneData, {
                onSuccess: (data) => {
                    navigate({ to: '/dashboard/hr/geofencing/$zoneId', params: { zoneId: data._id } })
                }
            })
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
        { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: false },
        { title: 'النطاق الجغرافي', href: '/dashboard/hr/geofencing', isActive: true },
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
                    title={isEditMode ? 'تعديل نطاق جغرافي' : 'إضافة نطاق جغرافي جديد'}
                    type="geofencing"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* BASIC INFO */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        معلومات النطاق
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-navy font-medium">
                                            اسم النطاق <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="مثال: مكتب الرياض الرئيسي"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-navy font-medium">
                                            نوع النطاق <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={type} onValueChange={(v) => setType(v as GeofenceType)}>
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="circle">
                                                    <div className="flex items-center gap-2">
                                                        <Circle className="h-4 w-4" />
                                                        دائري (نقطة مركزية + نصف قطر)
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="polygon">
                                                    <div className="flex items-center gap-2">
                                                        <Hexagon className="h-4 w-4" />
                                                        متعدد الأضلاع (نقاط متعددة)
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <Label className="text-navy font-medium">حالة النطاق</Label>
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={setIsActive}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* MAP AND COORDINATES */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        {type === 'circle' ? <Circle className="w-5 h-5 text-blue-500" /> : <Hexagon className="w-5 h-5 text-purple-500" />}
                                        {type === 'circle' ? 'الموقع ونصف القطر' : 'نقاط الحدود'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {type === 'circle' ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">خط العرض (Latitude)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.000001"
                                                        value={centerLat}
                                                        onChange={(e) => setCenterLat(parseFloat(e.target.value))}
                                                        className="h-11 rounded-xl"
                                                        dir="ltr"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">خط الطول (Longitude)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.000001"
                                                        value={centerLng}
                                                        onChange={(e) => setCenterLng(parseFloat(e.target.value))}
                                                        className="h-11 rounded-xl"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-navy font-medium">نصف القطر (بالمتر)</Label>
                                                <Input
                                                    type="number"
                                                    value={radius}
                                                    onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
                                                    min={50}
                                                    step={50}
                                                    className="h-11 rounded-xl max-w-xs"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" aria-hidden="true" />
                                                    <div className="text-sm text-blue-800">
                                                        <strong>كيفية رسم النطاق:</strong>
                                                        <p>اضغط على الخريطة لإضافة نقاط الحدود. يجب إضافة 3 نقاط على الأقل.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {coordinates.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-navy font-medium">النقاط ({coordinates.length})</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={clearCoordinates}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 ms-1" />
                                                            مسح الكل
                                                        </Button>
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                                        {coordinates.map((coord, idx) => (
                                                            <div key={coord.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                                <span className="text-sm font-medium text-navy min-w-[30px]">#{idx + 1}</span>
                                                                <span className="text-sm text-slate-600 flex-1" dir="ltr">
                                                                    {coord.latitude.toFixed(6)}, {coord.longitude.toFixed(6)}
                                                                </span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeCoordinate(coord.id)}
                                                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Interactive Map */}
                                    <div className="rounded-2xl overflow-hidden border-2 border-slate-200" style={{ height: '400px' }}>
                                        <MapContainer
                                            center={[centerLat, centerLng]}
                                            zoom={13}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <MapClickHandler onClick={handleMapClick} />

                                            {type === 'circle' ? (
                                                <>
                                                    <Marker position={[centerLat, centerLng]} />
                                                    <LeafletCircle
                                                        center={[centerLat, centerLng]}
                                                        radius={radius}
                                                        pathOptions={{
                                                            color: '#10b981',
                                                            fillColor: '#10b981',
                                                            fillOpacity: 0.2,
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    {coordinates.map((coord) => (
                                                        <Marker
                                                            key={coord.id}
                                                            position={[coord.latitude, coord.longitude]}
                                                        />
                                                    ))}
                                                    {coordinates.length >= 3 && (
                                                        <LeafletPolygon
                                                            positions={coordinates.map(c => [c.latitude, c.longitude])}
                                                            pathOptions={{
                                                                color: '#8b5cf6',
                                                                fillColor: '#8b5cf6',
                                                                fillOpacity: 0.2,
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </MapContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SETTINGS */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-amber-500" />
                                        إعدادات النطاق
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <Label className="text-navy font-medium">السماح بتسجيل الدخول</Label>
                                        <Switch
                                            checked={allowClockIn}
                                            onCheckedChange={setAllowClockIn}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <Label className="text-navy font-medium">السماح بتسجيل الخروج</Label>
                                        <Switch
                                            checked={allowClockOut}
                                            onCheckedChange={setAllowClockOut}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <Label className="text-navy font-medium">تنبيه عند الدخول</Label>
                                        <Switch
                                            checked={alertOnEntry}
                                            onCheckedChange={setAlertOnEntry}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <Label className="text-navy font-medium">تنبيه عند الخروج</Label>
                                        <Switch
                                            checked={alertOnExit}
                                            onCheckedChange={setAlertOnExit}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <Label className="text-navy font-medium">تقييد بساعات معينة</Label>
                                        <Switch
                                            checked={restrictedHours}
                                            onCheckedChange={setRestrictedHours}
                                        />
                                    </div>

                                    {restrictedHours && (
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                            <div className="space-y-2">
                                                <Label className="text-navy font-medium">من الساعة</Label>
                                                <Input
                                                    type="time"
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-navy font-medium">إلى الساعة</Label>
                                                <Input
                                                    type="time"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* SUBMIT BUTTONS */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: '/dashboard/hr/geofencing' })}
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
                                            {isEditMode ? 'حفظ التغييرات' : 'إضافة النطاق'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <HRSidebar context="geofencing" />
                </div>
            </Main>
        </>
    )
}
