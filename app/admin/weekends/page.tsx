import { getAllWeekends } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import Link from 'next/link'

export default async function WeekendsPage() {
  const weekendsResult = await getAllWeekends()

  if (isErr(weekendsResult)) {
    throw new Error(`Failed to fetch weekends: ${weekendsResult.error.message}`)
  }

  const weekends = weekendsResult.data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <AdminBreadcrumbs
        title="Weekends"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8 py-2 md:py-4">
        <Typography variant="muted" className="mb-4">
          Manage weekend events and their details.
        </Typography>

        <div className="relative">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold min-w-[200px]">
                    Weekend
                  </TableHead>
                  <TableHead className="min-w-[80px]">Number</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[150px]">Start Date</TableHead>
                  <TableHead className="min-w-[150px]">End Date</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekends.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No weekends found.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  weekends.map((weekend, index) => (
                    <TableRow
                      key={weekend.id}
                      className={`hover:bg-muted/50 ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
                    >
                      <TableCell className="font-medium">
                        <Link 
                          href={`/admin/weekends/${weekend.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {weekend.title ||
                            `${weekend.type} Weekend #${weekend.number}`}
                        </Link>
                      </TableCell>
                      <TableCell>{weekend.number}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            weekend.type === 'MENS' ? 'default' : 'secondary'
                          }
                        >
                          {weekend.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(weekend.start_date)}</TableCell>
                      <TableCell>{formatDate(weekend.end_date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            weekend.status === 'ACTIVE'
                              ? 'default'
                              : weekend.status === 'PLANNING'
                                ? 'outline'
                                : 'secondary'
                          }
                        >
                          {weekend.status || 'UNKNOWN'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  )
}
