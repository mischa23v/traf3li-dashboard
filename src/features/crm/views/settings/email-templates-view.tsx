/**
 * Email Templates Settings View
 *
 * Features:
 * - List view with template cards
 * - Filter by category tabs
 * - Template actions (Edit, Duplicate, Delete, Preview)
 * - Create/Edit template modal with TipTap editor
 * - Arabic/English support for subject and body
 * - Variable insertion for email personalization
 * - Preview with sample data
 * - Active/Draft status toggle
 * - RTL and Arabic support
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  X,
  Check,
  AlertCircle,
  Mail,
  Calendar,
  Loader2,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import {
  emailTemplateService,
  type EmailTemplate,
  type CreateEmailTemplateData,
} from '@/services/crmSettingsService'
import { ROUTES } from '@/constants/routes'
import { TipTapEditor } from '@/components/tiptap-editor'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.emailTemplates', href: '/dashboard/crm/settings/email-templates' },
]

// Category labels with colors
const CATEGORY_LABELS: Record<
  'lead' | 'follow_up' | 'proposal' | 'thank_you' | 'other',
  { en: string; ar: string; color: string }
> = {
  lead: {
    en: 'Lead',
    ar: 'عميل محتمل',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  follow_up: {
    en: 'Follow Up',
    ar: 'متابعة',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  proposal: {
    en: 'Proposal',
    ar: 'عرض',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  thank_you: {
    en: 'Thank You',
    ar: 'شكر',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  other: {
    en: 'Other',
    ar: 'أخرى',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
}

// Available variables for email templates
const EMAIL_VARIABLES = [
  { key: '{{contact_name}}', label: 'Contact Name', labelAr: 'اسم جهة الاتصال' },
  { key: '{{company}}', label: 'Company', labelAr: 'الشركة' },
  { key: '{{lead_status}}', label: 'Lead Status', labelAr: 'حالة العميل المحتمل' },
  { key: '{{user_name}}', label: 'Your Name', labelAr: 'اسمك' },
  { key: '{{user_email}}', label: 'Your Email', labelAr: 'بريدك الإلكتروني' },
  { key: '{{user_phone}}', label: 'Your Phone', labelAr: 'هاتفك' },
]

// Sample data for preview
const SAMPLE_DATA = {
  contact_name: 'أحمد محمد',
  company: 'شركة النجاح',
  lead_status: 'مؤهل',
  user_name: 'سارة أحمد',
  user_email: 'sara@example.com',
  user_phone: '+966 50 123 4567',
}

// Template Card Component
interface TemplateCardProps {
  template: EmailTemplate
  onEdit: (template: EmailTemplate) => void
  onDelete: (template: EmailTemplate) => void
  onDuplicate: (template: EmailTemplate) => void
  onPreview: (template: EmailTemplate) => void
  isRTL: boolean
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  isRTL,
}: TemplateCardProps) {
  const { t } = useTranslation()
  const categoryInfo = CATEGORY_LABELS[template.category]

  return (
    <Card className="rounded-3xl border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn('px-3 py-1', categoryInfo.color)} variant="outline">
                {isRTL ? categoryInfo.ar : categoryInfo.en}
              </Badge>
              <Badge
                variant={template.isActive ? 'default' : 'outline'}
                className={cn(
                  'px-3 py-1',
                  template.isActive
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                )}
              >
                {template.isActive
                  ? t('common.active', 'Active')
                  : t('common.draft', 'Draft')}
              </Badge>
            </div>
            <CardTitle className="text-lg mb-1 truncate">
              {isRTL ? template.nameAr || template.name : template.name}
            </CardTitle>
            <CardDescription className="text-sm truncate">
              {isRTL ? template.subjectAr || template.subject : template.subject}
            </CardDescription>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Pencil className="h-4 w-4 ml-2" />
                {t('common.edit', 'Edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreview(template)}>
                <Eye className="h-4 w-4 ml-2" />
                {t('common.preview', 'Preview')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(template)}>
                <Copy className="h-4 w-4 ml-2" />
                {t('common.duplicate', 'Duplicate')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(template)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                {t('common.delete', 'Delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(template.updatedAt).toLocaleDateString(
                isRTL ? 'ar-SA' : 'en-US',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }
              )}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(template)}
            className="h-8 rounded-lg"
          >
            <Eye className="h-4 w-4 ml-1" />
            {t('common.preview', 'Preview')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Template Editor Modal Component
interface TemplateEditorModalProps {
  open: boolean
  onClose: () => void
  template: EmailTemplate | null
  onSave: (data: CreateEmailTemplateData) => Promise<void>
  isRTL: boolean
}

function TemplateEditorModal({
  open,
  onClose,
  template,
  onSave,
  isRTL,
}: TemplateEditorModalProps) {
  const { t } = useTranslation()
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<CreateEmailTemplateData>({
    name: '',
    nameAr: '',
    subject: '',
    subjectAr: '',
    body: '',
    bodyAr: '',
    category: 'other',
    isActive: true,
  })

  // Reset form when modal opens/closes or template changes
  useEffect(() => {
    if (open && template) {
      setFormData({
        name: template.name,
        nameAr: template.nameAr,
        subject: template.subject,
        subjectAr: template.subjectAr,
        body: template.body,
        bodyAr: template.bodyAr,
        category: template.category,
        isActive: template.isActive,
      })
    } else if (open && !template) {
      setFormData({
        name: '',
        nameAr: '',
        subject: '',
        subjectAr: '',
        body: '',
        bodyAr: '',
        category: 'other',
        isActive: true,
      })
    }
    setShowPreview(false)
  }, [open, template])

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.nameAr) {
      toast.error(t('errors.fillRequired', 'Please fill all required fields'))
      return
    }
    if (!formData.subject || !formData.subjectAr) {
      toast.error(t('errors.fillRequired', 'Please fill all required fields'))
      return
    }
    if (!formData.body || !formData.bodyAr) {
      toast.error(t('errors.fillRequired', 'Please fill all required fields'))
      return
    }

    try {
      setIsSaving(true)
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSaving(false)
    }
  }

  const insertVariable = (variable: string, field: 'body' | 'bodyAr') => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] + ' ' + variable,
    }))
  }

  const replaceVariables = (text: string): string => {
    let result = text
    Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return result
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {template
              ? t('crm.emailTemplates.editTemplate', 'Edit Template')
              : t('crm.emailTemplates.createTemplate', 'Create Template')}
          </DialogTitle>
          <DialogDescription>
            {template
              ? t(
                  'crm.emailTemplates.editDescription',
                  'Update your email template details'
                )
              : t(
                  'crm.emailTemplates.createDescription',
                  'Create a new email template for your CRM communications'
                )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('crm.emailTemplates.nameEn', 'Template Name (English)')}
                <span className="text-red-500 mr-1">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t(
                  'crm.emailTemplates.namePlaceholder',
                  'Welcome Email'
                )}
                dir="ltr"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameAr">
                {t('crm.emailTemplates.nameAr', 'اسم القالب (عربي)')}
                <span className="text-red-500 mr-1">*</span>
              </Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                }
                placeholder={t(
                  'crm.emailTemplates.nameArPlaceholder',
                  'بريد الترحيب'
                )}
                dir="rtl"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                {t('crm.emailTemplates.category', 'Category')}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {isRTL ? value.ar : value.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isActive">
                {t('crm.emailTemplates.status', 'Status')}
              </Label>
              <div className="flex items-center gap-3 h-10 px-4 border rounded-xl">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <span className="text-sm">
                  {formData.isActive
                    ? t('common.active', 'Active')
                    : t('common.draft', 'Draft')}
                </span>
              </div>
            </div>
          </div>

          {/* Subject Lines */}
          <Tabs defaultValue="en" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="en" className="rounded-lg">
                {t('common.english', 'English')}
              </TabsTrigger>
              <TabsTrigger value="ar" className="rounded-lg">
                {t('common.arabic', 'العربية')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="en" className="space-y-2 mt-4">
              <Label htmlFor="subject">
                {t('crm.emailTemplates.subjectEn', 'Subject Line (English)')}
                <span className="text-red-500 mr-1">*</span>
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder={t(
                  'crm.emailTemplates.subjectPlaceholder',
                  'Welcome to our platform'
                )}
                dir="ltr"
                className="rounded-xl"
              />
            </TabsContent>
            <TabsContent value="ar" className="space-y-2 mt-4">
              <Label htmlFor="subjectAr">
                {t('crm.emailTemplates.subjectAr', 'سطر الموضوع (عربي)')}
                <span className="text-red-500 mr-1">*</span>
              </Label>
              <Input
                id="subjectAr"
                value={formData.subjectAr}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subjectAr: e.target.value,
                  }))
                }
                placeholder={t(
                  'crm.emailTemplates.subjectArPlaceholder',
                  'مرحباً بك في منصتنا'
                )}
                dir="rtl"
                className="rounded-xl"
              />
            </TabsContent>
          </Tabs>

          {/* Body Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('crm.emailTemplates.bodyContent', 'Email Body')}</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t('crm.emailTemplates.previewMode', 'Preview Mode')}
                </span>
                <Switch
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                />
              </div>
            </div>

            {/* Variable Insertion Buttons */}
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border">
              <span className="text-sm font-medium text-muted-foreground w-full mb-1">
                {t('crm.emailTemplates.insertVariable', 'Insert Variable')}:
              </span>
              {EMAIL_VARIABLES.map((variable) => (
                <div key={variable.key} className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.key, 'body')}
                    className="rounded-lg h-7 text-xs"
                  >
                    {variable.label}
                  </Button>
                </div>
              ))}
            </div>

            <Tabs defaultValue="en" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="en" className="rounded-lg">
                  {t('common.english', 'English')}
                </TabsTrigger>
                <TabsTrigger value="ar" className="rounded-lg">
                  {t('common.arabic', 'العربية')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="mt-4">
                <TipTapEditor
                  content={
                    showPreview ? replaceVariables(formData.body) : formData.body
                  }
                  onChange={(html) => {
                    if (!showPreview) {
                      setFormData((prev) => ({ ...prev, body: html }))
                    }
                  }}
                  placeholder={t(
                    'crm.emailTemplates.bodyPlaceholder',
                    'Write your email content here...'
                  )}
                  dir="ltr"
                  editable={!showPreview}
                  minHeight="300px"
                  className="rounded-xl"
                />
              </TabsContent>
              <TabsContent value="ar" className="mt-4">
                <TipTapEditor
                  content={
                    showPreview
                      ? replaceVariables(formData.bodyAr)
                      : formData.bodyAr
                  }
                  onChange={(html) => {
                    if (!showPreview) {
                      setFormData((prev) => ({ ...prev, bodyAr: html }))
                    }
                  }}
                  placeholder={t(
                    'crm.emailTemplates.bodyArPlaceholder',
                    'اكتب محتوى البريد الإلكتروني هنا...'
                  )}
                  dir="rtl"
                  editable={!showPreview}
                  minHeight="300px"
                  className="rounded-xl"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                {t('common.saving', 'Saving...')}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 ml-2" />
                {t('common.save', 'Save')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Component
export function EmailTemplatesView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  )
  const [deleteTemplate, setDeleteTemplate] = useState<EmailTemplate | null>(
    null
  )
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null
  )

  // Fetch templates
  useEffect(() => {
    loadTemplates()
  }, [selectedCategory])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const params =
        selectedCategory !== 'all' ? { category: selectedCategory } : {}
      const response = await emailTemplateService.getTemplates(params)
      setTemplates(response.data || [])
    } catch (error) {
      toast.error(t('errors.loadFailed', 'Failed to load email templates'))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle create
  const handleCreate = () => {
    setEditingTemplate(null)
    setEditorOpen(true)
  }

  // Handle edit
  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setEditorOpen(true)
  }

  // Handle save
  const handleSave = async (data: CreateEmailTemplateData) => {
    try {
      if (editingTemplate) {
        await emailTemplateService.updateTemplate(editingTemplate.id, data)
        toast.success(t('common.updateSuccess', 'Updated successfully'))
      } else {
        await emailTemplateService.createTemplate(data)
        toast.success(t('common.createSuccess', 'Created successfully'))
      }
      loadTemplates()
    } catch (error) {
      toast.error(
        t(
          'errors.saveFailed',
          editingTemplate ? 'Failed to update' : 'Failed to create'
        )
      )
      throw error
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTemplate) return

    try {
      await emailTemplateService.deleteTemplate(deleteTemplate.id)
      toast.success(t('common.deleteSuccess', 'Deleted successfully'))
      setDeleteTemplate(null)
      loadTemplates()
    } catch (error) {
      toast.error(t('errors.deleteFailed', 'Failed to delete'))
    }
  }

  // Handle duplicate
  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await emailTemplateService.duplicateTemplate(template.id, {
        name: `${template.name} (Copy)`,
        nameAr: `${template.nameAr} (نسخة)`,
      })
      toast.success(t('common.duplicateSuccess', 'Duplicated successfully'))
      loadTemplates()
    } catch (error) {
      toast.error(t('errors.duplicateFailed', 'Failed to duplicate'))
    }
  }

  // Handle preview
  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template)
  }

  // Filter templates by category
  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory)

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main
          fluid={true}
          className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
        >
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
      >
        <div className="flex items-center justify-between">
          <ProductivityHero
            badge={t('crm.badge', 'إدارة العملاء')}
            title={t('crm.settings.emailTemplates', 'قوالب البريد الإلكتروني')}
            type="crm"
            hideButtons
          />
          <Button
            onClick={handleCreate}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            {t('crm.emailTemplates.createTemplate', 'Create Template')}
          </Button>
        </div>

        {/* Category Tabs */}
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-6">
            <Tabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-6 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">
                  {t('common.all', 'All')}
                </TabsTrigger>
                {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
                  <TabsTrigger key={key} value={key} className="rounded-lg">
                    {isRTL ? value.ar : value.en}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('crm.emailTemplates.noTemplates', 'No templates found')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t(
                  'crm.emailTemplates.noTemplatesDescription',
                  'Create your first email template to get started'
                )}
              </p>
              <Button
                onClick={handleCreate}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                {t('crm.emailTemplates.createTemplate', 'Create Template')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={handleEdit}
                onDelete={setDeleteTemplate}
                onDuplicate={handleDuplicate}
                onPreview={handlePreview}
                isRTL={isRTL}
              />
            ))}
          </div>
        )}

        {/* Template Editor Modal */}
        <TemplateEditorModal
          open={editorOpen}
          onClose={() => {
            setEditorOpen(false)
            setEditingTemplate(null)
          }}
          template={editingTemplate}
          onSave={handleSave}
          isRTL={isRTL}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteTemplate !== null}
          onOpenChange={(open) => !open && setDeleteTemplate(null)}
        >
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                {t('common.confirmDelete', 'Confirm Delete')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t(
                  'crm.emailTemplates.deleteConfirm',
                  'Are you sure you want to delete this email template? This action cannot be undone.'
                )}
                {deleteTemplate && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                    <p className="font-medium">
                      {isRTL
                        ? deleteTemplate.nameAr || deleteTemplate.name
                        : deleteTemplate.name}
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                {t('common.cancel', 'Cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-xl bg-red-600 hover:bg-red-700"
              >
                {t('common.delete', 'Delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview Dialog */}
        <Dialog
          open={previewTemplate !== null}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
        >
          <DialogContent className="rounded-3xl max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {t('crm.emailTemplates.preview', 'Template Preview')}
              </DialogTitle>
              <DialogDescription>
                {previewTemplate && (
                  <span>
                    {isRTL
                      ? previewTemplate.nameAr || previewTemplate.name
                      : previewTemplate.name}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {previewTemplate && (
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                  <TabsTrigger value="en" className="rounded-lg">
                    {t('common.english', 'English')}
                  </TabsTrigger>
                  <TabsTrigger value="ar" className="rounded-lg">
                    {t('common.arabic', 'العربية')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      {t('crm.emailTemplates.subject', 'Subject')}
                    </Label>
                    <p className="text-lg font-semibold mt-1">
                      {previewTemplate.subject}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      {t('crm.emailTemplates.body', 'Body')}
                    </Label>
                    <div
                      className="mt-2 p-4 border rounded-xl bg-white"
                      dangerouslySetInnerHTML={{
                        __html: previewTemplate.body,
                      }}
                      dir="ltr"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="ar" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      {t('crm.emailTemplates.subject', 'الموضوع')}
                    </Label>
                    <p className="text-lg font-semibold mt-1">
                      {previewTemplate.subjectAr}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      {t('crm.emailTemplates.body', 'المحتوى')}
                    </Label>
                    <div
                      className="mt-2 p-4 border rounded-xl bg-white"
                      dangerouslySetInnerHTML={{
                        __html: previewTemplate.bodyAr,
                      }}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewTemplate(null)}
                className="rounded-xl"
              >
                {t('common.close', 'Close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
