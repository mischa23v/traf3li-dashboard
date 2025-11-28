import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  FileText,
  BookOpen,
  Search,
  Bell,
  Briefcase,
  ChevronRight,
  Scale,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCases } from '@/hooks/useCasesAndClients'

export function WikiGlobalCreateView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)

  // Fetch cases
  const { data: casesData, isLoading } = useCases({})

  // Filter cases by search
  const filteredCases = casesData?.cases?.filter(c => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      c.title?.toLowerCase().includes(query) ||
      c.caseNumber?.toLowerCase().includes(query) ||
      c.clientName?.toLowerCase().includes(query)
    )
  }) || []

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId)
    // Navigate to the case-specific wiki create page
    navigate({ to: `/dashboard/cases/${caseId}/wiki/new` as any })
  }

  const topNav = [
    { title: isArabic ? 'نظرة عامة' : 'Overview', href: '/dashboard/overview', isActive: false },
    { title: isArabic ? 'المهام' : 'Tasks', href: '/dashboard/tasks/list', isActive: false },
    { title: isArabic ? 'التذكيرات' : 'Reminders', href: '/dashboard/tasks/reminders', isActive: false },
    { title: isArabic ? 'الأحداث' : 'Events', href: '/dashboard/tasks/events', isActive: false },
    { title: isArabic ? 'مراجع والملاحضات' : 'References & Notes', href: '/dashboard/wiki' as any, isActive: false },
    { title: isArabic ? 'صفحة جديدة' : 'New Page', href: '/dashboard/wiki/new' as any, isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center space-x-4'>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* HERO CARD */}
          <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-lg">
              <div className="flex items-center gap-4 mb-4">
                <Link to="/dashboard/wiki">
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <h2 className="text-3xl font-bold leading-tight">
                  {isArabic ? 'إنشاء صفحة جديدة' : 'Create New Page'}
                </h2>
              </div>
              <p className="text-emerald-200 text-lg mb-4 leading-relaxed">
                {isArabic
                  ? 'اختر القضية التي تريد إنشاء صفحة ويكي جديدة فيها. يمكنك البحث عن القضية بالاسم أو الرقم.'
                  : 'Select the case where you want to create a new wiki page. You can search for the case by name or number.'}
              </p>
            </div>
            {/* Abstract Visual Decoration */}
            <div className="hidden md:block relative w-64 h-64">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div className="absolute inset-4 bg-emerald-950 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                <BookOpen className="h-24 w-24 text-emerald-400" />
              </div>
              <div className="absolute inset-4 bg-emerald-950/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                <FileText className="h-24 w-24 text-teal-400" />
              </div>
            </div>
          </div>

          {/* Case Selection Card */}
          <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 p-6">
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-emerald-500" />
                </div>
                {isArabic ? 'اختر القضية' : 'Select Case'}
              </CardTitle>
              <p className="text-slate-500 mt-2">
                {isArabic
                  ? 'صفحات الويكي مرتبطة بالقضايا. اختر القضية للمتابعة.'
                  : 'Wiki pages are linked to cases. Select a case to continue.'}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={isArabic ? 'ابحث عن قضية...' : 'Search for a case...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 pr-10 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Cases List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {isLoading && (
                  <>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-2/3" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {!isLoading && filteredCases.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <Scale className="h-8 w-8 text-slate-400" />
                    </div>
                    <h4 className="text-lg font-bold text-navy mb-2">
                      {searchQuery
                        ? (isArabic ? 'لا توجد نتائج' : 'No Results')
                        : (isArabic ? 'لا توجد قضايا' : 'No Cases')}
                    </h4>
                    <p className="text-slate-500 mb-4">
                      {searchQuery
                        ? (isArabic ? 'جرب البحث بكلمات مختلفة' : 'Try different search terms')
                        : (isArabic ? 'أنشئ قضية أولاً لإضافة صفحات ويكي' : 'Create a case first to add wiki pages')}
                    </p>
                    {!searchQuery && (
                      <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                        <Link to="/dashboard/cases">
                          <Briefcase className="ms-2 h-4 w-4" />
                          {isArabic ? 'إدارة القضايا' : 'Manage Cases'}
                        </Link>
                      </Button>
                    )}
                  </div>
                )}

                {!isLoading && filteredCases.map(caseItem => (
                  <button
                    key={caseItem._id}
                    onClick={() => handleCaseSelect(caseItem._id)}
                    disabled={selectedCaseId === caseItem._id}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-start ${
                      selectedCaseId === caseItem._id
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <Scale className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-navy truncate">
                        {caseItem.title || caseItem.caseNumber}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        {caseItem.caseNumber && (
                          <span>{caseItem.caseNumber}</span>
                        )}
                        {caseItem.clientName && (
                          <>
                            <span>•</span>
                            <span>{caseItem.clientName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {selectedCaseId === caseItem._id ? (
                      <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </Main>
    </>
  )
}
