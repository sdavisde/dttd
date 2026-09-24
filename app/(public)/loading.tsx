import { Loader2 } from 'lucide-react'

/** Public segment fallback: the bare header persists, the page streams in. */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}
