import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useLazyVerifyPaymentQuery } from '@/services/estatesApi';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const PaymentVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifyPayment] = useLazyVerifyPaymentQuery();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | null>(null);

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (!reference || status !== 'idle') return;

    const run = async () => {
      setStatus('loading');
      try {
        const result = await verifyPayment(reference).unwrap();
        setStatus('success');
        setMessage(result.message || 'Payment verified successfully!');
        if (result.data?.amount) setPaidAmount(result.data.amount);

        const timer = setTimeout(() => navigate('/dashboard'), 3000);
        return () => clearTimeout(timer);
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.data?.message || 'Failed to verify payment. Please contact support.');
      }
    };

    run();
  }, [reference, status, verifyPayment, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Payment Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your payment...'}
            {status === 'success' && 'Payment confirmed!'}
            {status === 'error' && 'Verification failed'}
            {status === 'idle' && 'Processing...'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            {(status === 'idle' || status === 'loading') && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-600">Please wait while we confirm your payment...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-sm text-green-800">{message}</AlertDescription>
                </Alert>
                {paidAmount !== null && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                    <p className="text-3xl font-bold text-green-600">
                      ₦{(paidAmount / 100).toLocaleString()}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500">Redirecting to your dashboard in 3 seconds...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-sm text-red-800">{message}</AlertDescription>
                </Alert>
              </>
            )}
          </div>

          {status !== 'loading' && (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              {status === 'error' && reference && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => setStatus('idle')}
                >
                  Retry
                </Button>
              )}
            </div>
          )}

          {reference && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center">
                Reference: <span className="font-mono text-gray-700">{reference}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
