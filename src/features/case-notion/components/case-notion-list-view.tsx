import { CaseNotionSidebar } from './case-notion-sidebar'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCases } from '@/hooks/useCasesAndClients'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
    Search, Bell, AlertCircle, Plus, MoreHorizontal, ChevronLeft,
    Eye, Trash2, Edit3, SortAsc, Filter, X, Lightbulb, Scale,
    FolderOpen, FileText, Clock, User, Calendar
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function CaseNotionListView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('updatedAt')

    // Fetch cases that have notion pages
    const { data: casesData, isLoading, isError, error, refetch } = useCases()

    // Helper function to format dates based on current locale
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: t('caseNotion.list.notSet', 'غير محدد'), english: t('caseNotion.list.notSet', 'Not set') }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy', { locale: enUS })
        }
    }

    // Transform and filter API data
    const cases = useMemo(() => {
        if (!casesData?.cases) return []

        let filteredCases = casesData.cases

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filteredCases = filteredCases.filter((c: any) =>
                c.title?.toLowerCase().includes(query) ||
                c.caseNumber?.toLowerCase().includes(query) ||
                c.clientId?.name?.toLowerCase().includes(query)
            )
        }

        // Status filter
        if (statusFilter !== 'all') {
            filteredCases = filteredCases.filter((c: any) => c.status === statusFilter)
        }

        // Sort
        filteredCases = [...filteredCases].sort((a: any, b: any) => {
            if (sortBy === 'updatedAt') {
                return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
            } else if (sortBy === 'createdAt') {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            } else if (sortBy === 'title') {
                return (a.title || '').localeCompare(b.title || '')
            }
            return 0
        })

        return filteredCases.map((caseItem: any) => ({
            id: caseItem._id,
            title: caseItem.title || caseItem.caseNumber || t('caseNotion.list.untitled', 'بدون عنوان'),
            caseNumber: caseItem.caseNumber,
            client: caseItem.clientId?.name || t('caseNotion.list.noClient', 'بدون عميل'),
            status: caseItem.status || 'active',
            updatedAt: caseItem.updatedAt,
            createdAt: caseItem.createdAt,
            updatedAtFormatted: formatDualDate(caseItem.updatedAt),
            createdAtFormatted: formatDualDate(caseItem.createdAt),
            notionPagesCount: caseItem.notionPagesCount || 0,
            _id: caseItem._id,
        }))
    }, [casesData, searchQuery, statusFilter, sortBy, t])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || statusFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
    }

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedCaseIds([])
    }

    const handleSelectCase = (caseId: string) => {
        if (selectedCaseIds.includes(caseId)) {
            setSelectedCaseIds(selectedCaseIds.filter(id => id !== caseId))
        } else {
            setSelectedCaseIds([...selectedCaseIds, caseId])
        }
    }

    const handleDeleteSelected = () => {
        // This would delete notion pages for selected cases
        // For now, just show a message
        if (selectedCaseIds.length === 0) return
        alert(t('caseNotion.list.deleteNotImplemented', 'حذف صفحات العصف الذهني قيد التطوير'))
    }

    // Single case actions
    const handleViewCase = (caseId: string) => {
        navigate({ to: `/dashboard/cases/${caseId}` as any })
    }

    const handleOpenNotion = (caseId: string) => {
        navigate({ to: `/dashboard/cases/${caseId}/notion` as any })
    }

    const topNav = [
        { title: t('caseNotion.nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
        { title: t('caseNotion.nav.tasks', 'المهام'), href: '/dashboard/tasks/list', isActive: false },
        { title: t('caseNotion.nav.cases', 'القضايا'), href: '/dashboard/cases', isActive: false },
        { title: t('caseNotion.nav.brainstorm', 'العصف الذهني'), href: '/dashboard/notion', isActive: true },
    ]

    // Get status badge style
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 rounded-md px-2">{t('caseNotion.status.active', 'نشط')}</Badge>
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 rounded-md px-2">{t('caseNotion.status.pending', 'قيد الانتظار')}</Badge>
            case 'closed':
                return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 rounded-md px-2">{t('caseNotion.status.closed', 'مغلق')}</Badge>
            default:
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md px-2">{status}</Badge>
        }
    }

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder={t('caseNotion.list.search', 'البحث...')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
                        <Bell className="h-5 w-5" />
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD */}
                <ProductivityHero
                    badge={t('caseNotion.hero.badge', 'العصف الذهني')}
                    title={t('caseNotion.hero.title', 'مساحة العمل التعاونية')}
                    type="tasks"
                />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Input */}
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                    <Input
                                        type="text"
                                        placeholder={t('caseNotion.list.searchPlaceholder', 'ابحث عن قضية...')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    />
                                </div>

                                {/* Status Filter */}
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                        <SelectValue placeholder={t('caseNotion.list.status', 'الحالة')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('caseNotion.list.allStatuses', 'جميع الحالات')}</SelectItem>
                                        <SelectItem value="active">{t('caseNotion.status.active', 'نشط')}</SelectItem>
                                        <SelectItem value="pending">{t('caseNotion.status.pending', 'قيد الانتظار')}</SelectItem>
                                        <SelectItem value="closed">{t('caseNotion.status.closed', 'مغلق')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Sort By */}
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                        <SortAsc className="h-4 w-4 ms-2 text-slate-500" />
                                        <SelectValue placeholder={t('caseNotion.list.sortBy', 'الترتيب')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="updatedAt">{t('caseNotion.list.lastUpdated', 'آخر تحديث')}</SelectItem>
                                        <SelectItem value="createdAt">{t('caseNotion.list.createdAt', 'تاريخ الإنشاء')}</SelectItem>
                                        <SelectItem value="title">{t('caseNotion.list.name', 'الاسم')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Clear Filters Button */}
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                    >
                                        <X className="h-4 w-4 ms-2" aria-hidden="true" />
                                        {t('caseNotion.list.clearFilters', 'مسح الفلاتر')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* MAIN CASES LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">
                                    {t('caseNotion.list.casesWithNotion', 'القضايا ومساحات العمل')}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {t('caseNotion.list.caseCount', { count: cases.length }, `${cases.length} قضية`)}
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{t('caseNotion.list.errorLoading', 'حدث خطأ في التحميل')}</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || t('caseNotion.list.connectionError', 'تعذر الاتصال بالخادم')}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            {t('caseNotion.list.retry', 'إعادة المحاولة')}
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && cases.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Lightbulb className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{t('caseNotion.list.noCases', 'لا توجد قضايا')}</h3>
                                        <p className="text-slate-500 mb-4">{t('caseNotion.list.noCasesDescription', 'أنشئ قضية جديدة لبدء العصف الذهني')}</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/cases/create">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                {t('caseNotion.list.newCase', 'قضية جديدة')}
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Cases List */}
                                {!isLoading && !isError && cases.map((caseItem, index) => (
                                    <div
                                        key={caseItem.id}
                                        className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group animate-in fade-in slide-in-from-bottom-4 ${selectedCaseIds.includes(caseItem.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200 hover:shadow-md hover:-translate-y-1'}`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedCaseIds.includes(caseItem.id)}
                                                        onCheckedChange={() => handleSelectCase(caseItem.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center shadow-sm border border-emerald-100">
                                                    <Scale className="h-6 w-6 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{caseItem.title}</h4>
                                                        {getStatusBadge(caseItem.status)}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                                                        {caseItem.caseNumber && (
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="h-3.5 w-3.5" />
                                                                {caseItem.caseNumber}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3.5 w-3.5" />
                                                            {caseItem.client}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleOpenNotion(caseItem.id)}>
                                                        <Lightbulb className="h-4 w-4 ms-2 text-emerald-500" aria-hidden="true" />
                                                        {t('caseNotion.list.openBrainstorm', 'فتح العصف الذهني')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleViewCase(caseItem.id)}>
                                                        <Eye className="h-4 w-4 ms-2" />
                                                        {t('caseNotion.list.viewCase', 'عرض القضية')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/cases/${caseItem.id}/edit` as any })}>
                                                        <Edit3 className="h-4 w-4 ms-2 text-blue-500" />
                                                        {t('caseNotion.list.editCase', 'تعديل القضية')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                {/* Notion Pages Count */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-500 mb-1">{t('caseNotion.list.pages', 'الصفحات')}</div>
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="h-4 w-4 text-emerald-500" />
                                                        <span className="font-bold text-navy text-sm">{caseItem.notionPagesCount || 0}</span>
                                                    </div>
                                                </div>
                                                {/* Last Updated - Dual Language */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-500 mb-1">{t('caseNotion.list.lastUpdated', 'آخر تحديث')}</div>
                                                    <div className="font-bold text-navy text-sm">{caseItem.updatedAtFormatted.arabic}</div>
                                                    <div className="text-xs text-slate-500">{caseItem.updatedAtFormatted.english}</div>
                                                </div>
                                                {/* Created Date - Dual Language */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-500 mb-1">{t('caseNotion.list.createdAt', 'تاريخ الإنشاء')}</div>
                                                    <div className="font-bold text-slate-600 text-sm">{caseItem.createdAtFormatted.arabic}</div>
                                                    <div className="text-xs text-slate-500">{caseItem.createdAtFormatted.english}</div>
                                                </div>
                                            </div>
                                            <Link to={`/dashboard/cases/${caseItem.id}/notion` as any}>
                                                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl px-6 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                                                    <Lightbulb className="h-4 w-4 ms-2" />
                                                    {t('caseNotion.list.openWorkspace', 'فتح مساحة العمل')}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button asChild variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    <Link to="/dashboard/cases">
                                        {t('caseNotion.list.viewAllCases', 'عرض جميع القضايا')}
                                        <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <CaseNotionSidebar
                        context="list"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedCaseIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
