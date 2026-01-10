import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Users,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  Clock,
  Target,
  Trash2,
  Phone,
  Calendar,
  BarChart3,
  Package,
  FileText,
  Megaphone,
  Receipt,
  Settings,
  Share2,
  Mail,
  MessageCircle,
  CheckCheck,
  Archive,
} from 'lucide-react'
import { useLeadStats, useLeadsNeedingFollowUp, useUpcomingTasks } from '@/hooks/useCrm'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import {
  useKeyboardShortcuts,
  KEYBOARD_SHORTCUTS,
  KBD_COLORS,
} from '@/hooks/useKeyboardShortcuts'

interface CrmSidebarProps {
  context: 'leads' | 'pipeline' | 'referrals' | 'activities' | 'reports' | 'products' | 'quotes' | 'campaigns' | 'transactions' | 'settings' | 'contacts' | 'email-marketing' | 'whatsapp'
  mode?: 'list' | 'detail' | 'create'
  isSelectionMode?: boolean
  onToggleSelectionMode?: () => void
  selectedCount?: number
  totalCount?: number
  onDeleteSelected?: () => void
  // Bulk actions
  onBulkArchive?: () => void
  onBulkComplete?: () => void
  onSelectAll?: () => void
}

const links = {
  leads: {
    create: ROUTES.dashboard.crm.leads.new,
    viewAll: ROUTES.dashboard.crm.leads.list,
  },
  pipeline: {
    viewAll: ROUTES.dashboard.crm.pipeline,
  },
  activities: {
    create: ROUTES.dashboard.crm.activities.new,
    viewAll: ROUTES.dashboard.crm.activities.list,
  },
  referrals: {
    create: ROUTES.dashboard.crm.referrals.new,
    viewAll: ROUTES.dashboard.crm.referrals.list,
  },
  reports: {
    create: ROUTES.dashboard.crm.reports.new,
    viewAll: ROUTES.dashboard.crm.reports.list,
  },
  products: {
    create: ROUTES.dashboard.crm.products.new,
    viewAll: ROUTES.dashboard.crm.products.list,
  },
  quotes: {
    create: ROUTES.dashboard.crm.quotes.new,
    viewAll: ROUTES.dashboard.crm.quotes.list,
  },
  campaigns: {
    create: ROUTES.dashboard.crm.campaigns.new,
    viewAll: ROUTES.dashboard.crm.campaigns.list,
  },
  transactions: {
    viewAll: ROUTES.dashboard.crm.transactions,
  },
  settings: {
    viewAll: ROUTES.dashboard.crm.settings.general,
  },
  contacts: {
    create: ROUTES.dashboard.crm.contacts.new,
    viewAll: ROUTES.dashboard.crm.contacts.list,
  },
  'email-marketing': {
    create: ROUTES.dashboard.crm.emailMarketing.new,
    viewAll: ROUTES.dashboard.crm.emailMarketing.list,
  },
  whatsapp: {
    create: ROUTES.dashboard.crm.whatsapp.start,
    viewAll: ROUTES.dashboard.crm.whatsapp.list,
  },
}

export function CrmSidebar({
  context,
  mode = 'list',
  isSelectionMode = false,
  onToggleSelectionMode,
  selectedCount = 0,
  totalCount = 0,
  onDeleteSelected,
  onBulkArchive,
  onBulkComplete,
  onSelectAll,
}: CrmSidebarProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const dateLocale = isRTL ? ar : enUS
  const navigate = useNavigate()
  const { data: statsData, isLoading: statsLoading } = useLeadStats()
  const { data: followUpData, isLoading: followUpLoading } = useLeadsNeedingFollowUp(5)
  const { data: tasksData, isLoading: tasksLoading } = useUpcomingTasks({ limit: 5 })

  const stats = statsData?.stats

  // Quick Actions tab state (Main / Bulk)
  const [quickActionsTab, setQuickActionsTab] = useState<'main' | 'bulk'>('main')

  // Check if context has a create page
  const hasCreatePage = context !== 'transactions' && context !== 'pipeline' && context !== 'settings'

  // Get current links for keyboard shortcuts
  const currentLinks = links[context] || links.leads

  // Register keyboard shortcuts (Gold Standard)
  useKeyboardShortcuts({
    mode,
    links: {
      create: currentLinks.create || currentLinks.viewAll,
      viewAll: currentLinks.viewAll,
    },
    disabled: !hasCreatePage && mode === 'list', // Disable create shortcuts for read-only views
    listCallbacks: {
      onToggleSelectionMode,
      onDeleteSelected,
      onBulkArchive,
      onBulkComplete,
      onSelectAll,
      isSelectionMode,
      selectedCount,
      totalCount,
    },
  })

  // Navigation links for the current context
  const navigationLinks = [
    { key: 'leads', icon: UserPlus, label: isRTL ? 'العملاء المحتملين' : 'Leads', route: links.leads.viewAll, color: 'text-emerald-600' },
    { key: 'pipeline', icon: TrendingUp, label: isRTL ? 'مسار المبيعات' : 'Pipeline', route: links.pipeline.viewAll, color: 'text-blue-600' },
    { key: 'contacts', icon: Users, label: isRTL ? 'جهات الاتصال' : 'Contacts', route: links.contacts.viewAll, color: 'text-indigo-600' },
    { key: 'products', icon: Package, label: isRTL ? 'المنتجات' : 'Products', route: links.products.viewAll, color: 'text-orange-600' },
    { key: 'quotes', icon: FileText, label: isRTL ? 'عروض الأسعار' : 'Quotes', route: links.quotes.viewAll, color: 'text-purple-600' },
    { key: 'campaigns', icon: Megaphone, label: isRTL ? 'الحملات' : 'Campaigns', route: links.campaigns.viewAll, color: 'text-pink-600' },
    { key: 'activities', icon: Clock, label: isRTL ? 'الأنشطة' : 'Activities', route: links.activities.viewAll, color: 'text-amber-600' },
    { key: 'referrals', icon: Share2, label: isRTL ? 'الإحالات' : 'Referrals', route: links.referrals.viewAll, color: 'text-cyan-600' },
    { key: 'email-marketing', icon: Mail, label: isRTL ? 'التسويق بالبريد' : 'Email Marketing', route: links['email-marketing'].viewAll, color: 'text-rose-600' },
    { key: 'whatsapp', icon: MessageCircle, label: isRTL ? 'واتساب' : 'WhatsApp', route: links.whatsapp.viewAll, color: 'text-green-600' },
    { key: 'transactions', icon: Receipt, label: isRTL ? 'المعاملات' : 'Transactions', route: links.transactions.viewAll, color: 'text-slate-600' },
    { key: 'reports', icon: BarChart3, label: isRTL ? 'التقارير' : 'Reports', route: links.reports.viewAll, color: 'text-violet-600' },
    { key: 'settings', icon: Settings, label: isRTL ? 'الإعدادات' : 'Settings', route: links.settings.viewAll, color: 'text-gray-600' },
  ]

  // Get keyboard shortcut info
  const getKbdClass = (color: keyof typeof KBD_COLORS) =>
    cn('text-[10px] font-mono px-1.5 py-0.5 rounded', KBD_COLORS[color])

  return (
    <div className="space-y-6">
      {/* Quick Actions - Gold Standard with Tabs */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-navy text-lg mb-4">
          {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
        </h3>

        {/* Main / Bulk Tabs (Only show in list mode with selection capability) */}
        {mode === 'list' && onToggleSelectionMode && (
          <div className="flex gap-2 mb-4 p-1 bg-slate-50 rounded-xl">
            <button
              onClick={() => setQuickActionsTab('main')}
              className={cn(
                'flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all',
                quickActionsTab === 'main'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {isRTL ? 'رئيسي' : 'Main'}
            </button>
            <button
              onClick={() => setQuickActionsTab('bulk')}
              className={cn(
                'flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all',
                quickActionsTab === 'bulk'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {isRTL ? 'تجميعي' : 'Bulk'}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {/* Main Tab Content */}
          {quickActionsTab === 'main' && (
            <>
              {/* Dynamic Create Button based on context */}
              {hasCreatePage && currentLinks.create && (
                <Button
                  asChild
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 justify-between"
                >
                  <Link to={currentLinks.create}>
                    <span className="flex items-center">
                      <Plus className="ms-3 h-5 w-5" aria-hidden="true" />
                      {context === 'leads' && (isRTL ? 'إضافة عميل محتمل' : 'Add Lead')}
                      {context === 'products' && (isRTL ? 'إضافة منتج' : 'Add Product')}
                      {context === 'quotes' && (isRTL ? 'إنشاء عرض سعر' : 'Create Quote')}
                      {context === 'campaigns' && (isRTL ? 'إنشاء حملة' : 'Create Campaign')}
                      {context === 'activities' && (isRTL ? 'إضافة نشاط' : 'Add Activity')}
                      {context === 'referrals' && (isRTL ? 'إضافة إحالة' : 'Add Referral')}
                      {context === 'reports' && (isRTL ? 'إنشاء تقرير' : 'Create Report')}
                      {context === 'contacts' && (isRTL ? 'إضافة جهة اتصال' : 'Add Contact')}
                      {context === 'email-marketing' && (isRTL ? 'إنشاء حملة بريدية' : 'Create Email Campaign')}
                      {context === 'whatsapp' && (isRTL ? 'بدء محادثة' : 'Start Conversation')}
                      {!['leads', 'products', 'quotes', 'campaigns', 'activities', 'referrals', 'reports', 'contacts', 'email-marketing', 'whatsapp'].includes(context) && (isRTL ? 'إضافة جديد' : 'Add New')}
                    </span>
                    <kbd className={getKbdClass('emerald')}>N</kbd>
                  </Link>
                </Button>
              )}

              {/* Selection Mode Toggle */}
              {onToggleSelectionMode && (
                <Button
                  onClick={onToggleSelectionMode}
                  variant="ghost"
                  className="w-full rounded-xl h-12 justify-between text-slate-600"
                >
                  <span className="flex items-center">
                    {isSelectionMode
                      ? (isRTL ? 'إلغاء التحديد' : 'Cancel Selection')
                      : (isRTL ? 'تحديد متعدد' : 'Multi-Select')
                    }
                  </span>
                  <kbd className={getKbdClass('slate')}>S</kbd>
                </Button>
              )}
            </>
          )}

          {/* Bulk Tab Content */}
          {quickActionsTab === 'bulk' && (
            <>
              {/* Select All */}
              {onSelectAll && (
                <Button
                  onClick={onSelectAll}
                  variant="outline"
                  className="w-full rounded-xl h-12 justify-between"
                  disabled={totalCount === 0}
                >
                  <span className="flex items-center gap-2">
                    <CheckCheck className="h-5 w-5" />
                    {isRTL ? 'تحديد الكل' : 'Select All'}
                    {totalCount > 0 && <span className="text-xs text-slate-400">({totalCount})</span>}
                  </span>
                  <kbd className={getKbdClass('blue')}>L</kbd>
                </Button>
              )}

              {/* Bulk Complete */}
              {onBulkComplete && (
                <Button
                  onClick={onBulkComplete}
                  variant="outline"
                  className="w-full rounded-xl h-12 justify-between text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  disabled={selectedCount === 0}
                >
                  <span className="flex items-center gap-2">
                    <CheckCheck className="h-5 w-5" />
                    {isRTL ? 'إكمال المحدد' : 'Complete Selected'}
                    {selectedCount > 0 && <span className="text-xs">({selectedCount})</span>}
                  </span>
                  <kbd className={getKbdClass('emerald')}>C</kbd>
                </Button>
              )}

              {/* Bulk Archive */}
              {onBulkArchive && (
                <Button
                  onClick={onBulkArchive}
                  variant="outline"
                  className="w-full rounded-xl h-12 justify-between text-slate-600"
                  disabled={selectedCount === 0}
                >
                  <span className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    {isRTL ? 'أرشفة المحدد' : 'Archive Selected'}
                    {selectedCount > 0 && <span className="text-xs text-slate-400">({selectedCount})</span>}
                  </span>
                  <kbd className={getKbdClass('slate')}>A</kbd>
                </Button>
              )}

              {/* Delete Selected */}
              {onDeleteSelected && (
                <Button
                  onClick={onDeleteSelected}
                  variant="outline"
                  className="w-full rounded-xl h-12 justify-between text-red-600 border-red-200 hover:bg-red-50"
                  disabled={selectedCount === 0}
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    {isRTL ? 'حذف المحدد' : 'Delete Selected'}
                    {selectedCount > 0 && <span className="text-xs">({selectedCount})</span>}
                  </span>
                  <kbd className={getKbdClass('red')}>D</kbd>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-navy text-lg mb-4">
          {isRTL ? 'التنقل السريع' : 'Quick Navigation'}
        </h3>
        <div className="space-y-2">
          {navigationLinks.map((link) => {
            const Icon = link.icon
            const isActive = context === link.key
            return (
              <Button
                key={link.key}
                asChild
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  "w-full rounded-xl h-11 justify-start",
                  isActive
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "hover:bg-slate-50 text-slate-700"
                )}
              >
                <Link to={link.route}>
                  <Icon className={cn("ms-3 h-4 w-4", isActive ? "text-white" : link.color)} aria-hidden="true" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-navy text-lg mb-4">
          {isRTL ? 'إحصائيات المبيعات' : 'Sales Statistics'}
        </h3>
        {statsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600 flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                {isRTL ? 'إجمالي العملاء المحتملين' : 'Total Leads'}
              </span>
              <span className="font-bold text-navy text-lg">
                {stats?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span className="text-emerald-700 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                {isRTL ? 'تم التحويل' : 'Converted'}
              </span>
              <span className="font-bold text-emerald-700 text-lg">
                {stats?.converted || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-blue-700 flex items-center gap-2">
                <Target className="h-4 w-4" aria-hidden="true" />
                {isRTL ? 'معدل التحويل' : 'Conversion Rate'}
              </span>
              <span className="font-bold text-blue-700 text-lg">
                {stats?.conversionRate || '0'}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Needs Follow Up */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-navy text-lg">
            {isRTL ? 'يحتاج متابعة' : 'Needs Follow Up'}
          </h3>
          <Button variant="ghost" size="sm" className="text-emerald-600" asChild>
            <Link to={`${ROUTES.dashboard.crm.leads.list}?filter=followup`}>
              {isRTL ? 'عرض الكل' : 'View All'}
            </Link>
          </Button>
        </div>
        {followUpLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : followUpData && followUpData.length > 0 ? (
          <div className="space-y-3">
            {followUpData.slice(0, 5).map((lead: any) => (
              <Link
                key={lead._id}
                to={ROUTES.dashboard.crm.leads.detail(lead._id)}
                className="block p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-navy">{lead.displayName}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      {lead.phone}
                    </p>
                  </div>
                  {lead.nextFollowUpDate && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
                      {formatDistanceToNow(new Date(lead.nextFollowUpDate), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">
            {isRTL ? 'لا توجد متابعات قادمة' : 'No upcoming follow-ups'}
          </p>
        )}
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-navy text-lg">
            {isRTL ? 'المهام القادمة' : 'Upcoming Tasks'}
          </h3>
          <Button variant="ghost" size="sm" className="text-emerald-600" asChild>
            <Link to={links.activities.viewAll}>
              {isRTL ? 'عرض الكل' : 'View All'}
            </Link>
          </Button>
        </div>
        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : tasksData && tasksData.length > 0 ? (
          <div className="space-y-3">
            {tasksData.slice(0, 5).map((task: any) => (
              <div
                key={task._id}
                className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <p className="font-medium text-navy">{task.title}</p>
                {task.taskData?.dueDate && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    {new Date(task.taskData.dueDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">
            {isRTL ? 'لا توجد مهام قادمة' : 'No upcoming tasks'}
          </p>
        )}
      </div>
    </div>
  )
}
