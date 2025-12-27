import { useState } from 'react'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStaffContext } from './staff-provider'
import { staffRoles, departureReasons } from '../data/data'
import firmService from '@/services/firmService'
import { useAuthStore } from '@/stores/auth-store'

export function StaffReinstateDialog() {
  const { open, setOpen, currentRow } = useStaffContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const user = useAuthStore((state) => state.user)
  const firmId = user?.firmId || user?.lawyerProfile?.firmID

  const handleReinstate = async () => {
    if (!currentRow || !firmId) return

    setIsSubmitting(true)
    try {
      await firmService.reinstateMember(firmId, currentRow._id)
      toast.success('Member reinstated successfully | تمت إعادة تفعيل الموظف بنجاح')
      invalidateCache.staff.all()
      invalidateCache.users.team()
      invalidateCache.staff.departed()
      setOpen(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reinstate member | فشل في إعادة تفعيل الموظف')
    } finally {
      setIsSubmitting(false)
    }
  }

  const previousRoleLabel = staffRoles.find((r) => r.value === currentRow?.previousRole)?.label || currentRow?.previousRole
  const departureReasonLabel = departureReasons.find((r) => r.value === currentRow?.departureReason)?.label || currentRow?.departureReason
  const departedDate = currentRow?.departedAt
    ? new Date(currentRow.departedAt).toLocaleDateString('ar-SA')
    : '-'

  return (
    <Dialog
      open={open === 'reinstate'}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إعادة تفعيل الموظف</DialogTitle>
          <DialogDescription>
            إعادة <span className="font-semibold">{currentRow?.firstName} {currentRow?.lastName}</span> إلى العمل النشط
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">الدور السابق:</span>
              <p className="font-medium">{previousRoleLabel || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">سبب المغادرة:</span>
              <p className="font-medium">{departureReasonLabel || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">تاريخ المغادرة:</span>
              <p className="font-medium">{departedDate}</p>
            </div>
            {currentRow?.assignedCases && currentRow.assignedCases.length > 0 && (
              <div>
                <span className="text-muted-foreground">القضايا المسندة:</span>
                <p className="font-medium">{currentRow.assignedCases.length} قضية</p>
              </div>
            )}
          </div>

          {currentRow?.departureNotes && (
            <div className="text-sm">
              <span className="text-muted-foreground">ملاحظات المغادرة:</span>
              <p className="mt-1 p-2 bg-muted rounded text-sm">{currentRow.departureNotes}</p>
            </div>
          )}

          <Alert className="border-teal-500 bg-teal-50 dark:bg-teal-950/20">
            <UserPlus className="h-4 w-4 text-teal-600" />
            <AlertTitle className="text-teal-800 dark:text-teal-200">
              عند إعادة التفعيل
            </AlertTitle>
            <AlertDescription className="text-teal-700 dark:text-teal-300 text-sm">
              <ul className="list-disc ps-4 space-y-1">
                <li>سيتم استعادة الدور السابق ({previousRoleLabel})</li>
                <li>سيستعيد الموظف صلاحياته الكاملة</li>
                <li>سيتمكن من الوصول إلى جميع البيانات حسب دوره</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(null)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleReinstate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري إعادة التفعيل...' : 'إعادة تفعيل'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
