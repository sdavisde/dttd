import { Tables } from "@/database.types"
import { Permission } from "@/lib/security"

export type Role = Omit<Tables<'roles'>, 'permissions'> & {
  permissions: Permission[]
}
