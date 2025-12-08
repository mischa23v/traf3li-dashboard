/**
 * PolicyManager Component
 * UI for managing permission policies in the enterprise permission system
 */

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  usePolicies,
  useCreatePolicy,
  useUpdatePolicy,
  useDeletePolicy,
  useTogglePolicy,
} from '@/hooks/useEnterprisePermissions'
import type {
  PermissionPolicy,
  CreatePolicyData,
  PolicySubject,
  PolicyResource,
  PolicyEffect,
  PolicyPriority,
} from '@/types/permissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldX,
  Search,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ==================== TYPES ====================

interface PolicyManagerProps {
  className?: string
}

// ==================== HELPERS ====================

const priorityColors: Record<PolicyPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const effectColors: Record<PolicyEffect, string> = {
  allow: 'bg-green-100 text-green-800',
  deny: 'bg-red-100 text-red-800',
}

// ==================== COMPONENTS ====================

function PolicyTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

function PolicyRow({
  policy,
  onEdit,
  onDelete,
  onToggle,
}: {
  policy: PermissionPolicy
  onEdit: (policy: PermissionPolicy) => void
  onDelete: (policyId: string) => void
  onToggle: (policyId: string, isEnabled: boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <TableRow className={cn(!policy.isEnabled && 'opacity-50')}>
      <TableCell>
        <div className="flex items-center gap-2">
          {policy.effect === 'allow' ? (
            <ShieldCheck className="h-4 w-4 text-green-600" />
          ) : (
            <ShieldX className="h-4 w-4 text-red-600" />
          )}
          <div>
            <p className="font-medium">{policy.nameAr || policy.name}</p>
            <p className="text-xs text-muted-foreground">{policy.descriptionAr || policy.description}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn(effectColors[policy.effect])}>
          {policy.effect === 'allow' ? t('permissions.allow') : t('permissions.deny')}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn(priorityColors[policy.priority])}>
          {t(`permissions.priority.${policy.priority}`)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <span className="text-muted-foreground">{t('permissions.subjects')}: </span>
          {policy.subjects.length}
        </div>
      </TableCell>
      <TableCell>
        <Switch
          checked={policy.isEnabled}
          onCheckedChange={(checked) => onToggle(policy.id, checked)}
          disabled={policy.isSystem}
        />
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(policy)}>
              <Pencil className="me-2 h-4 w-4" />
              {t('common.edit')}
            </DropdownMenuItem>
            {!policy.isSystem && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(policy.id)}
                  className="text-destructive"
                >
                  <Trash2 className="me-2 h-4 w-4" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function CreatePolicyDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreatePolicyData) => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Partial<CreatePolicyData>>({
    effect: 'allow',
    priority: 'medium',
    subjects: [],
    resources: [],
    actions: [],
    isEnabled: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.nameAr) {
      onSubmit(formData as CreatePolicyData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('permissions.createPolicy')}</DialogTitle>
          <DialogDescription>
            {t('permissions.createPolicyDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('permissions.policyName')}</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Policy name (English)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">{t('permissions.policyNameAr')}</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr || ''}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="اسم السياسة (عربي)"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('permissions.effect')}</Label>
                <Select
                  value={formData.effect}
                  onValueChange={(value: PolicyEffect) => setFormData({ ...formData, effect: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">{t('permissions.allow')}</SelectItem>
                    <SelectItem value="deny">{t('permissions.deny')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('permissions.priority.label')}</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: PolicyPriority) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('permissions.priority.low')}</SelectItem>
                    <SelectItem value="medium">{t('permissions.priority.medium')}</SelectItem>
                    <SelectItem value="high">{t('permissions.priority.high')}</SelectItem>
                    <SelectItem value="critical">{t('permissions.priority.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('permissions.description')}</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Policy description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving') : t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== MAIN COMPONENT ====================

export function PolicyManager({ className }: PolicyManagerProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [effectFilter, setEffectFilter] = useState<'all' | 'allow' | 'deny'>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null)
  const [editingPolicy, setEditingPolicy] = useState<PermissionPolicy | null>(null)

  const { data: policiesData, isLoading } = usePolicies({
    search: searchQuery || undefined,
    effect: effectFilter !== 'all' ? effectFilter : undefined,
  })
  const createPolicy = useCreatePolicy()
  const updatePolicy = useUpdatePolicy()
  const deletePolicy = useDeletePolicy()
  const togglePolicy = useTogglePolicy()

  const policies = policiesData?.policies || []

  const handleCreatePolicy = (data: CreatePolicyData) => {
    createPolicy.mutate(data, {
      onSuccess: () => setCreateDialogOpen(false),
    })
  }

  const handleDeletePolicy = () => {
    if (policyToDelete) {
      deletePolicy.mutate(policyToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setPolicyToDelete(null)
        },
      })
    }
  }

  const handleTogglePolicy = (policyId: string, isEnabled: boolean) => {
    togglePolicy.mutate({ policyId, isEnabled })
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('permissions.policyManager')}
            </CardTitle>
            <CardDescription>{t('permissions.policyManagerDescription')}</CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="me-2 h-4 w-4" />
            {t('permissions.addPolicy')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('permissions.searchPolicies')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select
            value={effectFilter}
            onValueChange={(value: 'all' | 'allow' | 'deny') => setEffectFilter(value)}
          >
            <SelectTrigger className="w-40">
              <Filter className="me-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="allow">{t('permissions.allow')}</SelectItem>
              <SelectItem value="deny">{t('permissions.deny')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <PolicyTableSkeleton />
        ) : policies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>{t('permissions.noPolicies')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('permissions.policy')}</TableHead>
                <TableHead>{t('permissions.effect')}</TableHead>
                <TableHead>{t('permissions.priority.label')}</TableHead>
                <TableHead>{t('permissions.subjects')}</TableHead>
                <TableHead>{t('permissions.enabled')}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <PolicyRow
                  key={policy.id}
                  policy={policy}
                  onEdit={setEditingPolicy}
                  onDelete={(id) => {
                    setPolicyToDelete(id)
                    setDeleteDialogOpen(true)
                  }}
                  onToggle={handleTogglePolicy}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Create Dialog */}
      <CreatePolicyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreatePolicy}
        isLoading={createPolicy.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('permissions.deletePolicy')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('permissions.deletePolicyConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePolicy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default PolicyManager
