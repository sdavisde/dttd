/**
 * Returns true when running in a local development environment.
 * Use this to conditionally show dev-only UI like "Fill with test data" buttons.
 *
 * Works in both server and client components since it checks NODE_ENV,
 * which Next.js inlines at build time.
 */
export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development'
}
