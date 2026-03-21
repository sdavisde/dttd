# Task 1.0 Proofs — DataTable Enhancements

## Code: `onRowClick` prop in DataTableProps

```typescript
// components/ui/data-table/data-table.tsx
interface DataTableProps<TData, TValue> {
  // ...existing props...
  onRowClick?: (row: TData) => void
  columnVisibility?: VisibilityState
  toolbarChildren?: ReactNode
}
```

Desktop `TableRow` applies `cursor-pointer` and `onClick` when `onRowClick` is provided:

```typescript
<TableRow
  key={row.id}
  className={cn(
    index % 2 === 1 ? 'bg-muted/25' : undefined,
    onRowClick && 'cursor-pointer'
  )}
  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
>
```

## Code: `onCardClick` prop in DataTableMobileCard

```typescript
// components/ui/data-table/data-table-mobile-card.tsx
interface DataTableMobileCardProps<TData> {
  row: Row<TData>
  expandedRowId: string | null
  onToggle: (rowId: string) => void
  onCardClick?: (row: TData) => void
}
```

Collapsed card area is clickable when `onCardClick` provided. Chevron remains a separate toggle:

```typescript
<div
  className={cn('min-w-0 flex-1', onCardClick && 'cursor-pointer')}
  onClick={onCardClick ? () => onCardClick(row.original) : undefined}
>
```

## Code: AND-merge column visibility logic

Permission denial can never be overridden by the prop:

```typescript
const permissionVisible = isNil(permission)
  ? true
  : !isNil(user)
    ? userHasPermission(user, [permission])
    : false

const propVisible = columnVisibilityProp?.[colId] ?? true

if (!permissionVisible || !propVisible) {
  visibility[colId] = false
}
```

## CLI: `yarn build` output

```
✓ Compiled successfully in 10.4s
✓ Generating static pages using 7 workers (42/42) in 419.7ms
Done in 29.00s.
```

No new TypeScript errors.
