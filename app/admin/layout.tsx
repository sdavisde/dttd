import { getLoggedInUser } from '@/actions/users'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Typography } from '@/components/ui/typography'
import { Errors } from '@/lib/error'
import * as Results from '@/lib/results'
import { permissionLock, Permission } from '@/lib/security'
import { getFileFolders } from '@/lib/files'
import { redirect } from 'next/navigation'
import { Footer } from '@/components/footer'
import { getActiveWeekends } from '@/actions/weekend'

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
        icon: 'SquareTerminal',
        isActive: true,
        items: [
          ...upcomingWeekends.map((it) => ({
            title: it.title ?? '-',
            url: `/admin/weekends/${it.id}`,
          })),
          // {
          //   title: 'Create Weekend',
          //   url: '/admin/weekends/create',
          // },
        ],
      },
      {
        title: 'Meetings',
        url: '/admin/meetings',
        icon: 'Calendar',
      },
      {
        title: 'Master Roster',
        url: '/admin/users',
        icon: 'Users',
      },
      {
        title: 'Files',
        url: '/admin/files',
        icon: 'BookOpen',
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
    permissionLock([Permission.ADMIN])(user)
  } catch (error: unknown) {
    redirect(`/?error=${(error as Error).message}`)
  }

  const sidebarData = await getSidebarData()

  return (
    <SidebarProvider>
      <AdminSidebar data={sidebarData} />
      <SidebarInset>
        <div className="w-full min-h-12 bg-primary flex md:grid grid-cols-6 p-2">
          <span className="col-span-1 " />
          <span className="col-span-4 flex items-center justify-center">
            <Typography
              variant="h4"
              className="text-white text-base md:text-center"
            >
              You are editing the Dusty Trails Tres Dias site.
            </Typography>
          </span>
          <span className="col-span-1 flex items-center justify-end">
            <Button
              variant="link"
              href="/home"
              className="text-white underline hover:text-white/80 cursor-pointer"
            >
              Go to Site
            </Button>
          </span>
        </div>
        <main className="w-full min-h-[80vh]">{children}</main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
