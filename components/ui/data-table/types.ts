import type { Permission } from '@/lib/security'
import type { RowData } from '@tanstack/react-table'

export type DataTableColumnMeta = {
  requiredPermission?: Permission
  filterType?: 'text' | 'select'
  showOnMobile?: boolean
  mobileLabel?: string
  mobilePriority?: 'primary' | 'secondary' | 'detail'
  /**
   * Marks a group column (one with child `columns`) as expandable. Collapsed,
   * only the summary child is visible under the group's label; expanded, all
   * children appear under a spanning group header. Toggle state persists via
   * URL state when the table uses useDataTableUrlState.
   */
  expandableGroup?: {
    /** Label shown on the collapsed header and the expanded group band */
    label: string
    /** Child column id that remains visible when the group is collapsed */
    summaryColumnId: string
  }
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue>
    extends DataTableColumnMeta {}
}
