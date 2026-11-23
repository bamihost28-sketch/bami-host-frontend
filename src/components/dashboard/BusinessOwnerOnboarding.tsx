import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboardBusinessOwnerMutation } from '@/services/authApi';
import { useGetEstatesQuery } from '@/services/estatesApi';
import { toast } from '@/components/ui/use-toast';
import { phoneOk, emailOk, credentialsNote } from '@/lib/onboarding';
import { UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const BusinessOwnerOnboarding = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedEstateIds, setSelectedEstateIds] = useState<string[]>([]);
    const [sendCredentials, setSendCredentials] = useState(true);

    const { data: estatesPage, isLoading: estatesLoading } = useGetEstatesQuery({ page: 1, limit: 100 });
    const [onboardBusinessOwner, { isLoading: onboarding }] = useOnboardBusinessOwnerMutation();

    const estates = estatesPage?.data ?? [];

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
        if (selectedEstateIds.length === 0) {
            toast({ title: 'Please select at least one estate', variant: 'destructive' });
            return;
        }

        try {
            const result = await onboardBusinessOwner({
                name: name.trim(),
                ...(email.trim() && { email: email.trim() }),
                phone: phone.trim(),
                estateIds: selectedEstateIds,
                sendCredentials,
            }).unwrap();

            toast({
                title: 'Business owner onboarded successfully',
                description: `Created account for ${result.data.name}. ${sendCredentials ? credentialsNote((result.data as any).credentials) : ''}`,
            });

            // Reset form
            setName('');
            setEmail('');
            setPhone('');
            setSelectedEstateIds([]);
            setSendCredentials(true);
            setOpen(false);
        } catch (error: any) {
            toast({
                title: 'Failed to onboard business owner',
                description: error?.data?.message || 'An error occurred',
                variant: 'destructive',
            });
        }
    };

    const toggleEstate = (estateId: string) => {
        setSelectedEstateIds((prev) =>
            prev.includes(estateId)
                ? prev.filter((id) => id !== estateId)
                : [...prev, estateId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Onboard Business Owner
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Onboard Business Owner</DialogTitle>
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
                                placeholder="e.g. john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone number * (they sign in with it)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="e.g. +234XXXXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Estate Selection */}
                    <div className="grid gap-2">
                        <Label>Assign Estates *</Label>
                        <p className="text-sm text-muted-foreground">
                            Select estates to assign to this business owner
                        </p>
                        {estatesLoading ? (
                            <div className="text-sm text-muted-foreground">Loading estates...</div>
                        ) : estates.length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                                No estates available. Create an estate first.
                            </div>
                        ) : (
                            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                                <div className="space-y-3">
                                    {estates.map((estate) => (
                                        <div
                                            key={estate.id}
                                            className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                                            onClick={() => toggleEstate(estate.id)}
                                        >
                                            <Checkbox
                                                checked={selectedEstateIds.includes(estate.id)}
                                                onCheckedChange={() => toggleEstate(estate.id)}
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">{estate.name}</div>
                                                {estate.description && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {estate.description}
                                                    </div>
                                                )}
                                            </div>
                                            {typeof estate.totalUnits === 'number' && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {estate.totalUnits} units
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedEstateIds.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                                {selectedEstateIds.length} estate{selectedEstateIds.length !== 1 ? 's' : ''} selected
                            </div>
                        )}
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
                            {onboarding ? 'Creating...' : 'Create Business Owner'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
