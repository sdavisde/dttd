import { getLoggedInUser } from '@/actions/users'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Typography } from '@/components/ui/typography'
import { Errors } from '@/lib/error'
import { isErr } from '@/lib/results'
import { permissionLock } from '@/lib/security'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { redirect } from 'next/navigation'
import { slugify } from '@/util/url'
import { Footer } from '@/components/footer'

type AdminLayoutProps = {
  children: React.ReactNode
}

async function getFileFolders() {
  try {
    const supabase = await createClient()
    const { data: items, error } = await supabase.storage.from('files').list('')

    if (error) {
      logger.error('Error fetching root folders:', error)
      return []
    }

    return items
      .filter((item) => item.metadata === null) // folders have null metadata
      .map((folder) => ({
        title:
          folder.name.charAt(0).toUpperCase() +
          folder.name.slice(1).replace(/-/g, ' '),
        url: `/admin/files/${slugify(folder.name)}`,
      }))
      .sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    logger.error('Error in getFileFolders:', error)
    return []
  }
}

function getSidebarData(fileFolders: Array<{ title: string; url: string }>) {
  return {
    navMain: [
      {
        title: 'Weekends',
        url: '/admin/weekends',
        icon: 'SquareTerminal',
        isActive: true,
        items: [
          {
            title: 'Upcoming Weekend',
            url: '/admin/weekends/upcoming',
          },
          {
            title: 'Meetings',
            url: '/admin/weekends/meetings',
          },
          {
            title: 'Create Weekend',
            url: '/admin/weekends/create',
          },
        ],
      },
      {
        title: 'Community',
        url: '/admin/users',
        icon: 'Bot',
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
    if (isErr(userResult) || !user) {
      throw new Error(Errors.NOT_LOGGED_IN.toString())
    }
    permissionLock(['ADMIN'])(user)
  } catch (error: unknown) {
    console.log(error)
    redirect(`/?error=${(error as Error).message}`)
  }

  // Fetch dynamic file folders for navigation
  const fileFolders = await getFileFolders()
  const sidebarData = getSidebarData(fileFolders)

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
        {children}
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
