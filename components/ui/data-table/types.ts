import { Permission } from '@/lib/security'
import { RowData } from '@tanstack/react-table'

export type DataTableColumnMeta = {
  requiredPermission?: Permission
  filterType?: 'text' | 'select'
  showOnMobile?: boolean
  mobileLabel?: string
  mobilePriority?: 'primary' | 'secondary' | 'detail'
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue>
    extends DataTableColumnMeta {}
}
