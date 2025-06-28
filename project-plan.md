# Dusty Trails Tres Dias (DTTD) - Project Plan

## Project Overview

**Dusty Trails Tres Dias** is a Christian community management platform designed to facilitate spiritual renewal weekends and ongoing fellowship. The application serves as a comprehensive portal for managing the entire candidate journey from sponsorship through weekend participation.

### Mission

To strengthen individuals' walk with Christ through spiritual renewal weekends and community fellowship. This website should help make the management of each weekend easier.

## Technology Stack

### Frontend

- **Framework**: Next.js 15.3.2 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v7.1.0
- **Styling**: Tailwind CSS v4
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: TanStack React Query v4

### Backend & Infrastructure

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe
- **Email Service**: Resend
- **Logging**: Pino
- **Deployment**: Vercel

## Business Terminology

### Core Concepts

#### Weekend Event

- **Definition**: 72-hour spiritual renewal event
- **Frequency**: Twice per year
- **Format**: Separate men's and women's weekends, one week apart
- **Naming**: Sequential numbering (e.g., "DTTD #10 - Mens")
- **Capacity**: 42 candidate spots per weekend

#### Candidate

- **Definition**: Guest participant in a weekend event
- **Requirements**: Must have existing relationship with God
- **Process**: Requires sponsorship and approval

#### Sponsor

- **Definition**: Community member who nominates a candidate
- **Role**: Initiates candidate application process
- **Requirements**: Must be verified community member

#### Pre-Weekend Couple

- **Definition**: Weekend organizers managing candidate approval
- **Responsibilities**:
  - Review sponsorship requests
  - Contact candidates for additional information
  - Send candidate forms
  - Manage weekend preparation

## Business Processes

### User Management

#### Authentication Flow

1. **Invitation-Only Access**

   - New members added through invitation system
   - First login creates community membership record

2. **Permission System** (Current Implementation)
   - **FULL_ACCESS**: Complete system access
   - **READ_MEDICAL_HISTORY**: Access to medical information
   - **FILES_UPLOAD**: Can upload files
   - **FILES_DELETE**: Can delete files
   - **Basic Access**: Standard community member access

**Note**: Invite flow implementation is pending. Role-based system planned for future implementation.

### Candidate Sponsorship Process

#### Step 1: Initial Nomination

1. **Sponsor Action**

   - Submit nomination form with sponsor and candidate details
   - Required fields: Sponsor information, basic candidate information
   - Data stored in `sponsorship_request` table

2. **Pre-Weekend Review**
   - Pre-weekend couple evaluates nomination
   - Decision: Approve for candidate contact or reject
   - Email notification sent to sponsor

#### Step 2: Candidate Forms

1. **Form Distribution**
   - Email sent to candidate with required forms
   - Email notification sent to sponsor
   - Forms completion required for spot confirmation
   - **Note**: Candidate forms implementation pending

#### Step 3: Payment Processing

1. **Payment Request**
   - Payment request email sent to payment_owner
   - Email contains callback link to website payment page with candidate ID
   - Payment required for final spot confirmation
   - Integrated with Stripe payment system
   - **Note**: Payment request email flow implementation pending

### Weekend Management

#### Event Planning

1. **Scheduling**

   - Bi-annual event planning
   - Gender-separated events
   - Sequential scheduling (one week apart)

2. **Capacity Management**
   - 42 candidate spots per event
   - First-come, first-served registration
   - Waitlist system for overflow

**Note**: Weekend creation/management functionality to be implemented

## Technical Requirements

### Data Models

#### User Model (Current Implementation)

```typescript
interface User {
  id: string
  permissions: string[]
}
```

#### Sponsorship Request Model

```typescript
interface SponsorshipRequest {
  id: number
  candidate_name: string | null
  candidate_email: string | null
  sponsor_name: string | null
  sponsor_email: string | null
  sponsor_address: string | null
  sponsor_phone: string | null
  sponsor_church: string | null
  sponsor_weekend: string | null
  reunion_group: string | null
  contact_frequency: string | null
  church_environment: string | null
  home_environment: string | null
  social_environment: string | null
  work_environment: string | null
  god_evidence: string | null
  support_plan: string | null
  prayer_request: string | null
  payment_owner: string | null
  attends_secuela: string | null
  created_at: string
}
```

#### Candidate Model

```typescript
interface Candidate {
  id: string
  name: string | null
  email: string | null
  sponsor_name: string | null
  sponsor_email: string | null
  status: 'sponsored' | 'awaiting_forms' | 'pending_approval' | 'awaiting_payment' | 'confirmed' | 'rejected'
  weekend_id: string | null
  created_at: string
  updated_at: string
}
```

#### Weekend Model

```typescript
interface Weekend {
  id: string
  title: string | null
  number: number | null
  type: 'MENS' | 'WOMENS'
  start_date: string
  end_date: string
  created_at: string
}
```

---

**Note**: This project plan is a living document that guides development decisions and maintains alignment across the DTTD platform. Regular updates reflect evolving requirements and community needs.
