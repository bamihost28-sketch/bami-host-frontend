import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetAllEstatesOverviewQuery } from '@/services/estatesApi';
import { Building2, DoorOpen, Users, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';

export const EstateOverviewCards = () => {
    const { data, isLoading, isError } = useGetAllEstatesOverviewQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-32"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-16"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError || !data?.success) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm">Failed to load overview data</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Safely destructure with default values to prevent undefined errors
    const estates = data?.data?.estates ?? { totalEstates: 0, activeEstates: 0 };
    const units = data?.data?.units ?? {
        totalUnits: 0,
        occupiedUnits: 0,
        vacantUnits: 0,
        maintenanceUnits: 0,
        reservedUnits: 0,
        occupancyRate: 0
    };
    const tenants = data?.data?.tenants ?? {
        totalActiveTenants: 0,
        dueSoon7Days: 0,
        dueSoon30Days: 0
    };
    const revenue = data?.data?.revenue ?? {
        last30Days: { amount: 0, transactionCount: 0 },
        last90Days: { amount: 0, transactionCount: 0 }
    };
    const payments = data?.data?.payments ?? {
        pendingCount: 0,
        completedLast30Days: 0
    };

    return (
        <div className="space-y-4">
            {/* Estates & Units */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            Estates
                        </CardTitle>
                        <CardDescription>Total & active</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estates.totalEstates}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {estates.activeEstates} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                            Units
                        </CardTitle>
                        <CardDescription>Occupancy status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{units.totalUnits}</div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                                {units.occupiedUnits} occupied
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {units.vacantUnits} vacant
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {(units?.occupancyRate ?? 0).toFixed(1)}% occupancy rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Tenants
                        </CardTitle>
                        <CardDescription>Active & due soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tenants.totalActiveTenants}</div>
                        <div className="flex flex-col gap-1 mt-2">
                            <p className="text-xs text-muted-foreground">
                                {tenants.dueSoon7Days} due in 7 days
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {tenants.dueSoon30Days} due in 30 days
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            Revenue
                        </CardTitle>
                        <CardDescription>Recent performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₦{(revenue?.last30Days?.amount ?? 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Last 30 days ({revenue?.last30Days?.transactionCount ?? 0} transactions)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Last 90 days: ₦{(revenue?.last90Days?.amount ?? 0).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            Payments
                        </CardTitle>
                        <CardDescription>Recent activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-lg font-semibold">{payments.pendingCount}</div>
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                            <div>
                                <div className="text-lg font-semibold">{payments.completedLast30Days}</div>
                                <p className="text-xs text-muted-foreground">Completed (30d)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Unit Status</CardTitle>
                        <CardDescription>Breakdown by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-muted-foreground">Maintenance:</span>
                                <span className="ml-1 font-semibold">{units.maintenanceUnits}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Reserved:</span>
                                <span className="ml-1 font-semibold">{units.reservedUnits}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
                        <CardDescription>Key metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Avg. revenue/transaction:</span>
                                <span className="font-semibold">
                                    ₦{(revenue?.last30Days?.transactionCount ?? 0) > 0
                                        ? Math.round((revenue?.last30Days?.amount ?? 0) / (revenue?.last30Days?.transactionCount ?? 1)).toLocaleString()
                                        : 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tenants per estate:</span>
                                <span className="font-semibold">
                                    {(estates?.totalEstates ?? 0) > 0
                                        ? Math.round((tenants?.totalActiveTenants ?? 0) / (estates?.totalEstates ?? 1))
                                        : 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
