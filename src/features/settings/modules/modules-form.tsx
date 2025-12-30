import { useTranslation } from 'react-i18next'
import {
  UserCog,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  Factory,
  ClipboardCheck,
  Building2,
  GitBranch,
  Headphones,
  BookOpen,
  Star,
  RotateCcw,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  useModuleVisibilityStore,
  TOGGLEABLE_MODULES,
  type ToggleableModule,
} from '@/stores/module-visibility-store'

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
  UserCog,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  Factory,
  ClipboardCheck,
  Building2,
  GitBranch,
  Headphones,
  BookOpen,
  Star,
}

// Module translations (fallbacks)
const moduleTranslations: Record<ToggleableModule, { ar: string; en: string; descAr: string; descEn: string }> = {
  hr: {
    ar: 'الموارد البشرية',
    en: 'Human Resources',
    descAr: 'إدارة الموظفين، الرواتب، الإجازات',
    descEn: 'Employees, payroll, leave management',
  },
  finance: {
    ar: 'المالية',
    en: 'Finance',
    descAr: 'الفواتير، المدفوعات، المصروفات',
    descEn: 'Invoices, payments, expenses',
  },
  sales: {
    ar: 'المبيعات',
    en: 'Sales',
    descAr: 'خط المبيعات، العروض، الحملات',
    descEn: 'Pipeline, quotes, campaigns',
  },
  inventory: {
    ar: 'المخزون',
    en: 'Inventory',
    descAr: 'المنتجات، المستودعات، حركة المخزون',
    descEn: 'Items, warehouses, stock movements',
  },
  buying: {
    ar: 'المشتريات',
    en: 'Buying',
    descAr: 'الموردين، أوامر الشراء',
    descEn: 'Suppliers, purchase orders',
  },
  manufacturing: {
    ar: 'التصنيع',
    en: 'Manufacturing',
    descAr: 'أوامر العمل، قوائم المواد',
    descEn: 'Work orders, bill of materials',
  },
  quality: {
    ar: 'الجودة',
    en: 'Quality',
    descAr: 'فحوصات الجودة، التقارير',
    descEn: 'Quality inspections, reports',
  },
  assets: {
    ar: 'الأصول',
    en: 'Assets',
    descAr: 'إدارة الأصول، الإهلاك',
    descEn: 'Asset management, depreciation',
  },
  subcontracting: {
    ar: 'التعاقد من الباطن',
    en: 'Subcontracting',
    descAr: 'أوامر التعاقد، الاستلام',
    descEn: 'Subcontract orders, receipts',
  },
  support: {
    ar: 'الدعم',
    en: 'Support',
    descAr: 'تذاكر الدعم، اتفاقيات الخدمة',
    descEn: 'Support tickets, SLAs',
  },
  library: {
    ar: 'المكتبة',
    en: 'Library',
    descAr: 'القوانين، الأحكام، النماذج',
    descEn: 'Laws, judgments, forms',
  },
  excellence: {
    ar: 'التميز المهني',
    en: 'Excellence',
    descAr: 'الشارات، السمعة المهنية',
    descEn: 'Badges, professional reputation',
  },
}

export function ModulesForm() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const { visibility, toggleModule, resetToDefaults } = useModuleVisibilityStore()

  // Count visible modules
  const visibleCount = Object.values(visibility).filter(Boolean).length
  const totalCount = TOGGLEABLE_MODULES.length

  return (
    <div className="space-y-6">
      {/* Header with count and reset */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isRtl
            ? `${visibleCount} من ${totalCount} وحدة مفعلة`
            : `${visibleCount} of ${totalCount} modules enabled`}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {isRtl ? 'إعادة التعيين' : 'Reset'}
        </Button>
      </div>

      {/* Module cards */}
      <div className="space-y-3">
        {TOGGLEABLE_MODULES.map((module) => {
          const Icon = iconMap[module.icon]
          const isVisible = visibility[module.key]
          const translation = moduleTranslations[module.key]

          return (
            <Card
              key={module.key}
              className={cn(
                'transition-all duration-200',
                !isVisible && 'opacity-60'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                        isVisible
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {isRtl ? translation.ar : translation.en}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isRtl ? translation.descAr : translation.descEn}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={() => toggleModule(module.key)}
                    aria-label={`Toggle ${translation.en}`}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground text-center pt-4">
        {isRtl
          ? 'التغييرات تُحفظ تلقائياً وستظهر فوراً في القائمة الجانبية'
          : 'Changes are saved automatically and will appear immediately in the sidebar'}
      </p>
    </div>
  )
}
