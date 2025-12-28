/**
 * Brands List View
 * Manage product brands
 * Supports Arabic and English with RTL layout
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Edit3,
  Trash2,
  Award,
  Loader2,
  AlertCircle,
  Search,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { ROUTES } from '@/constants/routes'
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from '@/hooks/useProductEnhanced'
import type { Brand, CreateBrandData, UpdateBrandData } from '@/types/product-enhanced'

export function BrandsList() {
  const { t } = useTranslation()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch brands
  const { data: brandsData, isLoading } = useBrands({
    search: searchTerm,
  })
  const brands = brandsData?.data || []

  // Mutations
  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()
  const deleteMutation = useDeleteBrand()

  // Form state
  const [formData, setFormData] = useState<CreateBrandData>({
    code: '',
    name: '',
    nameAr: '',
    logoUrl: '',
    description: '',
    descriptionAr: '',
    isActive: true,
  })

  const handleOpenForm = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand)
      setFormData({
        code: brand.code,
        name: brand.name,
        nameAr: brand.nameAr,
        logoUrl: brand.logoUrl || '',
        description: brand.description || '',
        descriptionAr: brand.descriptionAr || '',
        isActive: brand.isActive,
      })
    } else {
      setEditingBrand(null)
      setFormData({
        code: '',
        name: '',
        nameAr: '',
        logoUrl: '',
        description: '',
        descriptionAr: '',
        isActive: true,
      })
    }
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (editingBrand) {
      updateMutation.mutate(
        { brandId: editingBrand._id, data: formData as UpdateBrandData },
        {
          onSuccess: () => {
            setIsFormOpen(false)
            setEditingBrand(null)
          },
        }
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsFormOpen(false)
        },
      })
    }
  }

  const handleDelete = (brandId: string) => {
    deleteMutation.mutate(brandId, {
      onSuccess: () => {
        setDeleteConfirmId(null)
      },
    })
  }

  const topNav = [
    { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
    { title: 'إدارة علاقات العملاء', href: ROUTES.dashboard.crm.products.list, isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="إدارة المنتجات"
          title="العلامات التجارية"
          type="crm"
          listMode={true}
        />

        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" />
                العلامات التجارية
              </CardTitle>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9 w-full sm:w-64"
                  />
                </div>
                <Button onClick={() => handleOpenForm()} className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto">
                  <Plus className="h-4 w-4 ms-2" />
                  إضافة علامة
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <Award className="w-8 h-8 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد علامات تجارية</h3>
                <p className="text-slate-500 mb-4">ابدأ بإضافة علامات تجارية للمنتجات</p>
                <Button onClick={() => handleOpenForm()} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 ms-2" />
                  إضافة أول علامة
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الشعار</TableHead>
                      <TableHead>الكود</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands.map((brand) => (
                      <TableRow key={brand._id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                            {brand.logoUrl ? (
                              <img
                                src={brand.logoUrl}
                                alt={brand.nameAr}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Award className="h-6 w-6 text-slate-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{brand.code}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-navy">{brand.nameAr}</p>
                            <p className="text-sm text-slate-500" dir="ltr">
                              {brand.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {brand.descriptionAr || brand.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          {brand.isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-700">نشط</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">غير نشط</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenForm(brand)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(brand._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? 'تعديل العلامة التجارية' : 'إضافة علامة تجارية جديدة'}
            </DialogTitle>
            <DialogDescription>
              {editingBrand
                ? 'قم بتحديث معلومات العلامة التجارية'
                : 'أضف علامة تجارية جديدة للمنتجات'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">الكود *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="APPLE"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">رابط الشعار</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم (إنجليزي) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Apple"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم (عربي) *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="أبل"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف (إنجليزي)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter brand description..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionAr">الوصف (عربي)</Label>
              <Textarea
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                placeholder="أدخل وصف العلامة التجارية..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked === true })
                }
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                العلامة نشطة
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.code ||
                !formData.name ||
                !formData.nameAr ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>{editingBrand ? 'حفظ التعديلات' : 'إضافة العلامة'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذه العلامة التجارية؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ms-2" />
                  حذف العلامة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BrandsList
