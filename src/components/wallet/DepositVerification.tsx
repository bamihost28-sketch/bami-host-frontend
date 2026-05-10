import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { usePaystackDeposit, useWallet } from '../../hooks/useWallet';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

type VerificationStatus = 'loading' | 'success' | 'error' | 'idle';

/**
 * Component to handle Paystack payment verification after redirect
 * Should be rendered at /wallet/verify route
 */
export const DepositVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyDeposit, isVerifying } = usePaystackDeposit();
  const { wallet } = useWallet();
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [message, setMessage] = useState<string>('');

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('error');
        setMessage('No payment reference found. Please try again.');
        return;
      }

      setStatus('loading');

      try {
        await verifyDeposit(reference);
        setStatus('success');
        setMessage('Payment verified successfully!');

        // Redirect to dashboard after 3 seconds
        const timer = setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

        return () => clearTimeout(timer);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error?.data?.message || 'Failed to verify payment. Please contact support.'
        );
      }
    };

    if (reference && status === 'idle') {
      verifyPayment();
    }
  }, [reference, verifyDeposit, navigate, status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Payment Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your payment...'}
            {status === 'success' && 'Payment verified!'}
            {status === 'error' && 'Verification failed'}
            {status === 'idle' && 'Processing...'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Icon & Message */}
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-600">Please wait while we verify your payment...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-sm text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
                {wallet && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">New Balance</p>
                    <p className="text-3xl font-bold text-green-600">
                      {wallet.currencySymbol}
                      {wallet.balance.toLocaleString()}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Redirecting to dashboard in 3 seconds...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-sm text-red-800">
                    {message}
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {status !== 'loading' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
              {status === 'error' && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/dashboard')}
                >
                  Try Again
                </Button>
              )}
            </div>
          )}

          {/* Payment Details */}
          {reference && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center">
                Reference ID: <span className="font-mono text-gray-700">{reference}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
