// Export server actions only (safe for client components to import)
export * from './actions'

// Export types
export type { ContactInfo, NotificationRecipient } from './types'

// NOTE: notification-service functions are server-only
// Import them directly from './notification-service' when needed in server contexts
