import type { ColumnFiltersState } from '@tanstack/react-table'
import { isEmpty, isNil } from 'lodash'
import type { ParamRecord } from './use-object-query-param'

/** Convert a ParamRecord (from useObjectQueryParam) into TanStack ColumnFiltersState. */
export function recordToFilters(record: ParamRecord): ColumnFiltersState {
  return Object.entries(record).map(([id, value]) => ({
    id,
    value: toFilterValue(value),
  }))
}

/** Convert TanStack ColumnFiltersState into a ParamRecord (for useObjectQueryParam). */
export function filtersToRecord(filters: ColumnFiltersState): ParamRecord {
  const record: ParamRecord = {}
  for (const filter of filters) {
    const val = filter.value
    if (Array.isArray(val) && val.length > 0) {
      record[filter.id] = val
    } else if (typeof val === 'string' && val) {
      record[filter.id] = val
    }
  }
  return record
}

function toFilterValue(value: string | string[]): string[] {
  if (Array.isArray(value)) return value
  if (isNil(value) || isEmpty(value)) return []
  return value.split(',')
}
