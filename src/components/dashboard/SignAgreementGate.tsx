import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useSignAgreementMutation } from "@/services/authApi";
import { SignatureField, type SignaturePadHandle } from "./shared/SignaturePad";
import { Loader, ShieldCheck } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  business_owner: "Business Owner",
  manager: "Manager",
  super_manager: "Manager",
  vendor: "Vendor",
  super_vendor: "Vendor",
};

export function SignAgreementGate() {
  const { user, token, login } = useAuth();
  const { toast } = useToast();
  const [signAgreement, { isLoading }] = useSignAgreementMutation();
  const [typedName, setTypedName] = useState(user?.name || "");
  const sigRef = useRef<SignaturePadHandle>(null);

  const roleLabel = ROLE_LABELS[user?.role || ""] || "team member";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedName.trim()) {
      toast({ title: "Type your full name", description: "Your typed name is required to sign.", variant: "destructive" });
      return;
    }
    if (!sigRef.current?.hasSignature()) {
      toast({ title: "Signature required", description: "Please draw your signature below.", variant: "destructive" });
      return;
    }

    try {
      const result = await signAgreement({
        typedName: typedName.trim(),
        signatureImage: sigRef.current.dataUrl(),
      }).unwrap();

      if (token) {
        login(token, { ...(user as any), ...result.user });
      }
      toast({ title: "Signed", description: "Thanks — your dashboard is now unlocked." });
    } catch (error: any) {
      toast({
        title: "Couldn't sign",
        description: error?.data?.detail || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle>Terms of Engagement</CardTitle>
          </div>
          <CardDescription>
            Before you can access your {roleLabel} dashboard, please read and sign the terms below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground mb-6">
            By signing below, I, <strong>{typedName.trim() || "the undersigned"}</strong>, acknowledge that I am
            joining BamiHost as a {roleLabel} and agree to carry out my role in good faith, in line with the
            responsibilities assigned to my account and any policies communicated to me by BamiHost. Detailed
            terms specific to my role will follow separately.
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="typedName">Type your full name to sign</Label>
              <Input
                id="typedName"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>

            <SignatureField
              padRef={sigRef}
              label="Draw your signature"
              required
              signed={false}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isLoading ? "Signing..." : "Sign and Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
