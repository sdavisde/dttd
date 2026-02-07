# DTTD - Dusty Trails Tres Dias

Community management platform for Dusty Trails Tres Dias, a christian community based out of south-central Texas

## Quick Start

```bash
# Install go-task (required for automated setup)
brew install go-task

# Run the setup script (installs dependencies, configures environment)
task setup

# Run development server
yarn dev

# Optionally, if you are testing any online payments:
task dev:webhooks # will startup a webhook listener locally to receive Stripe webhook events
```

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Manual Setup (Alternative)

If you prefer manual setup or need more control:

```bash
# Install dependencies
yarn

# Start local database
yarn db:start # Spins up a local postgres database using supabase CLI
yarn db:migrate <description> # creates a template migration file
yarn db:reset # run whenever you update seed file, or add a migration
yarn db:generate # run after applying migrations to a running database, to update database.types file

# Run development server
yarn dev

# Stops the supabase docker containers running for the backend
yarn db:stop
```

## Environment Variables

Copy `.env.example` into `.env.local`, and follow the instructions inside

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced via commitlint on pre-commit. All commits must follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Description                               | Release Impact |
| ---------- | ----------------------------------------- | -------------- |
| `feat`     | New feature                               | Minor (0.X.0)  |
| `fix`      | Bug fix                                   | Patch (0.0.X)  |
| `perf`     | Performance improvement                   | Patch (0.0.X)  |
| `revert`   | Revert a previous commit                  | Patch (0.0.X)  |
| `docs`     | Documentation only                        | No release     |
| `style`    | Code style (formatting, semicolons, etc.) | No release     |
| `refactor` | Code refactoring (no feature/fix)         | No release     |
| `test`     | Adding or updating tests                  | No release     |
| `build`    | Build system or dependencies              | No release     |
| `ci`       | CI configuration                          | No release     |
| `chore`    | Maintenance tasks                         | No release     |

## Tech Stack

- Next.js 15 + TypeScript
- Supabase (Auth + Database)
- Stripe (Payments)
- ShadCN + Tailwind CSS

## TODOs

- [ ] Test payout webhook, make sure that online payments are marked as deposited when we receive a payout
- [ ] Next, need to show some indicator on the payments page that a payment was deposited
- [ ] Create delete user action
- [ ] Add user account actions dropdown menu
