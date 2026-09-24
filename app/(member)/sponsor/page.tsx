import { SponsorForm } from './SponsorForm'
import { PageContent } from '@/components/member/page-content'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'

export default function SponsorPage() {
  return (
    <PageContent size="narrow">
      <MemberBreadcrumbs
        title="Sponsor a candidate"
        breadcrumbs={[{ label: 'Home', href: '/home' }]}
      />
      <SponsorForm />
    </PageContent>
  )
}
