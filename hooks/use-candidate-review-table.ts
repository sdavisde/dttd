import { useState, useMemo } from 'react'
import { HydratedCandidate, CandidateStatus } from '@/lib/candidates/types'
import { useTablePagination } from './use-table-pagination'

type SortColumn = 'name' | 'sponsor' | 'submitted' | 'status' | null
type SortDirection = 'asc' | 'desc'

interface UseCandidateReviewTableOptions {
  initialPageSize?: number
  initialPage?: number
}

export function useCandidateReviewTable(
  candidates: HydratedCandidate[],
  options: UseCandidateReviewTableOptions = {}
) {
  const { initialPageSize = 25, initialPage = 1 } = options

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<CandidateStatus[]>([
    'sponsored',
    'awaiting_forms',
    'awaiting_payment',
    'confirmed',
    // Note: 'rejected' is excluded by default (archived)
  ])
  const [showArchived, setShowArchived] = useState(false)

  // Sort state
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Toggle sort column
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction or clear sort
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else {
        setSortColumn(null)
        setSortDirection('asc')
      }
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Toggle status filter
  const toggleStatusFilter = (status: CandidateStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilters([
      'sponsored',
      'awaiting_forms',
      'awaiting_payment',
      'confirmed',
    ])
    setShowArchived(false)
    setSortColumn(null)
    setSortDirection('asc')
  }

  // Filtered and sorted data
  const filteredAndSortedCandidates = useMemo(() => {
    let result = candidates

    // Filter by archived status
    if (!showArchived) {
      result = result.filter((candidate) => candidate.status !== 'rejected')
    }

    // Filter by selected statuses
    result = result.filter((candidate) =>
      statusFilters.includes(candidate.status)
    )

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()

      result = result.filter((candidate) => {
        const candidateName = (
          candidate.candidate_sponsorship_info?.candidate_name ?? ''
        ).toLowerCase()
        const candidateEmail = (
          candidate.candidate_sponsorship_info?.candidate_email ?? ''
        ).toLowerCase()
        const sponsorName = (
          candidate.candidate_sponsorship_info?.sponsor_name ?? ''
        ).toLowerCase()

        return (
          candidateName.includes(query) ||
          candidateEmail.includes(query) ||
          sponsorName.includes(query)
        )
      })
    }

    // Sort data
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let compareValue = 0

        switch (sortColumn) {
          case 'name': {
            const nameA = (
              a.candidate_sponsorship_info?.candidate_name ?? ''
            ).toLowerCase()
            const nameB = (
              b.candidate_sponsorship_info?.candidate_name ?? ''
            ).toLowerCase()
            compareValue = nameA.localeCompare(nameB)
            break
          }
          case 'sponsor': {
            const sponsorA = (
              a.candidate_sponsorship_info?.sponsor_name ?? ''
            ).toLowerCase()
            const sponsorB = (
              b.candidate_sponsorship_info?.sponsor_name ?? ''
            ).toLowerCase()
            compareValue = sponsorA.localeCompare(sponsorB)
            break
          }
          case 'submitted': {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            compareValue = dateA - dateB
            break
          }
          case 'status': {
            compareValue = a.status.localeCompare(b.status)
            break
          }
        }

        return sortDirection === 'asc' ? compareValue : -compareValue
      })
    }

    return result
  }, [
    candidates,
    searchQuery,
    statusFilters,
    showArchived,
    sortColumn,
    sortDirection,
  ])

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
  } = useTablePagination(filteredAndSortedCandidates, {
    initialPageSize,
    initialPage,
  })

  return {
    // Processed data
    paginatedCandidates: paginatedData,
    filteredCandidates: filteredAndSortedCandidates,

    // Search state
    searchQuery,
    setSearchQuery,

    // Filter state
    statusFilters,
    setStatusFilters,
    toggleStatusFilter,
    showArchived,
    setShowArchived,

    // Sort state
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

    // Utilities
    clearFilters,
  }
}
