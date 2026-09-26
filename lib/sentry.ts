/**
 * Options shared by the client, server and edge `Sentry.init` calls.
 *
 * Only production builds report, so local `yarn dev` errors stay out of the
 * project. Vercel exposes its environment ('production' | 'preview') to the
 * browser as NEXT_PUBLIC_VERCEL_ENV, which keeps preview and production
 * events separate.
 */
export const sentryOptions = {
  dsn: 'https://8751354f812cf91c313e1144e5011fb4@o4510754355216384.ingest.us.sentry.io/4510754360590336',
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'local',
  tracesSampleRate: 0.1,
}
