# 0007-spec-magic-link-sign-in.md

## Introduction/Overview

This spec describes adding a **"Sign me in with a link"** (magic link) option on the login page alongside the existing password and forgot-password flows. Users can enter their email and receive a one-time sign-in link by email; clicking the link signs them in without a password. This uses Supabase Auth's built-in magic link flow (`signInWithOtp`).

## Goals

- Add a passwordless sign-in option on the login page for users who prefer not to use (or have forgotten) their password.
- Use Supabase's magic link flow so we do not maintain custom token logic.
- Keep the flow consistent with existing auth (same session/cookies, redirect to `/home`).
- Coexist with existing email/password login and "Forgot your password?" without replacing them.

## User Stories

**As a user**, I want to sign in by receiving a link in my email so that I can log in without typing a password.

**As a user**, I want the sign-in link option to be clearly available on the login page so that I can choose it when I prefer it over password login.

## How Supabase Magic Links Work (Reference)

- **API**: `signInWithOtp({ email, options: { emailRedirectTo, shouldCreateUser } })`. Despite the name "OTP", this sends a **magic link** by default (Supabase docs: "Passwordless email logins").
- **Email**: Supabase sends the email; the link points to your `emailRedirectTo` URL with auth tokens appended.
- **Redirect**: After the user clicks the link, Supabase redirects to `emailRedirectTo` with tokens in the URL:
  - **Implicit flow (default)**: Tokens are in the **hash fragment**, e.g. `#access_token=...&refresh_token=...&type=magiclink`.
  - **PKCE flow**: If enabled, the app receives a `token_hash` (e.g. in query) and must call `verifyOtp({ token_hash, type: 'email' })` to create the session.
- **Configuration**: `emailRedirectTo` must be listed in Supabase **Auth → URL Configuration → Redirect URLs** (Dashboard for hosted, `auth.additional_redirect_urls` in config for self-hosted).
- **Behavior**: Magic links are one-time use and expire (default 1 hour). Rate limit: one magic link request per 60 seconds per user. If `shouldCreateUser: false`, only existing users receive a link (no auto sign-up).

References:

- [Supabase: Passwordless email logins (Magic Link)](https://supabase.com/docs/guides/auth/auth-magic-link)
- [Supabase JS: signInWithOtp](https://supabase.com/docs/reference/javascript/auth-signinwithotp)
- [Supabase JS: verifyOtp](https://supabase.com/docs/reference/javascript/auth-verifyotp) (for PKCE or token_hash callback)

## Demoable Units of Work

### Unit 1: "Email me a sign-in link" on the login page

**Purpose:** Let the user request a magic link from the login page and show clear feedback.

**Functional Requirements:**

- On the login page, when in **login** mode (not register), the system shall show an option to "Sign me in with a link" (or similar copy).
- The system shall allow the user to request a magic link using the **same email field** as password login (no separate email field required).
- When the user chooses "Email me a sign-in link":
  1. The system shall call `signInWithOtp` with:
     - `email`: value from the email input.
     - `options.emailRedirectTo`: the app's auth callback URL (e.g. `getUrl('/auth/callback')` for consistency with existing `getUrl()` and production).
     - `options.shouldCreateUser`: `false` so only existing users can sign in (no new account creation via magic link).
  2. On success (no error), the system shall show a clear message such as "Check your email for the sign-in link" and not require the user to enter a password.
  3. On error (e.g. rate limit, invalid email), the system shall display the error message in the existing error area.
- The system shall not block or replace the existing "Sign In" (password) or "Forgot your password?" flows; all three options remain available.
- Copy and placement should make it obvious that "Sign me in with a link" is an alternative way to sign in (e.g. link or secondary button near "Forgot your password?" or below the main Sign In button).

**Proof Artifacts:**

- Screenshot: Login page showing "Sign me in with a link" (or equivalent) and password / forgot-password options.
- Screenshot: After requesting link, success message "Check your email for the sign-in link".
- Code snippet: `signInWithOtp` call with `emailRedirectTo` and `shouldCreateUser: false`.

---

### Unit 2: Auth callback route to complete magic link sign-in

**Purpose:** When the user clicks the link in the email, the app must establish a session and redirect them to the app (e.g. `/home`).

**Functional Requirements:**

- The system shall expose an auth callback route that Supabase redirects to after the user clicks the magic link (e.g. `GET /auth/callback` or `/login/callback`). This route will also be the target for `emailRedirectTo` from magic link.
- On request to the callback URL with tokens present:
  - **If using implicit flow (hash fragment)**: The callback page/route shall read `access_token` and `refresh_token` from the URL hash (e.g. `#access_token=...&refresh_token=...&type=magiclink`), call `supabase.auth.setSession({ access_token, refresh_token })`, then redirect to `/home`.
  - **If using PKCE / token_hash**: The callback shall read `token_hash` and `type` from the query (or body), call `supabase.auth.verifyOtp({ token_hash, type: 'email' })`, then redirect to `/home`.
- The callback shall use the same Supabase client pattern as the rest of the app (e.g. server-side `createClient()` from `@/lib/supabase/server` for route handlers, or a client component that runs in the browser to read hash and call `setSession`). If the tokens are in the hash, a client component or client-side script is required because the hash is not sent to the server.
- After setting the session, the system shall redirect to `/home` (or the configured post-login destination) and trigger a refresh so middleware and layout see the new session.
- If the callback URL is opened without valid tokens (e.g. expired link, wrong URL), the system shall show a friendly error and link back to `/login` (e.g. "Invalid or expired link. Please request a new sign-in link.").
- The exact callback path (e.g. `/auth/callback`) shall be added to Supabase **Redirect URLs** so Supabase allows redirecting there.

**Design note:** The app currently references `/auth/callback` for Google OAuth but does not yet implement this route. Implementing the callback for magic link will also prepare the app for Google OAuth; both can share the same route and handle hash vs query params as needed.

**Proof Artifacts:**

- Code: Callback route or page that reads tokens, sets session, redirects to `/home`.
- Screenshot or steps: User clicks magic link in email → lands on callback → is redirected to `/home` and is logged in.
- Note in README or deployment docs: Add the callback URL to Supabase Redirect URLs.

---

### Unit 3: Configuration and edge cases

**Purpose:** Ensure magic link works in all environments and handle common edge cases.

**Functional Requirements:**

- **Redirect URL**: The `emailRedirectTo` used in `signInWithOtp` shall be built with the same base URL as the rest of the app (e.g. `getUrl('/auth/callback')` in `actions` or `window.location.origin + '/auth/callback'` on client), and the production/staging callback URL shall be added to Supabase Auth → URL Configuration → Redirect URLs.
- **Existing user only**: Using `shouldCreateUser: false` ensures only users who already have an account receive a magic link; if the email is not found, Supabase does not create a new user. Optional: show a generic message like "If an account exists for this email, you’ll receive a sign-in link" to avoid leaking existence of accounts.
- **Rate limiting**: Supabase enforces one magic link per 60 seconds. If the user hits this, show the error returned by `signInWithOtp` (e.g. "Please wait a minute before requesting another link").
- **Expiry**: Magic links expire (default 1 hour). If the user clicks an expired link, the callback should detect invalid/expired tokens and show the "Invalid or expired link" message with a link to `/login`.

**Proof Artifacts:**

- Config or doc: Redirect URL for production/staging listed in Supabase.
- Copy: Success and error messages for "request link" and "invalid/expired link" defined.

## Non-Goals (Out of Scope)

1. **Custom magic link emails**: Using Supabase’s default magic link email template is sufficient; custom Resend templates for magic link are out of scope unless required later.
2. **Magic link for registration**: Only sign-in for existing users; new users must use the existing "Create account" (register) flow.
3. **Replacing password or forgot-password**: Password login and "Forgot your password?" remain; this is an additional option.
4. **OTP code entry**: We are not implementing the 6-digit OTP entry flow; only the "click link in email" (magic link) flow.

## Design Considerations

**Login page layout:**

- Add "Sign me in with a link" as a secondary action (e.g. link or outline button) so it’s visible but doesn’t compete with the primary "Sign In" button. Options:
  - Below the Sign In button: "Prefer to sign in with a link? We’ll email you one."
  - Or a link next to "Forgot your password?" e.g. "Email me a sign-in link instead."
- After the user requests a link, show an info alert: "Check your email for the sign-in link. It may take a minute to arrive."

**Callback:**

- Because the hash fragment is not sent to the server, the callback must run in the browser to read `#access_token` and `#refresh_token`. Options:
  - **Option A**: Callback is a page that loads a client component; the component reads `window.location.hash`, calls `setSession`, then `router.replace('/home')` and `router.refresh()`.
  - **Option B**: Server route that only redirects to a dedicated "confirming sign-in" page; that page (client) reads hash and completes sign-in. Prefer the simplest approach that matches the existing reset-password pattern (client reads hash and sets session).

**Consistency with reset-password:**

- The existing reset-password flow uses a client component that reads the hash and calls `setSession`. The magic link callback can follow the same pattern: client component on `/auth/callback` that parses hash (and optionally query for PKCE), sets session, redirects to `/home`.

## Dependencies

- Supabase project with Email auth enabled (already the case; magic link is part of email auth).
- Redirect URL for the callback added in Supabase Auth URL configuration (documented in this spec; no code dependency).

## Open Questions

1. **Exact copy**: Confirm final wording for "Sign me in with a link" and the success/error messages with product/copy.
2. **PKCE**: If the project uses PKCE for auth, the callback must use `verifyOtp` with `token_hash` from the query and possibly a custom magic link email template; confirm Supabase project auth settings.

## Summary

| Unit | Description                                                                                                                                                                  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Add "Sign me in with a link" on login page; call `signInWithOtp` with `emailRedirectTo` and `shouldCreateUser: false`; show success/error messages.                          |
| 2    | Implement auth callback route/page that reads tokens from URL (hash or query), sets session, redirects to `/home`, or shows "Invalid or expired link" with link to `/login`. |
| 3    | Document redirect URL in Supabase; handle rate limit and expiry in UI and callback.                                                                                          |
