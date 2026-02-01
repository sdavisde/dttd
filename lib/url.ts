const INCLUDES_FORWARD_SLASH_AT_START_REGEX = /^\/(.|\n)*$/
const INCLUDES_FORWARD_SLASH_AT_START = (string: string) =>
  INCLUDES_FORWARD_SLASH_AT_START_REGEX.test(string)

export function getUrl(path: string) {
  return `${process.env.SITE_URL}${!INCLUDES_FORWARD_SLASH_AT_START(path) ? '/' : ''}${path}`
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}

/**
 * An opinionated approach to reversing a slug into a Title
 */
export function unslugify(text: string) {
  return text
    .split('-')
    .map((word) => {
      if (word.length === 0) {
        return ''
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Appends query parameters to a URL path.
 * @param basePath - The base URL path (e.g., '/login')
 * @param params - Object of query parameters to add
 * @returns URL with query parameters appended
 *
 * @example
 * appendQueryParams('/login', { redirectTo: '/dashboard' })
 * // Returns: '/login?redirectTo=%2Fdashboard'
 */
export function appendQueryParams(
  basePath: string,
  params: Record<string, string | undefined | null>
): string {
  const filteredParams = Object.entries(params).filter(
    ([, value]) => value != null && value !== ''
  )

  if (filteredParams.length === 0) {
    return basePath
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of filteredParams) {
    if (value) {
      searchParams.set(key, value)
    }
  }

  const separator = basePath.includes('?') ? '&' : '?'
  return `${basePath}${separator}${searchParams.toString()}`
}

/**
 * Builds a URL with an optional redirectTo parameter.
 * Convenience wrapper for common auth redirect pattern.
 * @param basePath - The base URL path
 * @param redirectTo - Optional redirect URL to preserve
 * @returns URL with redirectTo appended if provided
 *
 * @example
 * buildUrlWithRedirect('/join', '/dashboard')
 * // Returns: '/join?redirectTo=%2Fdashboard'
 */
export function buildUrlWithRedirect(
  basePath: string,
  redirectTo?: string | null
): string {
  return appendQueryParams(basePath, { redirectTo })
}
