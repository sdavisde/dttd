# DTTD > Services

## Overview

This directory contains the services for the DTTD application.

Services are intended to provide *business logic* around our database calls, so that the frontend doesn't have to do as much work. Think normalization of nil values, transformations of related entities into shared DTOs for consumption, or handling updating multiple tables in a single action without the frontend needing to know about the complexity of the database schema.

## Purpose

In NextJS app router, we use server actions instead of traditional fetch calls to a server
to fetch and POST data. This is because server actions are cached and can be used on the client side.

To support this pattern for React server actions while still maintaining the nice separation of concerns that we get with traditional API frameworks like Spring or .NET, we use the services pattern in this directory.

## Structure

Each service should reside in its own directory (e.g. `services/identity/user/`) and is comprised of 4-5 files:

1. `index.ts`
   - Entry point for the service.
   - **Re-exports the server actions** and necessary types.
   - Does NOT export the internal service logic directly if not needed.

2. `actions.ts`
   - Defines the **Server Actions** (data mutations/fetches callable from Client).
   - Uses `authorizedAction` wrapper to enforce permissions.
   - Calls into the `*-service.ts` file for logic.

3. `*-service.ts` (e.g. `user-service.ts`)
   - Pure business logic.
   - Transformation of data (Entities -> DTOs).
   - Calls `repository.ts` for data.

4. `repository.ts`
   - Direct database access (Supabase queries).
   - Returns Supabase results wrapped in `Result<E, D>`.

5. `types.ts` (Optional)
   - Domain-specific types.


## Data Transfer Objects (DTOs) vs Entities

Services should return **DTOs** (Data Transfer Objects), not raw Database Entities.
- **DTO**: A shape of data designed for the consumer (frontend). It may aggregate data from multiple tables, rename fields for clarity, or omit sensitive info.
- **Entity**: The raw shape of the data in the database (e.g. `Tables<'users'>`).

**Why?** This prevents leaking database schema details to the client and allows us to refactor the database without breaking the frontend. Use the Service layer to transform Entities into DTOs.

## Authorization

Authorization checks should be standardized at the **Action** layer.
- **Actions** reference a `requiredPermission` when defined.
- The Action layer checks the current user's permissions before calling the Service.
- Services can assume the caller is authorized for the *action*, but may still need to perform resource-level ownership checks (e.g. "can this user edit *this specific* candidate?").

