import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle } from 'lucide-react';

/**
 * Shown at /wallet/verify — previously the Paystack callback handler.
 * Now just a friendly redirect since bank transfers are confirmed manually by admin.
 */
export const DepositVerification: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-14 w-14 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Transfer Instructions Sent</CardTitle>
          <CardDescription>
            Once your bank transfer is confirmed, admin will credit your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Transfers are typically confirmed within a few hours. Contact admin if you need urgent assistance.
          </p>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
