/**
 * Security Incident Reporting Service
 * For internal security incident reporting and tracking
 */

import { apiClient } from '@/lib/api'
import { getDeviceInfoSummary } from '@/lib/device-fingerprint'

/**
 * Security incident types
 */
export type IncidentType =
  | 'data_breach'
  | 'unauthorized_access'
  | 'malware'
  | 'phishing'
  | 'ddos'
  | 'insider_threat'
  | 'policy_violation'
  | 'suspicious_activity'
  | 'account_compromise'
  | 'other'

/**
 * Incident severity levels
 */
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low'

/**
 * Security incident data
 */
export interface SecurityIncident {
  type: IncidentType
  severity: IncidentSeverity
  description: string
  affectedSystems?: string[]
  affectedUsers?: string[]
  discoveredAt?: string
  evidenceUrls?: string[]
  additionalInfo?: Record<string, any>
}

/**
 * Incident report response
 */
export interface IncidentReportResponse {
  success: boolean
  data: {
    incidentId: string
    status: 'reported' | 'investigating' | 'resolved' | 'closed'
    reportedAt: string
    reportedBy: string
    estimatedResponseTime?: string
  }
}

/**
 * Report a security incident
 */
export async function reportSecurityIncident(
  incident: SecurityIncident
): Promise<IncidentReportResponse> {
  // Add device info for context
  const deviceInfo = getDeviceInfoSummary()

  const payload = {
    ...incident,
    discoveredAt: incident.discoveredAt || new Date().toISOString(),
    reporterDevice: deviceInfo,
    reportedFrom: window.location.href,
  }

  const response = await apiClient.post('/security-incidents', payload)
  return response.data
}

/**
 * Get incident status
 */
export async function getIncidentStatus(incidentId: string): Promise<{
  success: boolean
  data: {
    incidentId: string
    status: string
    updates: Array<{
      timestamp: string
      message: string
      updatedBy: string
    }>
  }
}> {
  const response = await apiClient.get(`/security-incidents/${incidentId}`)
  return response.data
}

/**
 * Report suspicious login activity
 * Called automatically when unusual login patterns detected
 */
export async function reportSuspiciousLogin(details: {
  reason: string
  ipAddress?: string
  location?: string
  deviceFingerprint?: string
}): Promise<IncidentReportResponse> {
  return reportSecurityIncident({
    type: 'suspicious_activity',
    severity: 'medium',
    description: `نشاط تسجيل دخول مشبوه: ${details.reason}`,
    additionalInfo: details,
  })
}

/**
 * Report potential account compromise
 */
export async function reportAccountCompromise(details: {
  userId: string
  indicators: string[]
  suspectedCause?: string
}): Promise<IncidentReportResponse> {
  return reportSecurityIncident({
    type: 'account_compromise',
    severity: 'high',
    description: 'اشتباه في اختراق حساب مستخدم',
    affectedUsers: [details.userId],
    additionalInfo: {
      indicators: details.indicators,
      suspectedCause: details.suspectedCause,
    },
  })
}

/**
 * Report data breach
 */
export async function reportDataBreach(details: {
  dataTypes: string[]
  estimatedRecords?: number
  discoveryMethod: string
  containmentActions?: string[]
}): Promise<IncidentReportResponse> {
  return reportSecurityIncident({
    type: 'data_breach',
    severity: 'critical',
    description: 'اكتشاف تسرب بيانات محتمل',
    additionalInfo: details,
  })
}

/**
 * Get incident type labels in Arabic
 */
export function getIncidentTypeLabel(type: IncidentType): string {
  const labels: Record<IncidentType, string> = {
    data_breach: 'تسرب بيانات',
    unauthorized_access: 'وصول غير مصرح',
    malware: 'برمجيات خبيثة',
    phishing: 'تصيد احتيالي',
    ddos: 'هجوم حجب الخدمة',
    insider_threat: 'تهديد داخلي',
    policy_violation: 'مخالفة سياسة',
    suspicious_activity: 'نشاط مشبوه',
    account_compromise: 'اختراق حساب',
    other: 'أخرى',
  }
  return labels[type]
}

/**
 * Get severity label in Arabic
 */
export function getSeverityLabel(severity: IncidentSeverity): string {
  const labels: Record<IncidentSeverity, string> = {
    critical: 'حرج',
    high: 'عالي',
    medium: 'متوسط',
    low: 'منخفض',
  }
  return labels[severity]
}

/**
 * Get severity color for UI
 */
export function getSeverityColor(severity: IncidentSeverity): string {
  const colors: Record<IncidentSeverity, string> = {
    critical: 'text-red-700 bg-red-100',
    high: 'text-orange-700 bg-orange-100',
    medium: 'text-yellow-700 bg-yellow-100',
    low: 'text-blue-700 bg-blue-100',
  }
  return colors[severity]
}

export default {
  reportSecurityIncident,
  getIncidentStatus,
  reportSuspiciousLogin,
  reportAccountCompromise,
  reportDataBreach,
  getIncidentTypeLabel,
  getSeverityLabel,
  getSeverityColor,
}
