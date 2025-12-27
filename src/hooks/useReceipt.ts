import { useMutation, useQuery } from '@tanstack/react-query'
import financeService from '@/services/financeService'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'

/**
 * Hook for managing payment receipts
 */
export function useReceipt(paymentId: string) {
    // Get receipt data
    const { data: receiptData, isLoading, error } = useQuery({
        queryKey: ['receipt', paymentId],
        queryFn: () => financeService.getReceipt(paymentId),
        enabled: !!paymentId,
    })

    // Generate receipt
    const generateReceiptMutation = useMutation({
        mutationFn: (options?: { language?: 'ar' | 'en' | 'both' }) =>
            financeService.generateReceipt(paymentId, options),
        onSuccess: () => {
            invalidateCache.payments.receipt(paymentId)
            toast.success('تم إنشاء الإيصال بنجاح')
        },
        onError: (error: any) => {
            toast.error(error.message || 'فشل إنشاء الإيصال')
        },
    })

    // Download receipt
    const downloadReceiptMutation = useMutation({
        mutationFn: (language: 'ar' | 'en' = 'ar') =>
            financeService.downloadReceipt(paymentId, language),
        onSuccess: (blob, language) => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `receipt-${paymentId}-${language}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('تم تحميل الإيصال بنجاح')
        },
        onError: (error: any) => {
            toast.error(error.message || 'فشل تحميل الإيصال')
        },
    })

    // Send receipt via email
    const sendReceiptMutation = useMutation({
        mutationFn: (data: {
            email: string
            language?: 'ar' | 'en' | 'both'
            message?: string
        }) => financeService.sendReceipt(paymentId, data),
        onSuccess: () => {
            toast.success('تم إرسال الإيصال بنجاح')
        },
        onError: (error: any) => {
            toast.error(error.message || 'فشل إرسال الإيصال')
        },
    })

    return {
        // Data
        receipt: receiptData?.receipt,
        isLoading,
        error,

        // Actions
        generateReceipt: generateReceiptMutation.mutate,
        downloadReceipt: downloadReceiptMutation.mutate,
        sendReceipt: sendReceiptMutation.mutate,

        // Mutation states
        isGenerating: generateReceiptMutation.isPending,
        isDownloading: downloadReceiptMutation.isPending,
        isSending: sendReceiptMutation.isPending,
    }
}

/**
 * Hook for bulk receipt operations
 */
export function useBulkReceipts() {
    // Send multiple receipts
    const sendBulkReceiptsMutation = useMutation({
        mutationFn: async (data: {
            paymentIds: string[]
            email?: string
            language?: 'ar' | 'en' | 'both'
        }) => {
            const promises = data.paymentIds.map(id =>
                financeService.sendReceipt(id, {
                    email: data.email || '',
                    language: data.language,
                })
            )
            return Promise.all(promises)
        },
        onSuccess: (_, variables) => {
            toast.success(`تم إرسال ${variables.paymentIds.length} إيصال بنجاح`)
            variables.paymentIds.forEach(id => {
                invalidateCache.payments.receipt(id)
            })
        },
        onError: (error: any) => {
            toast.error(error.message || 'فشل إرسال الإيصالات')
        },
    })

    // Download multiple receipts
    const downloadBulkReceiptsMutation = useMutation({
        mutationFn: async (data: {
            paymentIds: string[]
            language?: 'ar' | 'en'
        }) => {
            const promises = data.paymentIds.map(id =>
                financeService.downloadReceipt(id, data.language)
            )
            return Promise.all(promises)
        },
        onSuccess: (blobs, variables) => {
            blobs.forEach((blob, index) => {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `receipt-${variables.paymentIds[index]}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            })
            toast.success(`تم تحميل ${blobs.length} إيصال بنجاح`)
        },
        onError: (error: any) => {
            toast.error(error.message || 'فشل تحميل الإيصالات')
        },
    })

    return {
        sendBulkReceipts: sendBulkReceiptsMutation.mutate,
        downloadBulkReceipts: downloadBulkReceiptsMutation.mutate,
        isSending: sendBulkReceiptsMutation.isPending,
        isDownloading: downloadBulkReceiptsMutation.isPending,
    }
}
