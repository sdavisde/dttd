import { getBuckets } from '@/lib/files'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { Folder } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function PublicFilesPage() {
  const buckets = await getBuckets()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Typography variant="h3" className="mb-4">
          Community Files
        </Typography>
        <Typography variant="p" className="text-muted-foreground">
          Browse and access files shared with the community.
        </Typography>
      </div>

      {buckets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Typography variant="muted">
              No files or folders are currently available.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {buckets.map((bucket) => (
            <div key={bucket.name} className="space-y-4">
              <Typography variant="h4" className="capitalize">
                {bucket.name}
              </Typography>
              
              {bucket.folders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Typography variant="muted" className="italic">
                      No folders available in {bucket.name}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folder Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bucket.folders.map((folder) => (
                      <TableRow key={folder.slug}>
                        <TableCell>
                          <Link
                            href={`/files/${folder.slug}`}
                            className="flex items-center gap-3 hover:bg-muted/50 transition-colors p-2 -m-2 rounded"
                          >
                            <Folder className="h-5 w-5 text-muted-foreground" />
                            <span className="capitalize font-medium">
                              {folder.name}
                            </span>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}