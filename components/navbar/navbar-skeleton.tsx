import { Skeleton } from '@/components/ui/skeleton'

/**
 * Static stand-in for `NavbarServer` while its data resolves. Mirrors the
 * real navbar's wrappers (accent bar, padding, 36px row) so there is no
 * layout shift when the navbar streams in.
 */
export function NavbarSkeleton() {
  return (
    <>
      <div className="h-1.5 bg-gradient-to-r from-primary to-primary" />

      <nav className="bg-white shadow-sm px-4 py-4 relative">
        <div className="flex items-center h-9">
          {/* Mobile menu button */}
          <Skeleton className="h-9 w-9 md:hidden" />

          {/* Left nav items (Desktop) */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Centered logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="hidden md:block h-2.5 w-32" />
          </div>

          {/* Right nav items (Desktop) */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
            <Skeleton className="h-5 w-32" />
          </div>

          {/* Spacer for mobile to push avatar right */}
          <div className="flex-1 md:hidden" />

          {/* User menu */}
          <Skeleton className="ml-3 h-9 w-9 rounded-full" />
        </div>
      </nav>
    </>
  )
}
