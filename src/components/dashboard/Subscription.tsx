import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Layout, Plus, Edit, Trash2, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import {
    useGetSubscriptionsQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useDeleteSubscriptionMutation,
    type Subscription
} from "@/services/subscriptionsApi";

export const Subscription = () => {
    const { data: subscriptionsData, isLoading, error } = useGetSubscriptionsQuery();
    const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
    const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation();
    const [deleteSubscription, { isLoading: isDeleting }] = useDeleteSubscriptionMutation();
    const { success, error: toastError } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        period: "month" as 'month' | 'year' | 'week' | 'day' | 'one-time',
        description: "",
        features: "",
        icon: "Layout (Frontend)" as 'Layout (Frontend)' | 'Server (Backend)',
        status: "Active" as 'Active' | 'Inactive',
        startDate: "",
        expiresAt: "",
    });

    const resetForm = () => {
        setFormData({
            name: "",
            price: "",
            period: "month",
            description: "",
            features: "",
            icon: "Layout (Frontend)",
            status: "Active",
            startDate: "",
            expiresAt: "",
        });
        setEditingId(null);
    };

    const handleOpenDialog = (subscription?: Subscription) => {
        if (subscription) {
            setEditingId(subscription._id ?? subscription.id ?? null);
            setFormData({
                name: subscription.name,
                price: subscription.price.toString(),
                period: subscription.billingPeriod,
                description: subscription.description || "",
                features: subscription.features.join("\n"),
                icon: subscription.icon || "Layout (Frontend)",
                status: subscription.status,
                startDate: subscription.startDate ? subscription.startDate.slice(0, 10) : "",
                expiresAt: subscription.expiresAt ? subscription.expiresAt.slice(0, 10) : "",
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toastError("Please enter a subscription name");
            return;
        }
        if (!formData.price.trim()) {
            toastError("Please enter a price");
            return;
        }

        const priceNum = parseFloat(formData.price.replace(/[^0-9.]/g, ''));
        if (isNaN(priceNum) || priceNum <= 0) {
            toastError("Please enter a valid price");
            return;
        }

        const featuresString = formData.features.trim();

        try {
            if (editingId) {
                await updateSubscription({
                    id: editingId,
                    payload: {
                        name: formData.name,
                        price: priceNum,
                        billingPeriod: formData.period,
                        description: formData.description,
                        features: featuresString,
                        icon: formData.icon,
                        status: formData.status,
                        startDate: formData.startDate || undefined,
                        expiresAt: formData.expiresAt || undefined,
                    }
                }).unwrap();
                success("Subscription updated successfully");
            } else {
                await createSubscription({
                    name: formData.name,
                    price: priceNum,
                    billingPeriod: formData.period,
                    description: formData.description,
                    features: featuresString,
                    icon: formData.icon,
                    status: formData.status,
                    startDate: formData.startDate || undefined,
                    expiresAt: formData.expiresAt || undefined,
                }).unwrap();
                success("Subscription added successfully");
            }
            handleCloseDialog();
        } catch (error: any) {
            toastError(error?.data?.message || "Failed to save subscription");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSubscription(id).unwrap();
            success("Subscription deleted successfully");
        } catch (error: any) {
            toastError(error?.data?.message || "Failed to delete subscription");
        }
    };

    const getIcon = (iconType?: 'Layout (Frontend)' | 'Server (Backend)' | null) => {
        if (!iconType || iconType === 'Layout (Frontend)') {
            return <Layout className="w-5 h-5" />;
        }
        return <Server className="w-5 h-5" />;
    };

    const formatPeriod = (period: string) => {
        if (period === 'one-time') return 'One-time';
        return period.charAt(0).toUpperCase() + period.slice(1);
    };

    const subscriptions = subscriptionsData?.data || [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Subscription Plans</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your hosting plans and subscription offerings.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Subscription" : "Add New Subscription"}</DialogTitle>
                            <DialogDescription>
                                {editingId ? "Update the subscription details below." : "Enter the details for your new subscription plan."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Plan Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Premium Hosting"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price *</Label>
                                    <Input
                                        id="price"
                                        placeholder="e.g., 10000"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="period">Billing Period</Label>
                                    <Select value={formData.period} onValueChange={(value: any) => setFormData({ ...formData, period: value })}>
                                        <SelectTrigger id="period">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="month">Monthly</SelectItem>
                                            <SelectItem value="year">Yearly</SelectItem>
                                            <SelectItem value="week">Weekly</SelectItem>
                                            <SelectItem value="day">Daily</SelectItem>
                                            <SelectItem value="one-time">One-time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Brief description of the plan"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="icon">Icon</Label>
                                    <Select value={formData.icon} onValueChange={(value: any) => setFormData({ ...formData, icon: value })}>
                                        <SelectTrigger id="icon">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Layout (Frontend)">Layout (Frontend)</SelectItem>
                                            <SelectItem value="Server (Backend)">Server (Backend)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expiresAt">Expiry Date</Label>
                                    <Input
                                        id="expiresAt"
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="features">Features (one per line)</Label>
                                <Textarea
                                    id="features"
                                    placeholder="Global CDN&#10;Unlimited Bandwidth&#10;DDoS Protection"
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    rows={5}
                                />
                                <p className="text-xs text-slate-500">Enter each feature on a new line</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
                                {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingId ? "Update" : "Add"} Plan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : error ? (
                <Card className="border-red-200 dark:border-red-900">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium text-slate-900 dark:text-white">Failed to load subscriptions</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please try again later</p>
                    </CardContent>
                </Card>
            ) : subscriptions.length > 0 ? (
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">All Subscription Plans</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            {subscriptions.length} plan{subscriptions.length !== 1 ? 's' : ''} configured
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                    <TableHead className="text-slate-700 dark:text-slate-300">Plan</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-300">Type</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-300">Price</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-300">Period</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-300">Start Date</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-300">Expires</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptions.map((subscription) => (
                                    <TableRow key={subscription._id ?? subscription.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <TableCell className="font-medium text-slate-900 dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${subscription.icon === 'Server (Backend)' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                                    {getIcon(subscription.icon)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{subscription.name}</div>
                                                    {subscription.description && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{subscription.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">
                                            {subscription.icon === 'Server (Backend)' ? 'Backend' : 'Frontend'}
                                        </TableCell>
                                        <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                                            ₦{subscription.price.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">
                                            {formatPeriod(subscription.billingPeriod)}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300 text-sm">
                                            {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : '—'}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300 text-sm">
                                            {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={subscription.status === 'Active' ? 'default' : 'secondary'} className={subscription.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700' : ''}>
                                                {subscription.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleOpenDialog(subscription)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                    onClick={() => handleDelete(subscription._id ?? subscription.id ?? '')}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-slate-500 dark:text-slate-400 text-center">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium text-slate-900 dark:text-white">No subscription plans yet</p>
                            <p className="text-sm mt-1">Click "Add Plan" to create your first subscription</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
