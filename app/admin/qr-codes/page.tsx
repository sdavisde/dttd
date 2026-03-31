import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { QrCodeGenerator } from '@/app/admin/qr-codes/qr-code-generator'

export default function Page() {
  return (
    <>
      <AdminBreadcrumbs
        title="QR Codes"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <QrCodeGenerator />
      </div>
    </>
  )
}
