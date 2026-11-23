import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboardManagerMutation } from '@/services/authApi';
import { toast } from '@/components/ui/use-toast';
import { phoneOk, emailOk, credentialsNote } from '@/lib/onboarding';
import { UserPlus } from 'lucide-react';

export const ManagerOnboarding = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('');
    const [sendCredentials, setSendCredentials] = useState(true);

    const [onboardManager, { isLoading: onboarding }] = useOnboardManagerMutation();

    const handleSubmit = async () => {
        // Validation
        if (!name.trim()) {
            toast({ title: 'Name is required', variant: 'destructive' });
            return;
        }
        if (!phoneOk(phone)) {
            toast({ title: 'A phone number is required (at least 10 digits)', variant: 'destructive' });
            return;
        }
        if (email.trim() && !emailOk(email)) {
            toast({ title: 'Enter a valid email address, or leave it blank', variant: 'destructive' });
            return;
        }

        try {
            const result = await onboardManager({
                name: name.trim(),
                ...(email.trim() && { email: email.trim() }),
                phone: phone.trim(),
                ...(position.trim() && { position: position.trim() }),
                sendCredentials,
            }).unwrap();

            toast({
                title: 'Manager onboarded successfully',
                description: `Created account for ${result.data.name}. ${sendCredentials ? credentialsNote((result.data as any).credentials) : ''}`,
            });

            // Reset form
            setName('');
            setEmail('');
            setPhone('');
            setPosition('');
            setSendCredentials(true);
            setOpen(false);
        } catch (error: any) {
            toast({
                title: 'Failed to onboard manager',
                description: error?.data?.message || 'An error occurred',
                variant: 'destructive',
            });
        }
    };



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Onboard Manager
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Onboard Manager</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Basic Information */}
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g. John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email (optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="e.g. john.doe@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone number * (they sign in with it)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="e.g. +1234567890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                placeholder="e.g. Estate Manager"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Send Credentials Option */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="sendCredentials"
                            checked={sendCredentials}
                            onCheckedChange={(checked) => setSendCredentials(checked as boolean)}
                        />
                        <Label
                            htmlFor="sendCredentials"
                            className="text-sm font-normal cursor-pointer"
                        >
                            Send login credentials (by text message, and email if given)
                        </Label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={onboarding}>
                            {onboarding ? 'Creating...' : 'Create Manager'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
