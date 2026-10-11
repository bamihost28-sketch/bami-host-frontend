import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, Loader, XCircle } from 'lucide-react';
import { useVerifyPaystackMutation } from '@/services/estatesApi';

type View =
  | { kind: 'checking' }
  | { kind: 'success'; billPaid: boolean | null; billReason?: string }
  | { kind: 'pending'; message: string }
  | { kind: 'failed'; message: string };

/**
 * Landing page Paystack redirects to after checkout (/payment/verify?reference=…).
 * Asks the backend to confirm the payment with Paystack — never trusts the URL.
 */
export const PaymentVerify: React.FC = () => {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');
  const [verify] = useVerifyPaystackMutation();
  const [view, setView] = useState<View>({ kind: 'checking' });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!reference) {
      setView({ kind: 'failed', message: 'No payment reference was found.' });
      return;
    }
    verify(reference)
      .unwrap()
      .then(({ data }) => {
        if (data.status === 'completed') {
          setView({ kind: 'success', billPaid: data.bill ? data.bill.paid : null, billReason: data.bill?.reason });
        } else if (data.status === 'mismatch') {
          setView({ kind: 'failed', message: `The amount paid did not match. Contact support with reference ${reference}.` });
        } else {
          setView({ kind: 'pending', message: data.message || 'We have not received confirmation of this payment yet.' });
        }
      })
      .catch((e) => setView({ kind: 'failed', message: e?.data?.detail || e?.data?.message || 'We could not confirm this payment.' }));
  }, [reference, verify]);

  // Full reload so the dashboard shows the fresh wallet balance and bills.
  const backToDashboard = () => window.location.assign('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {view.kind === 'checking' && <Loader className="h-14 w-14 text-green-600 animate-spin" />}
            {view.kind === 'success' && <CheckCircle className="h-14 w-14 text-green-600" />}
            {view.kind === 'pending' && <Loader className="h-14 w-14 text-amber-500" />}
            {view.kind === 'failed' && <XCircle className="h-14 w-14 text-red-600" />}
          </div>
          <CardTitle className="text-2xl">
            {view.kind === 'checking' && 'Confirming your payment…'}
            {view.kind === 'success' && 'Payment successful'}
            {view.kind === 'pending' && 'Payment not confirmed yet'}
            {view.kind === 'failed' && 'Payment problem'}
          </CardTitle>
          <CardDescription>
            {view.kind === 'success' &&
              (view.billPaid === true
                ? 'Your bill has been paid.'
                : view.billPaid === false
                  ? `Your wallet has been credited, but the bill was not paid: ${view.billReason}. You can pay it from your wallet.`
                  : 'Your wallet has been credited.')}
            {(view.kind === 'pending' || view.kind === 'failed') && view.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={backToDashboard} disabled={view.kind === 'checking'}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
