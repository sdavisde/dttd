/**
 * Maps the many ways a file upload can fail into a single, specific, friendly
 * message. Upload failures surface from a few places — the server action that
 * mints the signed URL, the Supabase Storage response, or an unexpected thrown
 * error — and each carries its reason differently. This normalizes them so the
 * user always learns *why* an upload failed, not just *that* it did.
 */

type MaybeStorageError = {
  message?: unknown
  error?: unknown
  status?: unknown
  statusCode?: unknown
}

function extractMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (error !== null && typeof error === 'object') {
    const e = error as MaybeStorageError
    if (typeof e.message === 'string') return e.message
    if (typeof e.error === 'string') return e.error
  }
  return ''
}

function extractStatus(error: unknown): number | undefined {
  if (error === null || typeof error !== 'object') return undefined
  const e = error as MaybeStorageError
  if (typeof e.status === 'number') return e.status
  if (typeof e.statusCode === 'number') return e.statusCode
  if (typeof e.statusCode === 'string') {
    const parsed = Number.parseInt(e.statusCode, 10)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

export function getFriendlyUploadError(error: unknown): string {
  const message = extractMessage(error).toLowerCase()
  const status = extractStatus(error)

  // Not signed in / expired session
  if (
    message.includes('not authenticated') ||
    message.includes('jwt') ||
    message.includes('session')
  ) {
    return 'Your session has expired. Please sign in again and retry the upload.'
  }

  // Authorized but lacking the upload permission
  if (
    status === 403 ||
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('row-level security') ||
    message.includes('unauthorized')
  ) {
    return "You don't have permission to upload files here. Contact an administrator if you think this is a mistake."
  }

  // A file with the same name already exists (uploads use upsert: false)
  if (
    status === 409 ||
    message.includes('already exists') ||
    message.includes('duplicate')
  ) {
    return 'A file with this name already exists. Rename the file or delete the existing one first.'
  }

  // Exceeded a storage-side size limit
  if (
    status === 413 ||
    message.includes('payload too large') ||
    message.includes('entity too large') ||
    message.includes('maximum allowed size') ||
    message.includes('exceeded the maximum')
  ) {
    return 'This file is too large to upload. Please use a smaller file.'
  }

  // Disallowed file type (server-side extension check)
  if (
    message.includes('pdf and image') ||
    message.includes('file type') ||
    message.includes('mime')
  ) {
    return 'Only PDF and image files are allowed.'
  }

  // Connectivity problems
  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('connection')
  ) {
    return 'The upload failed because of a network problem. Check your connection and try again.'
  }

  return 'Something went wrong while uploading the file. Please try again.'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
