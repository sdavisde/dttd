import { FilesPage } from '../components/files-page'

export default async function AdminFilesNestedPage({
  params,
}: {
  params: Promise<{ path: string[] | string }>
}) {
  const { path } = await params
  return <FilesPage pathSegments={typeof path === 'string' ? [path] : path} />
}
