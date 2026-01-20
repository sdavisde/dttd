# Task 2.0 Proof Artifacts - Integrate Infisical for Secret Management

## Proof Artifact 1: `.infisical.json` committed to repo

**Requirement**: File: `.infisical.json` committed to repo with project/workspace IDs (no secrets)

### Evidence

File contents of `.infisical.json`:

```json
{
  "workspaceId": "47fdbab8-b400-4b5f-a665-be90283edbb4",
  "defaultEnvironment": "dev",
  "gitBranchToEnvironmentMapping": null
}
```

**Verification**: File contains only project configuration IDs, no secrets.

---

## Proof Artifact 2: `task setup` prompts for Infisical login when not authenticated

**Requirement**: CLI: `task setup` after `infisical login` creates `.env.local` with Stripe keys, Resend API key, and price IDs populated

### Evidence - Unauthenticated State

```
$ task setup
✓ Node.js v22.21.1
✓ Yarn 1.22.22
✓ Docker 28.0.1
✓ Infisical CLI infisical version 0.43.48
✓ Stripe CLI stripe version 1.28.0

✓ All prerequisites satisfied

Proceeding with environment setup...
You are not logged in to Infisical.
Run 'infisical login' now? [Y/n]
```

**Verification**: Task correctly detects unauthenticated state and prompts user to login.

### Evidence - Authenticated State (User Must Verify)

After running `infisical login` and authenticating, running `task setup` should:

1. Complete the `check-infisical-auth` step successfully
2. Pull secrets from Infisical in dotenv format
3. Write secrets to `.env.local`
4. Preserve any existing local-only values in `.env.local`

**User verification command**:

```bash
# First, login to Infisical
infisical login

# Then run setup
task setup

# Verify .env.local was created with secrets
cat .env.local
```

---

## Proof Artifact 3: `infisical secrets` shows expected environment variables

**Requirement**: CLI: `infisical secrets` shows expected environment variables from `.env.example`

### Evidence

After authentication, running `infisical secrets --env=dev` should display the following variables (as defined in `.env.example`):

Expected variables in Infisical:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CANDIDATE_FEE_PRICE_ID`
- `TEAM_FEE_PRICE_ID`
- `RESEND_API_KEY`

**User verification command**:

```bash
infisical secrets --env=dev
```

---

## Implementation Details

### Files Created/Modified

1. **`.infisical.json`** - New file with Infisical project configuration
2. **`Taskfile.yml`** - Added tasks:
   - `check-infisical-auth` - Verifies user is authenticated to Infisical
   - `pull-secrets` - Pulls secrets and merges into `.env.local`
   - Updated `setup` task to call `pull-secrets`

### Taskfile Tasks Added

```yaml
check-infisical-auth:
  desc: Check user is authenticated to Infisical
  # Prompts for login if not authenticated

pull-secrets:
  desc: Pull secrets from Infisical and merge into .env.local
  # Fetches secrets in dotenv format
  # Preserves existing local-only values (e.g., Supabase keys)
```

### Build Verification

```
$ yarn build
✨ Done in 33.75s.

$ yarn lint
✨ Done in 20.21s.
```

---

## Summary

| Proof Artifact                      | Status                     | Notes                                        |
| ----------------------------------- | -------------------------- | -------------------------------------------- |
| `.infisical.json` with project IDs  | ✅ Verified                | No secrets, safe to commit                   |
| `task setup` creates `.env.local`   | ✅ Implementation Complete | Requires user authentication to fully verify |
| `infisical secrets` shows variables | ✅ Implementation Complete | Requires user authentication to fully verify |
