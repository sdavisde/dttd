# 01-spec-developer-onboarding.md

## Introduction/Overview

This feature streamlines developer onboarding for the DTTD project by automating environment setup, secret management, and local development tooling. New developers will be able to run `task setup` once to configure their environment, then use simple commands (`yarn dev`, `yarn db:start`, `task dev:webhooks`) to start working immediately.

The key improvements are: centralized secret management via Infisical, automated Supabase local key configuration, and non-interactive Stripe webhook listening that doesn't require individual Stripe dashboard access.

## Goals

- Reduce new developer setup time from manual multi-step process to a single `task setup` command
- Eliminate manual secret sharing by using Infisical for team secret management
- Enable Stripe webhook testing without requiring individual Stripe dashboard logins
- Automate Supabase local key population in `.env.local`
- Provide clear prerequisite checking with guided installation prompts

## User Stories

- **As a new developer**, I want to run a single setup command so that I can start developing without manually configuring secrets and environment variables.

- **As a developer**, I want to test Stripe webhooks locally so that I can verify payment flows work correctly without needing Stripe dashboard access.

- **As a team lead**, I want secrets managed centrally in Infisical so that I can onboard developers without sharing credentials via insecure channels.

- **As a developer**, I want the setup process to check for missing prerequisites so that I know exactly what tools I need to install before proceeding.

## Demoable Units of Work

### Unit 1: Taskfile Foundation with Prerequisite Checking

**Purpose:** Establish the task runner infrastructure and ensure developers have required tools installed before proceeding with setup.

**Functional Requirements:**

- The system shall use go-task (Taskfile.yml) as the task runner for multi-step scripts
- The system shall check for required prerequisites: Node.js (v22+), Yarn, Docker, Infisical CLI, Stripe CLI
- The system shall prompt the user with "[tool] is required; install? [Y/n]" when a prerequisite is missing
- The system shall provide platform-appropriate install commands (brew for macOS)
- The system shall verify Node.js version matches `.nvmrc` (v22.21.1)

**Proof Artifacts:**

- CLI: `task setup` on a fresh machine without Infisical CLI prompts for installation
- CLI: `task setup` with all prerequisites installed proceeds to next step
- File: `Taskfile.yml` exists in project root with `setup` and prerequisite check tasks

### Unit 2: Infisical Secret Integration

**Purpose:** Enable developers to pull shared secrets from Infisical into their local environment.

**Functional Requirements:**

- The system shall include an `infisical.json` file with project/workspace IDs (committed to repo)
- The setup task shall prompt the user to run `infisical login` if not authenticated
- The setup task shall pull secrets from Infisical and write them to `.env.local`
- The system shall preserve any existing local-only values in `.env.local` (e.g., Supabase keys added later)
- The secrets pulled shall include: Stripe keys, Resend API key, price IDs, and other shared secrets from `.env.example`

**Proof Artifacts:**

- CLI: `task setup` after `infisical login` creates `.env.local` with Stripe and Resend keys populated
- File: `infisical.json` committed to repo with project configuration
- CLI: `infisical secrets` shows the expected environment variables

### Unit 3: Supabase Local Key Automation

**Purpose:** Automatically populate Supabase local development keys after database startup.

**Functional Requirements:**

- The setup task shall start Supabase if not already running (`yarn db:start`)
- The setup task shall parse output from `supabase status` to extract `anon key` and `service_role key`
- The setup task shall write `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` to `.env.local`
- The system shall set `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` for local development
- The setup task shall not overwrite existing Infisical-sourced secrets when adding Supabase keys

**Proof Artifacts:**

- CLI: `task setup` populates `.env.local` with correct Supabase keys from local instance
- CLI: `yarn dev` starts successfully and connects to local Supabase after setup
- File: `.env.local` contains both Infisical secrets and Supabase local keys

### Unit 4: Stripe Webhook Listener Task

**Purpose:** Enable developers to listen to Stripe webhooks without interactive browser login.

**Functional Requirements:**

- The system shall provide a `task dev:webhooks` command for Stripe webhook forwarding
- The task shall use `STRIPE_SECRET_KEY` from `.env.local` for authentication (no browser login required)
- The task shall forward webhooks to `localhost:3000/api/webhooks/complete-checkout`
- The task shall capture the webhook signing secret from Stripe CLI output
- The task shall update `STRIPE_WEBHOOK_SECRET` in `.env.local` with the dynamic secret
- The task shall display a message indicating the webhook listener is ready

**Proof Artifacts:**

- CLI: `task dev:webhooks` starts Stripe listener without browser authentication prompt
- CLI: Webhook secret is automatically written to `.env.local`
- CLI: Test webhook via `stripe trigger checkout.session.completed` is received by local server

## Non-Goals (Out of Scope)

1. **CI/CD secret injection** - This spec focuses on local development only; CI/CD pipelines will continue using their existing secret management
2. **Production environment setup** - Only local development environment is addressed
3. **Database seeding automation** - Developers will manually run `yarn db:reset` when needed (per user preference)
4. **Windows support** - Initial implementation targets macOS; Linux support via similar package managers, Windows may require WSL
5. **Infisical account provisioning** - Developers must be invited to the Infisical project separately by the team lead

## Design Considerations

No specific UI design requirements. This is a CLI/tooling feature. Output should be clear and follow conventions:

- Use colored output for success (green), warnings (yellow), and errors (red) where supported
- Provide progress indicators for long-running operations (e.g., Supabase startup)
- Keep output concise but informative

## Repository Standards

Based on existing patterns in the repository:

- Shell scripts should be POSIX-compatible where possible
- Use existing yarn scripts (`db:start`, `db:status`) rather than duplicating functionality
- Follow the project's conventional commit format for all changes
- Update CLAUDE.md if new commands are added that AI assistants should know about

## Technical Considerations

- **go-task installation**: Developers need to install go-task first (`brew install go-task`)
- **Infisical CLI**: Available via `brew install infisical/get-cli/infisical`
- **Stripe CLI**: Available via `brew install stripe/stripe-cli/stripe`
- **Supabase status parsing**: The `supabase status` command outputs keys in a parseable format; use `grep` and `awk` or similar
- **Atomic .env.local updates**: When merging Infisical secrets with Supabase keys, avoid data loss by reading existing file first
- **Stripe webhook secret**: Changes each `stripe listen` session; task must capture from stdout and write to `.env.local`

## Security Considerations

- **infisical.json**: Contains only project/workspace IDs, no secrets - safe to commit
- **`.env.local`**: Must remain in `.gitignore` - contains actual secrets
- **Stripe API key**: The shared test mode key provides access to test environment only; production keys are never stored in Infisical for local dev
- **Infisical authentication**: Each developer authenticates individually; no shared service tokens for local development
- **Webhook secret rotation**: Dynamic webhook secrets are session-specific and not persisted long-term

## Success Metrics

1. **Setup time**: New developer can go from clone to running `yarn dev` successfully in under 10 minutes
2. **Prerequisites**: Setup script catches 100% of missing prerequisites before they cause cryptic errors
3. **Secret sync**: Developers can pull updated secrets from Infisical with a single command
4. **Webhook testing**: Developers can test Stripe webhooks without needing Stripe dashboard credentials

## Open Questions

1. Should there be a `task setup:refresh` command to re-pull secrets without full setup? (Can be added later if needed)
2. Should the webhook task filter to specific events (`checkout.session.completed`) or forward all events? (Recommend all events for flexibility)
