/**
 * The actual folder name in Supabase storage for meeting minutes
 */
export const MEETING_MINUTES_FOLDER = 'Meeting Minutes'

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

/**
 * Allowed file extensions, mirroring ALLOWED_FILE_TYPES. Used to gate uploads
 * server-side when minting signed upload URLs, since that flow only sees the
 * file name (the bytes go directly browser -> Supabase Storage).
 */
export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
]

/**
 * Client-side upload size cap. Bytes stream directly to Supabase Storage, so
 * this is a friendly guard rather than a framework limit — it gives users a
 * clear message instead of an opaque storage rejection on oversized files.
 */
export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024
export const MAX_UPLOAD_SIZE_LABEL = '50MB'
