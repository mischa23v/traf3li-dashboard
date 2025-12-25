/**
 * Quality Management Types
 * Types for Quality Inspections, Parameters, and Actions
 */

import { z } from 'zod'

export type InspectionType = 'incoming' | 'outgoing' | 'in_process'
export type InspectionStatus = 'pending' | 'accepted' | 'rejected' | 'partially_accepted'
export type ReadingStatus = 'accepted' | 'rejected'
export type ActionType = 'corrective' | 'preventive'
export type ActionStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface QualityInspection {
  _id: string
  inspectionId: string
  inspectionNumber: string
  referenceType: 'purchase_receipt' | 'delivery_note' | 'stock_entry' | 'production'
  referenceId: string
  referenceNumber?: string
  itemId: string
  itemCode?: string
  itemName?: string
  batchNo?: string
  inspectionType: InspectionType
  sampleSize: number
  inspectedBy?: string
  inspectedByName?: string
  inspectionDate: string
  templateId?: string
  templateName?: string
  readings: QualityInspectionReading[]
  status: InspectionStatus
  acceptedQty?: number
  rejectedQty?: number
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface QualityInspectionReading {
  _id?: string
  parameterName: string
  parameterNameAr?: string
  specification?: string
  acceptanceCriteria?: string
  minValue?: number
  maxValue?: number
  value?: number | string
  status: ReadingStatus
  remarks?: string
}

export interface QualityInspectionTemplate {
  _id: string
  templateId: string
  name: string
  nameAr?: string
  itemId?: string
  itemCode?: string
  itemGroup?: string
  readings: {
    parameterName: string
    parameterNameAr?: string
    specification?: string
    acceptanceCriteria?: string
    minValue?: number
    maxValue?: number
    mandatory?: boolean
  }[]
  isDefault?: boolean
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface QualityParameter {
  _id: string
  parameterId: string
  name: string
  nameAr?: string
  description?: string
  parameterType: 'numeric' | 'text' | 'boolean'
  minValue?: number
  maxValue?: number
  formula?: string
  unit?: string
  createdAt: string
  updatedAt: string
}

export interface QualityAction {
  _id: string
  actionId: string
  actionNumber: string
  inspectionId?: string
  type: ActionType
  description: string
  rootCause?: string
  correctiveAction?: string
  preventiveAction?: string
  assignedTo?: string
  assignedToName?: string
  targetDate?: string
  completedDate?: string
  status: ActionStatus
  priority: 'low' | 'medium' | 'high'
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface NonConformanceReport {
  _id: string
  ncrId: string
  ncrNumber: string
  inspectionId?: string
  itemId?: string
  itemCode?: string
  description: string
  rootCause?: string
  correctiveAction?: string
  preventiveAction?: string
  affectedQty?: number
  disposition?: 'rework' | 'scrap' | 'use_as_is' | 'return_to_supplier'
  status: 'open' | 'under_review' | 'resolved' | 'closed'
  closedDate?: string
  createdAt: string
  updatedAt: string
}

export interface QualitySettings {
  _id: string
  defaultInspectionTemplate?: string
  autoInspection?: boolean
  inspectionNamingSeries?: string
  qualityManagerEmail?: string
  sendEmailOnRejection?: boolean
  updatedAt: string
}

export interface QualityFilters {
  inspectionType?: InspectionType
  status?: InspectionStatus
  itemId?: string
  referenceType?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: 'inspectionDate' | 'createdAt' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface QualityStats {
  totalInspections: number
  passRate: number
  failRate: number
  pendingInspections: number
  openActions: number
  byStatus: Record<InspectionStatus, number>
  byType: Record<InspectionType, number>
}

export interface CreateQualityInspectionData {
  referenceType: 'purchase_receipt' | 'delivery_note' | 'stock_entry' | 'production'
  referenceId: string
  itemId: string
  batchNo?: string
  inspectionType: InspectionType
  sampleSize: number
  templateId?: string
  inspectionDate: string
  readings?: Omit<QualityInspectionReading, '_id'>[]
  remarks?: string
}

export const createInspectionSchema = z.object({
  referenceType: z.enum(['purchase_receipt', 'delivery_note', 'stock_entry', 'production']),
  referenceId: z.string().min(1, 'المرجع مطلوب'),
  itemId: z.string().min(1, 'الصنف مطلوب'),
  batchNo: z.string().optional(),
  inspectionType: z.enum(['incoming', 'outgoing', 'in_process']),
  sampleSize: z.number().min(1, 'حجم العينة مطلوب'),
  templateId: z.string().optional(),
  inspectionDate: z.string().min(1, 'تاريخ الفحص مطلوب'),
  remarks: z.string().optional(),
})

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>
