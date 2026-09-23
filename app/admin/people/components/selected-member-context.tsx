'use client'

import { createContext, useContext } from 'react'

/**
 * The id of the person whose editor is open, published to the table's cell
 * renderers so the matching row can mark itself selected. Using context (rather
 * than rebuilding the column defs) keeps the column array stable, which the
 * DataTable's URL-state machinery depends on.
 */
const SelectedMemberContext = createContext<string | null>(null)

export const SelectedMemberProvider = SelectedMemberContext.Provider

/**
 * Invisible marker rendered inside the selected row. The table container styles
 * the row via `tr:has([data-row-selected])`, which is the only way to tint a
 * single row without per-row class support in the shared DataTable.
 */
export function SelectedRowMarker({ memberId }: { memberId: string }) {
  const selectedId = useContext(SelectedMemberContext)
  if (selectedId !== memberId) return null
  return <span hidden data-row-selected="true" />
}
