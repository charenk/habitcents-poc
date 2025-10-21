import { Transaction } from '@/types';
import { detectSubscriptions } from './openai';

export interface SubscriptionPattern {
  merchant: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  confidence: number;
  transactions: Transaction[];
  nextBillingDate: string;
}

export function detectRecurringPatterns(transactions: Transaction[]): SubscriptionPattern[] {
  const patterns: SubscriptionPattern[] = [];
  const merchantGroups = groupByMerchant(transactions);
  
  for (const [merchant, merchantTransactions] of Object.entries(merchantGroups)) {
    if (merchantTransactions.length < 2) continue;
    
    const pattern = analyzeMerchantPattern(merchant, merchantTransactions);
    if (pattern) {
      patterns.push(pattern);
    }
  }
  
  return patterns.sort((a, b) => b.confidence - a.confidence);
}

function groupByMerchant(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce((groups, transaction) => {
    const merchant = normalizeMerchantName(transaction.merchant);
    if (!groups[merchant]) {
      groups[merchant] = [];
    }
    groups[merchant].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
}

function normalizeMerchantName(merchant: string): string {
  return merchant
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function analyzeMerchantPattern(merchant: string, transactions: Transaction[]): SubscriptionPattern | null {
  // Sort transactions by date
  const sortedTransactions = transactions.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Check for amount consistency
  const amounts = sortedTransactions.map(t => Math.abs(t.amount));
  const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  const amountVariance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
  const amountConsistency = 1 - (Math.sqrt(amountVariance) / avgAmount);
  
  // Check for date intervals
  const intervals = calculateIntervals(sortedTransactions);
  const frequency = determineFrequency(intervals);
  
  // Calculate confidence based on consistency and frequency
  const confidence = (amountConsistency * 0.6) + (frequency.confidence * 0.4);
  
  if (confidence < 0.7) return null;
  
  // Calculate next billing date
  const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
  const nextBillingDate = calculateNextBillingDate(lastTransaction.date, frequency.type);
  
  return {
    merchant,
    amount: avgAmount,
    frequency: frequency.type,
    confidence,
    transactions: sortedTransactions,
    nextBillingDate,
  };
}

function calculateIntervals(transactions: Transaction[]): number[] {
  const intervals: number[] = [];
  
  for (let i = 1; i < transactions.length; i++) {
    const prevDate = new Date(transactions[i - 1].date);
    const currDate = new Date(transactions[i].date);
    const diffDays = Math.abs(currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    intervals.push(diffDays);
  }
  
  return intervals;
}

function determineFrequency(intervals: number[]): { type: 'monthly' | 'yearly'; confidence: number } {
  if (intervals.length === 0) return { type: 'monthly', confidence: 0 };
  
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  
  // Check for monthly pattern (25-35 days)
  if (avgInterval >= 25 && avgInterval <= 35) {
    const monthlyVariance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - 30, 2), 0
    ) / intervals.length;
    const monthlyConfidence = 1 - (Math.sqrt(monthlyVariance) / 30);
    
    return { type: 'monthly', confidence: Math.max(0, monthlyConfidence) };
  }
  
  // Check for yearly pattern (350-380 days)
  if (avgInterval >= 350 && avgInterval <= 380) {
    const yearlyVariance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - 365, 2), 0
    ) / intervals.length;
    const yearlyConfidence = 1 - (Math.sqrt(yearlyVariance) / 365);
    
    return { type: 'yearly', confidence: Math.max(0, yearlyConfidence) };
  }
  
  return { type: 'monthly', confidence: 0 };
}

function calculateNextBillingDate(lastTransactionDate: string, frequency: 'monthly' | 'yearly'): string {
  const lastDate = new Date(lastTransactionDate);
  const nextDate = new Date(lastDate);
  
  if (frequency === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }
  
  return nextDate.toISOString().split('T')[0];
}

// Enhanced subscription detection using AI
export async function detectSubscriptionsWithAI(transactions: Transaction[]): Promise<SubscriptionPattern[]> {
  try {
    const aiResults = await detectSubscriptions(
      transactions.map(t => ({
        merchant: t.merchant,
        amount: t.amount,
        date: t.date,
        description: t.description,
      }))
    );
    
    return aiResults.map(result => ({
      merchant: result.merchant,
      amount: result.amount,
      frequency: result.frequency,
      confidence: result.confidence,
      transactions: transactions.filter(t => 
        normalizeMerchantName(t.merchant) === normalizeMerchantName(result.merchant)
      ),
      nextBillingDate: calculateNextBillingDate(
        transactions[transactions.length - 1]?.date || new Date().toISOString(),
        result.frequency
      ),
    }));
  } catch (error) {
    console.error('Error in AI subscription detection:', error);
    // Fallback to rule-based detection
    return detectRecurringPatterns(transactions);
  }
}
