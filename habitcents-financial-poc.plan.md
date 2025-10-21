# HabitCents Financial POC Implementation Plan

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Bank Integration**: Plaid API (focused on Canadian banks) + Manual PDF upload
- **AI**: OpenAI GPT-4 for PDF parsing and transaction categorization
- **Deployment**: Vercel
- **PDF Processing**: pdf-parse + OpenAI structured output

## Database Schema (Supabase)

### Tables
1. **users** (handled by Supabase Auth)
2. **connected_accounts**
   - id, user_id, plaid_access_token, plaid_item_id, institution_name, account_type, status, created_at
3. **transactions**
   - id, user_id, account_id, date, merchant, amount, description, category, confidence_score, is_verified, source (plaid/manual), created_at
4. **subscriptions**
   - id, user_id, merchant, amount, frequency (monthly/yearly), next_billing_date, status, detected_at
5. **habits**
   - id, user_id, name, category, target_reduction, current_count, potential_savings, status, created_at
6. **transaction_habits** (junction table)
   - id, transaction_id, habit_id

## Project Structure
```
/app
  /(auth)
    /login
    /signup
  /(dashboard)
    /dashboard
    /onboarding
      /connect-bank
      /upload-statement
    /transactions
    /subscriptions
    /habits
  /api
    /plaid
      /create-link-token
      /exchange-public-token
      /sync-transactions
    /upload-statement
    /categorize-transaction
    /detect-subscriptions
    /habits
/components
  /ui (shadcn components)
  /onboarding
  - ConnectionMethodSelector.tsx
  - PlaidLinkButton.tsx
  - PDFUploader.tsx
  /dashboard
  - TransactionCard.tsx (swipeable)
  - SubscriptionList.tsx
  - SpendingOverview.tsx
  - HabitTracker.tsx
/lib
 - supabase.ts
 - plaid.ts
 - openai.ts
 - pdf-parser.ts
 - subscription-detector.ts
/types
 - index.ts
```

## Implementation Steps

### Phase 1: Project Setup ✅ COMPLETED
- Initialize Next.js 14 with TypeScript and Tailwind CSS
- Install dependencies: @supabase/ssr, plaid, openai, pdf-parse, shadcn/ui, framer-motion, react-plaid-link
- Configure Supabase client with environment variables
- Set up shadcn/ui with mobile-first configuration
- Create Plaid account (free sandbox for Canadian banks)

### Phase 2: Authentication ✅ COMPLETED
- Create login/signup pages using Supabase Auth
- Implement protected route middleware
- Add user session management

### Phase 3: Database & Schema 🚧 NEXT PRIORITY
- Create Supabase tables with SQL migrations (including connected_accounts)
- Set up Row Level Security (RLS) policies
- Create database helper functions

### Phase 4: Onboarding Flow ✅ COMPLETED
- Build connection method selector (2 options: Connect Bank / Upload Statement)
- Create onboarding wizard with step indicator
- Route users based on their choice

### Phase 5: Plaid Integration (Option 1) ✅ COMPLETED
- Set up Plaid client in lib/plaid.ts
- Create API route for generating Plaid Link token with Canadian institutions
- Implement Plaid Link button component using react-plaid-link
- Build public token exchange endpoint
- Create transaction sync endpoint to fetch and store Plaid transactions
- Store encrypted access tokens in connected_accounts table
- Implement automatic transaction refresh (webhook or polling)

### Phase 6: PDF Upload & Processing (Option 2) ✅ COMPLETED
- Build file upload API route (`/api/upload-statement`)
- Implement pdf-parse to extract raw text
- Create OpenAI prompt for structured transaction extraction (JSON mode)
- Parse response and insert transactions into database (mark source as 'manual')
- Handle errors and validation

### Phase 7: Transaction Categorization ✅ COMPLETED
- Create unified OpenAI categorization service (works for both Plaid and manual transactions)
- Add confidence scores for uncertain categories
- Implement Tinder-style swipeable transaction card component:
  - Use **framer-motion** for gesture detection and animations
  - Card animations: drag, rotate on swipe, spring physics
  - **Swipe left**: Skip transaction (card exits left)
  - **Swipe right**: Confirm suggested category (card exits right)
  - **Swipe up**: Open category selector modal (card slides up)
  - Stack multiple cards with depth effect (scale and z-index)
  - Show visual feedback during drag (rotation, opacity, overlay)
- Build category selection modal with search and common categories
- Update transaction verification status in real-time
- Show progress indicator (e.g., "5 of 12 transactions to review")

### Phase 8: Subscription Detection 🚧 NEXT PRIORITY
- Build algorithm to detect recurring patterns (same merchant, similar amounts, frequency)
- Use OpenAI to validate and enhance detection
- Work across both Plaid and manual transactions
- Create subscription dashboard with list view
- Show next billing dates and total monthly/yearly cost

### Phase 9: Dashboard Overview ✅ COMPLETED
- Build mobile-first overview page showing:
  - Connected accounts status (if using Plaid)
  - Total spending (this month, last month)
  - Active subscriptions count and total cost
  - Recent transactions (last 10)
  - Quick stats with visual cards
- Use shadcn/ui Card, Badge components
- Implement responsive design with proper touch targets
- Add "Add more transactions" button (connects more banks or uploads more statements)

### Phase 10: Habit Tracking (Minimal) 🚧 NEXT PRIORITY
- Create habit selection interface (e.g., "Reduce coffee purchases")
- Link transactions to habits automatically
- Show current spending vs target
- Calculate and display potential savings
- Simple progress visualization

### Phase 11: Polish & Deploy 🚧 NEXT PRIORITY
- Add loading states and error handling
- Implement optimistic UI updates
- Add toast notifications
- Handle Plaid webhook for transaction updates
- Deploy to Vercel with environment variables
- Test with Plaid sandbox (Canadian banks) and real PDF statements

## Key Files Created ✅
1. **lib/plaid.ts** - Plaid client and configuration for Canadian institutions
2. **lib/openai.ts** - OpenAI client and prompts for PDF parsing and categorization
3. **lib/pdf-parser.ts** - PDF text extraction and chunking
4. **lib/subscription-detector.ts** - Pattern matching algorithm
5. **app/api/plaid/create-link-token/route.ts** - Generate Plaid Link token
6. **app/api/plaid/exchange-public-token/route.ts** - Exchange token and fetch transactions
7. **app/api/upload-statement/route.ts** - PDF upload and processing endpoint
8. **components/onboarding/PlaidLinkButton.tsx** - Plaid Link integration
9. **components/dashboard/TransactionCard.tsx** - Swipeable card with gesture handling
10. **app/(dashboard)/dashboard/page.tsx** - Main dashboard overview

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox
NEXT_PUBLIC_PLAID_ENV=sandbox
```

## Plaid Configuration
- **Environment**: Sandbox (free for testing)
- **Products**: Transactions
- **Countries**: Canada (CA)
- **Supported Canadian Banks**: TD, RBC, Scotiabank, BMO, CIBC (available in sandbox)

## Design Approach

### Color System (Based on Design Inspiration)
```css
Primary Navy: #1a1f3a (dark sections, headers, premium cards)
Light Blue: #7dd3fc (interactive elements, current state badges)
Sky Blue: #bae6fd (card backgrounds, hover states)
White/Off-white: #ffffff / #f8fafc (main background)
Gray: #64748b (secondary text)
Dark Text: #0f172a (headings, primary text)
Success Green: #10b981 (positive savings)
Warning Red: #ef4444 (spending alerts)
```

### Visual Design Language
- **Card Style**: Large rounded corners (24px), soft shadows (shadow-lg), floating appearance
- **Illustrations**: Line-art style isometric illustrations for empty states and feature highlights
- **Typography**: Bold headings (font-weight: 700), modern sans-serif (Inter or similar)
- **Spacing**: Generous padding (p-6 to p-8), consistent gaps (gap-4 to gap-6)
- **Buttons**: Pill-shaped with rounded-full, light blue backgrounds for secondary, navy for primary

### Component Patterns
1. **Dashboard Cards**: Dual-tone sections (light blue top, navy bottom) showing different data states
2. **Transaction Items**: Merchant icon/avatar + name + amount + metadata in list format
3. **Status Badges**: Small circular badges with counts, light blue background
4. **Pricing/Plan Cards**: Full-bleed colored backgrounds with illustrations and clear CTAs
5. **Bottom Navigation**: Icon-based with labels, clean spacing
6. **Swipeable Cards**: Large, centered cards with smooth animations

### Mobile-First Specifications
- Touch targets: min 44px height
- Card padding: 24px (p-6)
- Border radius: 24px for cards, 9999px for pills
- Font sizes: 28px+ for headings, 16px for body, 14px for metadata
- Bottom nav height: 64px with safe area padding
- Smooth transitions: 200-300ms ease-in-out

### Key UI Components to Build
1. **Welcome Header**: "Hi, [Name]" with personalized greeting
2. **Stat Cards**: Two-section cards showing Send/Receive style stats (Income/Expenses)
3. **Subscription Cards**: Navy background with illustrations, white text, pill buttons
4. **Transaction List**: Colorful merchant icons, amount highlighting, swipe gestures
5. **Onboarding Wizard**: Centered cards with illustrations, clear CTAs
6. **Empty States**: Line-art illustrations with encouraging copy

## Current Status Summary

### ✅ COMPLETED (Ready for Testing)
- Project setup with all dependencies
- Authentication system (login/signup)
- Onboarding flow (Plaid vs PDF selection)
- Plaid integration API routes
- PDF upload and processing API
- Swipeable transaction cards with Framer Motion
- Mobile-first dashboard layout
- Custom design system matching inspiration
- Repository setup with GitHub

### 🚧 NEXT SESSION PRIORITIES
1. **Database Setup** - Create Supabase tables and RLS policies
2. **Environment Configuration** - Add API keys for testing
3. **PDF Testing** - Test with real bank statements
4. **Plaid Testing** - Test with sandbox accounts
5. **Subscription Detection** - Implement algorithm
6. **Habit Tracking** - Add minimal habit interface
7. **Error Handling** - Polish and add loading states

### 📋 IMMEDIATE NEXT STEPS
1. Set up Supabase database schema (SQL provided in README)
2. Configure environment variables
3. Test PDF upload with real bank statement
4. Test Plaid sandbox integration
5. Implement subscription detection algorithm
6. Add habit tracking interface
7. Deploy to Vercel for testing

## Repository
- **GitHub**: https://github.com/charenk/habitcents-poc
- **Current Branch**: main
- **Status**: Ready for continued development
