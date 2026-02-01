import { getLoggedInUser } from '@/services/identity/user'
import { AdminSidebar } from '@/components/admin/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Errors } from '@/lib/error'
import * as Results from '@/lib/results'
import { permissionLock, Permission, userHasPermission } from '@/lib/security'
import { getFileFolders } from '@/lib/files'
import { redirect } from 'next/navigation'
import { Footer } from '@/components/footer'
import { getActiveWeekends } from '@/services/weekend'
import { formatWeekendTitle } from '@/lib/weekend'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { User } from '@/lib/users/types'

type AdminLayoutProps = {
  children: React.ReactNode
}

type AdminNavElement = {
  title: string
  url: string
  icon?: string
  isActive?: boolean
  permissions_needed: Permission[]
  items?: Array<{ title: string; url: string }>
}

type SystemLinkElement = {
  title: string
  url: string
  icon: string
  permissions_needed: Permission[]
}

function filterNavByPermission<T extends { permissions_needed: Permission[] }>(
  items: T[],
  user: User
): T[] {
  return items.filter((item) => {
    if (item.permissions_needed.length === 0) return true
    return userHasPermission(user, item.permissions_needed)
  })
}

async function getSidebarData(user: User) {
  // Fetch dynamic file folders for navigation
  const fileFolders = await getFileFolders(true)
  const activeWeekendsResult = await getActiveWeekends()

  const upcomingWeekends = Results.unwrap(
    Results.map(activeWeekendsResult, (activeWeekends) =>
      [activeWeekends.MENS, activeWeekends.WOMENS].filter((it) => it !== null)
    )
  )

  const navMain: AdminNavElement[] = [
    {
      title: 'Weekends',
      url: '/admin/weekends',
      icon: 'TentTree',
      isActive: true,
      permissions_needed: [Permission.READ_WEEKENDS],
    },
    {
      title: 'Events',
      url: '/admin/meetings',
      icon: 'Calendar',
      permissions_needed: [Permission.READ_EVENTS],
    },
    {
      title: 'Payments',
      url: '/admin/payments',
      icon: 'DollarSign',
      permissions_needed: [Permission.READ_PAYMENTS],
    },
    {
      title: 'Master Roster',
      url: '/admin/users',
      icon: 'Users',
      permissions_needed: [],
    },
    {
      title: 'Files',
      url: '/admin/files',
      icon: 'Folder',
      items: fileFolders,
      permissions_needed: [],
    },
  ]

  const systemLinks: SystemLinkElement[] = [
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: 'Settings2',
      permissions_needed: [],
    },
    {
      title: 'Security',
      url: '/admin/roles',
      icon: 'ShieldCheck',
      permissions_needed: [Permission.READ_USER_ROLES],
    },
  ]

  return {
    navMain: filterNavByPermission(navMain, user),
    systemLinks: filterNavByPermission(systemLinks, user),
  }
}
export default async function AdminLayout({ children }: AdminLayoutProps) {
  const userResult = await getLoggedInUser()
  const user = userResult?.data
  try {
    if (Results.isErr(userResult) || !user) {
      throw new Error(Errors.NOT_LOGGED_IN.toString())
    }
    permissionLock([Permission.READ_ADMIN_PORTAL])(user)
  } catch (error: unknown) {
    redirect(`/?error=${(error as Error).message}`)
  }

  const sidebarData = await getSidebarData(user)

  return (
    <SidebarProvider>
      <AdminSidebar data={sidebarData} systemLinks={sidebarData.systemLinks} />
      <SidebarInset>
        <div className="w-full">
          <Link
            href="/home"
            className="w-full min-h-12 bg-primary flex justify-center items-center gap-2 px-4 py-2 text-white hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Site</span>
          </Link>
        </div>
        <main className="w-full min-h-[80vh]">{children}</main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
