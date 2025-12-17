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
      // In production, this would redirect to OAuth flow
      toast.info('سيتم تحويلك إلى صفحة تسجيل الدخول...')

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
        toast.success(`تم الاتصال بـ ${providers.find(p => p.id === providerId)?.nameAr} بنجاح`)
      }, 1500)
    } catch (error) {
      toast.error('فشل الاتصال بالتقويم')
    }
  }

  // Disconnect from a calendar provider
  const handleDisconnect = async (providerId: string) => {
    try {
      setProviders(prev =>
        prev.map(p =>
          p.id === providerId ? { ...p, connected: false, lastSync: undefined } : p
        )
      )
      toast.success('تم قطع الاتصال بنجاح')
    } catch (error) {
      toast.error('فشل قطع الاتصال')
    }
  }

  // Sync with a provider
  const handleSync = async (providerId: string) => {
    try {
      toast.info('جاري المزامنة...')

      // Clear any existing timeout
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)

      // Simulate sync - with cleanup ref
      syncTimeoutRef.current = setTimeout(() => {
        setProviders(prev =>
          prev.map(p =>
            p.id === providerId ? { ...p, lastSync: new Date().toISOString() } : p
          )
        )
        toast.success('تمت المزامنة بنجاح')
      }, 2000)
    } catch (error) {
      toast.error('فشلت المزامنة')
    }
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

      toast.success('تم تصدير التقويم بنجاح')
    } catch (error) {
      toast.error('فشل تصدير التقويم')
    } finally {
      setIsExporting(false)
    }
  }

  // Import from ICS file
  const handleImport = async () => {
    if (!importFile) {
      toast.error('يرجى اختيار ملف للاستيراد')
      return
    }

    setIsImporting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const content = e.target?.result as string
        // Parse and import events
        // In production, this would call eventsService.importICS(content)
        toast.success(`تم استيراد الأحداث بنجاح`)
        setImportFile(null)
      }
      reader.readAsText(importFile)
    } catch (error) {
      toast.error('فشل استيراد التقويم')
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
X-WR-CALNAME:تقويم ترافلي القانوني
X-WR-TIMEZONE:Asia/Riyadh
BEGIN:VEVENT
DTSTART:${formatICSDate(now)}
DTEND:${formatICSDate(new Date(now.getTime() + 3600000))}
SUMMARY:مثال على حدث مصدر
DESCRIPTION:هذا حدث مثال تم تصديره من نظام ترافلي
LOCATION:الرياض
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
  }

  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const formatLastSync = (dateStr?: string) => {
    if (!dateStr) return 'لم تتم المزامنة'
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
            مزامنة التقويم
          </DialogTitle>
          <DialogDescription>
            قم بربط تقويمك مع خدمات التقويم الخارجية أو استيراد/تصدير الأحداث
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* External Calendar Providers */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" aria-hidden="true" />
              التقويمات الخارجية
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
                            متصل - آخر مزامنة: {formatLastSync(provider.lastSync)}
                          </span>
                        ) : (
                          'غير متصل'
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
                          مزامنة
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDisconnect(provider.id)}
                        >
                          <X className="h-4 w-4 ms-1" aria-hidden="true" />
                          قطع الاتصال
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleConnect(provider.id)}
                      >
                        <ExternalLink className="h-4 w-4 ms-1" aria-hidden="true" />
                        اتصال
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Auto Sync Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              إعدادات المزامنة التلقائية
            </h3>

            <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">المزامنة التلقائية</Label>
                  <p className="text-sm text-slate-500">
                    مزامنة التقويم تلقائياً مع التقويمات المتصلة
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
                  <Label htmlFor="sync-frequency">تكرار المزامنة</Label>
                  <select
                    id="sync-frequency"
                    value={syncFrequency}
                    onChange={(e) => setSyncFrequency(e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
                  >
                    <option value="5">كل 5 دقائق</option>
                    <option value="15">كل 15 دقيقة</option>
                    <option value="30">كل 30 دقيقة</option>
                    <option value="60">كل ساعة</option>
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
              استيراد / تصدير
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" aria-hidden="true" />
                  تصدير التقويم
                </h4>
                <p className="text-sm text-slate-500 mb-4">
                  تصدير جميع الأحداث إلى ملف ICS يمكن استيراده في أي تطبيق تقويم
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
                  تصدير إلى ICS
                </Button>
              </div>

              {/* Import */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  استيراد من ملف
                </h4>
                <p className="text-sm text-slate-500 mb-4">
                  استيراد أحداث من ملف ICS من تطبيق تقويم آخر
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
                    استيراد
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              ملاحظة: لربط التقويم مع Google أو Outlook، يجب تفعيل هذه الخاصية من إعدادات الخادم.
              تواصل مع مدير النظام لمزيد من المعلومات.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarSyncDialog
