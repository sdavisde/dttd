import { Tables } from '@/lib/supabase/database.types'
import { getUrl } from '@/lib/url'

interface CandidateFormsEmailPreviewProps {
  candidateSponsorshipInfo: Tables<'candidate_sponsorship_info'>
}

export function CandidateFormsEmailPreview({
  candidateSponsorshipInfo,
}: CandidateFormsEmailPreviewProps) {
  return (
    <div className="bg-white font-sans">
      <div className="mx-auto py-8 px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dusty Trails Tres Dias
          </h1>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Main Content */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome {candidateSponsorshipInfo.candidate_name}!
          </h2>

          <p className="text-gray-700 mb-4">
            We are excited that you will be joining us for an upcoming Tres Dias
            weekend! To help prepare for your weekend, there are some important
            forms we need you to complete.
          </p>

          <p className="text-gray-700 mb-4">
            Please click the button below to access and complete your candidate
            forms. These forms help us ensure we can provide the best possible
            experience for you during your weekend.
          </p>

          <div className="text-center mb-8">
            <a
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium no-underline"
              href={getUrl(
                `/candidate/${candidateSponsorshipInfo.candidate_id}/forms`
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Complete Your Forms
            </a>
          </div>

          <p className="text-gray-700 mb-4">
            If you have any questions about the forms or the upcoming weekend,
            please don&apos;t hesitate to reach out to your sponsor or contact
            us directly.
          </p>

          <p className="text-gray-700 italic">
            Note: Please complete these forms as soon as possible to help us
            with weekend planning.
          </p>
        </div>

        <hr className="border-gray-200 mb-8" />

        <div className="text-center text-gray-600 text-sm">
          <p>Dusty Trails Tres Dias</p>
          <p>De Colores!</p>
        </div>
      </div>
    </div>
  )
}
