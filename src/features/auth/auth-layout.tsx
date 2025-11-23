import { Logo } from '@/assets/logo'
import { LanguageSwitcher } from '@/components/language-switcher'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container relative grid h-svh max-w-none items-center justify-center'>
      {/* Language Switcher - Top Right */}
      <div className='absolute top-4 right-4 z-10'>
        <LanguageSwitcher />
      </div>

      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-4 flex items-center justify-center'>
          <Logo className='me-2' />
          <h1 className='text-xl font-medium'>منصة ترافعلي</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
