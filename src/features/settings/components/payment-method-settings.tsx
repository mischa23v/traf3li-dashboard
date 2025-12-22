/**
 * Payment Method Settings Component
 * Manages saved payment methods with Stripe Elements integration
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Building2,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  usePaymentMethods,
  useSetDefaultPaymentMethod,
  useRemovePaymentMethod,
  useCreateSetupIntent,
  useAddPaymentMethod,
} from '@/hooks/useBilling'

// Note: In production, you would install @stripe/react-stripe-js and @stripe/stripe-js
// For now, we'll create a placeholder component
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
// import { loadStripe } from '@stripe/stripe-js'

export function PaymentMethodSettings() {
  const { t } = useTranslation()
  const [showAddDialog, setShowAddDialog] = useState(false)

  const { data: paymentMethods, isLoading } = usePaymentMethods()
  const setDefaultMutation = useSetDefaultPaymentMethod()
  const removeMutation = useRemovePaymentMethod()

  const handleSetDefault = async (id: string) => {
    await setDefaultMutation.mutateAsync(id)
  }

  const handleRemove = async (id: string) => {
    if (confirm(t('billing.payment.confirmRemove'))) {
      await removeMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <PaymentMethodsSkeleton />
  }

  const defaultMethod = paymentMethods?.find((pm) => pm.isDefault)
  const otherMethods = paymentMethods?.filter((pm) => !pm.isDefault) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('billing.payment.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('billing.payment.description')}</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 me-2" />
          {t('billing.payment.addMethod')}
        </Button>
      </div>

      {paymentMethods && paymentMethods.length === 0 ? (
        <Alert>
          <CreditCard className="h-4 w-4" />
          <AlertDescription>{t('billing.payment.noMethods')}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {/* Default Payment Method */}
          {defaultMethod && (
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {defaultMethod.type === 'card' ? (
                      <CreditCard className="h-4 w-4" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    {t('billing.payment.defaultMethod')}
                  </CardTitle>
                  <Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3" />
                    {t('billing.payment.default')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <PaymentMethodCard
                  method={defaultMethod}
                  onSetDefault={handleSetDefault}
                  onRemove={handleRemove}
                  isDefault
                  isLoading={setDefaultMutation.isPending || removeMutation.isPending}
                />
              </CardContent>
            </Card>
          )}

          {/* Other Payment Methods */}
          {otherMethods.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t('billing.payment.otherMethods')}</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {otherMethods.map((method) => (
                  <Card key={method._id}>
                    <CardContent className="pt-6">
                      <PaymentMethodCard
                        method={method}
                        onSetDefault={handleSetDefault}
                        onRemove={handleRemove}
                        isLoading={setDefaultMutation.isPending || removeMutation.isPending}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Payment Method Dialog */}
      <AddPaymentMethodDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  )
}

interface PaymentMethodCardProps {
  method: any
  onSetDefault: (id: string) => void
  onRemove: (id: string) => void
  isDefault?: boolean
  isLoading?: boolean
}

function PaymentMethodCard({
  method,
  onSetDefault,
  onRemove,
  isDefault,
  isLoading,
}: PaymentMethodCardProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      {/* Card/Bank Details */}
      {method.type === 'card' && method.card && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-12 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded text-white text-xs font-bold">
              {method.card.brand.toUpperCase()}
            </div>
            <div>
              <p className="font-medium">•••• •••• •••• {method.card.last4}</p>
              <p className="text-xs text-muted-foreground">
                {t('billing.payment.expires')}: {method.card.expMonth}/{method.card.expYear}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{method.billingDetails.name}</p>
        </div>
      )}

      {method.type === 'bank_account' && method.bankAccount && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{method.bankAccount.bankName}</p>
              <p className="text-xs text-muted-foreground">
                {method.bankAccount.accountType} •••• {method.bankAccount.last4}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{method.billingDetails.name}</p>
        </div>
      )}

      {/* Actions */}
      {!isDefault && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(method._id)}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading && <Loader2 className="h-3 w-3 me-2 animate-spin" />}
            {t('billing.payment.setDefault')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(method._id)}
            disabled={isLoading}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

interface AddPaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AddPaymentMethodDialog({ open, onOpenChange }: AddPaymentMethodDialogProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const createSetupIntent = useCreateSetupIntent()
  const addPaymentMethod = useAddPaymentMethod()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In production, this would:
      // 1. Create setup intent
      // 2. Use Stripe Elements to collect payment details
      // 3. Confirm the setup intent
      // 4. Save the payment method

      // const { clientSecret } = await createSetupIntent.mutateAsync()
      // const stripe = useStripe()
      // const elements = useElements()
      // const result = await stripe.confirmCardSetup(clientSecret, {
      //   payment_method: {
      //     card: elements.getElement(CardElement),
      //     billing_details: { ... }
      //   }
      // })
      // await addPaymentMethod.mutateAsync({ paymentMethodId: result.setupIntent.payment_method })

      // Placeholder for demo
      alert(t('billing.payment.featureComingSoon'))
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add payment method:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('billing.payment.addMethod')}</DialogTitle>
          <DialogDescription>{t('billing.payment.addMethodDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Placeholder for Stripe CardElement */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground text-center">
              {t('billing.payment.stripeIntegration')}
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {t('billing.payment.stripeIntegrationNote')}
            </p>
            {/* In production, this would be:
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
            */}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('billing.payment.addCard')}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PaymentMethodsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}
