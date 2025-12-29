import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2, ArrowRightLeft, Calendar, DollarSign,
  FileText, Plus, Save, X, AlertCircle, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from './finance-sidebar'
import {
  useCreateInterCompanyTransaction,
  useUpdateInterCompanyTransaction,
  useInterCompanyCompanies,
  useExchangeRate,
} from '@/hooks/useInterCompany'
import { formatCurrency } from '@/lib/utils'

interface InterCompanyTransactionFormProps {
  transactionId?: string
  mode?: 'create' | 'edit'
}

export default function InterCompanyTransactionForm({
  transactionId,
  mode = 'create'
}: InterCompanyTransactionFormProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Form state
  const [sourceFirmId, setSourceFirmId] = useState('')
  const [targetFirmId, setTargetFirmId] = useState('')
  const [transactionType, setTransactionType] = useState<'invoice' | 'payment' | 'expense' | 'transfer'>('invoice')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('SAR')
  const [description, setDescription] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [autoCreateCounterpart, setAutoCreateCounterpart] = useState(true)
  const [notes, setNotes] = useState('')

  // API hooks
  const { data: companies, isLoading: companiesLoading } = useInterCompanyCompanies()
  const createMutation = useCreateInterCompanyTransaction()
  const updateMutation = useUpdateInterCompanyTransaction()

  // Get source and target companies for exchange rate
  const sourceCompany = companies?.find(c => c._id === sourceFirmId)
  const targetCompany = companies?.find(c => c._id === targetFirmId)

  // Fetch exchange rate if currencies differ
  const { data: exchangeRate } = useExchangeRate(
    sourceCompany?.currency || 'SAR',
    targetCompany?.currency || 'SAR',
    transactionDate
  )

  // Calculate equivalent amount in target currency
  const equivalentAmount = exchangeRate && amount
    ? (parseFloat(amount) * exchangeRate).toFixed(2)
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      sourceFirmId,
      targetFirmId,
      transactionType,
      amount: parseFloat(amount),
      currency,
      exchangeRate: exchangeRate || undefined,
      description,
      referenceNumber: referenceNumber || undefined,
      transactionDate,
      dueDate: dueDate || undefined,
      autoCreateCounterpart,
      notes: notes || undefined,
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data)
        navigate({ to: '/finance/inter-company' })
      } else if (transactionId) {
        await updateMutation.mutateAsync({ id: transactionId, data })
        navigate({ to: '/finance/inter-company' })
      }
    } catch (error) {
      console.error('Failed to save transaction:', error)
    }
  }

  const topNav = [
    { title: t('finance.interCompany.nav.finance'), href: '/finance' },
    { title: t('finance.interCompany.nav.interCompany'), href: '/finance/inter-company' },
    {
      title: mode === 'create'
        ? t('finance.interCompany.nav.newTransaction')
        : t('finance.interCompany.nav.editTransaction'),
      isCurrentPage: true
    },
  ]

  const currencies = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'KWD', 'BHD', 'OMR', 'QAR']

  return (
    <>
      <Header>
        <TopNav items={topNav} />
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <FinanceSidebar />

      <Main>
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                {mode === 'create'
                  ? t('finance.interCompany.transaction.newTitle')
                  : t('finance.interCompany.transaction.editTitle')
                }
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('finance.interCompany.transaction.subtitle')
                }
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Companies Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t('finance.interCompany.transaction.companies')}
                  </CardTitle>
                  <CardDescription>
                    {t('finance.interCompany.transaction.companiesDesc')
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source Company */}
                    <div className="space-y-2">
                      <Label htmlFor="sourceCompany">
                        {t('finance.interCompany.transaction.sourceCompany')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={sourceFirmId} onValueChange={setSourceFirmId} required>
                        <SelectTrigger id="sourceCompany">
                          <SelectValue placeholder={t('finance.interCompany.transaction.selectCompany')} />
                        </SelectTrigger>
                        <SelectContent>
                          {companies?.map((company) => (
                            <SelectItem key={company._id} value={company._id}>
                              <div className="flex items-center gap-2">
                                <span>{isArabic ? company.nameAr : company.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {company.currency}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sourceCompany && (
                        <p className="text-sm text-muted-foreground">
                          {t('finance.interCompany.transaction.currency') + ':'} {sourceCompany.currency}
                        </p>
                      )}
                    </div>

                    {/* Target Company */}
                    <div className="space-y-2">
                      <Label htmlFor="targetCompany">
                        {t('finance.interCompany.transaction.targetCompany')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={targetFirmId} onValueChange={setTargetFirmId} required>
                        <SelectTrigger id="targetCompany">
                          <SelectValue placeholder={t('finance.interCompany.transaction.selectCompany')} />
                        </SelectTrigger>
                        <SelectContent>
                          {companies
                            ?.filter(c => c._id !== sourceFirmId)
                            .map((company) => (
                              <SelectItem key={company._id} value={company._id}>
                                <div className="flex items-center gap-2">
                                  <span>{isArabic ? company.nameAr : company.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {company.currency}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {targetCompany && (
                        <p className="text-sm text-muted-foreground">
                          {t('finance.interCompany.transaction.currency') + ':'} {targetCompany.currency}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Exchange Rate Info */}
                  {sourceCompany && targetCompany && sourceCompany.currency !== targetCompany.currency && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {t('finance.interCompany.transaction.multiCurrency')}
                          </p>
                          <p className="text-sm">
                            {t('finance.interCompany.transaction.exchangeRate') + ':'} {exchangeRate || '...'} {' '}
                            ({sourceCompany.currency} → {targetCompany.currency})
                          </p>
                          {equivalentAmount && (
                            <p className="text-sm">
                              {t('finance.interCompany.transaction.equivalentAmount') + ':'}{' '}
                              {formatCurrency(parseFloat(equivalentAmount), targetCompany.currency)}
                            </p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('finance.interCompany.transaction.transactionDetails')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transaction Type */}
                  <div className="space-y-2">
                    <Label htmlFor="transactionType">
                      {t('finance.interCompany.transaction.transactionType')}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select value={transactionType} onValueChange={(v: any) => setTransactionType(v)} required>
                      <SelectTrigger id="transactionType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice">
                          {t('finance.interCompany.transaction.invoice')}
                        </SelectItem>
                        <SelectItem value="payment">
                          {t('finance.interCompany.transaction.payment')}
                        </SelectItem>
                        <SelectItem value="expense">
                          {t('finance.interCompany.transaction.expense')}
                        </SelectItem>
                        <SelectItem value="transfer">
                          {t('finance.interCompany.transaction.transfer')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        {t('finance.interCompany.transaction.amount')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {/* Currency */}
                    <div className="space-y-2">
                      <Label htmlFor="currency">
                        {t('finance.interCompany.transaction.currency')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={currency} onValueChange={setCurrency} required>
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((curr) => (
                            <SelectItem key={curr} value={curr}>
                              {curr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t('finance.interCompany.transaction.description')}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('finance.interCompany.transaction.transactionDesc')}
                      required
                    />
                  </div>

                  {/* Reference Number */}
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">
                      {t('finance.interCompany.transaction.referenceNumber')}
                    </Label>
                    <Input
                      id="referenceNumber"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder={t('finance.interCompany.transaction.optionalReference')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Transaction Date */}
                    <div className="space-y-2">
                      <Label htmlFor="transactionDate">
                        {t('finance.interCompany.transaction.transactionDate')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="transactionDate"
                        type="date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        required
                      />
                    </div>

                    {/* Due Date */}
                    {(transactionType === 'invoice' || transactionType === 'payment') && (
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">
                          {t('finance.interCompany.transaction.dueDate')}
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          min={transactionDate}
                        />
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {t('finance.interCompany.transaction.notes')}
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('finance.interCompany.transaction.additionalNotes')}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Auto-create Counterpart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    {t('finance.interCompany.transaction.autoCreate')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autoCreate">
                        {t('finance.interCompany.transaction.autoCreateCounterpart')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('finance.interCompany.transaction.autoCreateDesc')
                        }
                      </p>
                    </div>
                    <Switch
                      id="autoCreate"
                      checked={autoCreateCounterpart}
                      onCheckedChange={setAutoCreateCounterpart}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/finance/inter-company' })}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('finance.interCompany.transaction.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create'
                    ? t('finance.interCompany.transaction.createTransaction')
                    : t('finance.interCompany.transaction.saveChanges')
                  }
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Main>
    </>
  )
}
