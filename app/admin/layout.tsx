import { getLoggedInUser } from '@/services/identity/user'
import { AdminSidebar } from '@/components/admin/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Errors } from '@/lib/error'
import * as Results from '@/lib/results'
import { permissionLock, Permission } from '@/lib/security'
import { redirect } from 'next/navigation'
import { Footer } from '@/components/footer'
import { getVisibleNavItems } from '@/lib/admin/navigation'
import { isNil } from 'lodash'

type AdminLayoutProps = {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const userResult = await getLoggedInUser()
  const user = userResult?.data
  try {
    if (Results.isErr(userResult) || isNil(user)) {
      throw new Error(Errors.NOT_LOGGED_IN.toString())
    }
    permissionLock([Permission.READ_ADMIN_PORTAL])(user)
  } catch (error: unknown) {
    redirect(`/?error=${(error as Error).message}`)
  }

  return (
    <SidebarProvider>
      <AdminSidebar items={getVisibleNavItems(user)} />
      <SidebarInset>
        <main className="w-full min-h-[80vh]">{children}</main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
