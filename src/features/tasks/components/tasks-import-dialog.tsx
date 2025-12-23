import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
import { FILE_TYPES, SIZE_LIMITS, sanitizeFilename } from '@/lib/file-validation'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'يرجى رفع ملف',
    })
    .refine(
      (files) => FILE_TYPES.CSV.includes(files?.[0]?.type),
      'يرجى رفع ملف بصيغة CSV.'
    )
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      'حجم الملف يتجاوز الحد الأقصى 10 ميجابايت'
    ),
})

type TaskImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TasksImportDialog({
  open,
  onOpenChange,
}: TaskImportDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = () => {
    const file = form.getValues('file')

    if (file && file[0]) {
      const fileDetails = {
        name: sanitizeFilename(file[0].name),
        size: file[0].size,
        type: file[0].type,
      }
      showSubmittedData(fileDetails, 'تم استيراد الملف التالي:')
    }
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-start'>
          <DialogTitle>استيراد المهام</DialogTitle>
          <DialogDescription>
            استيراد المهام بسرعة من ملف CSV.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='task-import-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem className='my-2'>
                  <FormLabel>الملف</FormLabel>
                  <FormControl>
                    <Input type='file' accept='.csv' {...fileRef} className='h-8 py-0' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>إغلاق</Button>
          </DialogClose>
          <Button type='submit' form='task-import-form'>
            استيراد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
