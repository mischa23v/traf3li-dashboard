/**
 * Calendar Integration Hooks
 * React Query hooks for Google and Microsoft calendar integration
 *
 * خطافات تكامل التقويم
 * خطافات React Query لتكامل تقويم جوجل ومايكروسوفت
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import googleCalendarService from '@/services/googleCalendarService'
import microsoftCalendarService from '@/services/microsoftCalendarService'
import appointmentsService from '@/services/appointmentsService'
import { CACHE_TIMES } from '@/config/cache'
import { QueryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

// ==================== Query Keys (using centralized QueryKeys) ====================
// Re-export for convenience - uses centralized QueryKeys per CLAUDE.md
export const calendarIntegrationKeys = {
  all: QueryKeys.calendarIntegration.all(),
  google: QueryKeys.calendarIntegration.google,
  microsoft: QueryKeys.calendarIntegration.microsoft,
  appointments: {
    calendarStatus: QueryKeys.appointments.calendarStatus,
    calendarLinks: QueryKeys.appointments.calendarLinks,
  },
}

// ==================== Appointment Calendar Hooks ====================

/**
 * Get calendar connection status (Google & Microsoft)
 * الحصول على حالة اتصال التقويم (جوجل ومايكروسوفت)
 */
export function useCalendarStatus() {
  return useQuery({
    queryKey: QueryKeys.appointments.calendarStatus(),
    queryFn: () => appointmentsService.getCalendarStatus(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get "Add to Calendar" links for an appointment
 * الحصول على روابط "إضافة إلى التقويم" للموعد
 */
export function useCalendarLinks(appointmentId: string) {
  return useQuery({
    queryKey: QueryKeys.appointments.calendarLinks(appointmentId),
    queryFn: () => appointmentsService.getCalendarLinks(appointmentId),
    enabled: !!appointmentId,
    staleTime: CACHE_TIMES.LONG,
  })
}

/**
 * Sync appointment to connected calendars
 * مزامنة الموعد مع التقاويم المتصلة
 */
export function useSyncToCalendar() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (appointmentId: string) => appointmentsService.syncToCalendar(appointmentId),
    onSuccess: () => {
      toast.success(t('calendar.syncSuccess', 'تم مزامنة الموعد بنجاح'))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.all() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.syncError', 'فشل في مزامنة الموعد'))
    },
  })
}

/**
 * Download appointment as ICS file
 * تحميل الموعد كملف ICS
 */
export function useDownloadCalendarICS() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const blob = await appointmentsService.getCalendarICS(appointmentId)
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `appointment-${appointmentId}.ics`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      return blob
    },
    onSuccess: () => {
      toast.success(t('calendar.icsDownloaded', 'تم تحميل ملف التقويم'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.icsError', 'فشل في تحميل ملف التقويم'))
    },
  })
}

// ==================== Google Calendar Hooks ====================

/**
 * Get Google Calendar connection status
 * الحصول على حالة اتصال تقويم جوجل
 */
export function useGoogleCalendarStatus() {
  return useQuery({
    queryKey: QueryKeys.calendarIntegration.google.status(),
    queryFn: () => googleCalendarService.getStatus(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get Google Calendar OAuth URL and redirect
 * الحصول على رابط مصادقة جوجل والتوجيه
 */
export function useGoogleCalendarAuth() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => googleCalendarService.getAuthUrl(),
    onSuccess: (data) => {
      if (data.data.authUrl) {
        window.location.href = data.data.authUrl
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.google.authError', 'فشل في الاتصال بتقويم جوجل'))
    },
  })
}

/**
 * Disconnect Google Calendar
 * فصل تقويم جوجل
 */
export function useGoogleCalendarDisconnect() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => googleCalendarService.disconnect(),
    onSuccess: () => {
      toast.success(t('calendar.google.disconnected', 'تم فصل تقويم جوجل'))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.google.all() })
      queryClient.invalidateQueries({ queryKey: QueryKeys.appointments.calendarStatus() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.google.disconnectError', 'فشل في فصل تقويم جوجل'))
    },
  })
}

/**
 * Get user's Google calendars
 * الحصول على تقاويم جوجل للمستخدم
 */
export function useGoogleCalendars() {
  return useQuery({
    queryKey: QueryKeys.calendarIntegration.google.calendars(),
    queryFn: () => googleCalendarService.getCalendars(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get events from Google calendar
 * الحصول على أحداث تقويم جوجل
 */
export function useGoogleEvents(calendarId: string, params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [...QueryKeys.calendarIntegration.google.events(calendarId), params?.startDate ?? '', params?.endDate ?? ''],
    queryFn: () => googleCalendarService.getEvents(calendarId, params),
    enabled: !!calendarId,
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Create event in Google calendar
 * إنشاء حدث في تقويم جوجل
 */
export function useCreateGoogleEvent() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ calendarId, event }: { calendarId: string; event: Parameters<typeof googleCalendarService.createEvent>[1] }) =>
      googleCalendarService.createEvent(calendarId, event),
    onSuccess: (_, { calendarId }) => {
      toast.success(t('calendar.google.eventCreated', 'تم إنشاء الحدث في تقويم جوجل'))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.google.events(calendarId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.google.eventCreateError', 'فشل في إنشاء الحدث'))
    },
  })
}

/**
 * Import events from Google
 * استيراد الأحداث من جوجل
 */
export function useGoogleCalendarImport() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => googleCalendarService.syncImport(),
    onSuccess: (data) => {
      toast.success(t('calendar.google.importSuccess', `تم استيراد ${data.imported} حدث`))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendar.all() })
      queryClient.invalidateQueries({ queryKey: QueryKeys.appointments.all() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.google.importError', 'فشل في الاستيراد من جوجل'))
    },
  })
}

/**
 * Export event to Google
 * تصدير حدث إلى جوجل
 */
export function useGoogleCalendarExport() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (eventId: string) => googleCalendarService.syncExport(eventId),
    onSuccess: () => {
      toast.success(t('calendar.google.exportSuccess', 'تم تصدير الحدث إلى جوجل'))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.google.all() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.google.exportError', 'فشل في التصدير إلى جوجل'))
    },
  })
}

/**
 * Get Google sync settings
 * الحصول على إعدادات مزامنة جوجل
 */
export function useGoogleSyncSettings() {
  return useQuery({
    queryKey: QueryKeys.calendarIntegration.google.syncSettings(),
    queryFn: () => googleCalendarService.getSyncSettings(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Toggle Google auto-sync
 * تبديل المزامنة التلقائية لجوجل
 */
export function useGoogleAutoSync() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (enable: boolean) =>
      enable ? googleCalendarService.enableAutoSync() : googleCalendarService.disableAutoSync(),
    onSuccess: (_, enable) => {
      toast.success(
        enable
          ? t('calendar.google.autoSyncEnabled', 'تم تفعيل المزامنة التلقائية')
          : t('calendar.google.autoSyncDisabled', 'تم تعطيل المزامنة التلقائية')
      )
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.google.syncSettings() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.google.autoSyncError', 'فشل في تغيير إعدادات المزامنة'))
    },
  })
}

/**
 * Toggle showing external Google Calendar events in the calendar view
 * تبديل عرض أحداث تقويم جوجل الخارجية في عرض التقويم
 */
export function useToggleExternalEvents() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (showExternalEvents: boolean) =>
      googleCalendarService.updateShowExternalEvents(showExternalEvents),
    // Optimistic update for instant UI feedback
    onMutate: async (showExternalEvents) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QueryKeys.calendarIntegration.google.status() })

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(QueryKeys.calendarIntegration.google.status())

      // Optimistically update to the new value
      queryClient.setQueryData(QueryKeys.calendarIntegration.google.status(), (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          showExternalEvents,
        },
      }))

      // Return context with previous value for rollback
      return { previousStatus }
    },
    onSuccess: (_, showExternalEvents) => {
      toast.success(
        showExternalEvents
          ? t('calendar.google.externalEventsEnabled', 'تم تفعيل عرض الأحداث الخارجية')
          : t('calendar.google.externalEventsDisabled', 'تم تعطيل عرض الأحداث الخارجية')
      )
      // Invalidate calendar grid to refresh the displayed events
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendar.all() })
    },
    onError: (error: Error, _, context) => {
      // Rollback to previous value on error
      if (context?.previousStatus) {
        queryClient.setQueryData(QueryKeys.calendarIntegration.google.status(), context.previousStatus)
      }
      toast.error(error.message || t('calendar.google.externalEventsError', 'فشل في تغيير إعداد الأحداث الخارجية'))
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.google.status() })
    },
  })
}

// ==================== Microsoft Calendar Hooks ====================

/**
 * Get Microsoft Calendar connection status
 * الحصول على حالة اتصال تقويم مايكروسوفت
 */
export function useMicrosoftCalendarStatus() {
  return useQuery({
    queryKey: QueryKeys.calendarIntegration.microsoft.status(),
    queryFn: () => microsoftCalendarService.getStatus(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get Microsoft Calendar OAuth URL and redirect
 * الحصول على رابط مصادقة مايكروسوفت والتوجيه
 */
export function useMicrosoftCalendarAuth() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => microsoftCalendarService.getAuthUrl(),
    onSuccess: (data) => {
      if (data.data.authUrl) {
        window.location.href = data.data.authUrl
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.microsoft.authError', 'فشل في الاتصال بتقويم مايكروسوفت'))
    },
  })
}

/**
 * Disconnect Microsoft Calendar
 * فصل تقويم مايكروسوفت
 */
export function useMicrosoftCalendarDisconnect() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => microsoftCalendarService.disconnect(),
    onSuccess: () => {
      toast.success(t('calendar.microsoft.disconnected', 'تم فصل تقويم مايكروسوفت'))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.microsoft.all() })
      queryClient.invalidateQueries({ queryKey: QueryKeys.appointments.calendarStatus() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.microsoft.disconnectError', 'فشل في فصل تقويم مايكروسوفت'))
    },
  })
}

/**
 * Get user's Microsoft calendars
 * الحصول على تقاويم مايكروسوفت للمستخدم
 */
export function useMicrosoftCalendars() {
  return useQuery({
    queryKey: QueryKeys.calendarIntegration.microsoft.calendars(),
    queryFn: () => microsoftCalendarService.getCalendars(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get events from Microsoft calendar
 * الحصول على أحداث تقويم مايكروسوفت
 */
export function useMicrosoftEvents(params?: { calendarId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [...QueryKeys.calendarIntegration.microsoft.events(), params?.calendarId ?? '', params?.startDate ?? '', params?.endDate ?? ''],
    queryFn: () => microsoftCalendarService.getEvents(params),
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Create event in Microsoft calendar
 * إنشاء حدث في تقويم مايكروسوفت
 */
export function useCreateMicrosoftEvent() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (event: Parameters<typeof microsoftCalendarService.createEvent>[0]) =>
      microsoftCalendarService.createEvent(event),
    onSuccess: () => {
      toast.success(t('calendar.microsoft.eventCreated', 'تم إنشاء الحدث في تقويم مايكروسوفت'))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.microsoft.events() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.microsoft.eventCreateError', 'فشل في إنشاء الحدث'))
    },
  })
}

/**
 * Import events from Microsoft
 * استيراد الأحداث من مايكروسوفت
 */
export function useMicrosoftCalendarImport() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => microsoftCalendarService.syncFromMicrosoft(),
    onSuccess: (data) => {
      toast.success(t('calendar.microsoft.importSuccess', `تم استيراد ${data.imported} حدث`))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendar.all() })
      queryClient.invalidateQueries({ queryKey: QueryKeys.appointments.all() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.microsoft.importError', 'فشل في الاستيراد من مايكروسوفت'))
    },
  })
}

/**
 * Export event to Microsoft
 * تصدير حدث إلى مايكروسوفت
 */
export function useMicrosoftCalendarExport() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (eventId: string) => microsoftCalendarService.syncToMicrosoft(eventId),
    onSuccess: () => {
      toast.success(t('calendar.microsoft.exportSuccess', 'تم تصدير الحدث إلى مايكروسوفت'))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.microsoft.all() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.microsoft.exportError', 'فشل في التصدير إلى مايكروسوفت'))
    },
  })
}

/**
 * Toggle Microsoft auto-sync
 * تبديل المزامنة التلقائية لمايكروسوفت
 */
export function useMicrosoftAutoSync() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (enable: boolean) =>
      enable ? microsoftCalendarService.enableAutoSync() : microsoftCalendarService.disableAutoSync(),
    onSuccess: (_, enable) => {
      toast.success(
        enable
          ? t('calendar.microsoft.autoSyncEnabled', 'تم تفعيل المزامنة التلقائية')
          : t('calendar.microsoft.autoSyncDisabled', 'تم تعطيل المزامنة التلقائية')
      )
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.microsoft.all() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.microsoft.autoSyncError', 'فشل في تغيير إعدادات المزامنة'))
    },
  })
}

/**
 * Refresh Microsoft token
 * تحديث رمز مايكروسوفت
 */
export function useMicrosoftRefreshToken() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => microsoftCalendarService.refreshToken(),
    onSuccess: () => {
      toast.success(t('calendar.microsoft.tokenRefreshed', 'تم تحديث الرمز'))
      queryClient.invalidateQueries({ queryKey: QueryKeys.calendarIntegration.microsoft.status() })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('calendar.microsoft.tokenRefreshError', 'فشل في تحديث الرمز'))
    },
  })
}
