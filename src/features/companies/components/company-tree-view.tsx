/**
 * Company Tree View Component
 * Hierarchical view of parent-child companies with expand/collapse
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Building,
  Loader2,
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
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCompanyTree } from '@/hooks/useCompanies'
import type { CompanyTreeNode } from '@/services/companyService'

interface CompanyTreeViewProps {
  rootFirmId?: string
  onEdit?: (firmId: string) => void
  onDelete?: (firmId: string) => void
  onAddChild?: (parentId: string) => void
  className?: string
  canEdit?: boolean
  canDelete?: boolean
  canAddChild?: boolean
}

export function CompanyTreeView({
  rootFirmId,
  onEdit,
  onDelete,
  onAddChild,
  className,
  canEdit = true,
  canDelete = true,
  canAddChild = true,
}: CompanyTreeViewProps) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { data: treeData, isLoading, error } = useCompanyTree(rootFirmId)

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('companies.treeView.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('companies.treeView.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {t('companies.treeView.failedToLoad')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!treeData || treeData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('companies.treeView.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {t('companies.treeView.noCompanies')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('companies.treeView.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {treeData.map((node) => (
            <CompanyTreeNode
              key={node._id}
              node={node}
              level={0}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              canEdit={canEdit}
              canDelete={canDelete}
              canAddChild={canAddChild}
              isArabic={isArabic}
              t={t}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== TREE NODE ====================

interface CompanyTreeNodeProps {
  node: CompanyTreeNode
  level: number
  onEdit?: (firmId: string) => void
  onDelete?: (firmId: string) => void
  onAddChild?: (parentId: string) => void
  canEdit: boolean
  canDelete: boolean
  canAddChild: boolean
  isArabic: boolean
  t: (key: string) => string
}

function CompanyTreeNode({
  node,
  level,
  onEdit,
  onDelete,
  onAddChild,
  canEdit,
  canDelete,
  canAddChild,
  isArabic,
  t,
}: CompanyTreeNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)

  const hasChildren = node.children && node.children.length > 0
  const indent = level * 24 // 24px per level

  const getCompanyName = (company: CompanyTreeNode) => {
    return isArabic ? company.nameAr || company.name : company.name
  }

  const getCompanyInitials = (company: CompanyTreeNode) => {
    const name = getCompanyName(company)
    const words = name.split(' ')
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div>
      {/* Node */}
      <div
        className={cn(
          'group flex items-center gap-2 rounded-md p-2 hover:bg-accent transition-colors',
          isArabic ? 'pr-2' : 'pl-2'
        )}
        style={{
          [isArabic ? 'paddingRight' : 'paddingLeft']: `${indent + 8}px`,
        }}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-6 w-6 p-0',
            !hasChildren && 'invisible'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className={cn('h-4 w-4', isArabic && 'rotate-180')} />
          )}
        </Button>

        {/* Company Avatar */}
        {node.logo ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={node.logo} alt={getCompanyName(node)} />
            <AvatarFallback className="text-xs">{getCompanyInitials(node)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Building className="h-4 w-4 text-primary" />
          </div>
        )}

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{getCompanyName(node)}</p>
            {node.status !== 'active' && (
              <Badge variant="secondary" className="text-xs capitalize shrink-0">
                {node.status}
              </Badge>
            )}
          </div>
          {node.code && (
            <p className="text-xs text-muted-foreground">{node.code}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {node.userCount !== undefined && (
            <span>
              {node.userCount} {t('companies.treeView.users')}
            </span>
          )}
          {hasChildren && (
            <span>
              {node.children.length} {t('companies.treeView.children')}
            </span>
          )}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{t('companies.treeView.actions')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isArabic ? 'start' : 'end'} dir={isArabic ? 'rtl' : 'ltr'}>
            <DropdownMenuLabel>{t('companies.treeView.actions')}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {canEdit && onEdit && (
              <DropdownMenuItem onClick={() => onEdit(node._id)}>
                <Edit className={cn('h-4 w-4', isArabic ? 'ml-2' : 'mr-2')} />
                {t('companies.treeView.edit')}
              </DropdownMenuItem>
            )}

            {canAddChild && onAddChild && (
              <DropdownMenuItem onClick={() => onAddChild(node._id)}>
                <Plus className={cn('h-4 w-4', isArabic ? 'ml-2' : 'mr-2')} />
                {t('companies.treeView.addChild')}
              </DropdownMenuItem>
            )}

            {canDelete && onDelete && !hasChildren && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(node._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className={cn('h-4 w-4', isArabic ? 'ml-2' : 'mr-2')} />
                  {t('companies.treeView.delete')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <CompanyTreeNode
              key={child._id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              canEdit={canEdit}
              canDelete={canDelete}
              canAddChild={canAddChild}
              isArabic={isArabic}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}
