/**
 * Company Switcher Component
 * Dropdown in header showing current company with multi-select support
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  Check,
  ChevronsUpDown,
  Plus,
  Settings,
  Loader2,
  Building,
  CheckSquare,
  Square,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompanyContext } from '@/contexts/CompanyContext'
import type { Company } from '@/services/companyService'

interface CompanySwitcherProps {
  className?: string
  onManageClick?: () => void
  onAddClick?: () => void
  showManageButton?: boolean
  showAddButton?: boolean
}

export function CompanySwitcher({
  className,
  onManageClick,
  onAddClick,
  showManageButton = true,
  showAddButton = true,
}: CompanySwitcherProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const {
    activeCompany,
    activeCompanyId,
    accessibleCompanies,
    selectedCompanyIds,
    isMultiSelectMode,
    isLoading,
    isSwitching,
    switchCompany,
    toggleMultiSelect,
    selectCompany,
    deselectCompany,
    selectAllCompanies,
    clearSelectedCompanies,
    canManageCompany,
  } = useCompanyContext()

  const [open, setOpen] = React.useState(false)

  // Get company display name
  const getCompanyName = (company: Company) => {
    return isArabic ? company.nameAr || company.name : company.name
  }

  // Get company initials for avatar
  const getCompanyInitials = (company: Company) => {
    const name = getCompanyName(company)
    const words = name.split(' ')
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Handle company switch
  const handleSwitchCompany = async (companyId: string) => {
    if (!isMultiSelectMode) {
      try {
        await switchCompany(companyId)
        setOpen(false)
      } catch (error) {
        console.error('Failed to switch company:', error)
      }
    }
  }

  // Handle multi-select toggle
  const handleToggleCompany = (companyId: string) => {
    if (selectedCompanyIds.includes(companyId)) {
      deselectCompany(companyId)
    } else {
      selectCompany(companyId)
    }
  }

  // Group companies by parent (if needed)
  const rootCompanies = accessibleCompanies.filter((c) => !c.parentCompanyId)
  const childCompanies = accessibleCompanies.filter((c) => c.parentCompanyId)

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="h-10 w-[200px]" />
      </div>
    )
  }

  // No active company
  if (!activeCompany) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button variant="outline" size="sm" disabled>
          <Building2 className="h-4 w-4" />
          {isArabic ? 'لا توجد شركة نشطة' : 'No Active Company'}
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={isArabic ? 'اختر شركة' : 'Select company'}
          className={cn(
            'min-w-[200px] justify-between',
            isSwitching && 'opacity-50 cursor-wait',
            className
          )}
          disabled={isSwitching}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {activeCompany.logo ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={activeCompany.logo} alt={getCompanyName(activeCompany)} />
                <AvatarFallback className="text-xs">
                  {getCompanyInitials(activeCompany)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <span className="truncate font-medium">{getCompanyName(activeCompany)}</span>
            {isMultiSelectMode && selectedCompanyIds.length > 1 && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                +{selectedCompanyIds.length - 1}
              </Badge>
            )}
          </div>
          {isSwitching ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isArabic ? 'end' : 'start'}
        className="w-[300px]"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Multi-select toggle */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{isArabic ? 'الشركات' : 'Companies'}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.preventDefault()
              toggleMultiSelect()
            }}
          >
            {isMultiSelectMode ? (
              <>
                <CheckSquare className="h-3.5 w-3.5" />
                <span className={cn(isArabic ? 'mr-1.5' : 'ml-1.5')}>
                  {isArabic ? 'تحديد متعدد' : 'Multi-select'}
                </span>
              </>
            ) : (
              <>
                <Square className="h-3.5 w-3.5" />
                <span className={cn(isArabic ? 'mr-1.5' : 'ml-1.5')}>
                  {isArabic ? 'تحديد واحد' : 'Single select'}
                </span>
              </>
            )}
          </Button>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Multi-select actions */}
        {isMultiSelectMode && (
          <>
            <div className="flex gap-2 px-2 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={selectAllCompanies}
              >
                {isArabic ? 'تحديد الكل' : 'Select All'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={clearSelectedCompanies}
              >
                {isArabic ? 'إلغاء الكل' : 'Clear All'}
              </Button>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Root companies */}
        {rootCompanies.length > 0 && (
          <>
            {rootCompanies.map((company) => (
              <CompanyMenuItem
                key={company._id}
                company={company}
                isActive={!isMultiSelectMode && activeCompanyId === company._id}
                isSelected={isMultiSelectMode && selectedCompanyIds.includes(company._id)}
                isMultiSelectMode={isMultiSelectMode}
                onClick={() =>
                  isMultiSelectMode
                    ? handleToggleCompany(company._id)
                    : handleSwitchCompany(company._id)
                }
                getCompanyName={getCompanyName}
                getCompanyInitials={getCompanyInitials}
                isArabic={isArabic}
              />
            ))}
          </>
        )}

        {/* Child companies */}
        {childCompanies.length > 0 && (
          <>
            {rootCompanies.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {isArabic ? 'الشركات الفرعية' : 'Child Companies'}
            </DropdownMenuLabel>
            {childCompanies.map((company) => (
              <CompanyMenuItem
                key={company._id}
                company={company}
                isActive={!isMultiSelectMode && activeCompanyId === company._id}
                isSelected={isMultiSelectMode && selectedCompanyIds.includes(company._id)}
                isMultiSelectMode={isMultiSelectMode}
                isChild
                onClick={() =>
                  isMultiSelectMode
                    ? handleToggleCompany(company._id)
                    : handleSwitchCompany(company._id)
                }
                getCompanyName={getCompanyName}
                getCompanyInitials={getCompanyInitials}
                isArabic={isArabic}
              />
            ))}
          </>
        )}

        {/* Actions */}
        <DropdownMenuSeparator />

        {showAddButton && onAddClick && (
          <DropdownMenuItem onClick={onAddClick}>
            <Plus className={cn('h-4 w-4', isArabic ? 'ml-2' : 'mr-2')} />
            {isArabic ? 'إضافة شركة' : 'Add Company'}
          </DropdownMenuItem>
        )}

        {showManageButton && onManageClick && canManageCompany(activeCompanyId!) && (
          <DropdownMenuItem onClick={onManageClick}>
            <Settings className={cn('h-4 w-4', isArabic ? 'ml-2' : 'mr-2')} />
            {isArabic ? 'إدارة الشركات' : 'Manage Companies'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ==================== COMPANY MENU ITEM ====================

interface CompanyMenuItemProps {
  company: Company
  isActive: boolean
  isSelected: boolean
  isMultiSelectMode: boolean
  isChild?: boolean
  onClick: () => void
  getCompanyName: (company: Company) => string
  getCompanyInitials: (company: Company) => string
  isArabic: boolean
}

function CompanyMenuItem({
  company,
  isActive,
  isSelected,
  isMultiSelectMode,
  isChild,
  onClick,
  getCompanyName,
  getCompanyInitials,
  isArabic,
}: CompanyMenuItemProps) {
  if (isMultiSelectMode) {
    return (
      <DropdownMenuCheckboxItem
        checked={isSelected}
        onCheckedChange={onClick}
        className={cn(isChild && (isArabic ? 'pr-8' : 'pl-8'))}
      >
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          {company.logo ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={company.logo} alt={getCompanyName(company)} />
              <AvatarFallback className="text-xs">{getCompanyInitials(company)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Building className="h-3 w-3 text-primary" />
            </div>
          )}
          <span className="truncate">{getCompanyName(company)}</span>
          {company.status !== 'active' && (
            <Badge variant="secondary" className="text-xs capitalize">
              {company.status}
            </Badge>
          )}
        </div>
      </DropdownMenuCheckboxItem>
    )
  }

  return (
    <DropdownMenuItem
      onClick={onClick}
      className={cn('cursor-pointer', isChild && (isArabic ? 'pr-8' : 'pl-8'))}
    >
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        {company.logo ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={company.logo} alt={getCompanyName(company)} />
            <AvatarFallback className="text-xs">{getCompanyInitials(company)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <Building className="h-3 w-3 text-primary" />
          </div>
        )}
        <span className="truncate">{getCompanyName(company)}</span>
        {company.status !== 'active' && (
          <Badge variant="secondary" className="text-xs capitalize">
            {company.status}
          </Badge>
        )}
      </div>
      {isActive && <Check className={cn('h-4 w-4', isArabic ? 'mr-auto' : 'ml-auto')} />}
    </DropdownMenuItem>
  )
}
