import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStaffContext } from './staff-provider'
import { processDepartureSchema, type ProcessDepartureData } from '../data/schema'
import { departureReasons, staffRoles } from '../data/data'
import firmService from '@/services/firmService'
import { useAuthStore } from '@/stores/auth-store'
import { invalidateCache } from '@/lib/cache-invalidation'

export function StaffDepartureDialog() {
  const { open, setOpen, currentRow } = useStaffContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const user = useAuthStore((state) => state.user)
  const firmId = user?.firmId || user?.lawyerProfile?.firmID

  const form = useForm<ProcessDepartureData>({
    resolver: zodResolver(processDepartureSchema),
    defaultValues: {
      reason: 'resignation',
      notes: '',
    },
  })

  const onSubmit = async (data: ProcessDepartureData) => {
    if (!currentRow || !firmId) return

    setIsSubmitting(true)
    try {
      await firmService.processDeparture(firmId, currentRow._id, data)
      toast.success('Member departure processed successfully | تمت معالجة مغادرة الموظف بنجاح')
      await invalidateCache.staff.all()
      await invalidateCache.users.team()
      setOpen(null)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to process departure | فشل في معالجة المغادرة')
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleLabel = staffRoles.find((r) => r.value === currentRow?.role)?.label || currentRow?.role

  return (
    <Dialog
      open={open === 'depart'}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null)
          form.reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>معالجة مغادرة الموظف</DialogTitle>
          <DialogDescription>
            سيتم تحويل <span className="font-semibold">{currentRow?.firstName} {currentRow?.lastName}</span> ({roleLabel}) إلى حالة الموظف المغادر
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب المغادرة</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سبب المغادرة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departureReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أضف أي ملاحظات إضافية..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">
                تنبيه مهم
              </AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                <p className="mb-2">سيتم:</p>
                <ul className="list-disc ps-4 space-y-1">
                  <li>حفظ جميع البيانات المرتبطة بالموظف</li>
                  <li>إزالة صلاحيات الكتابة والتعديل</li>
                  <li>منع الوصول إلى البيانات المالية</li>
                  <li>السماح بقراءة القضايا التي عمل عليها فقط</li>
                </ul>
              </AlertDescription>
            </Alert>

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
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري المعالجة...' : 'تأكيد المغادرة'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
