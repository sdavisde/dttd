# 01-tasks-developer-onboarding.md

Task list generated from [01-spec-developer-onboarding.md](./01-spec-developer-onboarding.md)

## Tasks

### [~] 1.0 Create Taskfile Foundation with Prerequisite Checking

Establish go-task infrastructure with `Taskfile.yml` that checks for required prerequisites (Node.js v22+, Yarn, Docker, Infisical CLI, Stripe CLI) and prompts for installation when missing.

#### 1.0 Proof Artifact(s)

- File: `README.md` contains instruction to install go-task in the quick start
- File: `Taskfile.yml` exists in project root with `setup` and `check-prereqs` tasks
- CLI: `task setup` without Infisical CLI installed prompts "Infisical CLI is required; install? [Y/n]"
- CLI: `task setup` with all prerequisites installed displays "All prerequisites satisfied" and proceeds

#### 1.0 Tasks

- [x] 1.1 Create `Taskfile.yml` with basic structure and a `check-prereqs` task that verifies Node.js (v22+), Yarn, Docker, Infisical CLI, and Stripe CLI are installed
- [x] 1.2 Add installation prompts to `check-prereqs` that offer to install missing prerequisites with platform-appropriate commands (brew for macOS)
- [x] 1.3 Create `setup` task that calls `check-prereqs` first, displays "All prerequisites satisfied" when complete, and establishes the foundation for subsequent setup steps
- [x] 1.4 Update `README.md` Quick Start section to include go-task installation instruction

---

### [ ] 2.0 Integrate Infisical for Secret Management

Add `infisical.json` configuration and implement secret pulling in the setup task. Secrets from Infisical should be written to `.env.local` while preserving any existing local-only values. The org id is `195424da-3845-458c-b28f-d774c4a05b17` and the project is `47fdbab8-b400-4b5f-a665-be90283edbb4`

#### 2.0 Proof Artifact(s)

- File: `infisical.json` committed to repo with project/workspace IDs (no secrets)
- CLI: `task setup` after `infisical login` creates `.env.local` with Stripe keys, Resend API key, and price IDs populated
- CLI: `infisical secrets` shows expected environment variables from `.env.example`

#### 2.0 Tasks

TBD

---

### [ ] 3.0 Automate Supabase Local Key Population

Extend the setup task to start Supabase, parse `yarn db:start` or `yarn db:status` output, and write local Supabase keys to `.env.local` without overwriting Infisical-sourced secrets.

#### 3.0 Proof Artifact(s)

- CLI: `task setup` populates `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`
- CLI: `yarn dev` starts successfully and connects to local Supabase after running `task setup`
- File: `.env.local` contains both Infisical secrets (Stripe, Resend) and Supabase local keys

#### 3.0 Tasks

TBD

---

### [ ] 4.0 Create Stripe Webhook Listener Task

Implement `task dev:webhooks` that uses `STRIPE_SECRET_KEY` from `.env.local` for non-interactive authentication, captures the dynamic webhook signing secret, and updates `.env.local`.

#### 4.0 Proof Artifact(s)

- CLI: `task dev:webhooks` starts Stripe listener without browser authentication prompt
- CLI: `STRIPE_WEBHOOK_SECRET` is automatically written/updated in `.env.local`
- CLI: `stripe trigger checkout.session.completed` (in separate terminal) shows webhook received in listener output

#### 4.0 Tasks

TBD

---

### [ ] 5.0 Update Documentation for New Developer Workflow

Update README.md with brief Quick Start using new commands, create detailed SETUP.md with full instructions, and update CLAUDE.md with new task commands for AI assistant awareness.

#### 5.0 Proof Artifact(s)

- File: `README.md` Quick Start section references `task setup` and new workflow
- File: `SETUP.md` contains detailed prerequisites, installation steps, and troubleshooting
- File: `CLAUDE.md` Development Commands section includes `task setup`, `task dev:webhooks`

#### 5.0 Tasks

TBD
