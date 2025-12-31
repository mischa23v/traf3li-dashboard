/**
 * Manage Availability Dialog - Working Hours Settings
 * إدارة أوقات العمل - إعدادات ساعات العمل
 *
 * Lazy loaded component to reduce initial bundle size
 */

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Settings, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { QueryKeys } from '@/lib/query-keys'
import { CACHE_TIMES } from '@/config/cache'
import crmSettingsService from '@/services/crmSettingsService'

// ==================== Types ====================

const WORKING_DAYS = [
  { key: 'sunday', labelAr: 'الأحد', labelEn: 'Sunday' },
  { key: 'monday', labelAr: 'الإثنين', labelEn: 'Monday' },
  { key: 'tuesday', labelAr: 'الثلاثاء', labelEn: 'Tuesday' },
  { key: 'wednesday', labelAr: 'الأربعاء', labelEn: 'Wednesday' },
  { key: 'thursday', labelAr: 'الخميس', labelEn: 'Thursday' },
  { key: 'friday', labelAr: 'الجمعة', labelEn: 'Friday' },
  { key: 'saturday', labelAr: 'السبت', labelEn: 'Saturday' },
] as const

type DayKey = typeof WORKING_DAYS[number]['key']

interface WorkingHoursDay {
  enabled: boolean
  start: string
  end: string
}

interface WorkingHours {
  sunday: WorkingHoursDay
  monday: WorkingHoursDay
  tuesday: WorkingHoursDay
  wednesday: WorkingHoursDay
  thursday: WorkingHoursDay
  friday: WorkingHoursDay
  saturday: WorkingHoursDay
}

// Default working hours (Sun-Thu, Sat: 9-5, Friday: off)
const DEFAULT_WORKING_HOURS: WorkingHours = {
  sunday: { enabled: true, start: '09:00', end: '17:00' },
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: false, start: '09:00', end: '17:00' },
  saturday: { enabled: true, start: '09:00', end: '17:00' },
}

// ==================== Props Interface ====================

export interface ManageAvailabilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
  canManageOtherLawyers?: boolean
  teamMembers?: Array<{ _id: string; firstName: string; lastName: string }>
  currentUserId?: string
}

// ==================== Component ====================

export function ManageAvailabilityDialog({
  open,
  onOpenChange,
  isRtl,
}: ManageAvailabilityDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch current settings - using proper QueryKeys and caching
  const { data: settingsData, isLoading } = useQuery({
    queryKey: QueryKeys.appointments.crmSettings(),
    queryFn: () => crmSettingsService.getSettings(),
    enabled: open,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    gcTime: CACHE_TIMES.GC_MEDIUM, // 30 minutes
  })

  // Update local state when data loads
  useEffect(() => {
    if (settingsData?.appointmentSettings?.workingHours) {
      setWorkingHours(settingsData.appointmentSettings.workingHours as WorkingHours)
      setHasChanges(false)
    }
  }, [settingsData])

  // Handle day toggle - memoized to prevent unnecessary re-renders
  const handleDayToggle = useCallback((day: DayKey, enabled: boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled },
    }))
    setHasChanges(true)
  }, [])

  // Handle time change - memoized to prevent unnecessary re-renders
  const handleTimeChange = useCallback((day: DayKey, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
    setHasChanges(true)
  }, [])

  // Save changes - memoized with proper dependencies
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await crmSettingsService.updateAllWorkingHours(workingHours)
      toast.success(t('appointments.success.workingHoursSaved', 'تم حفظ أوقات العمل'))
      setHasChanges(false)
      queryClient.invalidateQueries({ queryKey: QueryKeys.appointments.crmSettings() })
      queryClient.invalidateQueries({ queryKey: QueryKeys.appointments.all() })
    } catch (error: any) {
      toast.error(error?.message || t('appointments.errors.saveSettingsFailed', 'فشل في حفظ الإعدادات'))
    } finally {
      setIsSaving(false)
    }
  }, [workingHours, queryClient, t])

  // Keyboard handler - memoized to prevent inline function in JSX
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && hasChanges && !isSaving) {
      e.preventDefault()
      handleSave()
    }
  }, [hasChanges, isSaving, handleSave])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            {t('appointments.dialogs.availability.title', 'إدارة أوقات العمل')}
          </DialogTitle>
          <DialogDescription>
            {t('appointments.dialogs.availability.description', 'حدد أيام وأوقات العمل للمواعيد')}
          </DialogDescription>
        </DialogHeader>

        <div
          className="space-y-4"
          onKeyDown={handleKeyDown}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden="true" />
            </div>
          ) : (
            <div className="space-y-3">
              {WORKING_DAYS.map((day) => {
                const dayHours = workingHours[day.key]
                return (
                  <div
                    key={day.key}
                    className={cn(
                      'p-4 border rounded-xl transition-colors',
                      dayHours.enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      {/* Day name and toggle */}
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={dayHours.enabled}
                          onCheckedChange={(checked) => handleDayToggle(day.key, checked)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <span className={cn(
                          'font-medium',
                          dayHours.enabled ? 'text-emerald-800' : 'text-slate-500'
                        )}>
                          {isRtl ? day.labelAr : day.labelEn}
                        </span>
                      </div>

                      {/* Time inputs */}
                      {dayHours.enabled ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={dayHours.start}
                            onChange={(e) => handleTimeChange(day.key, 'start', e.target.value)}
                            className="w-28 text-center bg-white"
                          />
                          <span className="text-slate-400">-</span>
                          <Input
                            type="time"
                            value={dayHours.end}
                            onChange={(e) => handleTimeChange(day.key, 'end', e.target.value)}
                            className="w-28 text-center bg-white"
                          />
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-slate-400">
                          {t('appointments.labels.dayOff', 'يوم إجازة')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Info box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700">
              {t('appointments.dialogs.availability.infoMessage', 'هذه الإعدادات تحدد أيام وأوقات العمل المتاحة للمواعيد. يمكنك حظر أوقات محددة باستخدام "حظر وقت" في القائمة.')}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close', 'إغلاق')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin me-2" aria-hidden="true" />}
            {t('common.saveChanges', 'حفظ التغييرات')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ManageAvailabilityDialog
