/**
 * Duplicate Detection Settings View
 * Configure duplicate detection rules and matching criteria
 */

'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Save,
  Loader2,
  Copy,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Settings,
  Users,
  Mail,
  Phone,
  Building,
  GripVertical,
} from 'lucide-react'
import { toast } from 'sonner'

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
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.duplicateDetection', href: '/dashboard/crm/settings/duplicate-detection' },
]

// Duplicate detection rule types
interface DuplicateRule {
  id: string
  field: string
  matchType: 'exact' | 'fuzzy' | 'phonetic'
  weight: number
  isEnabled: boolean
}

interface DuplicateSettings {
  isEnabled: boolean
  autoDetect: boolean
  minMatchScore: number
  rules: DuplicateRule[]
  entityTypes: {
    leads: boolean
    contacts: boolean
    organizations: boolean
  }
  actions: {
    warnOnCreate: boolean
    blockDuplicates: boolean
    suggestMerge: boolean
    notifyAdmin: boolean
  }
}

const DEFAULT_RULES: DuplicateRule[] = [
  { id: '1', field: 'email', matchType: 'exact', weight: 40, isEnabled: true },
  { id: '2', field: 'phone', matchType: 'fuzzy', weight: 30, isEnabled: true },
  { id: '3', field: 'name', matchType: 'phonetic', weight: 20, isEnabled: true },
  { id: '4', field: 'organization', matchType: 'fuzzy', weight: 10, isEnabled: false },
]

const FIELD_OPTIONS = [
  { value: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email', icon: Mail },
  { value: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone', icon: Phone },
  { value: 'name', labelAr: 'الاسم', labelEn: 'Name', icon: Users },
  { value: 'organization', labelAr: 'المنظمة', labelEn: 'Organization', icon: Building },
]

const MATCH_TYPES = [
  { value: 'exact', labelAr: 'تطابق تام', labelEn: 'Exact Match' },
  { value: 'fuzzy', labelAr: 'تطابق جزئي', labelEn: 'Fuzzy Match' },
  { value: 'phonetic', labelAr: 'تطابق صوتي', labelEn: 'Phonetic Match' },
]

export function DuplicateDetectionSettingsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<DuplicateSettings>({
    isEnabled: true,
    autoDetect: true,
    minMatchScore: 60,
    rules: DEFAULT_RULES,
    entityTypes: {
      leads: true,
      contacts: true,
      organizations: false,
    },
    actions: {
      warnOnCreate: true,
      blockDuplicates: false,
      suggestMerge: true,
      notifyAdmin: false,
    },
  })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Save settings
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully')
    } catch (error) {
      toast.error(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Update rule
  const updateRule = (id: string, updates: Partial<DuplicateRule>) => {
    setSettings((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) =>
        rule.id === id ? { ...rule, ...updates } : rule
      ),
    }))
  }

  // Delete rule
  const deleteRule = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      rules: prev.rules.filter((rule) => rule.id !== id),
    }))
  }

  // Add new rule
  const addRule = () => {
    const newRule: DuplicateRule = {
      id: `rule_${Date.now()}`,
      field: 'email',
      matchType: 'exact',
      weight: 10,
      isEnabled: true,
    }
    setSettings((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }))
  }

  // Calculate total weight
  const totalWeight = settings.rules
    .filter((r) => r.isEnabled)
    .reduce((sum, r) => sum + r.weight, 0)

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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl pb-24"
      >
        <ProductivityHero
          badge={isRTL ? 'إدارة العملاء' : 'CRM'}
          title={isRTL ? 'إعدادات اكتشاف التكرارات' : 'Duplicate Detection Settings'}
          type="crm"
          hideButtons
        />

        <div className="space-y-6 max-w-5xl">
          {/* Master Toggle */}
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Copy className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle>
                    {isRTL ? 'اكتشاف التكرارات' : 'Duplicate Detection'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL
                      ? 'اكتشاف ومنع السجلات المكررة تلقائياً'
                      : 'Automatically detect and prevent duplicate records'}
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.isEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, isEnabled: checked }))
                  }
                />
              </div>
            </CardHeader>

            {settings.isEnabled && (
              <CardContent className="space-y-4 pt-0">
                {/* Auto Detect Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {isRTL ? 'الكشف التلقائي' : 'Auto Detection'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'البحث عن التكرارات تلقائياً عند إنشاء سجل جديد'
                        : 'Automatically search for duplicates when creating new records'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoDetect}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, autoDetect: checked }))
                    }
                  />
                </div>

                {/* Min Match Score */}
                <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">
                        {isRTL ? 'الحد الأدنى لنسبة التطابق' : 'Minimum Match Score'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? 'نسبة التطابق المطلوبة لاعتبار السجل مكرراً'
                          : 'Required match percentage to consider a record as duplicate'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3">
                      {settings.minMatchScore}%
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.minMatchScore]}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, minMatchScore: value }))
                    }
                    min={30}
                    max={100}
                    step={5}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{isRTL ? 'حساس أكثر' : 'More Sensitive'}</span>
                    <span>{isRTL ? 'أقل حساسية' : 'Less Sensitive'}</span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Entity Types */}
          {settings.isEnabled && (
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>
                      {isRTL ? 'أنواع الكيانات' : 'Entity Types'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL
                        ? 'اختر أنواع السجلات للبحث عن التكرارات'
                        : 'Choose which record types to check for duplicates'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Leads */}
                  <div
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      settings.entityTypes.leads
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-slate-50 hover:bg-slate-100'
                    )}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        entityTypes: {
                          ...prev.entityTypes,
                          leads: !prev.entityTypes.leads,
                        },
                      }))
                    }
                  >
                    <Checkbox checked={settings.entityTypes.leads} />
                    <div>
                      <p className="font-medium">
                        {isRTL ? 'العملاء المحتملين' : 'Leads'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'اكتشاف تكرار العملاء المحتملين' : 'Detect duplicate leads'}
                      </p>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      settings.entityTypes.contacts
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-slate-50 hover:bg-slate-100'
                    )}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        entityTypes: {
                          ...prev.entityTypes,
                          contacts: !prev.entityTypes.contacts,
                        },
                      }))
                    }
                  >
                    <Checkbox checked={settings.entityTypes.contacts} />
                    <div>
                      <p className="font-medium">
                        {isRTL ? 'جهات الاتصال' : 'Contacts'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'اكتشاف تكرار جهات الاتصال' : 'Detect duplicate contacts'}
                      </p>
                    </div>
                  </div>

                  {/* Organizations */}
                  <div
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      settings.entityTypes.organizations
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-slate-50 hover:bg-slate-100'
                    )}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        entityTypes: {
                          ...prev.entityTypes,
                          organizations: !prev.entityTypes.organizations,
                        },
                      }))
                    }
                  >
                    <Checkbox checked={settings.entityTypes.organizations} />
                    <div>
                      <p className="font-medium">
                        {isRTL ? 'المنظمات' : 'Organizations'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'اكتشاف تكرار المنظمات' : 'Detect duplicate organizations'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Matching Rules */}
          {settings.isEnabled && (
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>
                        {isRTL ? 'قواعد المطابقة' : 'Matching Rules'}
                      </CardTitle>
                      <CardDescription>
                        {isRTL
                          ? 'تحديد الحقول ونوع المطابقة والوزن'
                          : 'Define fields, match type, and weight for detection'}
                      </CardDescription>
                    </div>
                  </div>
                  <Button size="sm" onClick={addRule} className="rounded-xl">
                    <Plus className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {isRTL ? 'إضافة قاعدة' : 'Add Rule'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weight Warning */}
                {totalWeight !== 100 && (
                  <Alert
                    variant={totalWeight > 100 ? 'destructive' : 'default'}
                    className="rounded-xl"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      {isRTL ? 'تنبيه الأوزان' : 'Weight Warning'}
                    </AlertTitle>
                    <AlertDescription>
                      {totalWeight > 100
                        ? isRTL
                          ? `مجموع الأوزان (${totalWeight}%) يتجاوز 100%. يرجى تعديل الأوزان.`
                          : `Total weight (${totalWeight}%) exceeds 100%. Please adjust weights.`
                        : isRTL
                          ? `مجموع الأوزان (${totalWeight}%) أقل من 100%. قد تكون النتائج أقل دقة.`
                          : `Total weight (${totalWeight}%) is less than 100%. Results may be less accurate.`}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Rules List */}
                <div className="space-y-3">
                  {settings.rules.map((rule, index) => {
                    const fieldConfig = FIELD_OPTIONS.find(
                      (f) => f.value === rule.field
                    )
                    const FieldIcon = fieldConfig?.icon || Mail

                    return (
                      <div
                        key={rule.id}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border bg-white',
                          !rule.isEnabled && 'opacity-50'
                        )}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />

                        <Switch
                          checked={rule.isEnabled}
                          onCheckedChange={(checked) =>
                            updateRule(rule.id, { isEnabled: checked })
                          }
                        />

                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <FieldIcon className="w-5 h-5 text-slate-600" />
                        </div>

                        <div className="flex-1 grid grid-cols-3 gap-4">
                          {/* Field */}
                          <Select
                            value={rule.field}
                            onValueChange={(value) =>
                              updateRule(rule.id, { field: value })
                            }
                          >
                            <SelectTrigger className="rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {isRTL ? option.labelAr : option.labelEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Match Type */}
                          <Select
                            value={rule.matchType}
                            onValueChange={(value) =>
                              updateRule(rule.id, {
                                matchType: value as DuplicateRule['matchType'],
                              })
                            }
                          >
                            <SelectTrigger className="rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MATCH_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {isRTL ? type.labelAr : type.labelEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Weight */}
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={rule.weight}
                              onChange={(e) =>
                                updateRule(rule.id, {
                                  weight: parseInt(e.target.value) || 0,
                                })
                              }
                              className="rounded-lg w-20"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => deleteRule(rule.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isRTL ? 'حذف القاعدة' : 'Delete Rule'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )
                  })}
                </div>

                {/* Total Weight Indicator */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium">
                    {isRTL ? 'مجموع الأوزان' : 'Total Weight'}
                  </span>
                  <Badge
                    variant={totalWeight === 100 ? 'default' : 'destructive'}
                    className="text-sm"
                  >
                    {totalWeight}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {settings.isEnabled && (
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL
                        ? 'تحديد ما يحدث عند اكتشاف تكرار'
                        : 'Define what happens when duplicates are detected'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Warn on Create */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {isRTL ? 'تحذير عند الإنشاء' : 'Warn on Create'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'عرض تحذير عند إنشاء سجل قد يكون مكرراً'
                        : 'Show warning when creating a potentially duplicate record'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.actions.warnOnCreate}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        actions: { ...prev.actions, warnOnCreate: checked },
                      }))
                    }
                  />
                </div>

                {/* Block Duplicates */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {isRTL ? 'منع التكرارات' : 'Block Duplicates'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'منع إنشاء سجلات مكررة تماماً'
                        : 'Prevent creation of exact duplicate records'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.actions.blockDuplicates}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        actions: { ...prev.actions, blockDuplicates: checked },
                      }))
                    }
                  />
                </div>

                {/* Suggest Merge */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {isRTL ? 'اقتراح الدمج' : 'Suggest Merge'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'اقتراح دمج السجلات المكررة'
                        : 'Suggest merging duplicate records'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.actions.suggestMerge}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        actions: { ...prev.actions, suggestMerge: checked },
                      }))
                    }
                  />
                </div>

                {/* Notify Admin */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {isRTL ? 'إشعار المسؤول' : 'Notify Admin'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'إرسال إشعار للمسؤول عند اكتشاف تكرارات'
                        : 'Send notification to admin when duplicates are detected'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.actions.notifyAdmin}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        actions: { ...prev.actions, notifyAdmin: checked },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Alert */}
          <Alert className="rounded-xl border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              {isRTL
                ? 'سيتم تطبيق هذه الإعدادات على جميع السجلات الجديدة. يمكنك أيضاً تشغيل فحص التكرارات يدوياً على السجلات الموجودة.'
                : 'These settings will apply to all new records. You can also run duplicate detection manually on existing records.'}
            </AlertDescription>
          </Alert>
        </div>

        {/* Sticky Save Button Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/80 backdrop-blur-lg">
          <div className="container flex items-center justify-end gap-4 p-4">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 min-w-[150px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Main>
    </>
  )
}

export default DuplicateDetectionSettingsView
