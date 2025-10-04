# DTTD - Dusty Trails Tres Dias

Christian community management platform for spiritual renewal weekends.

## Quick Start

```bash
yarn install
yarn dev
```

## Environment Variables

Create `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
RESEND_API_KEY=your_resend_key
```

## Tech Stack

- Next.js 15 + TypeScript
- Supabase (Auth + Database)
- Stripe (Payments)
- ShadCN + Tailwind CSS

## TODOs

- [ ] Implement approval logic for candidates
- [ ] Implement rejection logic for candidates
- [ ] Add mens/womens column to candidate table
- [ ] Create delete user action
- [ ] Add user account actions dropdown menu
