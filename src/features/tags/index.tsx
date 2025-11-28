import { useSearch } from '@tanstack/react-router'
import { useTags } from '@/hooks/useTags'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { TagsProvider } from './components/tags-provider'
import { TagsTable } from './components/tags-table'
import { TagsPrimaryButtons } from './components/tags-primary-buttons'
import { TagsDialogs } from './components/tags-dialogs'
import { useTranslation } from 'react-i18next'
import { Search, Bell, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SettingsSidebar } from '../settings/components/settings-sidebar'

export default function Tags() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_authenticated/dashboard/tags/' })
  const page = search.page || 1
  const pageSize = search.pageSize || 10

  const { data, isLoading } = useTags({
    page,
    limit: pageSize,
    entityType: search.entityType,
    search: search.search,
  })

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.settings', 'الإعدادات'), href: '/dashboard/settings', isActive: true },
  ]

  return (
    <TagsProvider>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                  <Scale className="w-3 h-3 ml-2" />
                  {t('settings.title', 'الإعدادات')}
                </Badge>
                <span className="text-slate-400 text-sm">
                  {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">
                {t('tags.title', 'إدارة الوسوم')}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                {t('tags.description', 'تصنيف وتنظيم البيانات باستخدام الوسوم المخصصة')}
              </p>
            </div>
            <div className="flex gap-3">
              <TagsPrimaryButtons />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <TagsTable
                data={data?.data || []}
                totalCount={data?.total || 0}
                page={page}
                pageSize={pageSize}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Sidebar */}
          <SettingsSidebar context="tags" />
        </div>
      </Main>

      <TagsDialogs />
    </TagsProvider>
  )
}
