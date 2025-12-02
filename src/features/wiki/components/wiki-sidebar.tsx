import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Pin,
  Lock,
  Clock,
  FileText,
  Briefcase,
  TrendingUp,
  FolderOpen,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link, useParams } from '@tanstack/react-router'
import type { WikiPage, WikiCollection } from '@/types/wiki'

// Get activity color classes based on index (full Tailwind class names to avoid purge issues)
const getActivityColorClasses = (index: number) => {
  if (index === 0) return { bg: 'bg-blue-50', border: 'border-blue-500' }
  if (index === 1) return { bg: 'bg-purple-50', border: 'border-purple-500' }
  return { bg: 'bg-emerald-50', border: 'border-emerald-500' }
}

interface WikiSidebarProps {
  recentPages?: WikiPage[]
  collections?: WikiCollection[]
  isLoading?: boolean
}

export function WikiSidebar({ recentPages = [], collections = [], isLoading }: WikiSidebarProps) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { caseId } = useParams({ strict: false }) as { caseId: string }

  // Calculate stats
  const totalPages = recentPages.length
  const pinnedCount = recentPages.filter(p => p.isPinned).length
  const sealedCount = recentPages.filter(p => p.isSealed).length
  const draftCount = recentPages.filter(p => p.status === 'draft').length

  return (
    <div className="space-y-8 lg:col-span-1">

      {/* WIKI STATS WIDGET */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300">
        <div className="p-6 pb-0 flex justify-between items-center">
          <h3 className="font-bold text-lg text-navy">
            {isArabic ? 'إحصائيات الويكي' : 'Wiki Stats'}
          </h3>
          <div className="bg-emerald-50 p-2 rounded-full">
            <BookOpen className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
              <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#10b981"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="439.8"
                strokeDashoffset={isLoading ? 439.8 : Math.max(0, 439.8 - (totalPages * 20))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-navy">{isLoading ? '-' : totalPages}</span>
              <span className="text-sm text-slate-400 mt-1">
                {isArabic ? 'صفحة' : 'pages'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-amber-500 font-bold text-lg">{isLoading ? '-' : pinnedCount}</div>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <Pin className="h-3 w-3" />
                {isArabic ? 'مثبتة' : 'Pinned'}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-red-500 font-bold text-lg">{isLoading ? '-' : sealedCount}</div>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                {isArabic ? 'مختومة' : 'Sealed'}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-blue-500 font-bold text-lg">{isLoading ? '-' : draftCount}</div>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <FileText className="h-3 w-3" />
                {isArabic ? 'مسودات' : 'Drafts'}
              </div>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl h-12 font-bold">
            <Link to={`/dashboard/cases/${caseId}/wiki/new` as any}>
              <Plus className="h-4 w-4 ms-2" />
              {isArabic ? 'إنشاء صفحة جديدة' : 'Create New Page'}
            </Link>
          </Button>
        </div>
      </div>

      {/* COLLECTIONS WIDGET */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
        <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-navy flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-emerald-500" />
            {t('wiki.stats.collections')}
          </h3>
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full hover:bg-emerald-50 text-emerald-600">
            <Link to={`/dashboard/cases/${caseId}/wiki/collections` as any}>
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="p-4">
          {collections && collections.length > 0 ? (
            <div className="space-y-2">
              {collections.slice(0, 5).map((collection) => (
                <div
                  key={collection._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: collection.color + '20' }}
                  >
                    <FolderOpen className="h-4 w-4" style={{ color: collection.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy truncate group-hover:text-emerald-600 transition-colors">
                      {isArabic ? collection.nameAr || collection.name : collection.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {collection.pageCount} {isArabic ? 'صفحات' : 'pages'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">
              {t('wiki.noCollections')}
            </div>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY WIDGET */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-navy text-lg">
            {isArabic ? 'آخر التحديثات' : 'Recent Activity'}
          </h3>
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3 border-0">
            {isArabic ? 'نشط' : 'Active'}
          </Badge>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-slate-400">
              {isArabic ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : recentPages.slice(0, 3).length === 0 ? (
            <div className="text-center py-4 text-slate-400">
              {isArabic ? 'لا توجد نشاطات حديثة' : 'No recent activity'}
            </div>
          ) : recentPages.slice(0, 3).map((page, i) => {
            const colorClasses = getActivityColorClasses(i)
            return (
              <div key={page._id} className={`flex gap-4 relative pb-4 ${i < 2 ? 'border-b border-slate-50' : ''}`}>
                <div className="w-14 text-center shrink-0">
                  <div className="text-sm font-bold text-navy">
                    {new Date(page.updatedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { day: 'numeric' })}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(page.updatedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short' })}
                  </div>
                </div>
                <div className={`flex-1 ${colorClasses.bg} rounded-xl p-3 border-r-4 ${colorClasses.border}`}>
                  <Link to={`/dashboard/cases/${caseId}/wiki/${page._id}` as any}>
                    <div className="font-bold text-navy text-sm mb-1 hover:text-emerald-600 transition-colors line-clamp-1">
                      {isArabic ? page.titleAr || page.title : page.title}
                    </div>
                  </Link>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    v{page.version}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
