import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

export function ProfileDropdown({ className }: { className?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useDialogState()

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className={cn('relative h-8 w-8 rounded-full', className)}>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/avatars/01.png' alt='@shadcn' />
              <AvatarFallback>SN</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>{t('profile.dropdown.username')}</p>
              <p className='text-muted-foreground text-xs leading-none'>
                {t('profile.dropdown.email')}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                {t('profile.dropdown.profile')}
                <DropdownMenuShortcut>{t('profile.dropdown.profileShortcut')}</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                {t('profile.dropdown.billing')}
                <DropdownMenuShortcut>{t('profile.dropdown.billingShortcut')}</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                {t('profile.dropdown.settings')}
                <DropdownMenuShortcut>{t('profile.dropdown.settingsShortcut')}</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>{t('profile.dropdown.newTeam')}</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            {t('profile.dropdown.signOut')}
            <DropdownMenuShortcut className='text-current'>
              {t('profile.dropdown.signOutShortcut')}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}