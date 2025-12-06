import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import { CandidateStatus } from '@/lib/candidates/types'

interface CandidateTableControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilters: CandidateStatus[]
  onToggleStatus: (status: CandidateStatus) => void
  showArchived: boolean
  onToggleArchived: (show: boolean) => void
  onClearFilters: () => void
}

const STATUS_OPTIONS: { value: CandidateStatus; label: string }[] = [
  { value: 'sponsored', label: 'Sponsored' },
  { value: 'awaiting_forms', label: 'Awaiting Forms' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' },
]

export function CandidateTableControls({
  searchQuery,
  onSearchChange,
  statusFilters,
  onToggleStatus,
  showArchived,
  onToggleArchived,
  onClearFilters,
}: CandidateTableControlsProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilters.length !== 5 || // Default is 5 (all except rejected)
    showArchived

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or sponsor..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-sm text-muted-foreground">Filter by Status:</Label>
          {STATUS_OPTIONS.map((status) => (
            <Badge
              key={status.value}
              variant={statusFilters.includes(status.value) ? 'default' : 'outline'}
              className="cursor-pointer select-none transition-all hover:opacity-80"
              onClick={() => onToggleStatus(status.value)}
            >
              {status.label}
            </Badge>
          ))}
        </div>

        {/* Show Archived Toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-archived"
            checked={showArchived}
            onCheckedChange={(checked) => onToggleArchived(checked === true)}
          />
          <Label htmlFor="show-archived" className="text-sm cursor-pointer">
            Show Archived
          </Label>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
