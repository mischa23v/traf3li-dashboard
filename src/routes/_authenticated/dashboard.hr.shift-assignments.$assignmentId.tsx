import { createFileRoute } from '@tanstack/react-router'
import { HRSidebar } from '@/features/hr/components/hr-sidebar'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate } from '@tanstack/react-router'
import { ProductivityHero } from '@/components/productivity-hero'
import { useShiftAssignment } from '@/hooks/useShiftAssignment'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  Search,
  Bell,
  ArrowLeft,
  Clock,
  Calendar,
  Building2,
  User,
  RefreshCw,
  CheckCircle,
  XCircle,
  CalendarClock,
  Edit3,
} from 'lucide-react'
import { SHIFT_ASSIGNMENT_STATUS_LABELS } from '@/services/shiftAssignmentService'

export const Route = createFileRoute(
  '/_authenticated/dashboard/hr/shift-assignments/$assignmentId'
)({
  component: ShiftAssignmentDetailsView,
})

function ShiftAssignmentDetailsView() {
  const { assignmentId } = Route.useParams()
  const navigate = useNavigate()

  const { data: assignment, isLoading, isError, error } = useShiftAssignment(assignmentId)

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: false },
    {
      title: 'مهام النوبات',
      href: '/dashboard/hr/shift-assignments',
      isActive: true,
    },
  ]

  // Status badge
  const getStatusBadge = (status: any) => {
    const config = SHIFT_ASSIGNMENT_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    }
    const icons: Record<string, React.ReactNode> = {
      active: <CheckCircle className="w-3 h-3" />,
      inactive: <XCircle className="w-3 h-3" />,
      scheduled: <CalendarClock className="w-3 h-3" />,
    }
    return (
      <Badge
        className={`${colorClasses[config.color]} border-0 rounded-md px-2 flex items-center gap-1`}
      >
        {icons[status]}
        {config.ar}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="بحث..."
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] dark:bg-slate-950 flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD */}
        <ProductivityHero
          badge="الموارد البشرية"
          title="تفاصيل مهمة النوبة"
          type="shift-assignment-details"
        />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/dashboard/hr/shift-assignments' })}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 me-2" />
              العودة إلى القائمة
            </Button>

            {isLoading ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  خطأ في تحميل البيانات
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {error?.message || 'حدث خطأ غير متوقع'}
                </p>
              </div>
            ) : assignment ? (
              <>
                {/* Assignment Details Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {assignment.employeeNameAr || assignment.employeeName}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        {assignment.employeeNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(assignment.status)}
                      {assignment.isRotational && (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 rounded-md px-2 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          دوري
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employee Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        معلومات الموظف
                      </h3>

                      {assignment.departmentName && (
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              القسم
                            </p>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {assignment.departmentNameAr ||
                                assignment.departmentName}
                            </p>
                          </div>
                        </div>
                      )}

                      {assignment.jobTitle && (
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              المسمى الوظيفي
                            </p>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {assignment.jobTitleAr || assignment.jobTitle}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shift Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        معلومات النوبة
                      </h3>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            نوع النوبة
                          </p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {assignment.shiftTypeNameAr ||
                              assignment.shiftTypeName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            الفترة
                          </p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            من {formatDate(assignment.startDate)}
                            {assignment.endDate && (
                              <> - {formatDate(assignment.endDate)}</>
                            )}
                            {!assignment.endDate && (
                              <span className="text-sm text-slate-500 ms-2">
                                (دائم)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rotation Patterns */}
                  {assignment.isRotational && assignment.rotationPattern && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
                        أنماط التناوب
                      </h3>
                      <div className="space-y-3">
                        {assignment.rotationPattern.map((pattern, index) => (
                          <div
                            key={index}
                            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                          >
                            <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                              {pattern.shiftName}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {pattern.daysOfWeek.map((day) => (
                                <span
                                  key={day}
                                  className="px-2 py-1 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 text-xs rounded-md border border-purple-200 dark:border-purple-800"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {assignment.notes?.assignmentNotes && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                        ملاحظات
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {assignment.notes.assignmentNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                    >
                      <Edit3 className="w-4 h-4 me-2" />
                      تعديل
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <div className="space-y-6">
            <HRSidebar activeSection="shift-assignments" />
          </div>
        </div>
      </Main>
    </>
  )
}
