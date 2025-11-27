import { type ChangeEvent, useState, useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { SlidersHorizontal, ArrowUpAZ, ArrowDownAZ } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useApps, useConnectApp, useDisconnectApp } from '@/hooks/useApps'
import { Skeleton } from '@/components/ui/skeleton'
import { getAppIcon } from './utils/icon-mapper'

const route = getRouteApi('/_authenticated/dashboard/apps/')

type AppType = 'all' | 'connected' | 'notConnected'

const appText = new Map<AppType, string>([
  ['all', 'جميع التطبيقات'],
  ['connected', 'متصل'],
  ['notConnected', 'غير متصل'],
])

// Arabic app names and descriptions
const appTranslations: Record<string, { name: string; desc: string }> = {
  telegram: {
    name: 'تيليجرام',
    desc: 'اتصل بتيليجرام للتواصل الفوري مع العملاء والفريق.',
  },
  notion: {
    name: 'نوشن',
    desc: 'مزامنة صفحات نوشن للتعاون السلس في إدارة المستندات.',
  },
  figma: {
    name: 'فيجما',
    desc: 'عرض والتعاون على تصاميم فيجما في مكان واحد.',
  },
  trello: {
    name: 'تريلو',
    desc: 'مزامنة بطاقات تريلو لإدارة المشاريع بشكل منظم.',
  },
  slack: {
    name: 'سلاك',
    desc: 'دمج سلاك للتواصل الفعال مع فريق العمل.',
  },
  zoom: {
    name: 'زووم',
    desc: 'استضافة اجتماعات زووم مباشرة من لوحة التحكم.',
  },
  stripe: {
    name: 'سترايب',
    desc: 'إدارة معاملات ومدفوعات سترايب بسهولة.',
  },
  gmail: {
    name: 'جيميل',
    desc: 'الوصول وإدارة رسائل جيميل بكل سهولة.',
  },
  medium: {
    name: 'ميديوم',
    desc: 'استكشاف ومشاركة مقالات ميديوم على لوحة التحكم.',
  },
  skype: {
    name: 'سكايب',
    desc: 'التواصل مع جهات اتصال سكايب بسلاسة.',
  },
  docker: {
    name: 'دوكر',
    desc: 'إدارة حاويات دوكر بسهولة من لوحة التحكم.',
  },
  github: {
    name: 'جيت هب',
    desc: 'تبسيط إدارة الأكواد مع تكامل جيت هب.',
  },
  gitlab: {
    name: 'جيت لاب',
    desc: 'إدارة مشاريع الأكواد بكفاءة مع تكامل جيت لاب.',
  },
  discord: {
    name: 'ديسكورد',
    desc: 'التواصل مع ديسكورد للتنسيق السلس مع الفريق.',
  },
  whatsapp: {
    name: 'واتساب',
    desc: 'دمج واتساب للتواصل المباشر مع العملاء.',
  },
  microsoft365: {
    name: 'مايكروسوفت 365',
    desc: 'تكامل مع تطبيقات مايكروسوفت للإنتاجية والتعاون.',
  },
  googlecalendar: {
    name: 'تقويم جوجل',
    desc: 'مزامنة المواعيد والأحداث مع تقويم جوجل.',
  },
  googledrive: {
    name: 'جوجل درايف',
    desc: 'الوصول وإدارة ملفاتك على جوجل درايف.',
  },
  dropbox: {
    name: 'دروب بوكس',
    desc: 'مزامنة وإدارة ملفاتك على دروب بوكس.',
  },
  onedrive: {
    name: 'ون درايف',
    desc: 'تخزين ومشاركة الملفات عبر ون درايف.',
  },
  teams: {
    name: 'مايكروسوفت تيمز',
    desc: 'التواصل والتعاون مع الفريق عبر تيمز.',
  },
  outlook: {
    name: 'أوتلوك',
    desc: 'إدارة البريد الإلكتروني والتقويم عبر أوتلوك.',
  },
  evernote: {
    name: 'إيفرنوت',
    desc: 'تدوين وتنظيم الملاحظات عبر إيفرنوت.',
  },
  asana: {
    name: 'أسانا',
    desc: 'إدارة المشاريع والمهام عبر أسانا.',
  },
  jira: {
    name: 'جيرا',
    desc: 'تتبع المشاريع والمهام باستخدام جيرا.',
  },
  zapier: {
    name: 'زابير',
    desc: 'أتمتة سير العمل بين التطبيقات المختلفة.',
  },
  calendly: {
    name: 'كاليندلي',
    desc: 'جدولة المواعيد بسهولة مع العملاء.',
  },
  docusign: {
    name: 'دوكيو ساين',
    desc: 'توقيع المستندات إلكترونياً بشكل آمن.',
  },
  quickbooks: {
    name: 'كويك بوكس',
    desc: 'إدارة الحسابات والمالية عبر كويك بوكس.',
  },
  xero: {
    name: 'زيرو',
    desc: 'إدارة المحاسبة والفواتير عبر زيرو.',
  },
}

// Helper to get Arabic translation for an app
function getAppTranslation(appName: string) {
  const key = appName.toLowerCase().replace(/\s+/g, '')
  return appTranslations[key] || { name: appName, desc: '' }
}

export function Apps() {
  const {
    filter = '',
    type = 'all',
    sort: initSort = 'asc',
  } = route.useSearch()
  const navigate = route.useNavigate()

  const [sort, setSort] = useState(initSort)
  const [appType, setAppType] = useState(type)
  const [searchTerm, setSearchTerm] = useState(filter)

  // Fetch apps from API
  const { data: apps, isLoading } = useApps()

  // Connect/Disconnect mutations
  const connectApp = useConnectApp()
  const disconnectApp = useDisconnectApp()

  const filteredApps = useMemo(() => {
    if (!apps) return []

    return apps
      .sort((a, b) =>
        sort === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      )
      .filter((app) =>
        appType === 'connected'
          ? app.connected
          : appType === 'notConnected'
            ? !app.connected
            : true
      )
      .filter((app) => {
        const translation = getAppTranslation(app.name)
        return (
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          translation.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
  }, [apps, sort, appType, searchTerm])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    navigate({
      search: (prev) => ({
        ...prev,
        filter: e.target.value || undefined,
      }),
    })
  }

  const handleTypeChange = (value: AppType) => {
    setAppType(value)
    navigate({
      search: (prev) => ({
        ...prev,
        type: value === 'all' ? undefined : value,
      }),
    })
  }

  const handleSortChange = (sort: 'asc' | 'desc') => {
    setSort(sort)
    navigate({ search: (prev) => ({ ...prev, sort }) })
  }

  const handleToggleConnect = (appId: string, isConnected: boolean) => {
    if (isConnected) {
      disconnectApp.mutate(appId)
    } else {
      connectApp.mutate({ appId })
    }
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            تكامل التطبيقات
          </h1>
          <p className='text-muted-foreground'>
            قم بربط تطبيقاتك المفضلة لتحسين سير العمل وزيادة الإنتاجية
          </p>
        </div>
        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='البحث في التطبيقات...'
              className='h-9 w-40 lg:w-[250px]'
              value={searchTerm}
              onChange={handleSearch}
            />
            <Select value={appType} onValueChange={handleTypeChange}>
              <SelectTrigger className='w-36'>
                <SelectValue>{appText.get(appType)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>جميع التطبيقات</SelectItem>
                <SelectItem value='connected'>متصل</SelectItem>
                <SelectItem value='notConnected'>غير متصل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className='w-16'>
              <SelectValue>
                <SlidersHorizontal size={18} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectItem value='asc'>
                <div className='flex items-center gap-4'>
                  <ArrowUpAZ size={16} />
                  <span>تصاعدي</span>
                </div>
              </SelectItem>
              <SelectItem value='desc'>
                <div className='flex items-center gap-4'>
                  <ArrowDownAZ size={16} />
                  <span>تنازلي</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator className='shadow-sm' />
        {isLoading ? (
          <div className='grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-32 w-full' />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <p className='text-muted-foreground text-lg'>
              لا توجد تطبيقات متاحة
            </p>
            <p className='text-muted-foreground text-sm'>
              سيتم إضافة المزيد من التطبيقات قريباً
            </p>
          </div>
        ) : (
          <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3'>
            {filteredApps.map((app) => {
              const translation = getAppTranslation(app.name)
              const isPending = connectApp.isPending || disconnectApp.isPending

              return (
                <li
                  key={app.id}
                  className='rounded-lg border p-4 hover:shadow-md'
                >
                  <div className='mb-8 flex items-center justify-between'>
                    <div
                      className={`bg-muted flex size-10 items-center justify-center rounded-lg p-2`}
                    >
                      {getAppIcon(app.iconName)}
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={isPending}
                      onClick={() => handleToggleConnect(app.id, app.connected)}
                      className={`${app.connected ? 'border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900' : ''}`}
                    >
                      {app.connected ? 'متصل' : 'ربط'}
                    </Button>
                  </div>
                  <div>
                    <h2 className='mb-1 font-semibold'>{translation.name || app.name}</h2>
                    <p className='line-clamp-2 text-gray-500'>
                      {translation.desc || app.desc}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Main>
    </>
  )
}
