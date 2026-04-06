import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { QrCodeGenerator } from '@/app/admin/qr-codes/qr-code-generator'

export default function Page() {
  return (
    <>
      <AdminBreadcrumbs
        title="QR Codes"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-4 sm:px-8 py-2 md:py-4">
        <div className="mx-auto mb-6 max-w-lg">
          <Typography variant="h1">QR Code Generator</Typography>
          <Typography variant="muted">
            Generate QR codes for public pages to print on handouts and share at
            community events and weekends.
          </Typography>
        </div>
        <QrCodeGenerator />
      </div>
    </>
  )
}
