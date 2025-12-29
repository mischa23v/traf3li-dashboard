import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, ChevronDown } from 'lucide-react'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const currentLanguage = i18n.language === 'ar' ? 'العربية' : 'English'

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className={`gap-1.5 px-2 ${className || ''}`}>
          <Globe className='h-4 w-4' />
          <span className='text-sm'>{currentLanguage}</span>
          <ChevronDown className='h-3 w-3 opacity-60' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => changeLanguage('ar')}>
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
