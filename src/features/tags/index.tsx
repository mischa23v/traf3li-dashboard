import { useSearch } from '@tanstack/react-router'
import { useTags } from '@/hooks/useTags'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { TagsProvider } from './components/tags-provider'
import { TagsTable } from './components/tags-table'
import { TagsPrimaryButtons } from './components/tags-primary-buttons'
import { TagsDialogs } from './components/tags-dialogs'
import { useTranslation } from 'react-i18next'

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

  return (
    <TagsProvider>
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
              {t('tags.title')}
            </h2>
            <p className='text-muted-foreground'>{t('tags.description')}</p>
          </div>
          <TagsPrimaryButtons />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <TagsTable
            data={data?.data || []}
            totalCount={data?.total || 0}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <TagsDialogs />
    </TagsProvider>
  )
}
