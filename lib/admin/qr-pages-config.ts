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
    label: 'Current Weekend',
    path: '/current-weekend',
    icon: 'TentTree',
  },
  {
    label: 'Secuela Sign In',
    path: '/secuela-signin',
    icon: 'LogIn',
  },
]
