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
- [ ] Move upcoming events data to database
- [ ] Link sponsor button to /sponsor page (currently points to Google Form)
  - Need to have a meeting with the pre weekend couple to understand the ideal flow for how the system can help facilitate candidate sponsorship.
  - The system needs to host all the forms and flow so that we know who the candidate is and can track whether or not they have paid.
- [ ] Add user account actions dropdown menu
