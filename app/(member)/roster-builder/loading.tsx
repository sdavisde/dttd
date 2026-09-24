import { Skeleton } from '@/components/ui/skeleton'

/** Slot counts per placeholder column, varied so the board reads as real. */
const COLUMN_SLOTS = [4, 6, 3, 5, 4]

/**
 * The roster builder is a full-bleed kanban board rather than a PageContent
 * page, so it gets its own fallback: title bar with stats, sticky toolbar,
 * then the role columns — side by side from md up, stacked and collapsed on
 * phones, like the real board.
 */
export default function RosterBuilderLoading() {
  return (
    <div className="flex min-w-0 flex-col">
      {/* Page header */}
      <header className="border-b bg-card px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex shrink-0 items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-7 w-60 max-w-full" />
          </div>
          <div className="flex items-center gap-5 sm:ml-auto">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-1.5 w-20 rounded-full" />
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-14 z-20 border-b bg-background/95 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-3">
          <Skeleton className="h-11 w-full sm:w-auto sm:min-w-[200px] sm:max-w-[300px] sm:flex-1 md:h-9" />
          <Skeleton className="h-11 w-44 md:h-9" />
          <Skeleton className="h-11 w-48 md:h-9" />
        </div>
      </div>

      {/* Kanban board */}
      <div className="min-w-0 flex-1 overflow-hidden px-4 py-5 md:px-6">
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex flex-col gap-3 overflow-hidden pb-6 md:flex-row md:gap-5">
            {COLUMN_SLOTS.map((slots, column) => (
              <div
                key={column}
                className="flex w-full flex-col rounded-md border bg-card md:w-72 md:shrink-0"
              >
                <div className="flex min-h-11 items-center justify-between gap-2 px-4 py-3 md:border-b">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
                <div className="hidden md:block">
                  <div className="flex flex-col gap-2 px-3 pt-3 pb-6">
                    {Array.from({ length: slots }, (_, slot) => (
                      <div
                        key={slot}
                        className="space-y-2.5 rounded-md border p-4"
                      >
                        <Skeleton className="h-3 w-24" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-7 w-7 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center border-t px-3 py-2">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
