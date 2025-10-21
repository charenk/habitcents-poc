# HabitCents - Financial Wellness POC

A Next.js application that helps users understand their financial spending through AI-powered transaction analysis, subscription detection, and habit tracking.

## Features

- **Dual Data Import**: Connect Canadian banks via Plaid API or upload PDF statements
- **AI-Powered Analysis**: OpenAI GPT-4 for transaction categorization and subscription detection
- **Tinder-Style Interface**: Swipeable cards for transaction review and categorization
- **Subscription Detection**: Automatically identify recurring payments and subscriptions
- **Mobile-First Design**: Beautiful, responsive UI optimized for mobile devices
- **Real-time Dashboard**: Track spending, view subscriptions, and monitor financial habits

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Bank Integration**: Plaid API (Canadian banks)
- **AI**: OpenAI GPT-4
- **PDF Processing**: pdf-parse
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Plaid account (for bank integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habitcents-poc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Plaid Configuration
   PLAID_CLIENT_ID=your_plaid_client_id_here
   PLAID_SECRET=your_plaid_secret_here
   PLAID_ENV=sandbox
   NEXT_PUBLIC_PLAID_ENV=sandbox
   ```

4. **Set up Supabase database**
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Create tables
   CREATE TABLE connected_accounts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     plaid_access_token TEXT NOT NULL,
     plaid_item_id TEXT NOT NULL,
     institution_name TEXT NOT NULL,
     account_type TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'active',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     account_id UUID REFERENCES connected_accounts(id) ON DELETE SET NULL,
     date DATE NOT NULL,
     merchant TEXT NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     description TEXT NOT NULL,
     category TEXT NOT NULL,
     confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
     is_verified BOOLEAN NOT NULL DEFAULT FALSE,
     source TEXT NOT NULL CHECK (source IN ('plaid', 'manual')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE subscriptions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     merchant TEXT NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'yearly')),
     next_billing_date DATE NOT NULL,
     status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused')),
     detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE habits (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     category TEXT NOT NULL,
     target_reduction INTEGER NOT NULL DEFAULT 0,
     current_count INTEGER NOT NULL DEFAULT 0,
     potential_savings DECIMAL(10,2) NOT NULL DEFAULT 0,
     status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE transaction_habits (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
     habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
     UNIQUE(transaction_id, habit_id)
   );

   -- Enable Row Level Security
   ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
   ALTER TABLE transaction_habits ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view their own connected accounts" ON connected_accounts
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own connected accounts" ON connected_accounts
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can view their own transactions" ON transactions
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own transactions" ON transactions
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own transactions" ON transactions
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view their own subscriptions" ON subscriptions
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can view their own habits" ON habits
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own habits" ON habits
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can view their own transaction habits" ON transaction_habits
     FOR SELECT USING (
       auth.uid() IN (
         SELECT user_id FROM transactions WHERE id = transaction_id
       )
     );

   CREATE POLICY "Users can insert their own transaction habits" ON transaction_habits
     FOR INSERT WITH CHECK (
       auth.uid() IN (
         SELECT user_id FROM transactions WHERE id = transaction_id
       )
     );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Users

1. **Sign Up**: Create an account using email and password
2. **Choose Data Source**: 
   - Connect your Canadian bank account via Plaid
   - Upload PDF bank statements for AI processing
3. **Review Transactions**: Use the swipeable interface to categorize transactions
4. **View Insights**: Monitor spending patterns and subscription costs
5. **Track Habits**: Set up financial habits and track potential savings

### For Developers

The application follows a modular structure:

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and API clients
- `/src/types` - TypeScript type definitions

Key components:
- `TransactionCard` - Swipeable transaction review interface
- `Dashboard` - Main financial overview page
- `Onboarding` - Data connection flow

## API Routes

- `POST /api/plaid/create-link-token` - Generate Plaid Link token
- `POST /api/plaid/exchange-public-token` - Exchange public token for access token
- `POST /api/upload-statement` - Process PDF bank statements

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to update your environment variables for production:
- Set `PLAID_ENV=production` for live bank connections
- Use production Supabase URL and keys
- Configure proper CORS settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@habitcents.com or create an issue in the repository.