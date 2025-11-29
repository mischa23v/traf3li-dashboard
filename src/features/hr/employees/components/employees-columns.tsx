import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import {
  departments,
  employeeStatuses,
  employeeStatusColors,
  departmentColors,
} from '../data/data'
import type { Employee } from '@/types/hr'
import { DataTableRowActions } from './data-table-row-actions'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export const useEmployeesColumns = (): ColumnDef<Employee>[] => {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('dataTable.selectAll')}
          className='translate-y-[2px]'
        />
      ),
      meta: {
        className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('dataTable.selectRow')}
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'employeeId',
      accessorKey: 'employeeId',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('hr.employees.columns.employeeId')}
        />
      ),
      cell: ({ row }) => (
        <div className='font-mono text-sm'>{row.getValue('employeeId')}</div>
      ),
    },
    {
      id: 'fullName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('hr.employees.columns.name')}
        />
      ),
      cell: ({ row }) => {
        const { firstName, lastName, avatar, email } = row.original
        const fullName = `${firstName} ${lastName}`
        const initials =
          `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={avatar} alt={fullName} />
              <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <LongText className='max-w-36 font-medium'>{fullName}</LongText>
              <div className='text-xs text-muted-foreground' dir='ltr'>
                {email}
              </div>
            </div>
          </div>
        )
      },
      meta: {
        className: cn(
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
          'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
        ),
      },
      enableHiding: false,
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('hr.employees.columns.phone')}
        />
      ),
      cell: ({ row }) => (
        <div className='w-fit ps-2 text-nowrap' dir='ltr'>
          {row.getValue('phone') || '-'}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'department',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('hr.employees.columns.department')}
        />
      ),
      cell: ({ row }) => {
        const dept = row.getValue('department') as string
        const department = departments.find((d) => d.value === dept)
        const DeptIcon = department?.icon
        const deptColor = departmentColors.get(dept)

        return (
          <Badge variant='outline' className={cn('font-normal', deptColor)}>
            {DeptIcon && <DeptIcon className='me-1 h-3 w-3' />}
            {isArabic ? department?.label : department?.labelEn}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'position',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('hr.employees.columns.position')}
        />
      ),
      cell: ({ row }) => (
        <div className='text-sm'>{row.getValue('position')}</div>
      ),
    },
    {
      accessorKey: 'hireDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('hr.employees.columns.hireDate')}
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue('hireDate') as string
        if (!date) return '-'
        return (
          <div className='text-sm'>
            {format(new Date(date), 'dd MMM yyyy', {
              locale: isArabic ? ar : enUS,
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('hr.employees.columns.status')}
        />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusInfo = employeeStatuses.find((s) => s.value === status)
        const statusColor = employeeStatusColors.get(status)

        return (
          <Badge variant='outline' className={cn('capitalize', statusColor)}>
            {isArabic ? statusInfo?.label : statusInfo?.labelEn}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]
}
