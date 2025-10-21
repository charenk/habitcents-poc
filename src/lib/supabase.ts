import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database helper functions
export const db = {
  // Transactions
  async getTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscriptions
  async getSubscriptions(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createSubscription(subscription: Omit<Subscription, 'id' | 'detected_at'>) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Habits
  async getHabits(userId: string) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createHabit(habit: Omit<Habit, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('habits')
      .insert(habit)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Connected Accounts
  async getConnectedAccounts(userId: string) {
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async createConnectedAccount(account: Omit<ConnectedAccount, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('connected_accounts')
      .insert(account)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
