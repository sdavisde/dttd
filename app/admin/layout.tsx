import { AdminSidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Typography } from '@/components/ui/typography'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className='w-full min-h-12 bg-primary flex md:grid grid-cols-6 p-2'>
          <span className='col-span-1 ' />
          <span className='col-span-4 flex items-center justify-center'>
            <Typography
              variant='h4'
              className='text-white text-base md:text-center'
            >
              You are editing the Dusty Trails Tres Dias site.
            </Typography>
          </span>
          <span className='col-span-1 flex items-center justify-end'>
            <Button
              variant='link'
              href='/home'
              className='text-white underline hover:text-white/80 cursor-pointer'
            >
              Go to Site
            </Button>
          </span>
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
