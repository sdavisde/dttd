import Link from 'next/link'
import { CalendarX } from 'lucide-react'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageContent } from '@/components/member/page-content'

export default function WeekendNotFound() {
  return (
    <PageContent>
      <MemberBreadcrumbs
        title="Weekend not found"
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'The weekends', href: '/weekends' },
        ]}
        shareable={false}
      />
      <div className="flex max-w-md flex-col items-start gap-3 rounded-lg border bg-card p-6">
        <CalendarX className="size-8 text-muted-foreground" aria-hidden />
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          We couldn&rsquo;t find that weekend
        </h1>
        <p className="text-sm text-muted-foreground">
          The link may be old, or the weekend may have been removed.
        </p>
        <Link
          href="/weekends"
          className="text-sm font-semibold text-primary hover:text-primary-hover"
        >
          See all the weekends
        </Link>
      </div>
    </PageContent>
  )
}
