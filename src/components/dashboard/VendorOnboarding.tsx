import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { useOnboardVendorMutation } from '@/services/vendorsApi';
import { useGetManagersQuery } from '@/services/authApi';
import { useGetBusinessTypesQuery } from '@/services/businessTypesApi';
import { toast } from '@/components/ui/use-toast';
import { phoneOk, emailOk, credentialsNote } from '@/lib/onboarding';

export const VendorOnboarding = () => {
    const [open, setOpen] = useState(false);
    const [onboardVendor, { isLoading }] = useOnboardVendorMutation();
    const { data: managersData, isLoading: loadingManagers } = useGetManagersQuery();
    const { data: businessTypesData, isLoading: loadingBusinessTypes } = useGetBusinessTypesQuery({ activeOnly: true });

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [managerId, setManagerId] = useState('');
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('');
    const [businessTypeId, setBusinessTypeId] = useState('');
    const [sendCredentials, setSendCredentials] = useState(true);

    const managers = managersData?.data || [];
    const businessTypes = businessTypesData?.data || [];

    const resetForm = () => {
        setName('');
        setEmail('');
        setManagerId('');
        setPhone('');
        setPosition('');
        setBusinessTypeId('');
        setSendCredentials(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter vendor name',
                variant: 'destructive',
            });
            return;
        }

        if (!phoneOk(phone)) {
            toast({
                title: 'Validation Error',
                description: 'A phone number is required (at least 10 digits)',
                variant: 'destructive',
            });
            return;
        }

        // Email is optional, but must be valid if given
        if (email.trim() && !emailOk(email)) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a valid email address',
                variant: 'destructive',
            });
            return;
        }

        if (!managerId) {
            toast({
                title: 'Validation Error',
                description: 'Please select a manager',
                variant: 'destructive',
            });
            return;
        }

        try {
            const payload: any = {
                name: name.trim(),
                managerId,
                sendCredentials,
                phone: phone.trim(),
            };

            if (email.trim()) payload.email = email.trim();
            if (position.trim()) payload.position = position.trim();
            if (businessTypeId) payload.businessTypeId = businessTypeId;

            const result = await onboardVendor(payload).unwrap();

            toast({
                title: 'Vendor Onboarded Successfully',
                description: `${name} has been onboarded. ${sendCredentials ? credentialsNote((result.data as any)?.credentials) : ''}`,
            });

            resetForm();
            setOpen(false);
        } catch (error: any) {
            toast({
                title: 'Failed to Onboard Vendor',
                description: error?.data?.message || 'An error occurred while onboarding the vendor',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Onboard Vendor
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Onboard New Vendor</DialogTitle>
                    <DialogDescription>
                        Add a new vendor to the system. They sign in with their phone number and get their login by text message (and email, if you add one).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Required Fields */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., John Vendor"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email <span className="text-muted-foreground">(optional)</span></Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="e.g., john.vendor@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="managerId">
                                Assign Manager <span className="text-destructive">*</span>
                            </Label>
                            {loadingManagers ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading managers...
                                </div>
                            ) : (
                                <Select value={managerId} onValueChange={setManagerId}>
                                    <SelectTrigger id="managerId">
                                        <SelectValue placeholder="Select manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map((manager: any) => (
                                            <SelectItem key={manager._id} value={manager._id}>
                                                {manager.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {managers.length === 0 && !loadingManagers && (
                                <p className="text-xs text-muted-foreground">
                                    No managers available. Create a manager first.
                                </p>
                            )}
                        </div>

                        {/* Optional Fields */}
                        <div className="grid gap-2">
                            <Label htmlFor="businessType">Business Type</Label>
                            {loadingBusinessTypes ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading business types...
                                </div>
                            ) : (
                                <Select value={businessTypeId} onValueChange={setBusinessTypeId}>
                                    <SelectTrigger id="businessType">
                                        <SelectValue placeholder="Select business type (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {businessTypes.map((type: any) => (
                                            <SelectItem key={type._id} value={type._id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {businessTypes.length === 0 && !loadingBusinessTypes && (
                                <p className="text-xs text-muted-foreground">
                                    No business types available. Contact admin to create business types.
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone number <span className="text-destructive">*</span></Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="e.g., +1234567890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                placeholder="e.g., Maintenance Vendor"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                            />
                        </div>

                        {/* Send Credentials Checkbox */}
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="sendCredentials"
                                checked={sendCredentials}
                                onCheckedChange={(checked) => setSendCredentials(checked as boolean)}
                            />
                            <Label
                                htmlFor="sendCredentials"
                                className="text-sm font-normal cursor-pointer"
                            >
                                Send login credentials to the vendor
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                setOpen(false);
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isLoading ? 'Onboarding...' : 'Onboard Vendor'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
