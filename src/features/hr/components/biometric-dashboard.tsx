import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Fingerprint,
  Scan,
  CreditCard,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Settings,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Search,
  Bell,
  ChevronLeft,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductivityHero } from '@/components/productivity-hero'
import { HRSidebar } from './hr-sidebar'
import {
  useDevices,
  useEnrollments,
  useLiveFeed,
  useVerificationStats,
  useSyncDevice,
  useTestDeviceConnection,
} from '@/hooks/useBiometric'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { BiometricDevice, VerificationLog } from '@/types/biometric'

const statusColors: Record<string, string> = {
  online: 'bg-emerald-100 text-emerald-700',
  offline: 'bg-red-100 text-red-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  error: 'bg-orange-100 text-orange-700',
}

const verificationResultColors: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  spoofing_detected: 'bg-orange-100 text-orange-700',
  unknown_user: 'bg-yellow-100 text-yellow-700',
  device_error: 'bg-gray-100 text-gray-700',
}

export function BiometricDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState<'devices' | 'enrollments' | 'logs'>('devices')

  // Fetch data
  const { data: devicesData, isLoading: devicesLoading } = useDevices()
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments()
  const { data: liveFeed, isLoading: feedLoading } = useLiveFeed(10)
  const { data: stats } = useVerificationStats()

  // Mutations
  const { mutate: syncDevice, isPending: syncing } = useSyncDevice()
  const { mutate: testConnection } = useTestDeviceConnection()

  const devices = devicesData?.data || []
  const enrollments = enrollmentsData?.data || []
  const feed = liveFeed || []

  const onlineDevices = devices.filter((d) => d.status === 'online').length
  const totalEnrolled = enrollments.filter((e) => e.status === 'complete').length

  const topNav = [
    { title: t('biometric.devices'), href: '/dashboard/hr/biometric', isActive: true },
    { title: t('biometric.geofencing'), href: '/dashboard/hr/geofencing', isActive: false },
    { title: t('hrAnalytics.title'), href: '/dashboard/hr/analytics', isActive: false },
    { title: t('hrPredictions.title'), href: '/dashboard/hr/predictions', isActive: false },
  ]

  const tabs = [
    { id: 'devices' as const, label: t('biometric.devices'), icon: Wifi },
    { id: 'enrollments' as const, label: t('biometric.enrollments'), icon: Users },
    { id: 'logs' as const, label: t('biometric.logs'), icon: Clock },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD */}
        <ProductivityHero
          badge={t('biometric.management')}
          title={t('biometric.title')}
          type="biometric"
        />

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Wifi className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">
                  {devicesLoading ? <Skeleton className="h-8 w-16" /> : onlineDevices}
                </div>
                <div className="text-sm text-slate-500">{t('biometric.onlineDevices')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">
                  {enrollmentsLoading ? <Skeleton className="h-8 w-16" /> : totalEnrolled}
                </div>
                <div className="text-sm text-slate-500">{t('biometric.enrolledEmployees')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">
                  {stats ? `${stats.successRate.toFixed(1)}%` : <Skeleton className="h-8 w-16" />}
                </div>
                <div className="text-sm text-slate-500">{t('biometric.successRate')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">
                  {stats ? stats.totalVerifications.toLocaleString() : <Skeleton className="h-8 w-16" />}
                </div>
                <div className="text-sm text-slate-500">{t('biometric.todayVerifications')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-4 flex gap-2 border-b border-slate-100">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={
                      activeTab === tab.id
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4'
                    }
                  >
                    <tab.icon className="h-4 w-4 me-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Devices Tab */}
              {activeTab === 'devices' && (
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-navy text-lg">{t('biometric.connectedDevices')}</h3>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">
                      <Plus className="h-4 w-4 me-2" />
                      {t('biometric.addDevice')}
                    </Button>
                  </div>

                  {devicesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                      ))}
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <WifiOff className="h-8 w-8 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-700 mb-2">{t('biometric.noDevices')}</h4>
                      <p className="text-slate-500 mb-4">{t('biometric.addFirstDevice')}</p>
                      <Button className="bg-emerald-500 hover:bg-emerald-600">
                        <Plus className="h-4 w-4 me-2" />
                        {t('biometric.addDevice')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {devices.map((device: BiometricDevice) => (
                        <DeviceCard
                          key={device._id}
                          device={device}
                          onSync={() => syncDevice(device._id)}
                          onTest={() => testConnection(device._id)}
                          syncing={syncing}
                          t={t}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Enrollments Tab */}
              {activeTab === 'enrollments' && (
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-navy text-lg">{t('biometric.employeeEnrollments')}</h3>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">
                      <Plus className="h-4 w-4 me-2" />
                      {t('biometric.enrollEmployee')}
                    </Button>
                  </div>

                  {enrollmentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                      ))}
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-700 mb-2">{t('biometric.noEnrollments')}</h4>
                      <p className="text-slate-500 mb-4">{t('biometric.startEnrolling')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrollments.slice(0, 10).map((enrollment) => (
                        <div
                          key={enrollment._id}
                          className="bg-[#F8F9FA] rounded-xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                              <Users className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                              <div className="font-medium text-navy">
                                {enrollment.employeeName || enrollment.employeeId}
                              </div>
                              <div className="flex gap-2 mt-1">
                                {enrollment.fingerprints.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Fingerprint className="h-3 w-3 me-1" />
                                    {enrollment.fingerprints.length}
                                  </Badge>
                                )}
                                {enrollment.facial && (
                                  <Badge variant="outline" className="text-xs">
                                    <Scan className="h-3 w-3 me-1" />
                                    {t('biometric.facial')}
                                  </Badge>
                                )}
                                {enrollment.card && (
                                  <Badge variant="outline" className="text-xs">
                                    <CreditCard className="h-3 w-3 me-1" />
                                    {t('biometric.card')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className={`${
                            enrollment.status === 'complete'
                              ? 'bg-emerald-100 text-emerald-700'
                              : enrollment.status === 'partial'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-slate-100 text-slate-700'
                          } border-0`}>
                            {t(`biometric.status.${enrollment.status}`)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'logs' && (
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-navy text-lg">{t('biometric.verificationLogs')}</h3>
                    <Button variant="outline" className="rounded-lg">
                      {t('common.export')}
                    </Button>
                  </div>

                  {feedLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : feed.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-700 mb-2">{t('biometric.noLogs')}</h4>
                      <p className="text-slate-500">{t('biometric.logsWillAppear')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {feed.map((log: VerificationLog) => (
                        <div
                          key={log._id}
                          className="bg-[#F8F9FA] rounded-xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              log.result === 'success' ? 'bg-emerald-50' : 'bg-red-50'
                            }`}>
                              {log.result === 'success' ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-navy">
                                {log.employeeName || t('biometric.unknownEmployee')}
                              </div>
                              <div className="text-sm text-slate-500">
                                {log.deviceName} • {t(`biometric.type.${log.verificationType}`)}
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <Badge className={`${verificationResultColors[log.result]} border-0`}>
                              {t(`biometric.result.${log.result}`)}
                            </Badge>
                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(log.timestamp).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <HRSidebar context="biometric" />
        </div>
      </Main>
    </>
  )
}

// Device Card Component
function DeviceCard({
  device,
  onSync,
  onTest,
  syncing,
  t,
}: {
  device: BiometricDevice
  onSync: () => void
  onTest: () => void
  syncing: boolean
  t: (key: string) => string
}) {
  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            device.status === 'online' ? 'bg-emerald-50' : 'bg-slate-100'
          }`}>
            {device.deviceType === 'fingerprint' ? (
              <Fingerprint className={`h-6 w-6 ${device.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`} />
            ) : device.deviceType === 'facial' ? (
              <Scan className={`h-6 w-6 ${device.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`} />
            ) : (
              <CreditCard className={`h-6 w-6 ${device.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`} />
            )}
          </div>
          <div>
            <h4 className="font-bold text-navy">{device.deviceName}</h4>
            <div className="text-sm text-slate-500">{device.location.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[device.status]} border-0`}>
            {device.status === 'online' ? (
              <Wifi className="h-3 w-3 me-1" />
            ) : (
              <WifiOff className="h-3 w-3 me-1" />
            )}
            {t(`biometric.deviceStatus.${device.status}`)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onTest}>
                <Activity className="h-4 w-4 me-2" />
                {t('biometric.testConnection')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSync} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 me-2 ${syncing ? 'animate-spin' : ''}`} />
                {t('biometric.syncDevice')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 me-2" />
                {t('biometric.deviceSettings')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-xl p-3">
          <div className="text-lg font-bold text-navy">
            {device.manufacturer.toUpperCase()}
          </div>
          <div className="text-xs text-slate-500">{t('biometric.manufacturer')}</div>
        </div>
        <div className="bg-white rounded-xl p-3">
          <div className="text-lg font-bold text-navy">
            {device.connection.ipAddress || '-'}
          </div>
          <div className="text-xs text-slate-500">{t('biometric.ipAddress')}</div>
        </div>
        <div className="bg-white rounded-xl p-3">
          <div className="text-lg font-bold text-navy">
            {device.lastSync
              ? new Date(device.lastSync).toLocaleDateString()
              : t('common.never')}
          </div>
          <div className="text-xs text-slate-500">{t('biometric.lastSync')}</div>
        </div>
      </div>
    </div>
  )
}
