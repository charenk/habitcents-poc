'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Upload, ArrowRight, CheckCircle } from 'lucide-react';

export default function OnboardingPage() {
  const [selectedMethod, setSelectedMethod] = useState<'plaid' | 'pdf' | null>(null);
  const router = useRouter();

  const handleMethodSelect = (method: 'plaid' | 'pdf') => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod === 'plaid') {
      router.push('/onboarding/connect-bank');
    } else if (selectedMethod === 'pdf') {
      router.push('/onboarding/upload-statement');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue to-light-blue p-4">
      <div className="max-w-md mx-auto pt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Welcome to HabitCents
          </h1>
          <p className="text-muted-foreground">
            Let's get started by connecting your financial data
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedMethod === 'plaid' 
                ? 'ring-2 ring-navy bg-navy text-white' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleMethodSelect('plaid')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-light-blue rounded-full">
                    <CreditCard className="h-6 w-6 text-navy" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Connect Bank Account</CardTitle>
                    <CardDescription className="text-sm">
                      Secure connection via Plaid
                    </CardDescription>
                  </div>
                </div>
                {selectedMethod === 'plaid' && (
                  <CheckCircle className="h-6 w-6 text-white" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  Recommended
                </Badge>
                <ul className="text-sm space-y-1">
                  <li>• Real-time transaction sync</li>
                  <li>• Automatic categorization</li>
                  <li>• Works with major Canadian banks</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedMethod === 'pdf' 
                ? 'ring-2 ring-navy bg-navy text-white' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleMethodSelect('pdf')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-light-blue rounded-full">
                    <Upload className="h-6 w-6 text-navy" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Upload Statement</CardTitle>
                    <CardDescription className="text-sm">
                      Upload PDF bank statements
                    </CardDescription>
                  </div>
                </div>
                {selectedMethod === 'pdf' && (
                  <CheckCircle className="h-6 w-6 text-white" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <ul className="text-sm space-y-1">
                  <li>• Upload PDF bank statements</li>
                  <li>• AI-powered transaction extraction</li>
                  <li>• Works with any bank</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className="w-full rounded-full bg-navy hover:bg-navy/90 text-white h-12 text-lg"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Your data is encrypted and secure. We never store your banking credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
