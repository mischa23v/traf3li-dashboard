import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '../data-table/data-table'
import { DataTableToolbar } from '../data-table/toolbar'
import { DataTableColumnHeader } from '../data-table/column-header'
import { DataTableBulkActions } from '../data-table/bulk-actions'
import { Checkbox } from '../ui/checkbox'
import { Button } from '../ui/button'

// Test data type
type TestData = {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  role: string
}

// Sample test data
const mockData: TestData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', role: 'admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'user' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active', role: 'user' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', status: 'active', role: 'editor' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive', role: 'user' },
]

// Column helper
const columnHelper = createColumnHelper<TestData>()

// Create basic columns
const createColumns = (enableSorting = true, enableSelection = false) => {
  const columns = []

  if (enableSelection) {
    columns.push(
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? 'indeterminate'
                  : false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
      })
    )
  }

  columns.push(
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      enableSorting,
    }),
    columnHelper.accessor('email', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      enableSorting,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      enableSorting: false,
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      enableSorting: false,
    })
  )

  return columns
}

describe('DataTable - Rendering', () => {
  it('should render table with data', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={mockData} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    // Multiple rows have "active" status, so use getAllByText
    expect(screen.getAllByText('active').length).toBeGreaterThan(0)
  })

  it('should render empty state when no data', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={[]} />)

    expect(screen.getByText('dataTable.noResults')).toBeInTheDocument()
  })

  it('should render loading skeleton when isLoading is true', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={mockData} isLoading={true} />)

    // Should show skeleton loading state
    const skeletons = screen.getAllByRole('row')
    // Header row + 5 skeleton rows
    expect(skeletons.length).toBeGreaterThan(1)
  })

  it('should render all columns correctly', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={mockData} />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  it('should render correct number of rows', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={mockData} />)

    const rows = screen.getAllByRole('row')
    // +1 for header row
    expect(rows).toHaveLength(mockData.length + 1)
  })
})

describe('DataTable - Sorting', () => {
  it('should toggle sort direction when clicking column header', async () => {
    const user = userEvent.setup()
    const columns = createColumns(true)
    render(<DataTable columns={columns} data={mockData} />)

    const nameHeader = screen.getByRole('button', { name: /name/i })

    // First click - sort ascending
    await user.click(nameHeader)

    // Get dropdown menu and click Asc option
    await waitFor(() => {
      const ascOption = screen.getByText('Asc')
      expect(ascOption).toBeInTheDocument()
    })

    const ascOption = screen.getByText('Asc')
    await user.click(ascOption)

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      // Alice should be first (alphabetically)
      expect(within(rows[1]).getByText('Alice Williams')).toBeInTheDocument()
    })
  })

  it('should show correct sort indicator', async () => {
    const user = userEvent.setup()
    const columns = createColumns(true)
    render(<DataTable columns={columns} data={mockData} />)

    const nameHeader = screen.getByRole('button', { name: /name/i })

    // Open sort menu
    await user.click(nameHeader)

    // Should show sort options
    await waitFor(() => {
      expect(screen.getByText('Asc')).toBeInTheDocument()
      expect(screen.getByText('Desc')).toBeInTheDocument()
    })
  })
})

describe('DataTable - Filtering', () => {
  it('should render search input in toolbar', () => {
    const columns = createColumns()

    const TestComponent = () => {
      return (
        <DataTable
          columns={columns}
          data={mockData}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchKey="name"
              searchPlaceholder="Search by name..."
            />
          )}
        />
      )
    }

    render(<TestComponent />)

    const searchInput = screen.getByPlaceholderText('Search by name...')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveValue('')
  })

  it('should show reset button when filters are applied', async () => {
    const user = userEvent.setup()
    const columns = createColumns()

    const TestComponent = () => {
      return (
        <DataTable
          columns={columns}
          data={mockData}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchKey="name"
              searchPlaceholder="Search..."
            />
          )}
        />
      )
    }

    render(<TestComponent />)

    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'John')

    // Wait for debounced search and reset button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})

describe('DataTable - Pagination', () => {
  const largeDataSet = Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    status: i % 2 === 0 ? 'active' : 'inactive' as const,
    role: 'user',
  }))

  it('should navigate to next page', async () => {
    const user = userEvent.setup()
    const columns = createColumns()
    render(<DataTable columns={columns} data={largeDataSet} pageSize={10} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('User 11')).toBeInTheDocument()
      expect(screen.queryByText('User 1')).not.toBeInTheDocument()
    })
  })

  it('should navigate to previous page', async () => {
    const user = userEvent.setup()
    const columns = createColumns()
    render(<DataTable columns={columns} data={largeDataSet} pageSize={10} />)

    // Go to next page first
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('User 11')).toBeInTheDocument()
    })

    // Go back to previous page
    const prevButton = screen.getByRole('button', { name: /previous/i })
    await user.click(prevButton)

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.queryByText('User 11')).not.toBeInTheDocument()
    })
  })

  it('should change page size', async () => {
    const user = userEvent.setup()
    const columns = createColumns()
    render(<DataTable columns={columns} data={largeDataSet} pageSize={10} />)

    // Find the page size selector
    const pageSizeSelector = screen.getByRole('combobox')
    await user.click(pageSizeSelector)

    // Select 20 items per page
    const option20 = screen.getByRole('option', { name: '20' })
    await user.click(option20)

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      // Should show 21 rows (20 data rows + 1 header)
      expect(rows.length).toBe(21)
    })
  })

  it('should display correct page information', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={largeDataSet} pageSize={10} />)

    // Should show page 1 of 5 (50 items / 10 per page)
    expect(screen.getByText(/dataTable.pagination.page/)).toBeInTheDocument()
  })

  it('should disable previous button on first page', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={largeDataSet} pageSize={10} />)

    const prevButton = screen.getByRole('button', { name: /previous/i })
    expect(prevButton).toBeDisabled()
  })

  it('should disable next button on last page', async () => {
    const user = userEvent.setup()
    const columns = createColumns()
    render(<DataTable columns={columns} data={largeDataSet} pageSize={10} />)

    // Navigate to last page
    const lastPageButton = screen.getByRole('button', { name: /last/i })
    await user.click(lastPageButton)

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeDisabled()
    })
  })
})

describe('DataTable - Row Selection', () => {
  it('should select individual row', async () => {
    const user = userEvent.setup()
    const columns = createColumns(true, true)
    render(<DataTable columns={columns} data={mockData} />)

    const checkboxes = screen.getAllByRole('checkbox')
    // First checkbox is "select all", second is first row
    const firstRowCheckbox = checkboxes[1]

    await user.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })
  })

  it('should select all rows with select all checkbox', async () => {
    const user = userEvent.setup()
    const columns = createColumns(true, true)
    render(<DataTable columns={columns} data={mockData} />)

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
    await user.click(selectAllCheckbox)

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      // All checkboxes should be checked
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked()
      })
    })
  })

  it('should display bulk actions when rows are selected', async () => {
    const user = userEvent.setup()
    const columns = createColumns(true, true)
    const onDelete = vi.fn()

    const TestComponent = () => {
      return (
        <DataTable
          columns={columns}
          data={mockData}
          toolbar={(table) => (
            <>
              <DataTableBulkActions table={table} entityName="user">
                <Button onClick={onDelete} size="sm">
                  Delete
                </Button>
              </DataTableBulkActions>
              <DataTableToolbar table={table} />
            </>
          )}
        />
      )
    }

    render(<TestComponent />)

    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]

    await user.click(firstRowCheckbox)

    await waitFor(() => {
      expect(screen.getByText('selected')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })
  })

  it('should deselect all rows when clear selection is clicked', async () => {
    const user = userEvent.setup()
    const columns = createColumns(true, true)

    const TestComponent = () => {
      return (
        <DataTable
          columns={columns}
          data={mockData}
          toolbar={(table) => (
            <>
              <DataTableBulkActions table={table} entityName="user">
                <Button size="sm">Delete</Button>
              </DataTableBulkActions>
              <DataTableToolbar table={table} />
            </>
          )}
        />
      )
    }

    render(<TestComponent />)

    // Select first row
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1])

    await waitFor(() => {
      expect(screen.getByText('selected')).toBeInTheDocument()
    })

    // Clear selection
    const clearButton = screen.getByRole('button', { name: /clear selection/i })
    await user.click(clearButton)

    await waitFor(() => {
      expect(screen.queryByText('selected')).not.toBeInTheDocument()
    })
  })
})

describe('DataTable - Accessibility', () => {
  it('should have proper table role', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={mockData} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('should have accessible column headers', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={mockData} />)

    const headers = screen.getAllByRole('columnheader')
    expect(headers.length).toBeGreaterThan(0)
  })

  it('should have aria-label on search input', () => {
    const columns = createColumns()

    const TestComponent = () => {
      return (
        <DataTable
          columns={columns}
          data={mockData}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchPlaceholder="Search users..."
            />
          )}
        />
      )
    }

    render(<TestComponent />)

    const searchInput = screen.getByRole('textbox')
    expect(searchInput).toHaveAttribute('aria-label', 'Search users...')
  })

  it('should support keyboard navigation in bulk actions toolbar', async () => {
    const user = userEvent.setup()
    const columns = createColumns(true, true)

    const TestComponent = () => {
      return (
        <DataTable
          columns={columns}
          data={mockData}
          toolbar={(table) => (
            <>
              <DataTableBulkActions table={table} entityName="user">
                <Button size="sm">Action 1</Button>
                <Button size="sm">Action 2</Button>
              </DataTableBulkActions>
              <DataTableToolbar table={table} />
            </>
          )}
        />
      )
    }

    render(<TestComponent />)

    // Select a row to show bulk actions
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1])

    await waitFor(() => {
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
    })

    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toHaveAttribute('aria-label')
  })

  it('should have proper row selection announcements', async () => {
    const user = userEvent.setup()
    const columns = createColumns(true, true)

    const TestComponent = () => {
      return (
        <DataTable
          columns={columns}
          data={mockData}
          toolbar={(table) => (
            <>
              <DataTableBulkActions table={table} entityName="user">
                <Button size="sm">Delete</Button>
              </DataTableBulkActions>
            </>
          )}
        />
      )
    }

    render(<TestComponent />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1])

    // Should have a live region for announcements
    await waitFor(() => {
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toBeInTheDocument()
    })
  })
})

describe('DataTable - Toolbar', () => {
  it('should render custom toolbar', () => {
    const columns = createColumns()

    const TestComponent = () => {
      return (
        <DataTable
          columns={columns}
          data={mockData}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchPlaceholder="Custom search..."
            />
          )}
        />
      )
    }

    render(<TestComponent />)

    expect(screen.getByPlaceholderText('Custom search...')).toBeInTheDocument()
  })

  it('should hide pagination when showPagination is false', () => {
    const columns = createColumns()
    render(<DataTable columns={columns} data={mockData} showPagination={false} />)

    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
  })
})
