import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'

export default function Page() {
  return (
    <>
      <AdminBreadcrumbs
        title="QR Codes"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* QR code generator will be added here */}
      </div>
    </>
  )
}
