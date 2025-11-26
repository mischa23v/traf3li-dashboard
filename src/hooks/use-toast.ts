import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export const toast = (options: ToastOptions) => {
  const message = options.title || options.description || ''
  if (options.variant === 'destructive') {
    return sonnerToast.error(message, {
      description: options.title ? options.description : undefined,
    })
  }
  return sonnerToast.success(message, {
    description: options.title ? options.description : undefined,
  })
}

export const useToast = () => ({ toast })
