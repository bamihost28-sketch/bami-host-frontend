import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/providers/ToastProvider';
import { useGetTenantAgreementQuery, useLazyDownloadTenantAgreementQuery } from '@/services/agreementApi';
import { Download, Loader, FileSignature } from 'lucide-react';
import { useState } from 'react';

interface TenancyAgreementCardProps {
  tenantId?: string;
}

export const TenancyAgreementCard = ({ tenantId }: TenancyAgreementCardProps) => {
  const { toast } = useToast();
  const { data, isLoading } = useGetTenantAgreementQuery(tenantId as string, { skip: !tenantId });
  const [triggerDownload] = useLazyDownloadTenantAgreementQuery();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!tenantId) return;
    setDownloading(true);
    try {
      const result = await triggerDownload(tenantId).unwrap();
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Couldn't download", description: 'Try again in a moment.', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenancy Agreement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.signed || !data.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenancy Agreement</CardTitle>
          <CardDescription>What the tenant submitted when they signed their registration</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Not yet signed by the tenant.</p>
        </CardContent>
      </Card>
    );
  }

  const { registration, typedName, signatureImage, signedAt } = data.data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Tenancy Agreement</CardTitle>
          <CardDescription>
            Signed by {typedName} {signedAt ? `on ${new Date(signedAt).toLocaleDateString()}` : ''}
          </CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading}>
          {downloading ? <Loader className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
          Download PDF
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-muted-foreground">Address:</span> {registration.address || '—'}</div>
          <div><span className="text-muted-foreground">Occupation:</span> {registration.occupation || '—'}</div>
          {registration.employer && (
            <div><span className="text-muted-foreground">Employer:</span> {registration.employer}</div>
          )}
          <div><span className="text-muted-foreground">ID Type:</span> {registration.idType || '—'}</div>
          <div><span className="text-muted-foreground">ID Number:</span> {registration.idNumber || '—'}</div>
          {registration.idDocumentUrl && (
            <div>
              <a href={registration.idDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                View uploaded ID
              </a>
            </div>
          )}
        </div>

        <div className="border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Next of Kin</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {registration.kinName || '—'}</div>
            <div><span className="text-muted-foreground">Relationship:</span> {registration.kinRelationship || '—'}</div>
            <div><span className="text-muted-foreground">Phone:</span> {registration.kinPhone || '—'}</div>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Witness</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {registration.witnessName || '—'}</div>
            <div><span className="text-muted-foreground">Relationship to Tenant:</span> {registration.witnessRelationship || '—'}</div>
            <div><span className="text-muted-foreground">Address:</span> {registration.witnessAddress || '—'}</div>
            <div><span className="text-muted-foreground">Occupation:</span> {registration.witnessOccupation || '—'}</div>
            {registration.witnessPhone && (
              <div><span className="text-muted-foreground">Phone:</span> {registration.witnessPhone}</div>
            )}
          </div>
        </div>

        <div className="border-t pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Tenant's Signature</p>
            {signatureImage && <img src={signatureImage} alt="Tenant signature" className="h-14 border rounded bg-white" />}
            <p className="text-sm italic mt-1 flex items-center gap-1">
              <FileSignature className="h-3.5 w-3.5" /> {typedName}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Witness's Signature</p>
            {registration.witnessSignatureImage && (
              <img src={registration.witnessSignatureImage} alt="Witness signature" className="h-14 border rounded bg-white" />
            )}
            <p className="text-sm italic mt-1">{registration.witnessTypedName || registration.witnessName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
