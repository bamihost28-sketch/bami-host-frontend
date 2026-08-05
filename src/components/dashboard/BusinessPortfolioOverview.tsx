import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BUSINESSES } from '@/data/mockData';
import { Building, Fuel, Truck, Droplets } from "lucide-react";
import { useGetCarWashOverviewAllQuery } from "@/services/carWashApi";

export const BusinessPortfolioOverview = () => {
  const businesses = BUSINESSES;
  const { data: carWashOverview } = useGetCarWashOverviewAllQuery();
  const carWash = carWashOverview?.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Business Portfolio Overview
        </CardTitle>
        <CardDescription>Your business units performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Estate Business */}
          <Card className="financial-card">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Real Estate</span>
                </CardTitle>
                <Badge variant="default" className="flex-shrink-0 text-xs">₦18M/year</Badge>
              </div>
              <CardDescription className="text-xs sm:text-sm truncate">38 units across 3 locations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                <span className="font-semibold text-sm">₦{businesses[0]?.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Net Profit</span>
                <span className="font-semibold text-green-600 text-sm">₦{businesses[0]?.netProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ROI</span>
                <span className="font-semibold text-sm">{businesses[0]?.performance.roi}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Filling Station */}
          <Card className="financial-card">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
                  <Fuel className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Filling Station</span>
                </CardTitle>
                <Badge variant="secondary" className="flex-shrink-0 text-xs">4 Tanks</Badge>
              </div>
              <CardDescription className="text-xs sm:text-sm truncate">Fuel, offices, carwash, gas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                <span className="font-semibold text-sm">₦{businesses[1]?.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Net Profit</span>
                <span className="font-semibold text-green-600 text-sm">₦{businesses[1]?.netProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ROI</span>
                <span className="font-semibold text-sm">{businesses[1]?.performance.roi}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Rental */}
          <Card className="financial-card">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
                  <Truck className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Equipment</span>
                </CardTitle>
                <Badge variant="outline" className="flex-shrink-0 text-xs">3 Units</Badge>
              </div>
              <CardDescription className="text-xs sm:text-sm truncate">Tipper, excavator, loader</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                <span className="font-semibold text-sm">₦{businesses[2]?.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Net Profit</span>
                <span className="font-semibold text-green-600 text-sm">₦{businesses[2]?.netProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ROI</span>
                <span className="font-semibold text-sm">{businesses[2]?.performance.roi}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Bami-Wash — real data, not the mock BUSINESSES array */}
          <Card className="financial-card">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
                  <Droplets className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Bami-Wash</span>
                </CardTitle>
                <Badge variant="outline" className="flex-shrink-0 text-xs">
                  {carWash ? `${carWash.stations} Station${carWash.stations === 1 ? '' : 's'}` : '—'}
                </Badge>
              </div>
              <CardDescription className="text-xs sm:text-sm truncate">Car wash bookings & payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Revenue (30d)</span>
                <span className="font-semibold text-sm">₦{(carWash?.revenue30D ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Orders Today</span>
                <span className="font-semibold text-sm">{carWash?.ordersToday ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Open Tickets</span>
                <span className="font-semibold text-sm">{carWash?.openTickets ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
