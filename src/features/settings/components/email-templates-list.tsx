import { useState } from 'react'
import {
  Mail, Edit, Trash2, Eye, Plus, Search, FileText, Bell,
  UserPlus, Clock, Filter, Loader2, Power
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmailTemplates, useDeleteEmailTemplate, useToggleEmailTemplateStatus } from '@/hooks/useEmailSettings'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Switch } from '@/components/ui/switch'

const categoryIcons: Record<string, any> = {
  invoice: FileText,
  notification: Bell,
  welcome: UserPlus,
  reminder: Clock,
  custom: Mail,
}

const categoryLabels: Record<string, string> = {
  invoice: 'فاتورة',
  notification: 'إشعار',
  welcome: 'ترحيب',
  reminder: 'تذكير',
  custom: 'مخصص',
}

const categoryColors: Record<string, string> = {
  invoice: 'bg-blue-100 text-blue-800',
  notification: 'bg-yellow-100 text-yellow-800',
  welcome: 'bg-green-100 text-green-800',
  reminder: 'bg-purple-100 text-purple-800',
  custom: 'bg-gray-100 text-gray-800',
}

export function EmailTemplatesList() {
  const { data: templatesData, isLoading } = useEmailTemplates()
  const deleteMutation = useDeleteEmailTemplate()
  const toggleStatusMutation = useToggleEmailTemplateStatus()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)

  const templates = templatesData?.templates || []

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.nameAr.includes(searchQuery)
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleToggleStatus = async (id: string) => {
    await toggleStatusMutation.mutateAsync(id)
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
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
                <Mail className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                قوالب البريد الإلكتروني
              </CardTitle>
              <CardDescription>
                إدارة قوالب رسائل البريد الإلكتروني المرسلة
              </CardDescription>
            </div>
            <Button className="bg-brand-blue hover:bg-brand-blue/90">
              <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
              قالب جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
              <Input
                placeholder="البحث في القوالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pe-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 me-2" aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="invoice">فواتير</SelectItem>
                <SelectItem value="notification">إشعارات</SelectItem>
                <SelectItem value="welcome">ترحيب</SelectItem>
                <SelectItem value="reminder">تذكيرات</SelectItem>
                <SelectItem value="custom">مخصص</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates Table */}
          <div className="rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم القالب</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>الموضوع</TableHead>
                  <TableHead>آخر تعديل</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-start">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      {searchQuery || categoryFilter !== 'all'
                        ? 'لا توجد قوالب مطابقة للبحث'
                        : 'لا توجد قوالب بريد إلكتروني بعد'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template: any) => {
                    const Icon = categoryIcons[template.category] || Mail
                    return (
                      <TableRow key={template._id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <span>{template.nameAr}</span>
                            <span className="text-xs text-slate-500" dir="ltr">
                              {template.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={categoryColors[template.category]}
                          >
                            <Icon className="h-3 w-3 me-1" aria-hidden="true" />
                            {categoryLabels[template.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={template.subjectAr}>
                            {template.subjectAr}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {formatDistanceToNow(new Date(template.lastModified || template.updatedAt), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => handleToggleStatus(template._id)}
                            disabled={toggleStatusMutation.isPending}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewTemplate(template)}
                            >
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(template._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const count = templates.filter((t: any) => t.category === key).length
              const Icon = categoryIcons[key]
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
                >
                  <div className="p-2 rounded-lg bg-white">
                    <Icon className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا القالب؟ لا يمكن التراجع عن هذا الإجراء.
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

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-blue" aria-hidden="true" />
              معاينة القالب
            </DialogTitle>
            <DialogDescription>
              معاينة محتوى رسالة البريد الإلكتروني
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold mb-2">اسم القالب:</h4>
                <p className="text-slate-600">{previewTemplate.nameAr}</p>
                <p className="text-sm text-slate-500" dir="ltr">{previewTemplate.name}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">الموضوع (عربي):</h4>
                <p className="text-slate-600">{previewTemplate.subjectAr}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">الموضوع (إنجليزي):</h4>
                <p className="text-slate-600" dir="ltr">{previewTemplate.subjectEn}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">المحتوى (عربي):</h4>
                <div className="p-4 bg-slate-50 rounded-xl whitespace-pre-wrap">
                  {previewTemplate.bodyAr}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">المحتوى (إنجليزي):</h4>
                <div className="p-4 bg-slate-50 rounded-xl whitespace-pre-wrap" dir="ltr">
                  {previewTemplate.bodyEn}
                </div>
              </div>
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">المتغيرات المتاحة:</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.variables.map((variable: string) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
