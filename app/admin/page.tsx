import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Users,
  FileText,
  Settings,
  CreditCard,
  UserCheck,
  Plus,
  Activity,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  return (
    <>
      <AdminBreadcrumbs title="Admin Dashboard" breadcrumbs={[]} />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h1">Welcome to Admin</Typography>
            <Typography variant="muted">
              Manage the DTTD community and weekend events
            </Typography>
          </div>
        </div>

        {/* Stats Cards */}
        {/*<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Typography
                variant="h2"
                className="text-2xl font-bold border-0 pb-0"
              >
                12
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                <span className="text-green-600">+3</span> from last week
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Weekend
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Typography
                variant="h2"
                className="text-2xl font-bold border-0 pb-0"
              >
                28/42
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                candidates registered
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Reviews
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Typography
                variant="h2"
                className="text-2xl font-bold border-0 pb-0"
              >
                5
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                awaiting approval
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Payments
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Typography
                variant="h2"
                className="text-2xl font-bold border-0 pb-0"
              >
                $2,840
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                this month
              </Typography>
            </CardContent>
          </Card>
        </div>*/}

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/weekends" className="flex w-full">
            <Card className="hover:bg-muted/50 transition-colors w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekend Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Typography variant="small" className="text-muted-foreground">
                  Create and manage weekend events, view rosters, and track
                  capacity.
                </Typography>
                {/*<Badge variant="secondary">2 active</Badge>*/}
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users" className="flex w-full">
            <Card className="hover:bg-muted/50 transition-colors w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Roster &amp; Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Typography variant="small" className="text-muted-foreground">
                  Manage user accounts and assign permissions for admin access.
                </Typography>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/files" className="flex w-full">
            <Card className="hover:bg-muted/50 transition-colors w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Typography variant="small" className="text-muted-foreground">
                  Upload, organize, and manage files for weekends and
                  documentation.
                </Typography>
                {/*<Badge variant="outline">24 recent</Badge>*/}
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/payments" className="flex w-full">
            <Card className="hover:bg-muted/50 transition-colors w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Typography variant="small" className="text-muted-foreground">
                  Monitor payment status and Stripe transaction history.
                </Typography>
                {/*<Badge variant="secondary">$2,840 MTD</Badge>*/}
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings" className="flex w-full">
            <Card className="hover:bg-muted/50 transition-colors w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Typography variant="small" className="text-muted-foreground">
                  Configure system preferences and application settings.
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {/*<Button variant="outline" size="sm">
                  Open Settings
                </Button>*/}
                </div>
              </CardContent>
            </Card>
          </Link>
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
