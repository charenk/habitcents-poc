// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  plaid_access_token: string;
  plaid_item_id: string;
  institution_name: string;
  account_type: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  date: string;
  merchant: string;
  amount: number;
  description: string;
  category: string;
  confidence_score: number;
  is_verified: boolean;
  source: 'plaid' | 'manual';
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  merchant: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  next_billing_date: string;
  status: 'active' | 'cancelled' | 'paused';
  detected_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: string;
  target_reduction: number;
  current_count: number;
  potential_savings: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

export interface TransactionHabit {
  id: string;
  transaction_id: string;
  habit_id: string;
}

// API types
export interface PlaidLinkTokenResponse {
  link_token: string;
  expiration: string;
}

export interface PlaidExchangeTokenRequest {
  public_token: string;
  institution_id: string;
  institution_name: string;
}

export interface PDFUploadResponse {
  success: boolean;
  transaction_count: number;
  message: string;
}

export interface TransactionCategorizationRequest {
  transaction_id: string;
  category: string;
  confidence_score?: number;
}

// UI types
export interface SwipeDirection {
  x: number;
  y: number;
}

export interface CardSwipeAction {
  direction: 'left' | 'right' | 'up';
  transaction_id: string;
  category?: string;
}

// OpenAI types
export interface OpenAITransaction {
  date: string;
  merchant: string;
  amount: number;
  description: string;
  category: string;
  confidence_score: number;
}

export interface OpenAIPDFResponse {
  transactions: OpenAITransaction[];
  total_count: number;
  processing_notes: string;
}
