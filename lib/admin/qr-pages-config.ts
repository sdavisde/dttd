/**
 * Curated list of public pages available for QR code generation.
 * Each entry provides a human-readable name, path, and Lucide icon name.
 */
export type QrPage = {
  label: string
  path: string
  icon: string
}

export const qrPages: QrPage[] = [
  {
    label: 'Sponsor a Candidate',
    path: '/sponsor',
    icon: 'Heart',
  },
  {
    label: 'Candidate List',
    path: '/candidate-list',
    icon: 'ClipboardList',
  },
  {
    label: 'Review Candidates',
    path: '/review-candidates',
    icon: 'UserCheck',
  },
  {
    label: 'Community Roster',
    path: '/roster',
    icon: 'Users',
  },
  {
    label: 'Current Weekend',
    path: '/current-weekend',
    icon: 'TentTree',
  },
  {
    label: 'Team Forms',
    path: '/team-forms',
    icon: 'FileText',
  },
  {
    label: 'Camp Waiver',
    path: '/team-forms/camp-waiver',
    icon: 'FileSignature',
  },
  {
    label: 'Commitment Form',
    path: '/team-forms/commitment-form',
    icon: 'FilePen',
  },
  {
    label: 'Statement of Belief',
    path: '/team-forms/statement-of-belief',
    icon: 'BookOpen',
  },
  {
    label: 'Release of Claim',
    path: '/team-forms/release-of-claim',
    icon: 'FileCheck',
  },
  {
    label: 'Team Info Sheet',
    path: '/team-forms/info-sheet',
    icon: 'ClipboardPen',
  },
  {
    label: 'Team Fee Payment',
    path: '/payment/team-fee',
    icon: 'DollarSign',
  },
  {
    label: 'Candidate Fee Payment',
    path: '/payment/candidate-fee',
    icon: 'CreditCard',
  },
  {
    label: 'Files',
    path: '/files',
    icon: 'Folder',
  },
  {
    label: 'Secuela Sign In',
    path: '/secuela-signin',
    icon: 'LogIn',
  },
]
