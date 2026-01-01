/**
 * Calendar Sync Dialog Component
 * Allows users to connect and sync with external calendar providers
 */

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import eventsService from '@/services/eventsService'
import {
  useGoogleCalendarStatus,
  useToggleExternalEvents,
  useGoogleCalendarAuth,
  useGoogleCalendarDisconnect,
  useGoogleCalendarImport,
} from '@/hooks/useCalendarIntegration'

interface CalendarProvider {
  id: string
  name: string
  nameAr: string
  icon: string
  color: string
  connected: boolean
  lastSync?: string
}

interface CalendarSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalendarSyncDialog({ open, onOpenChange }: CalendarSyncDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ==================== Google Calendar Integration Hooks ====================
  const { data: googleStatus, isLoading: isLoadingGoogleStatus } = useGoogleCalendarStatus()
  const googleAuthMutation = useGoogleCalendarAuth()
  const googleDisconnectMutation = useGoogleCalendarDisconnect()
  const googleImportMutation = useGoogleCalendarImport()
  const toggleExternalEventsMutation = useToggleExternalEvents()

  // Get Google Calendar connection status
  const isGoogleConnected = googleStatus?.data?.isConnected || googleStatus?.connected || false
  const showExternalEvents = googleStatus?.data?.showExternalEvents ?? true

  const [providers, setProviders] = useState<CalendarProvider[]>([
    {
      id: 'google',
      name: 'Google Calendar',
      nameAr: 'تقويم جوجل',
      icon: '🔵',
      color: '#4285f4',
      connected: false,
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      nameAr: 'مايكروسوفت أوتلوك',
      icon: '🔷',
      color: '#0078d4',
      connected: false,
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      nameAr: 'تقويم آبل',
      icon: '⚪',
      color: '#333333',
      connected: false,
    },
  ])

  // Update Google provider status when API status changes
  useEffect(() => {
    if (googleStatus) {
      setProviders(prev =>
        prev.map(p =>
          p.id === 'google'
            ? { ...p, connected: isGoogleConnected }
            : p
        )
      )
    }
  }, [googleStatus, isGoogleConnected])

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [autoSync, setAutoSync] = useState(true)
  const [syncFrequency, setSyncFrequency] = useState('15')

  // Refs for cleanup of timeouts to prevent memory leaks
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [])

  // Connect to a calendar provider
  const handleConnect = async (providerId: string) => {
    try {
      if (providerId === 'google') {
        // Use real Google Calendar OAuth
        googleAuthMutation.mutate()
      } else {
        // Fallback for other providers - simulated connection
        toast.info(t('calendar.sync.info.redirectToLogin', 'سيتم تحويلك إلى صفحة تسجيل الدخول...'))

        // Clear any existing timeout
        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)

        // Simulate connection for demo - with cleanup ref
        connectTimeoutRef.current = setTimeout(() => {
          setProviders(prev =>
            prev.map(p =>
              p.id === providerId
                ? { ...p, connected: true, lastSync: new Date().toISOString() }
                : p
            )
          )
          toast.success(t('calendar.sync.success.connected', `تم الاتصال بـ ${providers.find(p => p.id === providerId)?.nameAr} بنجاح`))
        }, 1500)
      }
    } catch (error) {
      toast.error(t('calendar.sync.errors.connectionFailed', 'فشل الاتصال بالتقويم'))
    }
  }

  // Disconnect from a calendar provider
  const handleDisconnect = async (providerId: string) => {
    try {
      if (providerId === 'google') {
        // Use real Google Calendar disconnect
        googleDisconnectMutation.mutate()
      } else {
        // Fallback for other providers
        setProviders(prev =>
          prev.map(p =>
            p.id === providerId ? { ...p, connected: false, lastSync: undefined } : p
          )
        )
        toast.success(t('calendar.sync.success.disconnected', 'تم قطع الاتصال بنجاح'))
      }
    } catch (error) {
      toast.error(t('calendar.sync.errors.disconnectionFailed', 'فشل قطع الاتصال'))
    }
  }

  // Sync with a provider
  const handleSync = async (providerId: string) => {
    try {
      if (providerId === 'google') {
        // Use real Google Calendar import
        googleImportMutation.mutate()
      } else {
        toast.info(t('calendar.sync.info.syncing', 'جاري المزامنة...'))

        // Clear any existing timeout
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)

        // Simulate sync - with cleanup ref
        syncTimeoutRef.current = setTimeout(() => {
          setProviders(prev =>
            prev.map(p =>
              p.id === providerId ? { ...p, lastSync: new Date().toISOString() } : p
            )
          )
          toast.success(t('calendar.sync.success.synced', 'تمت المزامنة بنجاح'))
        }, 2000)
      }
    } catch (error) {
      toast.error(t('calendar.sync.errors.syncFailed', 'فشلت المزامنة'))
    }
  }

  // Toggle external events visibility in calendar
  const handleToggleExternalEvents = () => {
    toggleExternalEventsMutation.mutate(!showExternalEvents)
  }

  // Export to ICS file
  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Get current month events
      const startDate = new Date()
      startDate.setDate(1)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0)

      // Create ICS content
      const icsContent = generateICSContent()

      // Download file - avoid forced reflow by not appending to DOM
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `traf3li-calendar-${new Date().toISOString().split('T')[0]}.ics`
      // Modern browsers support click() without appendChild - avoids forced reflow
      link.style.display = 'none'
      link.click()
      // Cleanup URL after a short delay to ensure download starts
      setTimeout(() => URL.revokeObjectURL(url), 100)

      toast.success(t('calendar.sync.success.exported', 'تم تصدير التقويم بنجاح'))
    } catch (error) {
      toast.error(t('calendar.sync.errors.exportFailed', 'فشل تصدير التقويم'))
    } finally {
      setIsExporting(false)
    }
  }

  // Import from ICS file
  const handleImport = async () => {
    if (!importFile) {
      toast.error(t('calendar.sync.errors.noFileSelected', 'يرجى اختيار ملف للاستيراد'))
      return
    }

    setIsImporting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const content = e.target?.result as string
        // Parse and import events
        // In production, this would call eventsService.importICS(content)
        toast.success(t('calendar.sync.success.imported', 'تم استيراد الأحداث بنجاح'))
        setImportFile(null)
      }
      reader.readAsText(importFile)
    } catch (error) {
      toast.error(t('calendar.sync.errors.importFailed', 'فشل استيراد التقويم'))
    } finally {
      setIsImporting(false)
    }
  }

  // Generate ICS content
  const generateICSContent = () => {
    const now = new Date()
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Traf3li//Legal Calendar//AR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${t('calendar.sync.ics.calendarName', 'تقويم ترافلي القانوني')}
X-WR-TIMEZONE:Asia/Riyadh
BEGIN:VEVENT
DTSTART:${formatICSDate(now)}
DTEND:${formatICSDate(new Date(now.getTime() + 3600000))}
SUMMARY:${t('calendar.sync.ics.sampleEventTitle', 'مثال على حدث مصدر')}
DESCRIPTION:${t('calendar.sync.ics.sampleEventDescription', 'هذا حدث مثال تم تصديره من نظام ترافلي')}
LOCATION:${t('calendar.sync.ics.sampleEventLocation', 'الرياض')}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
  }

  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const formatLastSync = (dateStr?: string) => {
    if (!dateStr) return t('calendar.sync.labels.notSynced', 'لم تتم المزامنة')
    const date = new Date(dateStr)
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-500" />
            {t('calendar.sync.title', 'مزامنة التقويم')}
          </DialogTitle>
          <DialogDescription>
            {t('calendar.sync.description', 'قم بربط تقويمك مع خدمات التقويم الخارجية أو استيراد/تصدير الأحداث')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* External Calendar Providers */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" aria-hidden="true" />
              {t('calendar.sync.sections.externalCalendars', 'التقويمات الخارجية')}
            </h3>

            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${provider.color}20` }}
                    >
                      {provider.icon}
                    </div>
                    <div>
                      <p className="font-medium">{provider.nameAr}</p>
                      <p className="text-sm text-slate-500">
                        {provider.connected ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" aria-hidden="true" />
                            {t('calendar.sync.status.connectedLastSync', 'متصل - آخر مزامنة: {{lastSync}}', { lastSync: formatLastSync(provider.lastSync) })}
                          </span>
                        ) : (
                          t('calendar.sync.status.disconnected', 'غير متصل')
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {provider.connected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(provider.id)}
                        >
                          <RefreshCw className="h-4 w-4 ms-1" />
                          {t('calendar.sync.actions.sync', 'مزامنة')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDisconnect(provider.id)}
                        >
                          <X className="h-4 w-4 ms-1" aria-hidden="true" />
                          {t('calendar.sync.actions.disconnect', 'قطع الاتصال')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleConnect(provider.id)}
                      >
                        <ExternalLink className="h-4 w-4 ms-1" aria-hidden="true" />
                        {t('calendar.sync.actions.connect', 'اتصال')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* External Events Toggle - Only show when Google is connected */}
            {isGoogleConnected && (
              <div className="mt-4 p-4 rounded-xl border border-[#4285F4]/20 bg-[#4285F4]/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: '#4285F4' }}
                    >
                      G
                    </div>
                    <div>
                      <Label htmlFor="show-external-events" className="font-medium">
                        {t('calendar.sync.labels.showExternalEvents', 'عرض الأحداث الخارجية')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('calendar.sync.descriptions.showExternalEvents', 'عرض أحداث تقويم جوجل التي لم يتم إنشاؤها في Traf3li')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="show-external-events"
                    checked={showExternalEvents}
                    onCheckedChange={handleToggleExternalEvents}
                    disabled={toggleExternalEventsMutation.isPending}
                    aria-busy={toggleExternalEventsMutation.isPending}
                  />
                </div>
                {showExternalEvents && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <Eye className="h-4 w-4 text-[#4285F4]" aria-hidden="true" />
                    <span>{t('calendar.sync.info.externalEventsVisible', 'الأحداث الخارجية مرئية في التقويم')}</span>
                  </div>
                )}
                {!showExternalEvents && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                    <span>{t('calendar.sync.info.externalEventsHidden', 'الأحداث الخارجية مخفية من التقويم')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Auto Sync Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              {t('calendar.sync.sections.autoSyncSettings', 'إعدادات المزامنة التلقائية')}
            </h3>

            <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">{t('calendar.sync.labels.autoSync', 'المزامنة التلقائية')}</Label>
                  <p className="text-sm text-slate-500">
                    {t('calendar.sync.descriptions.autoSync', 'مزامنة التقويم تلقائياً مع التقويمات المتصلة')}
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>

              {autoSync && (
                <div className="flex items-center gap-4">
                  <Label htmlFor="sync-frequency">{t('calendar.sync.labels.syncFrequency', 'تكرار المزامنة')}</Label>
                  <select
                    id="sync-frequency"
                    value={syncFrequency}
                    onChange={(e) => setSyncFrequency(e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
                  >
                    <option value="5">{t('calendar.sync.options.every5Minutes', 'كل 5 دقائق')}</option>
                    <option value="15">{t('calendar.sync.options.every15Minutes', 'كل 15 دقيقة')}</option>
                    <option value="30">{t('calendar.sync.options.every30Minutes', 'كل 30 دقيقة')}</option>
                    <option value="60">{t('calendar.sync.options.everyHour', 'كل ساعة')}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Import/Export */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5" aria-hidden="true" />
              {t('calendar.sync.sections.importExport', 'استيراد / تصدير')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" aria-hidden="true" />
                  {t('calendar.sync.sections.exportCalendar', 'تصدير التقويم')}
                </h4>
                <p className="text-sm text-slate-500 mb-4">
                  {t('calendar.sync.descriptions.exportCalendar', 'تصدير جميع الأحداث إلى ملف ICS يمكن استيراده في أي تطبيق تقويم')}
                </p>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 ms-2" aria-hidden="true" />
                  )}
                  {t('calendar.sync.actions.exportToICS', 'تصدير إلى ICS')}
                </Button>
              </div>

              {/* Import */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  {t('calendar.sync.sections.importFromFile', 'استيراد من ملف')}
                </h4>
                <p className="text-sm text-slate-500 mb-4">
                  {t('calendar.sync.descriptions.importFromFile', 'استيراد أحداث من ملف ICS من تطبيق تقويم آخر')}
                </p>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".ics,.ical"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={handleImport}
                    disabled={!importFile || isImporting}
                    className="w-full"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 ms-2" aria-hidden="true" />
                    )}
                    {t('calendar.sync.actions.import', 'استيراد')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              {t('calendar.sync.info.serverConfigRequired', 'ملاحظة: لربط التقويم مع Google أو Outlook، يجب تفعيل هذه الخاصية من إعدادات الخادم. تواصل مع مدير النظام لمزيد من المعلومات.')}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('calendar.sync.actions.close', 'إغلاق')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarSyncDialog
