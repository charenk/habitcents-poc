'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue to-light-blue">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-navy mb-6">
            Financial Wellness Made Simple
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your spending, identify subscriptions, and build better financial habits 
            with AI-powered insights designed for Canadians.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-navy hover:bg-navy/90 text-white px-8 py-4 text-lg"
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-navy text-navy hover:bg-navy hover:text-white px-8 py-4 text-lg"
            >
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-light-blue rounded-full w-fit mb-4">
                <DollarSign className="h-8 w-8 text-navy" />
              </div>
              <CardTitle>Smart Spending Tracking</CardTitle>
              <CardDescription>
                Connect your bank or upload statements to automatically track and categorize your expenses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-light-blue rounded-full w-fit mb-4">
                <TrendingUp className="h-8 w-8 text-navy" />
              </div>
              <CardTitle>Subscription Insights</CardTitle>
              <CardDescription>
                Discover recurring payments and subscriptions you might have forgotten about
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-light-blue rounded-full w-fit mb-4">
                <Shield className="h-8 w-8 text-navy" />
              </div>
              <CardTitle>Bank-Level Security</CardTitle>
              <CardDescription>
                Your financial data is encrypted and secure. We never store your banking credentials
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-navy text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to take control of your finances?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of Canadians who are building better financial habits with HabitCents
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white text-navy hover:bg-gray-100 px-8 py-4 text-lg"
            >
              <Link href="/signup">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
