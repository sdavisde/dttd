# Server Services Architecture

## Layer Responsibilities

This directory contains server-side services following a strict layered architecture. Each service is a directory with these files:

| File                | Layer          | Responsibility                                              |
| ------------------- | -------------- | ----------------------------------------------------------- |
| `types.ts`          | Data           | DTOs, Raw types, Zod schemas                                |
| `repository.ts`     | Data Access    | Database queries only                                       |
| `{name}-service.ts` | Business Logic | Core logic, normalization, side effects                     |
| `actions.ts`        | Controller     | Auth/RBAC checks, the export point for all server side code |
| `index.ts`          | Public API     | Re-exports actions and types only                           |

## Soft Delete Pattern

All deletable entities use a `deleted_at` timestamp column for soft deletion. This pattern is handled **exclusively at the repository layer**.

### Why Repository-Level Only

The repository layer is the **only** layer that should be aware of soft delete:

```
┌─────────────────────────────────────────────────────────────────┐
│  actions.ts      │  "Delete this project"                      │
├──────────────────┼──────────────────────────────────────────────┤
│  service.ts      │  "Delete this project" (no awareness of how)│
├──────────────────┼──────────────────────────────────────────────┤
│  repository.ts   │  SET deleted_at = NOW() WHERE id = $1       │
│                  │  All queries include: WHERE deleted_at IS NULL│
└─────────────────────────────────────────────────────────────────┘
```

**Services call `repository.delete(id)`** - they don't know or care whether this is a soft or hard delete. This separation provides:

1. **Single point of change**: To switch from soft to hard delete, only repository changes
2. **No business logic pollution**: Services focus on domain rules, not deletion mechanics
3. **Consistent filtering**: Repository guarantees deleted records never leak to services
4. **Testability**: Services can be tested without understanding deletion implementation

### Repository Implementation

Every repository query that returns data must filter out soft-deleted records:

```typescript
// repository.ts

export async function findAll(): Promise<Result<RawProject[], Error>> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null) // Always filter soft-deleted
    .order('created_at', { ascending: false })

  // ...
}

export async function findById(
  id: string
): Promise<Result<RawProject | null, Error>> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null) // Always filter soft-deleted
    .maybeSingle()

  // ...
}

export async function softDelete(id: string): Promise<Result<void, Error>> {
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  // ...
}
```

### Service Implementation

Services simply call delete - they don't know it's soft:

```typescript
// project-service.ts

export async function deleteProject(id: string): Promise<Result<void, Error>> {
  // Business logic checks (e.g., verify project exists, check for dependencies)
  const project = await ProjectRepository.findById(id)
  if (!project.ok) return project
  if (project.value === null) {
    return Results.failure(new Error('Project not found'))
  }

  // Just call delete - repository handles the implementation
  return ProjectRepository.softDelete(id)
}
```

### RLS Policies

Row Level Security policies must also respect soft delete:

```sql
-- Contractors can only see non-deleted projects they're assigned to
CREATE POLICY "Contractors can view assigned projects"
ON projects FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM project_assignments
    WHERE project_assignments.project_id = projects.id
    AND project_assignments.user_id = auth.email()
  )
);
```

### When to Bypass Soft Delete Filter

In rare cases (admin recovery tools, data migrations), you may need to query deleted records. Create explicit methods for this:

```typescript
// repository.ts

// Standard query - always excludes deleted
export async function findAll() { ... }

// Explicit method for admin tools only
export async function findAllIncludingDeleted() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    // No deleted_at filter
    .order('created_at', { ascending: false })

  // ...
}
```

Never add a `includeDeleted` boolean parameter to standard methods - this leaks implementation details to services.

## Key Principles

1. **Repository is the gatekeeper**: All database access goes through repository
2. **Services don't know about deleted_at**: They work with "active" records only
3. **Delete means delete**: When service calls delete, it's deleted from their perspective
4. **Explicit over implicit**: If you need deleted records, use an explicitly named method
