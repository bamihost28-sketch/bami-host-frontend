import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Send,
  Shield,
  Key
} from "lucide-react";
import {
  useRequestOtpMutation,
  useResetPasswordWithOtpMutation
} from "@/services/authApi";

interface PasswordResetProps {
  onBack: () => void;
}

type ResetStep = 'request' | 'verify' | 'reset' | 'success';

export const ForgotPassword = ({ onBack }: PasswordResetProps) => {
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [requestOtp, { isLoading: isRequesting }] = useRequestOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordWithOtpMutation();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Please enter your email address or phone number");

    try {
      const response = await requestOtp({ email: email.trim() }).unwrap();
      if (response.success) {
        setStep('verify');
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.data?.detail || err.data?.message || "An error occurred. Please try again.");
    }
  };

  // The server checks the code when the new password is saved, so this step only collects it.
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) return setError("Please enter a valid 6-digit OTP");

    setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters");

    try {
      const response = await resetPassword({ email: email.trim(), code: otp, password: newPassword }).unwrap();
      if (response.success) {
        setStep('success');
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (err: any) {
      // a wrong or expired code is reported here, so send them back to re-enter it
      setError(err.data?.detail || err.data?.message || "An error occurred. Please try again.");
    }
  };

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-white/90 shadow-2xl border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been updated successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} className="w-full">
            Continue to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-white/90 shadow-2xl border-white/20">
      <CardHeader className="text-center">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${step === 'request' ? 'bg-blue-100' : step === 'verify' ? 'bg-orange-100' : 'bg-green-100'
          }`}>
          {step === 'request' ? <Lock className="h-8 w-8 text-blue-600" /> :
            step === 'verify' ? <Key className="h-8 w-8 text-orange-600" /> :
              <Shield className="h-8 w-8 text-green-600" />}
        </div>
        <CardTitle className="text-2xl">
          {step === 'request' ? "Forgot Password" :
            step === 'verify' ? "Verify OTP" :
              "Set New Password"}
        </CardTitle>
        <CardDescription>
          {step === 'request' ? "Enter your email address or phone number. We'll send a 6-digit code to your email, or by text message if you use a phone number." :
            step === 'verify' ? `Enter the 6-digit code we sent to ${email}` :
              "Choose a strong password for your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone Number</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="name@example.com or 08012345678"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isRequesting}
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full" disabled={isRequesting}>
                {isRequesting ? "Sending code..." : "Send Code"}
              </Button>
              <Button onClick={onBack} type="button" variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-bold"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full">
                Continue
              </Button>
              <Button onClick={() => setStep('request')} type="button" variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Use a different email or phone number
              </Button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isResetting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your details"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isResetting}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting ? "Updating Password..." : "Reset Password"}
              </Button>
              <Button onClick={() => setStep('verify')} type="button" variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to OTP
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

interface ResetPasswordFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const ResetPasswordForm = ({ onSuccess, onBack }: ResetPasswordFormProps) => {
  // This component is now partially handled by ForgotPassword's 3-step flow,
  // but we keep it here to support existing routing in LoginPage.tsx
  return (
    <div className="text-center p-8 bg-white/90 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <p className="text-muted-foreground mb-6">Please use the "Forgot Password" flow to reset your password via OTP.</p>
      <div className="space-y-3">
        <Button onClick={onBack} variant="outline" className="w-full">
          Back to Login
        </Button>
      </div>
    </div>
  );
};

export const PasswordResetSuccess = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-white/90 shadow-2xl border-white/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
        <CardDescription>
          Your password has been updated successfully
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your account is now secure. You can now log in using your new credentials.
          </AlertDescription>
        </Alert>

        <Button onClick={onContinue} className="w-full">
          Continue to Login
        </Button>
      </CardContent>
    </Card>
  );
};