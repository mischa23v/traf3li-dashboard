import { useState } from 'react'
import {
  FileSignature, Plus, Edit, Trash2, Star, Loader2, Save, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useEmailSignatures,
  useCreateEmailSignature,
  useUpdateEmailSignature,
  useDeleteEmailSignature,
  useSetDefaultEmailSignature,
} from '@/hooks/useEmailSettings'

interface SignatureFormData {
  nameEn: string
  nameAr: string
  contentEn: string
  contentAr: string
  isDefault: boolean
}

export function EmailSignaturesManager() {
  const { data: signaturesData, isLoading } = useEmailSignatures()
  const createMutation = useCreateEmailSignature()
  const updateMutation = useUpdateEmailSignature()
  const deleteMutation = useDeleteEmailSignature()
  const setDefaultMutation = useSetDefaultEmailSignature()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState<SignatureFormData>({
    nameEn: '',
    nameAr: '',
    contentEn: '',
    contentAr: '',
    isDefault: false,
  })

  const signatures = signaturesData?.signatures || []

  const handleOpenForm = (signature?: any) => {
    if (signature) {
      setEditingId(signature._id)
      setFormData({
        nameEn: signature.nameEn,
        nameAr: signature.nameAr,
        contentEn: signature.contentEn,
        contentAr: signature.contentAr,
        isDefault: signature.isDefault,
      })
    } else {
      setEditingId(null)
      setFormData({
        nameEn: '',
        nameAr: '',
        contentEn: '',
        contentAr: '',
        isDefault: false,
      })
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      nameEn: '',
      nameAr: '',
      contentEn: '',
      contentAr: '',
      isDefault: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }

    handleCloseForm()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleSetDefault = async (id: string) => {
    await setDefaultMutation.mutateAsync(id)
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                توقيعات البريد الإلكتروني
              </CardTitle>
              <CardDescription>
                إدارة التوقيعات التي تظهر في نهاية رسائل البريد الإلكتروني
              </CardDescription>
            </div>
            <Button
              className="bg-brand-blue hover:bg-brand-blue/90"
              onClick={() => handleOpenForm()}
            >
              <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
              توقيع جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {signatures.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileSignature className="h-12 w-12 mx-auto mb-4 text-slate-300" aria-hidden="true" />
              <p>لا توجد توقيعات بريد إلكتروني بعد</p>
              <p className="text-sm mt-2">أضف توقيعاً جديداً للبدء</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signatures.map((signature: any) => (
                <Card key={signature._id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {signature.nameAr}
                          {signature.isDefault && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 me-1 fill-yellow-600" aria-hidden="true" />
                              افتراضي
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-slate-500" dir="ltr">
                          {signature.nameEn}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!signature.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(signature._id)}
                            disabled={setDefaultMutation.isPending}
                          >
                            <Star className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(signature)}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(signature._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">المحتوى (عربي):</p>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {signature.contentAr}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Content (English):</p>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm whitespace-pre-wrap max-h-24 overflow-y-auto" dir="ltr">
                        {signature.contentEn}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-brand-blue" aria-hidden="true" />
              {editingId ? 'تعديل التوقيع' : 'توقيع جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'قم بتعديل بيانات التوقيع' : 'أضف توقيعاً جديداً لرسائل البريد الإلكتروني'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم التوقيع (عربي)</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="التوقيع الرسمي"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">Signature Name (English)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Official Signature"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentAr">المحتوى (عربي)</Label>
              <Textarea
                id="contentAr"
                value={formData.contentAr}
                onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                placeholder="مع أطيب التحيات،&#10;شركة ترافلي&#10;البريد الإلكتروني: info@company.com&#10;الهاتف: +966 XX XXX XXXX"
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentEn">Content (English)</Label>
              <Textarea
                id="contentEn"
                value={formData.contentEn}
                onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                placeholder="Best regards,&#10;Trafeli Company&#10;Email: info@company.com&#10;Phone: +966 XX XXX XXXX"
                dir="ltr"
                rows={6}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                <X className="h-4 w-4 ms-2" aria-hidden="true" />
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-brand-blue hover:bg-brand-blue/90"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                )}
                {editingId ? 'حفظ التعديلات' : 'إضافة التوقيع'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا التوقيع؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
              )}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
