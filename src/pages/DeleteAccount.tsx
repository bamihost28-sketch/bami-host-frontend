import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteAccountMutation } from "@/services/authApi";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Check, X } from "lucide-react";

const REMOVED = [
  "Your name, email, phone number and profile photo",
  "Your uploaded ID document and signature image",
];
const RETAINED = [
  "Your signed tenancy agreement, kept as a legal record",
  "Payment and billing history, kept for accounting purposes",
];

const DeleteAccount = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = async () => {
    setError("");
    try {
      await deleteAccount({ password }).unwrap();
      setDone(true);
      logout();
    } catch (e: any) {
      setError(e?.data?.detail || "Could not delete your account. Please try again.");
      toast({ title: "Deletion failed", description: e?.data?.detail || "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 h-96 w-96 rounded-full bg-green-600/10 blur-3xl" />
      </div>

      <Navbar />

      <section className="relative container mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Delete Your Account
            </span>
          </h1>
          <p className="text-xl text-slate-300">
            Permanently delete your Bami Host account and personal data. This works whether you're a tenant, owner, manager or vendor.
          </p>
        </div>
      </section>

      <section className="relative container mx-auto px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 md:p-12 space-y-8">

              {done ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-400">
                    <Check className="w-6 h-6" />
                    <h2 className="text-xl font-bold text-white">Your account has been deleted</h2>
                  </div>
                  <p className="text-slate-300">
                    You've been signed out. If you change your mind, contact{" "}
                    <a href="mailto:support@bamihost.com" className="text-green-400 hover:underline">support@bamihost.com</a>.
                  </p>
                  <Link to="/"><Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Back to home</Button></Link>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-3 text-white">What this does</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">Removed</p>
                        <ul className="space-y-2">
                          {REMOVED.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                              <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Retained for legal &amp; accounting reasons</p>
                        <ul className="space-y-2">
                          {RETAINED.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                              <Check className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-200">
                      If you have a wallet balance, withdraw it first — deletion is blocked while funds remain. This action is permanent and cannot be undone.
                    </p>
                  </div>

                  {!user ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
                      <p className="text-slate-300">
                        Log in to delete your account directly. If you can't log in, email{" "}
                        <a href="mailto:support@bamihost.com" className="text-green-400 hover:underline">support@bamihost.com</a>{" "}
                        from your account's email address and we'll process the deletion for you.
                      </p>
                      <Link to="/login">
                        <Button className="bg-green-600 hover:bg-green-700 font-bold">Log in to continue</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-slate-300">Signed in as <span className="font-semibold text-white">{user.email}</span></p>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/10 border-white/10 placeholder:text-slate-400 text-white"
                      />
                      {error && <p className="text-sm text-red-400">{error}</p>}
                      {!confirming ? (
                        <Button
                          variant="destructive"
                          disabled={!password || isLoading}
                          onClick={() => setConfirming(true)}
                        >
                          Delete My Account
                        </Button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm text-slate-300">Are you sure? This can't be undone.</p>
                          <Button variant="destructive" disabled={isLoading} onClick={onSubmit}>
                            {isLoading ? "Deleting…" : "Yes, delete permanently"}
                          </Button>
                          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setConfirming(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DeleteAccount;
