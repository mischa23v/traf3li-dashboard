import { Link, getRouteApi } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  MessageCircle,
  FileText,
  Briefcase,
  Receipt,
  DollarSign,
  Edit,
  Trash2,
  Lock,
} from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClient } from '@/hooks/useClients'
import { clientStatusColors, contactMethods } from '../data/data'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const route = getRouteApi('/_authenticated/dashboard/clients/$clientId')

export function ClientDetails() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const dateLocale = isArabic ? ar : enUS
  const { clientId } = route.useParams()
  const BackArrow = isArabic ? ArrowRight : ArrowLeft

  const { data, isLoading, isError } = useClient(clientId)

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center gap-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-96 w-full' />
        </Main>
      </>
    )
  }

  if (isError || !data) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center gap-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 flex-col items-center justify-center gap-4'>
          <p className='text-lg text-muted-foreground'>{t('clients.notFound')}</p>
          <Button asChild>
            <Link to='/dashboard/clients'>
              <BackArrow className='me-2 h-4 w-4' />
              {t('clients.backToClients')}
            </Link>
          </Button>
        </Main>
      </>
    )
  }

  const client = data.client
  const { relatedData, summary } = data
  const contactMethod = contactMethods.find(
    (m) => m.value === client.preferredContactMethod
  )
  const ContactIcon = contactMethod?.icon || MessageCircle

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Header */}
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' asChild>
              <Link to='/dashboard/clients'>
                <BackArrow className='h-4 w-4' />
              </Link>
            </Button>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold'>{client.fullName}</h1>
                <Badge
                  variant='outline'
                  className={cn(
                    'capitalize',
                    clientStatusColors.get(client.status)
                  )}
                >
                  {t(`clients.statuses.${client.status}`)}
                </Badge>
              </div>
              <p className='text-muted-foreground'>
                {client.clientId && `#${client.clientId} • `}
                {t('clients.createdAt')}:{' '}
                {format(new Date(client.createdAt), 'PPP', { locale: dateLocale })}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
              <Edit className='me-2 h-4 w-4' />
              {t('common.edit')}
            </Button>
            <Button variant='destructive' size='sm'>
              <Trash2 className='me-2 h-4 w-4' />
              {t('common.delete')}
            </Button>
          </div>
        </div>

        {/* Balance Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('clients.summary.creditBalance')}</CardTitle>
            <CardDescription>{t('clients.summary.balanceDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>{t('clients.summary.creditBalance')}</p>
                <p className={cn('text-2xl font-bold', (client.billing?.creditBalance ?? 0) > 0 ? 'text-green-600' : '')}>
                  {(client.billing?.creditBalance ?? 0).toLocaleString()} {t('common.sar')}
                </p>
              </div>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>{t('clients.summary.totalPaid')}</p>
                <p className='text-2xl font-bold'>
                  {(client.totalPaid ?? 0).toLocaleString()} {t('common.sar')}
                </p>
              </div>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>{t('clients.summary.outstanding')}</p>
                <p className={cn('text-2xl font-bold', (client.totalOutstanding ?? 0) > 0 ? 'text-destructive' : '')}>
                  {(client.totalOutstanding ?? 0).toLocaleString()} {t('common.sar')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('clients.summary.totalCases')}
              </CardTitle>
              <Briefcase className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{summary.totalCases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('clients.summary.totalInvoices')}
              </CardTitle>
              <Receipt className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{summary.totalInvoices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('clients.summary.totalPaid')}
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {summary.totalPaid.toLocaleString()} {t('common.sar')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('clients.summary.outstanding')}
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-destructive'>
                {summary.outstandingBalance.toLocaleString()} {t('common.sar')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue='info' className='w-full'>
          <TabsList>
            <TabsTrigger value='info'>{t('clients.tabs.info')}</TabsTrigger>
            <TabsTrigger value='cases'>{t('clients.tabs.cases')}</TabsTrigger>
            <TabsTrigger value='invoices'>{t('clients.tabs.invoices')}</TabsTrigger>
            <TabsTrigger value='payments'>{t('clients.tabs.payments')}</TabsTrigger>
          </TabsList>

          <TabsContent value='info' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>{t('clients.form.clientInfo')}</CardTitle>
                <CardDescription>{t('clients.viewClientDescription')}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Contact Information */}
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium'>{t('clients.form.contactInfo')}</h4>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div className='flex items-center gap-3'>
                      <Phone className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          {t('clients.form.phone')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
                        </p>
                        <p className='font-medium' dir='ltr'>
                          {client.phone}
                        </p>
                      </div>
                    </div>
                    {client.alternatePhone && (
                      <div className='flex items-center gap-3'>
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='text-sm text-muted-foreground'>
                            {t('clients.form.alternatePhone')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
                          </p>
                          <p className='font-medium' dir='ltr'>
                            {client.alternatePhone}
                          </p>
                        </div>
                      </div>
                    )}
                    {client.email && (
                      <div className='flex items-center gap-3'>
                        <Mail className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='text-sm text-muted-foreground'>
                            {t('clients.form.email')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
                          </p>
                          <p className='font-medium' dir='ltr'>
                            {client.email}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className='flex items-center gap-3'>
                      <ContactIcon className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          {t('clients.form.preferredContactMethod')}
                        </p>
                        <p className='font-medium'>
                          {t(`clients.contactMethods.${client.preferredContactMethod}`)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identity Information */}
                {client.nationalId && (
                  <>
                    <Separator />
                    <div className='space-y-4'>
                      <h4 className='text-sm font-medium'>
                        {t('clients.form.identityInfo')}
                      </h4>
                      <div className='flex items-center gap-3'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='text-sm text-muted-foreground'>
                            {t('clients.form.nationalId')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
                          </p>
                          <p className='font-medium'>{client.nationalId}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Company Information */}
                {(client.companyName || client.companyRegistration) && (
                  <>
                    <Separator />
                    <div className='space-y-4'>
                      <h4 className='text-sm font-medium'>
                        {t('clients.form.companyInfo')}
                      </h4>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        {client.companyName && (
                          <div className='flex items-center gap-3'>
                            <Building2 className='h-4 w-4 text-muted-foreground' />
                            <div>
                              <p className='text-sm text-muted-foreground'>
                                {t('clients.form.companyName')}
                              </p>
                              <p className='font-medium'>{client.companyName}</p>
                            </div>
                          </div>
                        )}
                        {client.companyRegistration && (
                          <div className='flex items-center gap-3'>
                            <FileText className='h-4 w-4 text-muted-foreground' />
                            <div>
                              <p className='text-sm text-muted-foreground'>
                                {t('clients.form.companyRegistration')}
                              </p>
                              <p className='font-medium'>
                                {client.companyRegistration}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Address Information */}
                {(client.city || client.address) && (
                  <>
                    <Separator />
                    <div className='space-y-4'>
                      <h4 className='text-sm font-medium'>
                        {t('clients.form.addressInfo')}
                      </h4>
                      <div className='flex items-center gap-3'>
                        <MapPin className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='text-sm text-muted-foreground'>
                            {t('clients.form.address')}
                          </p>
                          <p className='font-medium'>
                            {[client.address, client.city, client.country]
                              .filter(Boolean)
                              .join('، ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Notes */}
                {client.notes && (
                  <>
                    <Separator />
                    <div className='space-y-4'>
                      <h4 className='text-sm font-medium'>{t('clients.form.notes')}</h4>
                      <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                        {client.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='cases' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>{t('clients.tabs.cases')}</CardTitle>
                <CardDescription>
                  {t('clients.casesDescription', { count: relatedData.cases.length })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedData.cases.length === 0 ? (
                  <p className='text-center text-muted-foreground py-8'>
                    {t('clients.noCases')}
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {relatedData.cases.map((caseItem: any) => (
                      <div
                        key={caseItem._id}
                        className='flex items-center justify-between rounded-lg border p-4'
                      >
                        <div>
                          <p className='font-medium'>{caseItem.title}</p>
                          <p className='text-sm text-muted-foreground'>
                            {caseItem.caseNumber}
                          </p>
                        </div>
                        <Badge>{caseItem.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='invoices' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>{t('clients.tabs.invoices')}</CardTitle>
                <CardDescription>
                  {t('clients.invoicesDescription', {
                    count: relatedData.invoices.length,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedData.invoices.length === 0 ? (
                  <p className='text-center text-muted-foreground py-8'>
                    {t('clients.noInvoices')}
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {relatedData.invoices.map((invoice: any) => (
                      <div
                        key={invoice._id}
                        className='flex items-center justify-between rounded-lg border p-4'
                      >
                        <div>
                          <p className='font-medium'>{invoice.invoiceNumber}</p>
                          <p className='text-sm text-muted-foreground'>
                            {format(new Date(invoice.issueDate), 'PPP', {
                              locale: dateLocale,
                            })}
                          </p>
                        </div>
                        <div className='text-end'>
                          <p className='font-medium'>
                            {invoice.totalAmount.toLocaleString()} {t('common.sar')}
                          </p>
                          <Badge variant='outline'>{invoice.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='payments' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>{t('clients.tabs.payments')}</CardTitle>
                <CardDescription>
                  {t('clients.paymentsDescription', {
                    count: relatedData.payments.length,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedData.payments.length === 0 ? (
                  <p className='text-center text-muted-foreground py-8'>
                    {t('clients.noPayments')}
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {relatedData.payments.map((payment: any) => (
                      <div
                        key={payment._id}
                        className='flex items-center justify-between rounded-lg border p-4'
                      >
                        <div>
                          <p className='font-medium'>
                            {payment.amount.toLocaleString()} {t('common.sar')}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {format(new Date(payment.date), 'PPP', {
                              locale: dateLocale,
                            })}
                          </p>
                        </div>
                        <Badge variant='outline'>{payment.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
