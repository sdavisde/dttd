# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `yarn dev` (with Turbopack)
- **Build for production**: `yarn build`
- **Start production server**: `yarn start`
- **Lint code**: `yarn lint`
- **Generate Supabase types**: `yarn generate` (regenerates `database.types.ts`)

## Project Overview

Dusty Trails Tres Dias (DTTD) is a Christian community management platform for spiritual renewal weekends. The application manages the complete candidate journey from sponsorship through weekend participation.

### Technology Stack

- **Frontend**: Next.js 15.3.2 (App Router), TypeScript, React 19, shadcn/ui components, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL), Supabase Auth, Supabase SSR
- **State**: TanStack React Query v4, React Hook Form + Zod v4 validation
- **Payments**: Stripe integration (v18.2.0)
- **Email**: Resend service, React Email components
- **Logging**: Pino logger
- **UI Libraries**: Radix UI primitives, Lucide React icons, Next Themes, Sonner toasts
- **Utilities**: date-fns, clsx, class-variance-authority

## Code Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
  - `(public)/` - Public routes (candidate forms, payments, sponsorship, roster)
    - `api/` - API routes (webhooks for checkout completion)
    - `candidate/` - Candidate form workflows
    - `files/` - Public file access and management
    - `payment/` - Stripe payment flows
    - `sponsor/` - Sponsorship form and submission
    - `review-candidates/` - Candidate review interface
    - `roster/` - Public roster page
  - `admin/` - Admin dashboard with role-based access
    - `files/` - File management system
    - `roles/` - Role assignment interface
    - `users/` - User management
    - `weekends/` - Weekend event management
    - `settings/` - System configuration
- `actions/` - Server actions for database operations
- `components/` - Reusable React components organized by feature
  - `ui/` - shadcn/ui component library
  - `auth/` - Authentication forms and providers
  - `file-management/` - File system operations
  - `email/` - React Email templates
- `lib/` - Shared utilities, types, and service configurations
- `hooks/` - Custom React hooks
- `util/` - Legacy utility functions (should be consolidated with `lib/`)

### Key Architectural Patterns

1. **Server Actions Pattern**: Database operations are handled via server actions in the `actions/` directory, not API routes
2. **Type Safety**: All database operations use generated types from `database.types.ts`
3. **Result Pattern**: Server actions return `Result<Error, T>` types for consistent error handling
4. **Authentication Middleware**: Supabase auth handled in `middleware.ts` with route protection
5. **Component Co-location**: Feature-specific components are organized under their respective domain folders
6. **Separation of Concerns**: Clear separation between public and admin functionality through route grouping

### Database Architecture

The application uses Supabase with several key tables:
- `candidates` - Main candidate records with status tracking
- `candidate_sponsorship_info` - Sponsorship details
- `candidate_info` - Detailed candidate forms and medical information
- `users` - User accounts with role-based permissions
- `weekend` - Weekend event management

### Business Domain

**Core Concepts**:
- **Weekend**: 72-hour spiritual renewal events (42 candidate capacity)
- **Candidate**: Guest participant requiring sponsorship and approval
- **Sponsor**: Community member who nominates candidates
- **Pre-Weekend Couple**: Weekend organizers managing candidate approval

**User Permissions**:
- `FULL_ACCESS` - Complete system access
- `READ_MEDICAL_HISTORY` - Access to medical information  
- `FILES_UPLOAD` - File upload permissions
- `FILES_DELETE` - File deletion permissions

### Component Patterns

**IMPORTANT: ONLY use shadcn/ui components - NO Material-UI or other UI libraries allowed**

- shadcn/ui components for UI consistency (built on Radix UI primitives)
- React Hook Form with Zod schemas for form validation
- Server/client component separation following Next.js best practices
- Import UI components from `@/components/ui/` directory only

### Responsive Design Guidelines for Admin Pages

**CRITICAL: ALL admin pages and data tables MUST implement mobile-responsive designs following these patterns:**

#### Mobile-First Data Display Requirements

1. **Dual Layout Strategy**:
   - **Desktop (md+)**: Preserve existing table layouts - NO changes to desktop behavior
   - **Mobile (sm and below)**: Implement card-based layouts for better mobile UX

2. **Responsive Implementation Pattern**:
   ```tsx
   {/* Desktop Table - Hidden on mobile */}
   <div className="relative hidden md:block">
     <Table>
       {/* Existing desktop table implementation */}
     </Table>
   </div>

   {/* Mobile Card Layout - Shown only on mobile */}
   <div className="md:hidden space-y-3">
     {data.map((item) => (
       <div key={item.id} className="bg-card border rounded-lg p-4 space-y-3">
         {/* Mobile card content */}
       </div>
     ))}
   </div>
   ```

3. **Mobile Card Design Standards**:
   - **Header**: Primary identifier (name, title) prominently displayed with larger font (`text-lg`, `font-medium`)
   - **Content Organization**: Use labeled sections with consistent spacing (`space-y-2`, `space-y-3`)
   - **Labels**: Muted foreground labels with fixed width for alignment (`text-muted-foreground w-16`)
   - **Action Buttons**: Position in header with proper touch targets (minimum 44px)
   - **Status/Badges**: Group together with flexbox (`flex flex-wrap items-center gap-2`)
   - **Borders**: Use card styling (`bg-card border rounded-lg p-4`)

4. **Functional Requirements**:
   - **Search/Filter**: Must work identically on both desktop and mobile layouts
   - **Interactions**: All dropdowns, modals, and actions must function on mobile cards
   - **State Management**: Preserve all existing state management and data flow
   - **Empty States**: Show appropriate messages for both layouts

5. **Touch Optimization**:
   - Minimum 44px touch targets for interactive elements
   - Proper spacing between interactive elements (minimum 8px gaps)
   - Hover states replaced with appropriate mobile interactions

6. **Example Implementation**:
   Reference: `/app/admin/weekends/[weekend_id]/weekend-roster-table.tsx` for complete mobile card implementation

#### When to Apply These Guidelines

- **New Admin Pages**: Always implement responsive design from the start
- **Existing Admin Tables**: When modifying any admin table, add mobile card layout
- **Data Display Components**: Any component showing tabular data in admin routes
- **Form Lists**: Lists of editable items in admin interfaces

**DO NOT modify desktop behavior** - only add mobile-responsive alternatives alongside existing layouts.

### File Organization

- Server components in page directories
- Client components marked with 'use client'
- Shared types in `lib/` subdirectories by domain
- Email templates using React Email in `components/email/`
- use `yarn build` to confirm compilation