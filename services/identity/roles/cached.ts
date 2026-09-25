import 'server-only'

import { defineCachedRead } from '@/lib/cache/cached-read'
import { TAGS } from '@/lib/cache/tags'
import * as RolesRepository from './repository'

// Every role write calls updateTag; the day is a safety net.
const DAY_SECONDS = 60 * 60 * 24

/**
 * The role inheritance graph ({@link RolesRepository.getRoleGraph}), shared
 * across requests. It carries no per-user data: which roles a user holds is
 * read separately, per request.
 */
export const getCachedRoleGraph = defineCachedRead(
  'role-graph',
  (client) => RolesRepository.getRoleGraph({ client }),
  { tags: () => [TAGS.roles], revalidateSeconds: DAY_SECONDS }
)
