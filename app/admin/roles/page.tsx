import { permanentRedirect } from 'next/navigation'

/** The roles page became Security. Keep old links and bookmarks working. */
export default function LegacyRolesPage() {
  permanentRedirect('/admin/security')
}
