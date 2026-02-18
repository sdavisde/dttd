import { useState, useMemo, useCallback } from 'react'
import { HydratedCandidate, CandidateStatus } from '@/lib/candidates/types'
import { useClientPagination } from '@/hooks/use-client-pagination'
import { User } from '@/lib/users/types'
import {
  CANDIDATE_COLUMNS,
  getDesktopColumns,
  getMobileColumns,
  CandidateColumnConfig,
} from '../config/columns'

type SortColumn = string | null
type SortDirection = 'asc' | 'desc'

interface UseCandidateListOptions {
  initialPageSize?: number
  initialPage?: number
  /** Current user for permission-based column filtering */
  user?: User | null
}

/**
 * Headless hook for candidate list management.
 * Handles all data operations (filter, search, sort, pagination)
 * without any UI concerns.
 */
export function useCandidateList(
  candidates: HydratedCandidate[],
  options: UseCandidateListOptions = {}
) {
  const { initialPageSize = 25, initialPage = 1, user = null } = options

  // Get permission-filtered columns
  const desktopColumns = useMemo(() => getDesktopColumns(user), [user])
  const mobileColumns = useMemo(() => getMobileColumns(user), [user])

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Sort state
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Toggle sort column
  const handleSort = useCallback(
    (columnId: string) => {
      if (sortColumn === columnId) {
        if (sortDirection === 'asc') {
          setSortDirection('desc')
        } else {
          setSortColumn(null)
          setSortDirection('asc')
        }
      } else {
        setSortColumn(columnId)
        setSortDirection('asc')
      }
    },
    [sortColumn, sortDirection]
  )

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  // Filtered and sorted data
  const filteredAndSortedCandidates = useMemo(() => {
    let result = candidates

    // Only show confirmed candidates (read-only view)
    result = result.filter(
      (candidate) =>
        candidate.status !== 'rejected' && candidate.status !== 'sponsored'
    )

    // Filter by search query (search across multiple fields)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()

      result = result.filter((candidate) => {
        // Search in name
        const candidateName = (
          candidate.candidate_sponsorship_info?.candidate_name ?? ''
        ).toLowerCase()
        const firstName = (
          candidate.candidate_info?.first_name ?? ''
        ).toLowerCase()
        const lastName = (
          candidate.candidate_info?.last_name ?? ''
        ).toLowerCase()

        // Search in email
        const email = (
          candidate.candidate_info?.email ??
          candidate.candidate_sponsorship_info?.candidate_email ??
          ''
        ).toLowerCase()

        // Search in phone
        const phone = (candidate.candidate_info?.phone ?? '').toLowerCase()

        // Search in sponsor name
        const sponsorName = (
          candidate.candidate_sponsorship_info?.sponsor_name ?? ''
        ).toLowerCase()

        // Search in church
        const church = (candidate.candidate_info?.church ?? '').toLowerCase()
        const sponsorChurch = (
          candidate.candidate_sponsorship_info?.sponsor_church ?? ''
        ).toLowerCase()

        return (
          candidateName.includes(query) ||
          firstName.includes(query) ||
          lastName.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          sponsorName.includes(query) ||
          church.includes(query) ||
          sponsorChurch.includes(query)
        )
      })
    }

    // Sort data
    if (sortColumn) {
      const column = CANDIDATE_COLUMNS.find((col) => col.id === sortColumn)
      if (column) {
        result = [...result].sort((a, b) => {
          const valueA = column.accessor(a) ?? ''
          const valueB = column.accessor(b) ?? ''

          // Handle numeric sorting for age
          if (sortColumn === 'age') {
            const numA = parseInt(valueA, 10) || 0
            const numB = parseInt(valueB, 10) || 0
            return sortDirection === 'asc' ? numA - numB : numB - numA
          }

          // String comparison for everything else
          const comparison = String(valueA).localeCompare(String(valueB))
          return sortDirection === 'asc' ? comparison : -comparison
        })
      }
    }

    return result
  }, [candidates, searchQuery, sortColumn, sortDirection])

  // Pagination
  const {
    paginatedData,
    pagination,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
  } = useClientPagination(filteredAndSortedCandidates, {
    initialPageSize,
    initialPage,
  })

  return {
    // Column configuration (filtered by user permissions)
    desktopColumns,
    mobileColumns,

    // Processed data
    candidates: paginatedData,
    totalFiltered: filteredAndSortedCandidates.length,
    totalCandidates: candidates.length,

    // Search
    searchQuery,
    setSearchQuery,
    clearSearch,

    // Sort
    sortColumn,
    sortDirection,
    handleSort,

    // Pagination
    pagination,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,

    // Utility to get cell value for a candidate and column
    getCellValue: (
      candidate: HydratedCandidate,
      column: CandidateColumnConfig
    ) => column.accessor(candidate),
  }
}

export type UseCandidateListReturn = ReturnType<typeof useCandidateList>
