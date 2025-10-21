'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { usePlaidLink } from 'react-plaid-link';
import { toast } from 'sonner';

export default function ConnectBankPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to create link token');
        }
        
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (err) {
        setError('Failed to initialize bank connection');
        console.error('Error creating link token:', err);
      } finally {
        setLoading(false);
      }
    };

    createLinkToken();
  }, []);

  const onSuccess = async (publicToken: string, metadata: any) => {
    try {
      const response = await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token: publicToken,
          institution_id: metadata.institution.institution_id,
          institution_name: metadata.institution.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect bank account');
      }

      toast.success('Bank account connected successfully!');
      router.push('/dashboard');
    } catch (err) {
      toast.error('Failed to connect bank account');
      console.error('Error exchanging public token:', err);
    }
  };

  const onExit = (err: any, metadata: any) => {
    if (err) {
      console.error('Plaid Link error:', err);
      toast.error('Bank connection was cancelled');
    }
  };

  const config = {
    token: linkToken,
    onSuccess,
    onExit,
  };

  const { open, ready } = usePlaidLink(config);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-blue to-light-blue flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-navy mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing bank connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-blue to-light-blue flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Connection Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue to-light-blue p-4">
      <div className="max-w-md mx-auto pt-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 p-0 text-navy hover:text-navy/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Connect Your Bank
          </h1>
          <p className="text-muted-foreground">
            Securely connect your Canadian bank account
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-light-blue rounded-full">
                <CreditCard className="h-6 w-6 text-navy" />
              </div>
              <div>
                <CardTitle className="text-lg">Supported Banks</CardTitle>
                <CardDescription>
                  Connect with major Canadian banks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="secondary" className="justify-center">TD Bank</Badge>
              <Badge variant="secondary" className="justify-center">RBC</Badge>
              <Badge variant="secondary" className="justify-center">Scotiabank</Badge>
              <Badge variant="secondary" className="justify-center">BMO</Badge>
              <Badge variant="secondary" className="justify-center">CIBC</Badge>
              <Badge variant="secondary" className="justify-center">Tangerine</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-light-blue rounded-full">
                <Shield className="h-6 w-6 text-navy" />
              </div>
              <div>
                <CardTitle className="text-lg">Security & Privacy</CardTitle>
                <CardDescription>
                  Your data is protected
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Bank-level encryption</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>We never store your credentials</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Read-only access to transactions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>You can disconnect anytime</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Button
          onClick={() => open()}
          disabled={!ready}
          className="w-full rounded-full bg-navy hover:bg-navy/90 text-white h-12 text-lg"
        >
          {ready ? 'Connect Bank Account' : 'Loading...'}
        </Button>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            By connecting your account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
