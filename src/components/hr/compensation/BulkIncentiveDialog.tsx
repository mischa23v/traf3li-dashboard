import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkCreateIncentives } from '@/hooks/useEmployeeIncentive'
import type {
  CreateEmployeeIncentiveData,
  IncentiveType,
  ReferenceType,
} from '@/services/employeeIncentiveService'
import {
  incentiveTypeLabels,
  referenceTypeLabels,
} from '@/services/employeeIncentiveService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2, Upload, Download, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

interface BulkIncentiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface IncentiveRow {
  id: string
  employeeId: string
  employeeName: string
  employeeNameAr: string
  employeeNumber?: string
  departmentId: string
  departmentName?: string
  departmentNameAr?: string
  incentiveType: IncentiveType
  incentiveAmount: number
  currency: string
  payrollDate: string
  incentiveReason: string
  incentiveReasonAr: string
  referenceType?: ReferenceType
  referenceId?: string
  officeId: string
  isValid: boolean
  errors?: string[]
}

// Mock data - In production, these would come from APIs
const MOCK_EMPLOYEES = [
  {
    id: '1',
    nameAr: 'أحمد محمد السعيد',
    nameEn: 'Ahmed Mohammed Al-Said',
    number: 'EMP001',
    departmentId: 'dept1',
    departmentNameAr: 'قسم المبيعات',
    departmentNameEn: 'Sales Department',
  },
  {
    id: '2',
    nameAr: 'فاطمة علي الأحمد',
    nameEn: 'Fatima Ali Al-Ahmad',
    number: 'EMP002',
    departmentId: 'dept2',
    departmentNameAr: 'قسم التسويق',
    departmentNameEn: 'Marketing Department',
  },
  {
    id: '3',
    nameAr: 'محمد عبدالله الخالد',
    nameEn: 'Mohammed Abdullah Al-Khalid',
    number: 'EMP003',
    departmentId: 'dept1',
    departmentNameAr: 'قسم المبيعات',
    departmentNameEn: 'Sales Department',
  },
]

export function BulkIncentiveDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkIncentiveDialogProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // State
  const [incentives, setIncentives] = useState<IncentiveRow[]>([])
  const [commonSettings, setCommonSettings] = useState({
    incentiveType: 'performance_bonus' as IncentiveType,
    currency: 'SAR',
    payrollDate: new Date().toISOString().split('T')[0],
    officeId: 'office1',
    referenceType: '' as ReferenceType | '',
    referenceId: '',
  })

  // Mutations
  const bulkCreateMutation = useBulkCreateIncentives()

  // Add a new row
  const addIncentiveRow = () => {
    const newRow: IncentiveRow = {
      id: `new-${Date.now()}`,
      employeeId: '',
      employeeName: '',
      employeeNameAr: '',
      employeeNumber: '',
      departmentId: '',
      departmentName: '',
      departmentNameAr: '',
      incentiveType: commonSettings.incentiveType,
      incentiveAmount: 0,
      currency: commonSettings.currency,
      payrollDate: commonSettings.payrollDate,
      incentiveReason: '',
      incentiveReasonAr: '',
      referenceType: commonSettings.referenceType || undefined,
      referenceId: commonSettings.referenceId || undefined,
      officeId: commonSettings.officeId,
      isValid: false,
      errors: [],
    }
    setIncentives([...incentives, newRow])
  }

  // Remove a row
  const removeIncentiveRow = (id: string) => {
    setIncentives(incentives.filter((i) => i.id !== id))
  }

  // Update a row
  const updateIncentiveRow = (id: string, field: string, value: any) => {
    setIncentives(
      incentives.map((incentive) => {
        if (incentive.id === id) {
          const updated = { ...incentive, [field]: value }

          // If employee changes, update employee details
          if (field === 'employeeId') {
            const employee = MOCK_EMPLOYEES.find((e) => e.id === value)
            if (employee) {
              updated.employeeName = employee.nameEn
              updated.employeeNameAr = employee.nameAr
              updated.employeeNumber = employee.number
              updated.departmentId = employee.departmentId
              updated.departmentName = employee.departmentNameEn
              updated.departmentNameAr = employee.departmentNameAr
            }
          }

          // Validate
          updated.isValid = validateIncentiveRow(updated)
          return updated
        }
        return incentive
      })
    )
  }

  // Validate a row
  const validateIncentiveRow = (incentive: IncentiveRow): boolean => {
    const errors: string[] = []

    if (!incentive.employeeId) errors.push('Employee required')
    if (!incentive.incentiveAmount || incentive.incentiveAmount <= 0)
      errors.push('Amount must be greater than 0')
    if (!incentive.incentiveReason) errors.push('Reason (English) required')
    if (!incentive.incentiveReasonAr) errors.push('Reason (Arabic) required')
    if (!incentive.payrollDate) errors.push('Payroll date required')
    if (!incentive.officeId) errors.push('Office required')

    incentive.errors = errors
    return errors.length === 0
  }

  // Apply common settings to all rows
  const applyCommonSettings = () => {
    setIncentives(
      incentives.map((incentive) => ({
        ...incentive,
        incentiveType: commonSettings.incentiveType,
        currency: commonSettings.currency,
        payrollDate: commonSettings.payrollDate,
        officeId: commonSettings.officeId,
        referenceType: commonSettings.referenceType || undefined,
        referenceId: commonSettings.referenceId || undefined,
      }))
    )
    toast.success(isArabic ? 'تم تطبيق الإعدادات على جميع الصفوف' : 'Settings applied to all rows')
  }

  // Submit
  const handleSubmit = async () => {
    // Validate all rows
    const validatedIncentives = incentives.map((incentive) => ({
      ...incentive,
      isValid: validateIncentiveRow(incentive),
    }))

    setIncentives(validatedIncentives)

    const invalidCount = validatedIncentives.filter((i) => !i.isValid).length
    if (invalidCount > 0) {
      toast.error(
        isArabic
          ? `${invalidCount} صف غير صالح. الرجاء التحقق من البيانات.`
          : `${invalidCount} invalid row(s). Please check the data.`
      )
      return
    }

    if (validatedIncentives.length === 0) {
      toast.error(isArabic ? 'الرجاء إضافة حوافز' : 'Please add incentives')
      return
    }

    try {
      const payload: CreateEmployeeIncentiveData[] = validatedIncentives.map((incentive) => ({
        employeeId: incentive.employeeId,
        employeeName: incentive.employeeName,
        employeeNameAr: incentive.employeeNameAr,
        employeeNumber: incentive.employeeNumber,
        departmentId: incentive.departmentId,
        departmentName: incentive.departmentName,
        departmentNameAr: incentive.departmentNameAr,
        incentiveType: incentive.incentiveType,
        incentiveAmount: incentive.incentiveAmount,
        currency: incentive.currency,
        payrollDate: incentive.payrollDate,
        incentiveReason: incentive.incentiveReason,
        incentiveReasonAr: incentive.incentiveReasonAr,
        referenceType: incentive.referenceType,
        referenceId: incentive.referenceId,
        officeId: incentive.officeId,
      }))

      await bulkCreateMutation.mutateAsync({ incentives: payload })
      onOpenChange(false)
      setIncentives([])
      onSuccess?.()
    } catch (error) {
      console.error('Error creating bulk incentives:', error)
    }
  }

  // Download CSV template
  const downloadTemplate = () => {
    const headers = [
      'Employee ID',
      'Incentive Type',
      'Amount',
      'Currency',
      'Payroll Date',
      'Reason (English)',
      'Reason (Arabic)',
      'Reference Type',
      'Reference ID',
    ]
    const csvContent = headers.join(',') + '\n'

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'incentives-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast.success(isArabic ? 'تم تنزيل القالب' : 'Template downloaded')
  }

  const validCount = incentives.filter((i) => i.isValid).length
  const invalidCount = incentives.filter((i) => !i.isValid).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto lg:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'إنشاء حوافز جماعي' : 'Bulk Create Incentives'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'أضف حوافز متعددة للموظفين دفعة واحدة'
              : 'Add multiple employee incentives at once'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Common Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isArabic ? 'الإعدادات المشتركة' : 'Common Settings'}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? 'سيتم تطبيق هذه الإعدادات على جميع الحوافز'
                  : 'These settings will be applied to all incentives'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isArabic ? 'نوع الحافز' : 'Incentive Type'}</Label>
                  <Select
                    value={commonSettings.incentiveType}
                    onValueChange={(value) =>
                      setCommonSettings({
                        ...commonSettings,
                        incentiveType: value as IncentiveType,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(incentiveTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {isArabic ? label.ar : label.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isArabic ? 'العملة' : 'Currency'}</Label>
                  <Select
                    value={commonSettings.currency}
                    onValueChange={(value) =>
                      setCommonSettings({ ...commonSettings, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">
                        {isArabic ? 'ريال سعودي' : 'Saudi Riyal'}
                      </SelectItem>
                      <SelectItem value="USD">
                        {isArabic ? 'دولار أمريكي' : 'US Dollar'}
                      </SelectItem>
                      <SelectItem value="EUR">{isArabic ? 'يورو' : 'Euro'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isArabic ? 'تاريخ الرواتب' : 'Payroll Date'}</Label>
                  <Input
                    type="date"
                    value={commonSettings.payrollDate}
                    onChange={(e) =>
                      setCommonSettings({ ...commonSettings, payrollDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={applyCommonSettings} variant="outline" size="sm">
                  {isArabic ? 'تطبيق على الكل' : 'Apply to All'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={addIncentiveRow} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {isArabic ? 'إضافة صف' : 'Add Row'}
              </Button>
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {isArabic ? 'تنزيل القالب' : 'Download Template'}
              </Button>
            </div>

            {incentives.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {isArabic ? 'إجمالي:' : 'Total:'} {incentives.length} |{' '}
                {isArabic ? 'صالح:' : 'Valid:'}{' '}
                <span className="text-green-600">{validCount}</span> |{' '}
                {isArabic ? 'غير صالح:' : 'Invalid:'}{' '}
                <span className="text-red-600">{invalidCount}</span>
              </div>
            )}
          </div>

          {/* Incentives Table */}
          {incentives.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>{isArabic ? 'الموظف' : 'Employee'}</TableHead>
                    <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                    <TableHead>{isArabic ? 'المبلغ' : 'Amount'}</TableHead>
                    <TableHead>{isArabic ? 'السبب (EN)' : 'Reason (EN)'}</TableHead>
                    <TableHead>{isArabic ? 'السبب (AR)' : 'Reason (AR)'}</TableHead>
                    <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead className="w-[80px]">
                      {isArabic ? 'إجراءات' : 'Actions'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incentives.map((incentive, index) => (
                    <TableRow key={incentive.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Select
                          value={incentive.employeeId}
                          onValueChange={(value) =>
                            updateIncentiveRow(incentive.id, 'employeeId', value)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue
                              placeholder={isArabic ? 'اختر الموظف' : 'Select Employee'}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_EMPLOYEES.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {isArabic ? employee.nameAr : employee.nameEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={incentive.incentiveType}
                          onValueChange={(value) =>
                            updateIncentiveRow(incentive.id, 'incentiveType', value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(incentiveTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {isArabic ? label.ar : label.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={incentive.incentiveAmount || ''}
                          onChange={(e) =>
                            updateIncentiveRow(
                              incentive.id,
                              'incentiveAmount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-[120px]"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={incentive.incentiveReason}
                          onChange={(e) =>
                            updateIncentiveRow(incentive.id, 'incentiveReason', e.target.value)
                          }
                          className="w-[200px]"
                          placeholder="Reason..."
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={incentive.incentiveReasonAr}
                          onChange={(e) =>
                            updateIncentiveRow(
                              incentive.id,
                              'incentiveReasonAr',
                              e.target.value
                            )
                          }
                          className="w-[200px]"
                          placeholder="السبب..."
                        />
                      </TableCell>
                      <TableCell>
                        {incentive.isValid ? (
                          <Badge variant="default" className="bg-green-600">
                            {isArabic ? 'صالح' : 'Valid'}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            {isArabic ? 'غير صالح' : 'Invalid'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => removeIncentiveRow(incentive.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{isArabic ? 'لا توجد حوافز' : 'No Incentives'}</AlertTitle>
              <AlertDescription>
                {isArabic
                  ? 'الرجاء إضافة حوافز باستخدام زر "إضافة صف"'
                  : 'Please add incentives using the "Add Row" button'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={bulkCreateMutation.isPending}
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={bulkCreateMutation.isPending || incentives.length === 0}
          >
            {bulkCreateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isArabic ? 'إنشاء' : 'Create'} ({incentives.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
