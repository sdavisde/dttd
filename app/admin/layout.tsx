import { getLoggedInUser } from '@/services/identity/user'
import { AdminSidebar } from '@/components/admin/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Errors } from '@/lib/error'
import * as Results from '@/lib/results'
import { permissionLock, Permission } from '@/lib/security'
import { getFileFolders } from '@/lib/files'
import { redirect } from 'next/navigation'
import { Footer } from '@/components/footer'
import { getActiveWeekends } from '@/services/weekend'
import { formatWeekendTitle } from '@/lib/weekend'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type AdminLayoutProps = {
  children: React.ReactNode
}

async function getSidebarData() {
  // Fetch dynamic file folders for navigation
  const fileFolders = await getFileFolders(true)
  const activeWeekendsResult = await getActiveWeekends()

  const upcomingWeekends = Results.unwrap(
    Results.map(activeWeekendsResult, (activeWeekends) =>
      [activeWeekends.MENS, activeWeekends.WOMENS].filter((it) => it !== null)
    )
  )

  return {
    navMain: [
      {
        title: 'Weekends',
        url: '/admin/weekends',
        icon: 'TentTree',
        isActive: true,
      },
      {
        title: 'Events',
        url: '/admin/meetings',
        icon: 'Calendar',
      },
      {
        title: 'Payments',
        url: '/admin/payments',
        icon: 'DollarSign',
      },
      {
        title: 'Master Roster',
        url: '/admin/users',
        icon: 'Users',
      },
      {
        title: 'Files',
        url: '/admin/files',
        icon: 'Folder',
        items: fileFolders,
      },
    ],
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

  const sidebarData = await getSidebarData()

  return (
    <SidebarProvider>
      <AdminSidebar data={sidebarData} />
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
