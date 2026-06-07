import { ALLOWED_FILE_EXTENSIONS } from './constants'

/**
 * Extracts the lowercased extension (including the leading dot) from a file name.
 * Returns '' when the name has no extension or is a dotfile (e.g. '.env').
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot <= 0) return ''
  return fileName.slice(lastDot).toLowerCase()
}

/**
 * Whether the file name ends in an allowed extension. Gates uploads server-side,
 * since the signed-URL flow never inspects the file's MIME type.
 */
export function isAllowedFileExtension(fileName: string): boolean {
  return ALLOWED_FILE_EXTENSIONS.includes(getFileExtension(fileName))
}
