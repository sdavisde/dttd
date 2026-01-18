# 01 Questions Round 1 - Developer Onboarding

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Task Runner Preference

You mentioned `task setup` but go-task isn't currently installed. Which approach would you prefer for the setup command?

- [x] (A) **go-task (Taskfile.yml)** - Requires developers to install `task` CLI first, but provides a clean cross-platform task runner
- [ ] (B) **npm/yarn scripts only** - Use `yarn setup` instead, keeping everything in package.json (no extra tools)
- [ ] (C) **Shell script** - Use `./scripts/setup.sh` for setup, keeping complex logic out of package.json
- [ ] (D) **Makefile** - Classic approach, widely available on Unix systems
- [ ] (E) Other (describe)

## 2. Infisical Authentication Method for Developers

How should developers authenticate with Infisical to pull secrets?

- [x] (A) **Interactive login** - Each developer runs `infisical login` (opens browser, requires Infisical account)
- [ ] (B) **Shared service token** - Team shares a single service token (stored where? in setup docs?)
- [ ] (C) **Machine identity** - Each developer gets assigned credentials from you
- [ ] (D) Other (describe)

Notes: Interactive login is simplest for teams - each dev authenticates once and can pull secrets. Service tokens are better for CI/CD.

## 3. Infisical Project Configuration

Do you want the Infisical project ID and workspace ID committed to the repo (in `infisical.json`) so developers don't need to look them up?

- [x] (A) **Yes** - Commit `infisical.json` with project/workspace IDs (safe - no secrets, just identifiers)
- [ ] (B) **No** - Keep it out of repo, developers will need to configure manually
- [ ] (C) Other (describe)

## 4. Supabase Local Keys Handling

When running `yarn db:start`, Supabase outputs local API keys. Should the setup script automatically populate `.env.local` with these keys?

- [x] (A) **Yes, fully automated** - Setup script runs `supabase status`, parses output, and writes keys to `.env.local`
- [ ] (B) **Semi-automated** - Setup script displays the keys and instructs developer to copy them
- [ ] (C) **Manual** - Developer runs `yarn db:status` and copies keys themselves (current approach)
- [ ] (D) Other (describe)

Notes: The Supabase CLI outputs `PUBLISHABLE_KEY` and `SECRET_KEY` which map to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`.

## 5. Stripe Webhook Authentication for Team

For the `yarn dev:webhooks` command, how should developers authenticate with Stripe CLI?

- [x] (A) **Shared test API key via Infisical** - Store `STRIPE_SECRET_KEY` in Infisical, use `stripe listen --api-key $STRIPE_SECRET_KEY`
- [ ] (B) **Individual Stripe logins** - Each developer needs Stripe dashboard access and runs `stripe login`
- [ ] (C) **Both options** - Document both approaches, let developers choose
- [ ] (D) Other (describe)

Notes: Using the API key approach (option A) means developers don't need Stripe dashboard access.

## 6. Environment File Strategy

Which environment file should the setup process create/populate?

- [x] (A) **`.env.local`** - Next.js convention for local overrides (gitignored)
- [ ] (B) **`.env`** - Standard env file (gitignored)
- [ ] (C) **Both** - Base secrets in `.env`, local Supabase keys in `.env.local`
- [ ] (D) Other (describe)

## 7. Prerequisites Installation

Should the setup script check for and guide installation of prerequisites (Node.js, Yarn, Infisical CLI, Stripe CLI, Docker)?

- [x] (A) **Yes, check all** - Verify each prerequisite is installed, prompt user with "xyz is required; install? [Y/n]" installations if missing
- [ ] (B) **Check critical only** - Only verify Node.js version and Docker (required for Supabase)
- [ ] (C) **No checks** - Assume developers have prerequisites, document them in README
- [ ] (D) Other (describe)

## 8. Stripe Webhook Secret Handling

The `STRIPE_WEBHOOK_SECRET` changes each time you run `stripe listen`. How should this be handled?

- [x] (A) **Dynamic in script** - The `yarn dev:webhooks` script captures and exports the secret automatically. Actually, this creates a good use-case for this to be called `task stripe-listen` instead of using yarn scripts.
- [ ] (B) **Fixed test secret** - Use a consistent webhook secret from Stripe dashboard (requires webhook endpoint registration)
- [ ] (C) **Manual each time** - Developer copies the secret from CLI output to `.env.local` when starting webhooks
- [ ] (D) Other (describe)

Notes: The dynamic approach is more complex but provides better DX. The manual approach is simpler but requires copying the secret each session.

## 9. Database Seeding

Should the setup automatically run database migrations and seeding?

- [ ] (A) **Yes** - Setup runs `yarn db:start` then `yarn db:reset` to apply migrations and seed data
- [x] (B) **No** - Setup only starts the database, developer runs reset manually if needed
- [ ] (C) Other (describe)

## 10. Documentation Updates

Where should the new developer onboarding instructions live?

- [ ] (A) **README.md** - Update the existing Quick Start section
- [ ] (B) **Separate CONTRIBUTING.md or SETUP.md** - Keep README brief, detailed setup in separate file
- [x] (C) **Both** - Brief overview in README, detailed instructions in separate file
- [ ] (D) Other (describe)
