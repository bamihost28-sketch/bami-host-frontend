import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUSINESSES } from "@/data/consolidatedDemoData";
import { ExcavatorOperations } from "./ExcavatorOperations";
import { Truck, Settings, Calendar, TrendingUp, Wrench, DollarSign } from "lucide-react";

export const EquipmentManagement = () => {
  const [excavatorId, setExcavatorId] = useState<string | null>(null);
  const equipment = BUSINESSES.find(b => b.id === 'equipment');
  const assets = equipment?.assets || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'rented': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default' as const;
      case 'rented': return 'secondary' as const;
      case 'maintenance': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'tipper': return '🚛';
      case 'excavator': return '🚜';
      case 'self_loader': return '🏗️';
      case 'pipeline_welder': return '🔥';
      case 'sandblaster': return '💨';
      default: return '🚚';
    }
  };

  const calculateUtilization = (status: string) => {
    return status === 'rented' ? 100 : status === 'maintenance' ? 0 : 50;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipment Management</h1>
          <p className="text-muted-foreground">Manage tipper, excavator, self-loader, pipeline welding & sandblasting machine rentals</p>
        </div>
        <Button>Add Equipment</Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{equipment?.monthlyRevenue.toLocaleString()}</div>
            <div className="text-xs text-green-600">+15.4% growth rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{equipment?.netProfit.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              ROI: {equipment?.performance.roi}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <div className="text-xs text-muted-foreground">
              {assets.filter(a => a.status === 'available').length} available
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment?.performance.efficiency}%</div>
            <Progress value={equipment?.performance.efficiency} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Equipment Fleet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {assets.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">{getEquipmentIcon(item.type)}</span>
                  {item.model}
                </CardTitle>
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {item.status}
                </Badge>
              </div>
              <CardDescription className="capitalize">{item.type.replace(/_/g, ' ')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Daily Rate</span>
                  <span className="font-semibold">₦{item.dailyRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Revenue</span>
                  <span className="font-semibold">₦{item.monthlyRevenue.toLocaleString()}</span>
                </div>
                
                {item.status === 'rented' && (
                  <>
                    <div className="flex justify-between">
                      <span>Current Client</span>
                      <span className="text-blue-600">{item.currentClient}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rent End Date</span>
                      <span>{item.rentEndDate}</span>
                    </div>
                  </>
                )}

                {item.status === 'maintenance' && (
                  <div className="flex justify-between">
                    <span>Maintenance End</span>
                    <span className="text-red-600">{item.maintenanceEndDate}</span>
                  </div>
                )}

                {item.status === 'available' && (
                  <>
                    <div className="flex justify-between">
                      <span>Last Service</span>
                      <span>{item.lastService}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Service</span>
                      <span>{item.nextService}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilization</span>
                  <span>{calculateUtilization(item.status)}%</span>
                </div>
                <Progress value={calculateUtilization(item.status)} className="h-2" />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => item.type === 'excavator' && setExcavatorId(item.id)}
                >
                  {item.status === 'available' ? 'Book Now' : 'View Details'}
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Equipment</CardTitle>
            <CardDescription>Monthly revenue comparison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assets.map((item) => {
              const percentage = (item.monthlyRevenue / 1500000) * 100; // Total potential revenue
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.model}</span>
                    <span>₦{item.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Average Daily Rate</span>
                <span className="font-semibold">
                  ₦{Math.round(assets.reduce((sum, item) => sum + item.dailyRate, 0) / assets.length).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Monthly Potential</span>
                <span className="font-semibold">
                  ₦{assets.reduce((sum, item) => sum + item.monthlyRevenue, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fleet Utilization</span>
                <span className="font-semibold">75%</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance Cost</span>
                <span className="font-semibold">₦{equipment?.monthlyExpenses.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Management */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Operations</CardTitle>
          <CardDescription>Detailed equipment management and scheduling</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fleet-overview" className="space-y-4">
            <TabsList className="dashboard-tabs-list">
              <TabsTrigger value="fleet-overview">Fleet Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
            </TabsList>

            <TabsContent value="fleet-overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Available Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {assets.filter(a => a.status === 'available').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Ready for booking</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Currently Rented</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {assets.filter(a => a.status === 'rented').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Generating revenue</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">In Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {assets.filter(a => a.status === 'maintenance').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Under servicing</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Booking Calendar</h3>
                <p className="text-muted-foreground">Schedule and manage equipment bookings</p>
                <Button className="mt-4">View Calendar</Button>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upcoming Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                          <span>Dangote Tipper</span>
                          <Badge variant="secondary">Due: Apr 5, 2024</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span>CAT Excavator</span>
                          <Badge variant="outline">Scheduled</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Maintenance History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span>Self Loader</span>
                          <Badge variant="default">Completed</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last service: Jan 20, 2024
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clients" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">Construction Co.</div>
                          <div className="text-sm text-muted-foreground">CAT Excavator - Until Feb 15, 2024</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₦35,000/day</div>
                          <div className="text-sm text-green-600">Active</div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">View All Clients</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {excavatorId && (
        <ExcavatorOperations
          assetId={excavatorId}
          open
          onOpenChange={(o) => !o && setExcavatorId(null)}
        />
      )}
    </div>
  );
};
