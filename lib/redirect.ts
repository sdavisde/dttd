/**
 * Validates a redirect URL to prevent open redirect attacks.
 *
 * Security checks:
 * - Must be a relative path (starts with `/`)
 * - Blocks absolute URLs and protocol-relative URLs (`//evil.com`)
 * - Blocks `javascript:`, `data:`, and other dangerous protocols
 * - Blocks auth pages to prevent redirect loops
 * - Normalizes paths to prevent traversal attacks
 *
 * @param url - The URL to validate
 * @param defaultPath - The fallback path if validation fails (default: '/home')
 * @returns A safe redirect URL
 */
export function validateRedirectUrl(
  url: string | null | undefined,
  defaultPath: string = '/home'
): string {
  if (!url) {
    return defaultPath
  }

  // Must start with exactly one forward slash (relative path)
  // Reject protocol-relative URLs like //evil.com
  if (!url.startsWith('/') || url.startsWith('//')) {
    return defaultPath
  }

  // Block dangerous protocols that might be encoded
  const lowerUrl = url.toLowerCase()
  if (
    lowerUrl.includes('javascript:') ||
    lowerUrl.includes('data:') ||
    lowerUrl.includes('vbscript:')
  ) {
    return defaultPath
  }

  // Block potential XSS characters
  if (/[<>"']/.test(url)) {
    return defaultPath
  }

  // Normalize the path to resolve any .. or . segments
  // This prevents path traversal attacks
  try {
    const normalized = new URL(url, 'http://localhost').pathname
    // Also preserve query string if present
    const queryIndex = url.indexOf('?')
    const queryString = queryIndex !== -1 ? url.slice(queryIndex) : ''
    const fullPath = normalized + queryString

    // Block redirects to auth pages to prevent loops
    const authPages = ['/login', '/join', '/forgot-password', '/reset-password']
    if (
      authPages.some(
        (page) => normalized === page || normalized.startsWith(page + '/')
      )
    ) {
      return defaultPath
    }

    // Block root path redirect (user should go to home instead)
    if (normalized === '/') {
      return defaultPath
    }

    return fullPath
  } catch {
    return defaultPath
  }
}
