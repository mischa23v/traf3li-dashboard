import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Filter,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/_authenticated/reconciliation/')({
  component: ReconciliationPage,
})

function ReconciliationPage() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // TODO: Replace with real API data
  const reconciliation = {
    id: 'REC-2025-11',
    month: 'FHAE(1 2025',
    year: 2025,
    bookBalance: 185000,
    bankBalance: 182500,
    difference: 2500,
    reconciliationRate: 87.5,
    status: 'in_progress',
    unmatchedInBooks: [
      {
        id: 'BK-001',
        date: '18 FHAE(1 2025',
        description: '/A9) EF E4'1J 'D1'(-',
        type: 'income',
        amount: 15000,
        status: 'pending',
      },
      {
        id: 'BK-002',
        date: '16 FHAE(1 2025',
        description: '13HE E-CE) - B6J) CASE-001',
        type: 'expense',
        amount: 500,
        status: 'pending',
      },
    ],
    unmatchedInBank: [
      {
        id: 'BANK-001',
        date: '17 FHAE(1 2025',
        description: '*-HJD H'1/',
        type: 'income',
        amount: 28000,
        status: 'unrecorded',
      },
      {
        id: 'BANK-002',
        date: '15 FHAE(1 2025',
        description: '3-( FB/J',
        type: 'expense',
        amount: 1000,
        status: 'unrecorded',
      },
    ],
    matchedTransactions: [
      {
        id: 'M-001',
        date: '14 FHAE(1 2025',
        bookDescription: '/A9) A'*H1) INV-2025-002',
        bankDescription: '*-HJD EF 3'1) 'DE7J1J',
        amount: 28000,
        matchedBy: '#-E/ 'D3'DE',
        matchedDate: '19 FHAE(1 2025',
      },
      {
        id: 'M-002',
        date: '12 FHAE(1 2025',
        bookDescription: '13HE '3*4'1) B'FHFJ)',
        bankDescription: '*-HJD H'1/',
        amount: 5000,
        matchedBy: '#-E/ 'D3'DE',
        matchedDate: '19 FHAE(1 2025',
      },
    ],
    outstandingItems: [
      {
        category: '4JC'* E9DB)',
        count: 2,
        amount: 12000,
      },
      {
        category: 'H/'&9 AJ 'D71JB',
        count: 1,
        amount: 8500,
      },
    ],
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <Badge className='bg-yellow-500'>
            {isRTL ? 'BJ/ 'DE1',9)' : 'In Progress'}
          </Badge>
        )
      case 'completed':
        return (
          <Badge className='bg-green-500'>
            {isRTL ? 'EC*ED)' : 'Completed'}
          </Badge>
        )
      case 'reviewed':
        return (
          <Badge className='bg-blue-500'>
            {isRTL ? '*E* 'DE1',9)' : 'Reviewed'}
          </Badge>
        )
      default:
        return null
    }
  }

  const getTransactionBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant='outline' className='border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20'>
            {isRTL ? 'E9DB)' : 'Pending'}
          </Badge>
        )
      case 'unrecorded':
        return (
          <Badge variant='outline' className='border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20'>
            {isRTL ? ':J1 E3,D)' : 'Unrecorded'}
          </Badge>
        )
      case 'matched':
        return (
          <Badge variant='outline' className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20'>
            {isRTL ? 'E*7'(B)' : 'Matched'}
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className='min-h-screen'>
      {/* Top Header */}
      <div className='border-b bg-background px-6 py-4'>
        <div className='mx-auto flex max-w-[1800px] items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              {isRTL ? 'E7'(B) 'D(FC' : 'Bank Reconciliation'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL ? 'E7'(B) 'D3,D'* E9 C4A -3'( 'D(FC' : 'Reconcile records with bank statements'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              <Upload className='me-2 h-4 w-4' />
              {isRTL ? '*-EJD C4A 'D(FC' : 'Upload Statement'}
            </Button>
            <Button variant='outline'>
              <Download className='me-2 h-4 w-4' />
              {isRTL ? '*5/J1' : 'Export'}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1800px] p-6'>
        {/* Reconciliation Header */}
        <Card className='mb-6 bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='mb-2 text-2xl'>
                  {reconciliation.month}
                </CardTitle>
                <div className='flex items-center gap-3'>
                  {getStatusBadge(reconciliation.status)}
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Calendar className='h-4 w-4' />
                    <span>{isRTL ? '".1 *-/J+:' : 'Last updated:'} 19 FHAE(1 2025</span>
                  </div>
                </div>
              </div>
              <div className='text-end'>
                <div className='mb-2 text-sm text-muted-foreground'>
                  {isRTL ? 'F3() 'DE7'(B)' : 'Reconciliation Rate'}
                </div>
                <div className='text-4xl font-bold'>{reconciliation.reconciliationRate}%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={reconciliation.reconciliationRate} className='h-3' />
          </CardContent>
        </Card>

        {/* Balance Summary */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <Card className='bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900'>
                  <FileText className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <Badge variant='outline'>{isRTL ? ''D/A'*1' : 'Books'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(reconciliation.bookBalance)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? '15J/ 'D/A'*1' : 'Book balance'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                  <DollarSign className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <Badge variant='outline'>{isRTL ? ''D(FC' : 'Bank'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(reconciliation.bankBalance)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? '15J/ 'D(FC' : 'Bank balance'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-yellow-50 to-background dark:from-yellow-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900'>
                  <AlertCircle className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
                </div>
                <Badge className='bg-yellow-500'>{isRTL ? ''DA1B' : 'Difference'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(reconciliation.difference)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? ''DA1B' : 'Variance'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unmatched Transactions */}
        <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Unmatched in Books */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                {isRTL ? 'E9'ED'* :J1 E*7'(B) AJ 'D/A'*1' : 'Unmatched in Books'}
                <Badge variant='outline'>{reconciliation.unmatchedInBooks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {reconciliation.unmatchedInBooks.map((tx) => (
                  <div key={tx.id} className='rounded-lg border p-4'>
                    <div className='mb-2 flex items-start justify-between'>
                      <div>
                        <div className='mb-1 font-semibold'>{tx.description}</div>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span className='font-mono'>{tx.id}</span>
                          <span>"</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>
                      <div className='text-end'>
                        <div className='mb-1 flex items-center gap-1 font-bold'>
                          {tx.type === 'income' ? (
                            <TrendingUp className='h-4 w-4 text-green-600' />
                          ) : (
                            <TrendingDown className='h-4 w-4 text-red-600' />
                          )}
                          {formatCurrency(tx.amount)}
                        </div>
                        {getTransactionBadge(tx.status)}
                      </div>
                    </div>
                    <Button variant='outline' size='sm' className='w-full'>
                      <CheckCircle className='me-2 h-4 w-4' />
                      {isRTL ? 'E7'(B)' : 'Match'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Unmatched in Bank */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                {isRTL ? 'E9'ED'* :J1 E*7'(B) AJ 'D(FC' : 'Unmatched in Bank'}
                <Badge variant='outline'>{reconciliation.unmatchedInBank.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {reconciliation.unmatchedInBank.map((tx) => (
                  <div key={tx.id} className='rounded-lg border p-4'>
                    <div className='mb-2 flex items-start justify-between'>
                      <div>
                        <div className='mb-1 font-semibold'>{tx.description}</div>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span className='font-mono'>{tx.id}</span>
                          <span>"</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>
                      <div className='text-end'>
                        <div className='mb-1 flex items-center gap-1 font-bold'>
                          {tx.type === 'income' ? (
                            <TrendingUp className='h-4 w-4 text-green-600' />
                          ) : (
                            <TrendingDown className='h-4 w-4 text-red-600' />
                          )}
                          {formatCurrency(tx.amount)}
                        </div>
                        {getTransactionBadge(tx.status)}
                      </div>
                    </div>
                    <Button variant='outline' size='sm' className='w-full'>
                      <CheckCircle className='me-2 h-4 w-4' />
                      {isRTL ? '*3,JD' : 'Record'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matched Transactions */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              {isRTL ? 'E9'ED'* E*7'(B)' : 'Matched Transactions'}
              <Badge variant='outline' className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20'>
                {reconciliation.matchedTransactions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='border-b bg-muted/50'>
                  <tr>
                    <th className='px-4 py-3 text-start text-xs font-semibold'>
                      {isRTL ? ''D*'1J.' : 'Date'}
                    </th>
                    <th className='px-4 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'H5A 'D/A'*1' : 'Book Description'}
                    </th>
                    <th className='px-4 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'H5A 'D(FC' : 'Bank Description'}
                    </th>
                    <th className='px-4 py-3 text-center text-xs font-semibold'>
                      {isRTL ? ''DE(D:' : 'Amount'}
                    </th>
                    <th className='px-4 py-3 text-start text-xs font-semibold'>
                      {isRTL ? '*E* 'DE7'(B) (H'37)' : 'Matched By'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliation.matchedTransactions.map((tx) => (
                    <tr key={tx.id} className='border-b hover:bg-muted/50'>
                      <td className='px-4 py-3 text-sm'>{tx.date}</td>
                      <td className='px-4 py-3 text-sm'>{tx.bookDescription}</td>
                      <td className='px-4 py-3 text-sm'>{tx.bankDescription}</td>
                      <td className='px-4 py-3 text-center text-sm font-semibold'>
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className='px-4 py-3 text-sm'>
                        <div>{tx.matchedBy}</div>
                        <div className='text-xs text-muted-foreground'>{tx.matchedDate}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Items */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-yellow-600' />
              {isRTL ? '(FH/ E9DB)' : 'Outstanding Items'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {reconciliation.outstandingItems.map((item, index) => (
                <div key={index} className='rounded-lg border p-4'>
                  <div className='mb-2 flex items-center justify-between'>
                    <div className='font-semibold'>{item.category}</div>
                    <Badge variant='outline'>{item.count}</Badge>
                  </div>
                  <div className='text-2xl font-bold'>{formatCurrency(item.amount)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            {isRTL
              ? `${reconciliation.matchedTransactions.length} E9'ED) E*7'(B) ${reconciliation.unmatchedInBooks.length + reconciliation.unmatchedInBank.length} :J1 E*7'(B)`
              : `${reconciliation.matchedTransactions.length} matched, ${reconciliation.unmatchedInBooks.length + reconciliation.unmatchedInBank.length} unmatched`}
          </div>
          <div className='flex gap-3'>
            <Button variant='outline'>
              {isRTL ? '-A8 CE3H/)' : 'Save Draft'}
            </Button>
            <Button>
              <CheckCircle className='me-2 h-4 w-4' />
              {isRTL ? '%CE'D 'DE7'(B)' : 'Complete Reconciliation'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
