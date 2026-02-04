import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import {
  Calendar,
  DollarSign,
  Folder,
  Settings2,
  ShieldCheck,
  TentTree,
  Users,
  type LucideIcon,
  ClipboardList,
} from 'lucide-react'
import Link from 'next/link'
import { getLoggedInUser } from '@/services/identity/user'
import { redirect } from 'next/navigation'
import * as Results from '@/lib/results'
import { getFilteredNavData } from '@/lib/admin/navigation'

const iconMap: Record<string, LucideIcon> = {
  TentTree,
  Calendar,
  DollarSign,
  Users,
  Folder,
  Settings2,
  ShieldCheck,
}

export default async function Page() {
  const userResult = await getLoggedInUser()

  if (Results.isErr(userResult) || !userResult.data) {
    redirect('/')
  }

  const { navMain, systemLinks } = getFilteredNavData(userResult.data)
  const allLinks = [...navMain, ...systemLinks]

  return (
    <>
      <AdminBreadcrumbs title="Admin Dashboard" breadcrumbs={[]} />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h1">Welcome to the Admin Dashboard</Typography>
            <Typography variant="muted">
              Manage the DTTD community and weekends
            </Typography>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allLinks.map((link) => {
            const Icon = iconMap[link.icon]
            return (
              <Link key={link.url} href={link.url} className="flex w-full">
                <Card className="hover:bg-muted/50 transition-colors w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {Icon && <Icon className="h-5 w-5" />}
                      {link.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Typography
                      variant="small"
                      className="text-muted-foreground"
                    >
                      {link.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* todo: add this back when we actually have data to show through audit tracking */}
        {/* Recent Activity */}
        {/*<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <Typography variant="small">
                    New candidate application received
                  </Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    Sarah Johnson - 2 hours ago
                  </Typography>
                </div>
                <Badge variant="outline">New</Badge>
              </div>

              <Separator />

              <div className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <Typography variant="small">
                    Weekend roster updated
                  </Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    March 2024 Weekend - 4 hours ago
                  </Typography>
                </div>
                <Badge variant="secondary">Update</Badge>
              </div>

              <Separator />

              <div className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <Typography variant="small">Payment completed</Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    $95.00 - Michael Chen - 6 hours ago
                  </Typography>
                </div>
                <Badge variant="outline">Payment</Badge>
              </div>

              <Separator />

              <div className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <Typography variant="small">User role assigned</Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    Jane Doe granted READ_MEDICAL_HISTORY - 1 day ago
                  </Typography>
                </div>
                <Badge variant="outline">Admin</Badge>
              </div>

              <Separator />

              <div className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <Typography variant="small">File uploaded</Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    weekend-guidelines.pdf - 1 day ago
                  </Typography>
                </div>
                <Badge variant="outline">File</Badge>
              </div>
            </div>
          </CardContent>
        </Card>*/}
      </div>
    </>
  )
}
