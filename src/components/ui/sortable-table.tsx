'use client'

import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Checkbox } from './checkbox'
import { cn } from '@/lib/utils'

export type SortDir = 'asc' | 'desc'
export interface SortState<K extends string> {
  key: K
  dir: SortDir
}

export interface ColumnDef<Row, K extends string = string> {
  key: K
  label: string
  sortable?: boolean
  sortValue?: (row: Row) => string | number | Date | null | undefined
  align?: 'left' | 'right' | 'center'
  className?: string
  width?: string
}

interface SortableTableProps<Row, K extends string> {
  columns: ColumnDef<Row, K>[]
  rows: Row[]
  rowKey: (row: Row) => string
  initialSort?: SortState<K>
  renderCell: (row: Row, columnKey: K) => React.ReactNode
  rowClassName?: (row: Row) => string | undefined
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  onRowClick?: (row: Row) => void
}

// Don't trigger a row click when the user is interacting with a control inside the row
// (checkbox, action buttons, links, menus, open dialogs).
const INTERACTIVE_SELECTOR = 'button, a, input, label, select, textarea, [role="menu"], [role="menuitem"], [role="dialog"]'

export function SortableTable<Row, K extends string>({
  columns,
  rows,
  rowKey,
  initialSort,
  renderCell,
  rowClassName,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onRowClick,
}: SortableTableProps<Row, K>) {
  const [sort, setSort] = useState<SortState<K> | null>(initialSort ?? null)

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (av instanceof Date && bv instanceof Date) return (av.getTime() - bv.getTime()) * dir
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [rows, sort, columns])

  const handleSort = (key: K) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'desc' }
      if (prev.dir === 'desc') return { key, dir: 'asc' }
      return null
    })
  }

  const allIds = useMemo(() => sortedRows.map(rowKey), [sortedRows, rowKey])
  const selectedCount = selectedIds?.size ?? 0
  const allSelected = selectable && selectedCount > 0 && selectedCount === allIds.length
  const someSelected = selectable && selectedCount > 0 && !allSelected

  const toggleAll = () => {
    if (!onSelectionChange) return
    if (allSelected) onSelectionChange(new Set())
    else onSelectionChange(new Set(allIds))
  }

  const toggleRow = (id: string) => {
    if (!onSelectionChange || !selectedIds) return
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {selectable && (
              <th className="w-10 pb-3 pl-1">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => {
              const active = sort?.key === col.key
              const Icon = active ? (sort!.dir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
              const alignClass =
                col.align === 'right' ? 'text-right justify-end'
                : col.align === 'center' ? 'text-center justify-center'
                : 'text-left'
              return (
                <th
                  key={col.key}
                  className={cn(
                    'pb-3 font-medium text-muted-foreground',
                    alignClass.split(' ')[0],
                    col.width,
                  )}
                  aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : col.sortable ? 'none' : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className={cn(
                        'group inline-flex items-center gap-1 rounded -mx-1 px-1 py-0.5 hover:text-foreground transition-colors',
                        alignClass.includes('right') && 'flex-row-reverse',
                        active && 'text-foreground',
                      )}
                    >
                      <span>{col.label}</span>
                      <Icon
                        className={cn(
                          'h-3 w-3 shrink-0 transition-opacity',
                          active ? 'opacity-100' : 'opacity-30 group-hover:opacity-70',
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => {
            const id = rowKey(row)
            const isSelected = selectedIds?.has(id) ?? false
            return (
              <tr
                key={id}
                onClick={onRowClick ? (e) => {
                  if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return
                  onRowClick(row)
                } : undefined}
                className={cn(
                  'border-b border-border last:border-0 hover:bg-muted/50 transition-colors',
                  isSelected && 'bg-primary/5',
                  onRowClick && 'cursor-pointer',
                  rowClassName?.(row),
                )}
              >
                {selectable && (
                  <td className="w-10 py-3 pl-1">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                      aria-label={`Select row ${id}`}
                    />
                  </td>
                )}
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'right' ? 'text-right'
                    : col.align === 'center' ? 'text-center'
                    : 'text-left'
                  return (
                    <td key={col.key} className={cn('py-3', alignClass, col.className)}>
                      {renderCell(row, col.key)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
