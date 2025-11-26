import { useSearch } from '@tanstack/react-router'
import { useDocuments, useDocumentStats } from '@/hooks/useDocuments'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { DocumentsProvider } from './components/documents-provider'
import { DocumentsTable } from './components/documents-table'
import { DocumentsPrimaryButtons } from './components/documents-primary-buttons'
import { DocumentsDialogs } from './components/documents-dialogs'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Lock, HardDrive, Calendar } from 'lucide-react'
import { formatFileSize } from './data/data'

export default function Documents() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_authenticated/dashboard/documents/' })
  const page = search.page || 1
  const pageSize = search.pageSize || 10

  const { data, isLoading } = useDocuments({
    page,
    limit: pageSize,
    category: search.category,
    search: search.search,
  })

  const { data: stats } = useDocumentStats()

  return (
    <DocumentsProvider>
      <Header>
        <div className='ms-auto flex items-center space-s-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('documents.title')}
            </h2>
            <p className='text-muted-foreground'>{t('documents.description')}</p>
          </div>
          <DocumentsPrimaryButtons />
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className='grid gap-4 md:grid-cols-4 mb-6'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <FileText className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('documents.totalDocuments')}
                    </p>
                    <p className='text-2xl font-bold'>{stats.totalDocuments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-destructive/10 rounded-lg'>
                    <Lock className='h-5 w-5 text-destructive' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('documents.confidentialDocs')}
                    </p>
                    <p className='text-2xl font-bold'>{stats.confidentialDocuments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-blue-500/10 rounded-lg'>
                    <HardDrive className='h-5 w-5 text-blue-500' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('documents.storageUsed')}
                    </p>
                    <p className='text-2xl font-bold'>
                      {formatFileSize(stats.totalStorageUsed)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-green-500/10 rounded-lg'>
                    <Calendar className='h-5 w-5 text-green-500' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('documents.thisMonth')}
                    </p>
                    <p className='text-2xl font-bold'>{stats.documentsThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DocumentsTable
            data={data?.data || []}
            totalCount={data?.total || 0}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <DocumentsDialogs />
    </DocumentsProvider>
  )
}
