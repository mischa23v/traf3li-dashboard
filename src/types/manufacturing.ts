/**
 * Manufacturing Types
 * Types for BOM, Work Orders, and Production Management
 */

import { z } from 'zod'

export type BomType = 'standard' | 'template' | 'subcontract'
export type WorkOrderStatus = 'draft' | 'submitted' | 'not_started' | 'in_progress' | 'completed' | 'stopped' | 'cancelled'
export type JobCardStatus = 'draft' | 'open' | 'work_in_progress' | 'completed' | 'cancelled'
export type OperationType = 'assembly' | 'disassembly' | 'packing' | 'testing' | 'other'

export interface BillOfMaterials {
  _id: string
  bomId: string
  bomNumber: string
  itemId: string
  itemCode?: string
  itemName?: string
  bomType: BomType
  quantity: number
  uom: string
  isActive: boolean
  isDefault: boolean
  items: BomItem[]
  operations?: BomOperation[]
  routingId?: string
  totalCost?: number
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface BomItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  qty: number
  uom: string
  rate?: number
  amount?: number
  sourceWarehouse?: string
  includeInManufacturing?: boolean
}

export interface BomOperation {
  _id?: string
  operation: string
  operationAr?: string
  workstation?: string
  timeInMins: number
  operatingCost?: number
  description?: string
  sequence: number
}

export interface Workstation {
  _id: string
  workstationId: string
  name: string
  nameAr?: string
  workstationType?: string
  productionCapacity?: number
  hourRate?: number
  electricityCost?: number
  consumableCost?: number
  rentCost?: number
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface WorkOrder {
  _id: string
  workOrderId: string
  workOrderNumber: string
  itemId: string
  itemCode?: string
  itemName?: string
  bomId: string
  bomNumber?: string
  qty: number
  producedQty: number
  uom: string
  plannedStartDate: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
  targetWarehouse: string
  workInProgressWarehouse?: string
  sourceWarehouse?: string
  status: WorkOrderStatus
  docStatus: 0 | 1 | 2
  salesOrderId?: string
  materialRequestId?: string
  requiredItems?: WorkOrderItem[]
  operations?: WorkOrderOperation[]
  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface WorkOrderItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  requiredQty: number
  transferredQty: number
  consumedQty: number
  uom: string
  sourceWarehouse?: string
  rate?: number
  amount?: number
}

export interface WorkOrderOperation {
  _id?: string
  operation: string
  workstation?: string
  plannedTime: number
  actualTime?: number
  status: 'pending' | 'in_progress' | 'completed'
  completedQty: number
  sequence: number
}

export interface JobCard {
  _id: string
  jobCardId: string
  jobCardNumber: string
  workOrderId: string
  workOrderNumber?: string
  operation: string
  workstation?: string
  itemId: string
  itemCode?: string
  itemName?: string
  forQuantity: number
  completedQty: number
  status: JobCardStatus
  startedTime?: string
  completedTime?: string
  timeInMins?: number
  employee?: string
  employeeName?: string
  timeLogs?: {
    fromTime: string
    toTime: string
    completedQty: number
    remarks?: string
  }[]
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface ProductionPlan {
  _id: string
  planId: string
  planNumber: string
  planName?: string
  postingDate: string
  fromDate: string
  toDate: string
  items: {
    itemId: string
    itemCode?: string
    itemName?: string
    plannedQty: number
    bomId?: string
    warehouse?: string
  }[]
  status: 'draft' | 'submitted' | 'in_progress' | 'completed' | 'cancelled'
  workOrdersCreated?: string[]
  materialRequestsCreated?: string[]
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface ManufacturingSettings {
  _id: string
  capacityPlanningForDays?: number
  disableCapacityPlanning?: boolean
  allowOverproduction?: boolean
  overproductionPercentage?: number
  defaultWorkInProgressWarehouse?: string
  defaultFinishedGoodsWarehouse?: string
  workOrderNamingSeries?: string
  jobCardNamingSeries?: string
  updatedAt: string
}

export interface ManufacturingFilters {
  status?: WorkOrderStatus
  itemId?: string
  bomId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: 'plannedStartDate' | 'createdAt' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ManufacturingStats {
  totalWorkOrders: number
  inProgressOrders: number
  completedOrders: number
  totalBOMs: number
  activeBOMs: number
  totalWorkstations: number
  productionEfficiency?: number
  byStatus: Record<WorkOrderStatus, number>
}

export interface CreateBomData {
  itemId: string
  bomType?: BomType
  quantity: number
  uom: string
  items: Omit<BomItem, '_id'>[]
  operations?: Omit<BomOperation, '_id'>[]
  isActive?: boolean
  isDefault?: boolean
  remarks?: string
}

export interface CreateWorkOrderData {
  itemId: string
  bomId: string
  qty: number
  plannedStartDate: string
  plannedEndDate?: string
  targetWarehouse: string
  sourceWarehouse?: string
  salesOrderId?: string
  materialRequestId?: string
  remarks?: string
}

export const createBomSchema = z.object({
  itemId: z.string().min(1, 'الصنف مطلوب'),
  bomType: z.enum(['standard', 'template', 'subcontract']).default('standard'),
  quantity: z.number().min(0.001, 'الكمية مطلوبة'),
  uom: z.string().min(1, 'وحدة القياس مطلوبة'),
  items: z.array(z.object({
    itemId: z.string().min(1),
    qty: z.number().min(0.001),
    uom: z.string().min(1),
    rate: z.number().optional(),
  })).min(1, 'يجب إضافة مكون واحد على الأقل'),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  remarks: z.string().optional(),
})

export type CreateBomInput = z.infer<typeof createBomSchema>
