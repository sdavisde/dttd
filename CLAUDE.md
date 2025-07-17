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

- **Frontend**: Next.js 15.3.2 (App Router), TypeScript, Material-UI v7.1.0, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL), Supabase Auth
- **State**: TanStack React Query v4, React Hook Form + Zod validation
- **Payments**: Stripe integration
- **Email**: Resend service
- **Logging**: Pino logger

## Code Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
  - `(public)/` - Public routes (candidate forms, payments, sponsorship)
  - `admin/` - Admin dashboard with role-based access
- `actions/` - Server actions for database operations
- `components/` - Reusable React components organized by feature
- `lib/` - Shared utilities, types, and service configurations
- `hooks/` - Custom React hooks

### Key Architectural Patterns

1. **Server Actions Pattern**: Database operations are handled via server actions in the `actions/` directory, not API routes
2. **Type Safety**: All database operations use generated types from `database.types.ts`
3. **Result Pattern**: Server actions return `Result<Error, T>` types for consistent error handling
4. **Authentication Middleware**: Supabase auth handled in `middleware.ts` with route protection

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
- `FILES_UPLOAD/DELETE` - File management permissions

### Component Patterns

- Material-UI components for UI consistency
- Radix UI primitives for complex interactions
- React Hook Form with Zod schemas for form validation
- Server/client component separation following Next.js best practices

### File Organization

- Server components in page directories
- Client components marked with 'use client'
- Shared types in `lib/` subdirectories by domain
- Email templates using React Email in `components/email/`