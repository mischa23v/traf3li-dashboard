/**
 * Biometric Hooks
 * React Query hooks for biometric devices, enrollments, logs, and geofences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  deviceService,
  enrollmentService,
  verificationService,
  geofenceService,
} from '@/services/biometricService'
import type {
  CreateDeviceData,
  UpdateDeviceData,
  DeviceFilters,
  CreateEnrollmentData,
  EnrollmentFilters,
  VerificationFilters,
  CreateGeofenceData,
  GeofenceFilters,
} from '@/types/biometric'

// ═══════════════════════════════════════════════════════════════
// DEVICE HOOKS
// ═══════════════════════════════════════════════════════════════

export const useDevices = (filters?: DeviceFilters) => {
  return useQuery({
    queryKey: ['biometric-devices', filters],
    queryFn: () => deviceService.getDevices(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useDevice = (id: string) => {
  return useQuery({
    queryKey: ['biometric-device', id],
    queryFn: () => deviceService.getDevice(id),
    enabled: !!id,
  })
}

export const useCreateDevice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDeviceData) => deviceService.createDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] })
      toast.success('تم إضافة الجهاز بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة الجهاز')
    },
  })
}

export const useUpdateDevice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeviceData }) =>
      deviceService.updateDevice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] })
      queryClient.invalidateQueries({ queryKey: ['biometric-device', variables.id] })
      toast.success('تم تحديث الجهاز بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث الجهاز')
    },
  })
}

export const useDeleteDevice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deviceService.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] })
      toast.success('تم حذف الجهاز بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف الجهاز')
    },
  })
}

export const useSyncDevice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deviceService.syncDevice(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['biometric-device', id] })
      toast.success(`تم مزامنة ${data.synced} سجل بنجاح`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في مزامنة الجهاز')
    },
  })
}

export const useTestDeviceConnection = () => {
  return useMutation({
    mutationFn: (id: string) => deviceService.testConnection(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`الاتصال ناجح - زمن الاستجابة: ${data.latency}ms`)
      } else {
        toast.error('فشل الاتصال بالجهاز')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في اختبار الاتصال')
    },
  })
}

export const useDeviceHealth = (id: string) => {
  return useQuery({
    queryKey: ['device-health', id],
    queryFn: () => deviceService.getDeviceHealth(id),
    enabled: !!id,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false,
  })
}

// ═══════════════════════════════════════════════════════════════
// ENROLLMENT HOOKS
// ═══════════════════════════════════════════════════════════════

export const useEnrollments = (filters?: EnrollmentFilters) => {
  return useQuery({
    queryKey: ['biometric-enrollments', filters],
    queryFn: () => enrollmentService.getEnrollments(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useEnrollment = (id: string) => {
  return useQuery({
    queryKey: ['biometric-enrollment', id],
    queryFn: () => enrollmentService.getEnrollment(id),
    enabled: !!id,
  })
}

export const useEnrollmentByEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: ['biometric-enrollment-employee', employeeId],
    queryFn: () => enrollmentService.getEnrollmentByEmployee(employeeId),
    enabled: !!employeeId,
  })
}

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEnrollmentData) => enrollmentService.createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-enrollments'] })
      toast.success('تم إنشاء التسجيل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء التسجيل')
    },
  })
}

export const useAddFingerprint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ enrollmentId, data }: {
      enrollmentId: string
      data: { finger: string; template: string; quality: number }
    }) => enrollmentService.addFingerprint(enrollmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['biometric-enrollment', variables.enrollmentId] })
      toast.success('تم إضافة بصمة الإصبع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة البصمة')
    },
  })
}

export const useAddFacial = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ enrollmentId, data }: {
      enrollmentId: string
      data: { photo: string; template: string; quality: number }
    }) => enrollmentService.addFacial(enrollmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['biometric-enrollment', variables.enrollmentId] })
      toast.success('تم إضافة بصمة الوجه بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة بصمة الوجه')
    },
  })
}

export const useAssignCard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ enrollmentId, data }: {
      enrollmentId: string
      data: { cardNumber: string; cardType: string; expiresAt?: Date }
    }) => enrollmentService.assignCard(enrollmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['biometric-enrollment', variables.enrollmentId] })
      toast.success('تم تعيين البطاقة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تعيين البطاقة')
    },
  })
}

export const useSuspendEnrollment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      enrollmentService.suspendEnrollment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-enrollments'] })
      toast.success('تم تعليق التسجيل')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تعليق التسجيل')
    },
  })
}

export const useReactivateEnrollment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => enrollmentService.reactivateEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-enrollments'] })
      toast.success('تم إعادة تفعيل التسجيل')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إعادة التفعيل')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION LOG HOOKS
// ═══════════════════════════════════════════════════════════════

export const useVerificationLogs = (filters?: VerificationFilters) => {
  return useQuery({
    queryKey: ['verification-logs', filters],
    queryFn: () => verificationService.getLogs(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useLiveFeed = (limit: number = 20) => {
  return useQuery({
    queryKey: ['verification-live-feed', limit],
    queryFn: () => verificationService.getLiveFeed(limit),
    refetchInterval: 30000, // Refresh every 30 seconds (reduced from 5s for performance)
    retry: false,
  })
}

export const useVerificationStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['verification-stats', startDate, endDate],
    queryFn: () => verificationService.getStats(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  })
}

export const useExportLogs = () => {
  return useMutation({
    mutationFn: (filters?: VerificationFilters) => verificationService.exportLogs(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `verification-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('تم تصدير السجلات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تصدير السجلات')
    },
  })
}

export const useCreateManualEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      employeeId: string
      verificationType: string
      timestamp: Date
      notes?: string
    }) => verificationService.createManualEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-logs'] })
      queryClient.invalidateQueries({ queryKey: ['verification-live-feed'] })
      toast.success('تم إضافة السجل يدوياً')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة السجل')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// GEOFENCE HOOKS
// ═══════════════════════════════════════════════════════════════

export const useGeofences = (filters?: GeofenceFilters) => {
  return useQuery({
    queryKey: ['geofences', filters],
    queryFn: () => geofenceService.getZones(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export const useGeofence = (id: string) => {
  return useQuery({
    queryKey: ['geofence', id],
    queryFn: () => geofenceService.getZone(id),
    enabled: !!id,
  })
}

export const useCreateGeofence = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGeofenceData) => geofenceService.createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('تم إنشاء النطاق الجغرافي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء النطاق')
    },
  })
}

export const useUpdateGeofence = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGeofenceData> }) =>
      geofenceService.updateZone(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      queryClient.invalidateQueries({ queryKey: ['geofence', variables.id] })
      toast.success('تم تحديث النطاق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث النطاق')
    },
  })
}

export const useDeleteGeofence = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => geofenceService.deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('تم حذف النطاق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف النطاق')
    },
  })
}

export const useToggleGeofence = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => geofenceService.toggleZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('تم تغيير حالة النطاق')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تغيير الحالة')
    },
  })
}

export const useCheckLocation = () => {
  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      geofenceService.checkLocation(latitude, longitude),
  })
}

export const useAssignEmployeesToZone = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ zoneId, employeeIds }: { zoneId: string; employeeIds: string[] }) =>
      geofenceService.assignEmployees(zoneId, employeeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] })
      toast.success('تم تعيين الموظفين للنطاق')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تعيين الموظفين')
    },
  })
}
