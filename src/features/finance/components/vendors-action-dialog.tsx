'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Vendor } from '@/services/accountingService'
import { useCreateVendor, useUpdateVendor } from '@/hooks/useAccounting'

const vendorCategories = [
  { value: 'consultants', label: 'استشاريون', labelEn: 'Consultants' },
  { value: 'office_supplies', label: 'مستلزمات مكتبية', labelEn: 'Office Supplies' },
  { value: 'technology', label: 'تقنية', labelEn: 'Technology' },
  { value: 'legal_services', label: 'خدمات قانونية', labelEn: 'Legal Services' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
]

const formSchema = z.object({
  name: z.string().min(2, 'الاسم بالإنجليزية مطلوب ويجب أن يكون حرفين على الأقل'),
  nameAr: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('SA'),
  taxNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  iban: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
})

type VendorForm = z.infer<typeof formSchema>

type VendorsActionDialogProps = {
  currentRow?: Vendor
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VendorsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: VendorsActionDialogProps) {
  const isEdit = !!currentRow
  const { mutate: createVendor, isPending: isCreating } = useCreateVendor()
  const { mutate: updateVendor, isPending: isUpdating } = useUpdateVendor()
  const isPending = isCreating || isUpdating

  const form = useForm<VendorForm>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          nameAr: currentRow.nameAr || '',
          email: currentRow.email || '',
          phone: currentRow.phone || '',
          address: currentRow.address || '',
          city: currentRow.city || '',
          country: currentRow.country || 'SA',
          taxNumber: currentRow.taxNumber || '',
          bankName: currentRow.bankName || '',
          bankAccountNumber: currentRow.bankAccountNumber || '',
          iban: currentRow.iban || '',
          category: currentRow.category || '',
          notes: currentRow.notes || '',
        }
      : {
          name: '',
          nameAr: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          country: 'SA',
          taxNumber: '',
          bankName: '',
          bankAccountNumber: '',
          iban: '',
          category: '',
          notes: '',
        },
  })

  const onSubmit = (values: VendorForm) => {
    if (isEdit && currentRow) {
      updateVendor(
        { id: currentRow._id, data: values },
        {
          onSuccess: () => {
            form.reset()
            onOpenChange(false)
          },
        }
      )
    } else {
      createVendor(values, {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'تعديل المورد' : 'إضافة مورد جديد'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'قم بتحديث بيانات المورد'
              : 'أضف مورد جديد إلى قائمة الموردين'}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[60vh] w-full overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='vendor-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              {/* Basic Info Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  المعلومات الأساسية
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='nameAr'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المورد (عربي)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="اسم المورد بالعربية"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المورد (إنجليزي) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Vendor Name (English)"
                            dir='ltr'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التصنيف</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder="اختر التصنيف"
                          items={vendorCategories.map((c) => ({
                            label: c.label,
                            value: c.value,
                          }))}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='taxNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرقم الضريبي</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="الرقم الضريبي"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Info Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  معلومات الاتصال
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder="email@example.com"
                            dir='ltr'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+966 50 123 4567"
                            dir='ltr'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  العنوان
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="العنوان التفصيلي"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدينة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="المدينة"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='country'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الدولة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SA"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Banking Info Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  المعلومات البنكية
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='bankName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم البنك</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="اسم البنك"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='bankAccountNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الحساب البنكي</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="رقم الحساب"
                            dir='ltr'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='iban'
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>رقم الآيبان (IBAN)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SA00 0000 0000 0000 0000 0000"
                            dir='ltr'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Notes Section */}
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ملاحظات إضافية عن المورد..."
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button type='submit' form='vendor-form' disabled={isPending}>
            {isPending
              ? 'جاري الحفظ...'
              : isEdit
                ? 'تحديث'
                : 'إضافة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
