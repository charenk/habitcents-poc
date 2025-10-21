'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TransactionCard } from '@/components/dashboard/TransactionCard';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Plus,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Transaction, Subscription } from '@/types';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [unverifiedTransactions, setUnverifiedTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push('/login');
        return;
      }
      await loadData(user.id);
    };

    getUser();
  }, [router]);

  const loadData = async (userId: string) => {
    try {
      // Load transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (transactionsData) {
        setTransactions(transactionsData);
        setUnverifiedTransactions(transactionsData.filter(t => !t.is_verified));
      }

      // Load subscriptions
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('next_billing_date', { ascending: true });

      if (subscriptionsData) {
        setSubscriptions(subscriptionsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up', transactionId: string) => {
    if (direction === 'right') {
      // Confirm category
      await supabase
        .from('transactions')
        .update({ is_verified: true })
        .eq('id', transactionId);
      
      toast.success('Transaction confirmed!');
    } else if (direction === 'left') {
      // Skip transaction
      await supabase
        .from('transactions')
        .update({ is_verified: true })
        .eq('id', transactionId);
      
      toast.info('Transaction skipped');
    }

    // Move to next card
    setCurrentCardIndex(prev => prev + 1);
  };

  const handleCategoryChange = async (transactionId: string, category: string) => {
    await supabase
      .from('transactions')
      .update({ category, is_verified: true })
      .eq('id', transactionId);
    
    toast.success('Category updated!');
    setCurrentCardIndex(prev => prev + 1);
  };

  const calculateMonthlySpending = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               t.amount < 0;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const calculateSubscriptionCost = () => {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-blue to-light-blue flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue to-light-blue">
      {/* Header */}
      <div className="p-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy">
              Hi, {user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground">Welcome back to your financial dashboard</p>
          </div>
          <Button
            onClick={() => router.push('/onboarding')}
            size="sm"
            className="rounded-full bg-navy hover:bg-navy/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-navy" />
                <span className="text-sm font-medium text-muted-foreground">This Month</span>
              </div>
              <div className="text-2xl font-bold text-navy">
                ${calculateMonthlySpending().toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-navy" />
                <span className="text-sm font-medium text-muted-foreground">Subscriptions</span>
              </div>
              <div className="text-2xl font-bold text-navy">
                ${calculateSubscriptionCost().toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Review Section */}
        {unverifiedTransactions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <span>Review Transactions</span>
                <Badge variant="secondary">
                  {currentCardIndex + 1} of {unverifiedTransactions.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Swipe to categorize your transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64">
                {unverifiedTransactions.slice(currentCardIndex, currentCardIndex + 3).map((transaction, index) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onSwipe={handleSwipe}
                    onCategoryChange={handleCategoryChange}
                    isTop={index === 0}
                  />
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Swipe left to skip • Swipe right to confirm • Swipe up to edit</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Transactions</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/transactions')}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-light-blue rounded-full">
                      <DollarSign className="h-4 w-4 text-navy" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.merchant}</p>
                      <p className="text-xs text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions */}
        {subscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Subscriptions</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/subscriptions')}
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptions.slice(0, 3).map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-navy rounded-full">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{subscription.merchant}</p>
                        <p className="text-xs text-muted-foreground">
                          {subscription.frequency} • Next: {new Date(subscription.next_billing_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-navy">
                        ${subscription.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
