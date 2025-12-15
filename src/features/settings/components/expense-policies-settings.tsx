import { useState } from 'react'
import {
  FileText, Plus, MoreHorizontal, Trash2, Edit, Loader2, Star,
  Shield, Receipt, CheckCircle2, Plane, DollarSign, Car, AlertTriangle,
  Copy, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
  useExpensePolicies,
  useCreateExpensePolicy,
  useUpdateExpensePolicy,
  useDeleteExpensePolicy,
  useSetDefaultExpensePolicy,
  useTogglePolicyStatus,
  useDuplicateExpensePolicy
} from '@/hooks/useExpensePolicies'
import { Skeleton } from '@/components/ui/skeleton'
import type { ExpensePolicy } from '@/services/expensePoliciesService'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

const travelClassOptions = [
  { value: 'economy', label: 'اقتصادية', labelEn: 'Economy' },
  { value: 'premium_economy', label: 'اقتصادية ممتازة', labelEn: 'Premium Economy' },
  { value: 'business', label: 'رجال أعمال', labelEn: 'Business' },
  { value: 'first', label: 'درجة أولى', labelEn: 'First Class' },
]

const expenseCategoryOptions = [
  { value: 'travel', label: 'سفر' },
  { value: 'meals', label: 'وجبات' },
  { value: 'accommodation', label: 'إقامة' },
  { value: 'transportation', label: 'مواصلات' },
  { value: 'office_supplies', label: 'مستلزمات مكتبية' },
  { value: 'communication', label: 'اتصالات' },
  { value: 'professional_services', label: 'خدمات مهنية' },
  { value: 'training', label: 'تدريب' },
  { value: 'entertainment', label: 'ضيافة' },
  { value: 'court_fees', label: 'رسوم محاكم' },
  { value: 'legal_research', label: 'أبحاث قانونية' },
  { value: 'client_expenses', label: 'مصاريف موكلين' },
  { value: 'mileage', label: 'مسافات' },
  { value: 'parking', label: 'مواقف' },
  { value: 'tolls', label: 'رسوم طرق' },
  { value: 'other', label: 'أخرى' },
]

const defaultFormData = {
  name: '',
  nameAr: '',
  isActive: true,
  isDefault: false,
  dailyLimits: {
    meals: 300,
    transportation: 500,
    accommodation: 1000,
    other: 200,
  },
  receiptRequired: {
    threshold: 100,
    categories: ['accommodation', 'travel'] as string[],
  },
  approvalThresholds: {
    level1: 1000,
    level2: 5000,
    level3: 10000,
  },
  travelPolicies: {
    domesticPerDiem: 200,
    internationalPerDiem: 500,
    maxHotelRate: 1000,
    allowedTravelClasses: ['economy', 'premium_economy'] as string[],
    advanceBookingDays: 7,
  },
  mileageRates: {
    personalCar: 1.5,
    companyCar: 1.0,
    rental: 2.0,
  },
  restrictions: {
    maxSingleExpense: 50000,
    maxMonthlyTotal: 100000,
    blockedCategories: [] as string[],
    blockedVendors: [] as string[],
  }
}

export default function ExpensePoliciesSettings() {
  const { data: policiesData, isLoading } = useExpensePolicies()
  const createMutation = useCreateExpensePolicy()
  const updateMutation = useUpdateExpensePolicy()
  const deleteMutation = useDeleteExpensePolicy()
  const setDefaultMutation = useSetDefaultExpensePolicy()
  const toggleStatusMutation = useTogglePolicyStatus()
  const duplicateMutation = useDuplicateExpensePolicy()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<ExpensePolicy | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [newVendor, setNewVendor] = useState('')

  const policies = policiesData?.policies || []

  const handleOpenDialog = (policy?: ExpensePolicy) => {
    if (policy) {
      setEditingPolicy(policy)
      setFormData({
        name: policy.name,
        nameAr: policy.nameAr,
        isActive: policy.isActive,
        isDefault: policy.isDefault,
        dailyLimits: { ...policy.dailyLimits },
        receiptRequired: {
          threshold: policy.receiptRequired.threshold,
          categories: [...policy.receiptRequired.categories]
        },
        approvalThresholds: { ...policy.approvalThresholds },
        travelPolicies: {
          ...policy.travelPolicies,
          allowedTravelClasses: [...policy.travelPolicies.allowedTravelClasses]
        },
        mileageRates: { ...policy.mileageRates },
        restrictions: {
          ...policy.restrictions,
          blockedCategories: [...policy.restrictions.blockedCategories],
          blockedVendors: [...policy.restrictions.blockedVendors]
        }
      })
    } else {
      setEditingPolicy(null)
      setFormData(defaultFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPolicy(null)
    setFormData(defaultFormData)
    setNewVendor('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value
    setFormData(prev => ({ ...prev, [name]: processedValue }))
  }

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value
      }
    }))
  }

  const handleArrayToggle = (section: string, field: string, item: string) => {
    setFormData(prev => {
      const currentArray = (prev[section as keyof typeof prev] as any)[field] as string[]
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item]

      return {
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] as any),
          [field]: newArray
        }
      }
    })
  }

  const handleAddVendor = () => {
    if (newVendor.trim()) {
      setFormData(prev => ({
        ...prev,
        restrictions: {
          ...prev.restrictions,
          blockedVendors: [...prev.restrictions.blockedVendors, newVendor.trim()]
        }
      }))
      setNewVendor('')
    }
  }

  const handleRemoveVendor = (vendor: string) => {
    setFormData(prev => ({
      ...prev,
      restrictions: {
        ...prev.restrictions,
        blockedVendors: prev.restrictions.blockedVendors.filter(v => v !== vendor)
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingPolicy) {
      await updateMutation.mutateAsync({
        id: editingPolicy._id,
        data: formData
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
    handleCloseDialog()
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه السياسة؟')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSetDefault = async (id: string) => {
    await setDefaultMutation.mutateAsync(id)
  }

  const handleToggleStatus = async (id: string) => {
    await toggleStatusMutation.mutateAsync(id)
  }

  const handleDuplicate = async (id: string, name: string, nameAr: string) => {
    const newName = prompt('أدخل اسم السياسة الجديدة (إنجليزي):', `${name} - Copy`)
    const newNameAr = prompt('أدخل اسم السياسة الجديدة (عربي):', `${nameAr} - نسخة`)

    if (newName && newNameAr) {
      await duplicateMutation.mutateAsync({ id, newName, newNameAr })
    }
  }

  if (isLoading) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center gap-4'>
            <LanguageSwitcher />
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className="p-6 lg:p-8 bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-48 rounded-3xl" />
              ))}
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="p-6 lg:p-8 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-navy">سياسات المصروفات</h1>
              <p className="text-slate-500">إدارة سياسات وقواعد المصروفات</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="bg-brand-blue hover:bg-brand-blue/90">
              <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
              إضافة سياسة
            </Button>
          </div>

          {/* Policies Grid */}
          {policies.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-3xl">
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-navy mb-2">لا توجد سياسات مصروفات</h3>
                <p className="text-slate-500 mb-4">قم بإضافة سياسة للبدء</p>
                <Button onClick={() => handleOpenDialog()} variant="outline">
                  <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                  إضافة سياسة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {policies.map((policy) => (
                <Card
                  key={policy._id}
                  className={`border-0 shadow-sm rounded-3xl transition-all ${
                    !policy.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Policy Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          policy.isDefault ? 'bg-emerald-100' : 'bg-blue-100'
                        }`}>
                          <Shield className={`h-7 w-7 ${
                            policy.isDefault ? 'text-emerald-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-navy text-lg">{policy.nameAr}</h3>
                            {policy.isDefault && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                                <Star className="h-3 w-3 ms-1 fill-current" />
                                افتراضي
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500" dir="ltr">{policy.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={policy.isActive}
                          onCheckedChange={() => handleToggleStatus(policy._id)}
                          disabled={toggleStatusMutation.isPending}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(policy)}>
                              <Edit className="h-4 w-4 ms-2" aria-hidden="true" />
                              تعديل
                            </DropdownMenuItem>
                            {!policy.isDefault && (
                              <DropdownMenuItem onClick={() => handleSetDefault(policy._id)}>
                                <Star className="h-4 w-4 ms-2" />
                                تعيين كافتراضي
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicate(policy._id, policy.name, policy.nameAr)}>
                              <Copy className="h-4 w-4 ms-2" />
                              نسخ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(policy._id)}
                              className="text-red-600"
                              disabled={policy.isDefault}
                            >
                              <Trash2 className="h-4 w-4 ms-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    {/* Policy Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Daily Limits */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <DollarSign className="h-4 w-4" />
                          <span>الحدود اليومية</span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 pe-2">
                          <div className="flex justify-between">
                            <span>وجبات:</span>
                            <span className="font-medium">{policy.dailyLimits.meals} ر.س</span>
                          </div>
                          <div className="flex justify-between">
                            <span>مواصلات:</span>
                            <span className="font-medium">{policy.dailyLimits.transportation} ر.س</span>
                          </div>
                          <div className="flex justify-between">
                            <span>إقامة:</span>
                            <span className="font-medium">{policy.dailyLimits.accommodation} ر.س</span>
                          </div>
                        </div>
                      </div>

                      {/* Approval Thresholds */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>حدود الاعتماد</span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 pe-2">
                          <div className="flex justify-between">
                            <span>مستوى 1:</span>
                            <span className="font-medium">{policy.approvalThresholds.level1} ر.س</span>
                          </div>
                          <div className="flex justify-between">
                            <span>مستوى 2:</span>
                            <span className="font-medium">{policy.approvalThresholds.level2} ر.س</span>
                          </div>
                          <div className="flex justify-between">
                            <span>مستوى 3:</span>
                            <span className="font-medium">{policy.approvalThresholds.level3} ر.س</span>
                          </div>
                        </div>
                      </div>

                      {/* Travel Policy */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Plane className="h-4 w-4" />
                          <span>سياسة السفر</span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 pe-2">
                          <div className="flex justify-between">
                            <span>بدل محلي:</span>
                            <span className="font-medium">{policy.travelPolicies.domesticPerDiem} ر.س</span>
                          </div>
                          <div className="flex justify-between">
                            <span>بدل دولي:</span>
                            <span className="font-medium">{policy.travelPolicies.internationalPerDiem} ر.س</span>
                          </div>
                          <div className="flex justify-between">
                            <span>حد الفندق:</span>
                            <span className="font-medium">{policy.travelPolicies.maxHotelRate} ر.س</span>
                          </div>
                        </div>
                      </div>

                      {/* Mileage Rates */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Car className="h-4 w-4" />
                          <span>أسعار المسافات</span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 pe-2">
                          <div className="flex justify-between">
                            <span>سيارة شخصية:</span>
                            <span className="font-medium">{policy.mileageRates.personalCar} ر.س/كم</span>
                          </div>
                          <div className="flex justify-between">
                            <span>سيارة الشركة:</span>
                            <span className="font-medium">{policy.mileageRates.companyCar} ر.س/كم</span>
                          </div>
                          <div className="flex justify-between">
                            <span>مستأجرة:</span>
                            <span className="font-medium">{policy.mileageRates.rental} ر.س/كم</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Requirements */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <Receipt className="h-4 w-4" />
                        <span>متطلبات الفواتير</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>مطلوب فوق: <span className="font-medium">{policy.receiptRequired.threshold} ر.س</span></p>
                        <p className="mt-1">
                          فئات إلزامية: <span className="font-medium">{policy.receiptRequired.categories.length} فئة</span>
                        </p>
                      </div>
                    </div>

                    {/* Restrictions */}
                    {(policy.restrictions.blockedCategories.length > 0 || policy.restrictions.blockedVendors.length > 0) && (
                      <Alert className="mt-4 border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 text-sm">
                          <div>
                            {policy.restrictions.blockedCategories.length > 0 && (
                              <p>فئات محظورة: {policy.restrictions.blockedCategories.length}</p>
                            )}
                            {policy.restrictions.blockedVendors.length > 0 && (
                              <p>موردين محظورين: {policy.restrictions.blockedVendors.length}</p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? 'تعديل سياسة المصروفات' : 'إضافة سياسة مصروفات جديدة'}
            </DialogTitle>
            <DialogDescription>
              {editingPolicy ? 'تعديل بيانات السياسة' : 'أدخل بيانات السياسة الجديدة'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">أساسي</TabsTrigger>
                <TabsTrigger value="limits">الحدود</TabsTrigger>
                <TabsTrigger value="approval">الاعتماد</TabsTrigger>
                <TabsTrigger value="travel">السفر</TabsTrigger>
                <TabsTrigger value="restrictions">القيود</TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم (إنجليزي) *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Standard Policy"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">الاسم (عربي) *</Label>
                    <Input
                      id="nameAr"
                      name="nameAr"
                      value={formData.nameAr}
                      onChange={handleChange}
                      placeholder="السياسة القياسية"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <Label htmlFor="isActive">تفعيل السياسة</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label htmlFor="isDefault">سياسة افتراضية</Label>
                    <p className="text-sm text-slate-500">يتم تطبيقها تلقائياً على المطالبات الجديدة</p>
                  </div>
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                  />
                </div>
              </TabsContent>

              {/* Limits Tab */}
              <TabsContent value="limits" className="space-y-6">
                {/* Daily Limits */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    الحدود اليومية (ر.س)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>وجبات</Label>
                      <Input
                        type="number"
                        value={formData.dailyLimits.meals}
                        onChange={(e) => handleNestedChange('dailyLimits', 'meals', parseFloat(e.target.value) || 0)}
                        placeholder="300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>مواصلات</Label>
                      <Input
                        type="number"
                        value={formData.dailyLimits.transportation}
                        onChange={(e) => handleNestedChange('dailyLimits', 'transportation', parseFloat(e.target.value) || 0)}
                        placeholder="500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>إقامة</Label>
                      <Input
                        type="number"
                        value={formData.dailyLimits.accommodation}
                        onChange={(e) => handleNestedChange('dailyLimits', 'accommodation', parseFloat(e.target.value) || 0)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>أخرى</Label>
                      <Input
                        type="number"
                        value={formData.dailyLimits.other}
                        onChange={(e) => handleNestedChange('dailyLimits', 'other', parseFloat(e.target.value) || 0)}
                        placeholder="200"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Receipt Requirements */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-purple-600" />
                    متطلبات الفواتير
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>الحد الأدنى (ر.س)</Label>
                      <Input
                        type="number"
                        value={formData.receiptRequired.threshold}
                        onChange={(e) => handleNestedChange('receiptRequired', 'threshold', parseFloat(e.target.value) || 0)}
                        placeholder="100"
                      />
                      <p className="text-sm text-slate-500">يجب إرفاق فاتورة للمصروفات أعلى من هذا المبلغ</p>
                    </div>

                    <div className="space-y-2">
                      <Label>الفئات التي تتطلب فاتورة دائماً</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                        {expenseCategoryOptions.map((category) => (
                          <div key={category.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`receipt-${category.value}`}
                              checked={formData.receiptRequired.categories.includes(category.value)}
                              onChange={() => handleArrayToggle('receiptRequired', 'categories', category.value)}
                              className="rounded"
                            />
                            <label htmlFor={`receipt-${category.value}`} className="text-sm cursor-pointer">
                              {category.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Approval Tab */}
              <TabsContent value="approval" className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    حدود الاعتماد (ر.س)
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    يتم تصعيد المطالبة للمستوى التالي إذا تجاوزت هذه الحدود
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>المستوى 1 - اعتماد المدير المباشر</Label>
                      <Input
                        type="number"
                        value={formData.approvalThresholds.level1}
                        onChange={(e) => handleNestedChange('approvalThresholds', 'level1', parseFloat(e.target.value) || 0)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>المستوى 2 - اعتماد المدير العام</Label>
                      <Input
                        type="number"
                        value={formData.approvalThresholds.level2}
                        onChange={(e) => handleNestedChange('approvalThresholds', 'level2', parseFloat(e.target.value) || 0)}
                        placeholder="5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>المستوى 3 - اعتماد تنفيذي</Label>
                      <Input
                        type="number"
                        value={formData.approvalThresholds.level3}
                        onChange={(e) => handleNestedChange('approvalThresholds', 'level3', parseFloat(e.target.value) || 0)}
                        placeholder="10000"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Travel Tab */}
              <TabsContent value="travel" className="space-y-6">
                {/* Travel Policies */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Plane className="h-5 w-5 text-blue-600" />
                    سياسة السفر
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>بدل يومي محلي (ر.س)</Label>
                      <Input
                        type="number"
                        value={formData.travelPolicies.domesticPerDiem}
                        onChange={(e) => handleNestedChange('travelPolicies', 'domesticPerDiem', parseFloat(e.target.value) || 0)}
                        placeholder="200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>بدل يومي دولي (ر.س)</Label>
                      <Input
                        type="number"
                        value={formData.travelPolicies.internationalPerDiem}
                        onChange={(e) => handleNestedChange('travelPolicies', 'internationalPerDiem', parseFloat(e.target.value) || 0)}
                        placeholder="500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الحد الأقصى لسعر الفندق (ر.س)</Label>
                      <Input
                        type="number"
                        value={formData.travelPolicies.maxHotelRate}
                        onChange={(e) => handleNestedChange('travelPolicies', 'maxHotelRate', parseFloat(e.target.value) || 0)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>أيام الحجز المسبق المطلوبة</Label>
                      <Input
                        type="number"
                        value={formData.travelPolicies.advanceBookingDays}
                        onChange={(e) => handleNestedChange('travelPolicies', 'advanceBookingDays', parseInt(e.target.value) || 0)}
                        placeholder="7"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label>درجات السفر المسموحة</Label>
                    <div className="grid grid-cols-2 gap-2 p-2 border rounded-lg">
                      {travelClassOptions.map((tClass) => (
                        <div key={tClass.value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`travel-${tClass.value}`}
                            checked={formData.travelPolicies.allowedTravelClasses.includes(tClass.value)}
                            onChange={() => handleArrayToggle('travelPolicies', 'allowedTravelClasses', tClass.value)}
                            className="rounded"
                          />
                          <label htmlFor={`travel-${tClass.value}`} className="text-sm cursor-pointer">
                            {tClass.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Mileage Rates */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Car className="h-5 w-5 text-teal-600" />
                    أسعار المسافات (ر.س/كم)
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>سيارة شخصية</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.mileageRates.personalCar}
                        onChange={(e) => handleNestedChange('mileageRates', 'personalCar', parseFloat(e.target.value) || 0)}
                        placeholder="1.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>سيارة الشركة</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.mileageRates.companyCar}
                        onChange={(e) => handleNestedChange('mileageRates', 'companyCar', parseFloat(e.target.value) || 0)}
                        placeholder="1.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>مستأجرة</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.mileageRates.rental}
                        onChange={(e) => handleNestedChange('mileageRates', 'rental', parseFloat(e.target.value) || 0)}
                        placeholder="2.0"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Restrictions Tab */}
              <TabsContent value="restrictions" className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    القيود والحدود
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>الحد الأقصى لمصروف واحد (ر.س)</Label>
                      <Input
                        type="number"
                        value={formData.restrictions.maxSingleExpense}
                        onChange={(e) => handleNestedChange('restrictions', 'maxSingleExpense', parseFloat(e.target.value) || 0)}
                        placeholder="50000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الحد الأقصى للمصروفات الشهرية (ر.س)</Label>
                      <Input
                        type="number"
                        value={formData.restrictions.maxMonthlyTotal}
                        onChange={(e) => handleNestedChange('restrictions', 'maxMonthlyTotal', parseFloat(e.target.value) || 0)}
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Blocked Categories */}
                <div>
                  <h3 className="font-medium mb-4">الفئات المحظورة</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                    {expenseCategoryOptions.map((category) => (
                      <div key={category.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`blocked-${category.value}`}
                          checked={formData.restrictions.blockedCategories.includes(category.value)}
                          onChange={() => handleArrayToggle('restrictions', 'blockedCategories', category.value)}
                          className="rounded"
                        />
                        <label htmlFor={`blocked-${category.value}`} className="text-sm cursor-pointer">
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Blocked Vendors */}
                <div>
                  <h3 className="font-medium mb-4">الموردين المحظورين</h3>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newVendor}
                      onChange={(e) => setNewVendor(e.target.value)}
                      placeholder="اسم المورد"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddVendor()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddVendor} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.restrictions.blockedVendors.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {formData.restrictions.blockedVendors.map((vendor, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-sm">{vendor}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVendor(vendor)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-brand-blue hover:bg-brand-blue/90"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                ) : null}
                {editingPolicy ? 'حفظ التغييرات' : 'إضافة السياسة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
