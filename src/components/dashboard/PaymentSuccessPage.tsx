import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVerifyPaymentQuery, useLazyDownloadPaymentReceiptQuery, useResendPaymentReceiptMutation } from '@/services/estatesApi';
import { CheckCircle2, XCircle, Loader2, Receipt, ArrowLeft, Home, Download, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

export const PaymentSuccessPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Paystack may return reference or trxref; support both
  const reference = params.get('reference') || params.get('trxref') || '';
  const { data, isLoading, isError, refetch } = useVerifyPaymentQuery(reference, { 
    skip: !reference
  });

  const [triggerDownload, { isFetching: isDownloading }] = useLazyDownloadPaymentReceiptQuery();
  const [resendEmail, { isLoading: isEmailing }] = useResendPaymentReceiptMutation();

  useEffect(() => {
    // If there is no reference in search params, try to parse from hash (fallback for some redirects)
    if (!reference) {
      const hashRef = new URLSearchParams(location.hash.replace(/^#\/?/, '')).get('reference') || 
                       new URLSearchParams(location.hash.replace(/^#\/?/, '')).get('trxref');
      if (hashRef) {
        navigate(`${location.pathname}?reference=${hashRef}`, { replace: true });
      }
    }
  }, [reference, location.hash, navigate, location.pathname]);

  if (!reference) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
            <CardTitle className="text-center">Missing Reference</CardTitle>
            <CardDescription className="text-center">
              We couldn't find a payment reference to verify.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard/overview')}>
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isVerified = data?.success;
  const paymentData = data?.data;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const paymentId = paymentData?._id || reference;
      const result = await triggerDownload(paymentId).unwrap();
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', result.filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Receipt download started." });
    } catch (error) {
      toast({ 
        title: "Download Failed", 
        description: "Could not generate PDF receipt. Please try printing instead.",
        variant: "destructive"
      });
    }
  };

  const handleEmail = async () => {
    try {
      const paymentId = paymentData?._id || reference;
      await resendEmail(paymentId).unwrap();
      toast({ title: "Email Sent", description: "Receipt has been resent to your email." });
    } catch (error) {
      toast({ 
        title: "Email Failed", 
        description: "Could not resend email receipt. Please try downloading instead.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 print:p-0 print:m-0 print:max-w-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 1cm; }
          body { background: white !important; }
          .print-center { display: flex !important; justify-content: center !important; width: 100% !important; }
        }
      `}} />
      <div className="print-center">
        <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden print:shadow-none print:border print:border-slate-200 print:w-[16cm]">
        <div className="bg-primary/5 py-3 px-6 border-b border-primary/10 flex justify-between items-center print:hidden">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Official Receipt
          </Badge>
          <span className="text-xs font-bold text-primary tracking-widest uppercase">BamiHost</span>
        </div>
        
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-6 print:hidden">
            {isLoading ? (
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Receipt className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            ) : isVerified ? (
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-full">
                <XCircle className="w-16 h-16 text-rose-600 dark:text-rose-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl text-center print:text-left print:mt-4">
            {isLoading ? 'Verifying Payment' : isVerified ? 'Payment Confirmed' : 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-center text-base mt-2 print:text-left">
            {isLoading 
              ? 'Please wait while we confirm your transaction with Paystack...' 
              : isVerified 
                ? 'Your payment has been confirmed and your records have been updated.' 
                : data?.message || 'We encountered an error while verifying your payment.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isVerified && paymentData && (
            <div className="bg-muted/50 rounded-lg p-6 space-y-4 border border-dashed border-muted-foreground/30 print:bg-white print:border-solid print:p-0 print:border-0">
              <div className="flex justify-between items-center pb-2 border-b border-muted">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Receipt No</span>
                <span className="font-mono font-bold text-primary">{paymentData.receiptNo || paymentData.reference || reference}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Amount Paid</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">₦{paymentData.amount?.toLocaleString() || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase">Status</p>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 print:hidden">Success</Badge>
                  <span className="hidden print:inline font-bold text-emerald-600 uppercase">Paid</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Tenant</p>
                  <p className="font-semibold">{paymentData.tenantName || 'Validated Tenant'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase">Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {paymentData.description && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Payment For</p>
                  <p className="text-sm italic text-muted-foreground bg-white/40 dark:bg-black/20 p-2 rounded print:bg-slate-50 print:p-0">
                    "{paymentData.description}"
                  </p>
                </div>
              )}
              
              <div className="hidden print:block pt-8 text-center border-t border-muted mt-8">
                <p className="text-[10px] text-muted-foreground">Thank you for your payment. This receipt is computer generated and does not require a physical signature.</p>
                <p className="text-xs font-bold mt-2 text-primary">BAMIHOST PROPERTY MANAGEMENT SYSTEM</p>
              </div>
            </div>
          )}

          {!isLoading && !isVerified && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md text-sm text-center">
              {isError 
                ? 'There was a network error during verification. Please try again.' 
                : 'The verification process is still in progress or the payment was not found.'}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-muted print:hidden">
          {isVerified && (
            <>
              <Button 
                variant="outline"
                className="w-full sm:flex-1 py-6 h-auto text-base border-primary/20 hover:bg-primary/5" 
                onClick={handlePrint}
              >
                <Receipt className="w-5 h-5 mr-2 text-primary" /> Print
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:flex-1 py-6 h-auto text-base border-primary/20 hover:bg-primary/5" 
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2 text-primary" />}
                Download PDF
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:flex-1 py-6 h-auto text-base border-primary/20 hover:bg-primary/5" 
                onClick={handleEmail}
                disabled={isEmailing}
              >
                {isEmailing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Mail className="w-5 h-5 mr-2 text-primary" />}
                Email Me
              </Button>
            </>
          )}
          <Button 
            className="w-full sm:flex-1 py-6 h-auto text-base" 
            onClick={() => navigate('/dashboard/overview')}
          >
            <Home className="w-5 h-5 mr-2" /> Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full sm:w-auto py-6 h-auto" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {(isError || (!isLoading && !isVerified)) && (
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto py-6 h-auto" 
              onClick={() => refetch()}
            >
              Retry
            </Button>
          )}
        </CardFooter>
        </Card>
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-8 print:hidden">
        Reference ID: {reference}
      </p>
    </div>
  );
};
