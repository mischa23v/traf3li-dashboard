import React, { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { sidebarData } from './layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'

type NavItemCommandProps = {
  navItem: { url: string; title: string }
  runCommand: (command: () => unknown) => void
  navigate: any
}

function NavItemCommand({ navItem, runCommand, navigate }: NavItemCommandProps) {
  const handleSelect = useCallback(() => {
    runCommand(() => navigate({ to: navItem.url }))
  }, [runCommand, navigate, navItem.url])

  return (
    <CommandItem
      value={navItem.title}
      onSelect={handleSelect}
    >
      <div className='flex size-4 items-center justify-center'>
        <ArrowRight className='text-muted-foreground/80 size-2' aria-hidden='true' />
      </div>
      {navItem.title}
    </CommandItem>
  )
}

type SubItemCommandProps = {
  navTitle: string
  subItem: { url: string; title: string }
  runCommand: (command: () => unknown) => void
  navigate: any
}

function SubItemCommand({ navTitle, subItem, runCommand, navigate }: SubItemCommandProps) {
  const handleSelect = useCallback(() => {
    runCommand(() => navigate({ to: subItem.url }))
  }, [runCommand, navigate, subItem.url])

  return (
    <CommandItem
      value={`${navTitle}-${subItem.url}`}
      onSelect={handleSelect}
    >
      <div className='flex size-4 items-center justify-center'>
        <ArrowRight className='text-muted-foreground/80 size-2' aria-hidden='true' />
      </div>
      {navTitle} <ChevronRight aria-hidden='true' /> {subItem.title}
    </CommandItem>
  )
}

type ThemeCommandItemProps = {
  theme: 'light' | 'dark' | 'system'
  runCommand: (command: () => unknown) => void
  setTheme: (theme: string) => void
}

function ThemeCommandItem({ theme, runCommand, setTheme }: ThemeCommandItemProps) {
  const handleSelect = useCallback(() => {
    runCommand(() => setTheme(theme))
  }, [runCommand, setTheme, theme])

  const icons = {
    light: <Sun aria-hidden='true' />,
    dark: <Moon className='scale-90' aria-hidden='true' />,
    system: <Laptop aria-hidden='true' />
  }

  const labels = {
    light: 'Light',
    dark: 'Dark',
    system: 'System'
  }

  return (
    <CommandItem onSelect={handleSelect}>
      {icons[theme]} <span>{labels[theme]}</span>
    </CommandItem>
  )
}

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>No results found.</CommandEmpty>
          {(sidebarData.navGroups ?? []).map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {(group.items ?? []).map((navItem, i) => {
                if (navItem.url)
                  return (
                    <NavItemCommand
                      key={`${navItem.url}-${i}`}
                      navItem={navItem}
                      runCommand={runCommand}
                      navigate={navigate}
                    />
                  )

                return navItem.items?.map((subItem, i) => (
                  <SubItemCommand
                    key={`${navItem.title}-${subItem.url}-${i}`}
                    navTitle={navItem.title}
                    subItem={subItem}
                    runCommand={runCommand}
                    navigate={navigate}
                  />
                ))
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading='Theme'>
            <ThemeCommandItem theme="light" runCommand={runCommand} setTheme={setTheme} />
            <ThemeCommandItem theme="dark" runCommand={runCommand} setTheme={setTheme} />
            <ThemeCommandItem theme="system" runCommand={runCommand} setTheme={setTheme} />
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
