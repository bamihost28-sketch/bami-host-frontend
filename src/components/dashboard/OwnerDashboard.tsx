import { useState } from "react";
import {
  Building,
  Users,
  Home,
  DollarSign,
  Wrench,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronRight,
  Download,
  CreditCard,
  Wallet,
  Receipt,
  Edit,
  UserPlus,
  FileCheck,
  Activity,
  ArrowUpRight,
  Zap,
  Droplets,
  Key,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OWNER_DEMO_DATA } from "@/data/demoData";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionsPanel } from "./TransactionsPanel";
import { AdminFeedbackPanel } from "./AdminFeedbackPanel";
import { formatCurrencyIntl as formatCurrency, formatDateNg as formatDate, getStatusColor } from "@/utils/propertyUtils";
import { PageHeader, StatCard, MetricGrid, SectionHeader } from "./DashboardPrimitives";

const ownerData = OWNER_DEMO_DATA;

function Sprinklers(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4"/><path d="M16 2v4"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M12 14v4"/><path d="M12 10v.01"/><path d="M12 18v.01"/>
    </svg>
  );
}

export const OwnerDashboard: React.FC = () => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [addTenantDialogOpen, setAddTenantDialogOpen] = useState(false);
  const [addMaintenanceDialogOpen, setAddMaintenanceDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");

  const totalUnits = ownerData.properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const occupiedUnits = ownerData.properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
  const vacantUnits = ownerData.properties.reduce((sum, p) => sum + p.vacantUnits, 0);
  const monthlyIncome = ownerData.properties.reduce((sum, p) => sum + p.monthlyRent, 0);
  const outstanding = ownerData.properties.reduce((sum, p) => sum + p.outstanding, 0);
  const pendingMaintenance = ownerData.maintenanceRequests.filter(m => m.status !== "completed").length;
  const expiringLeases = ownerData.leases.filter(l => l.status === "expiring_soon").length;

  const filteredTenants = selectedProperty === "all"
    ? ownerData.tenants
    : ownerData.tenants.filter(t => t.property === selectedProperty);

  const handleAddTenant = () => {
    toast({ title: "Success", description: "Tenant added successfully" });
    setAddTenantDialogOpen(false);
  };

  const handleApproveTenant = (tenantId: string) => {
    toast({ title: "Success", description: "Tenant approved" });
  };

  const handleRenewLease = (leaseId: string) => {
    toast({ title: "Success", description: "Lease renewed" });
  };

  const handleAssignTechnician = (requestId: string) => {
    toast({ title: "Success", description: "Technician assigned" });
    setAddMaintenanceDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="dashboard-tabs-list bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="tenants" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Tenants</TabsTrigger>
          <TabsTrigger value="finances" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Finance</TabsTrigger>
          <TabsTrigger value="leases" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Leases</TabsTrigger>
          <TabsTrigger value="maintenance" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Maint.</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Transactions</TabsTrigger>
          <TabsTrigger value="feedback" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Feedback</TabsTrigger>
        </TabsList>

        {/* 1. Property Overview */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageHeader
              title="Owner Dashboard"
              description="Property management control center"
              icon={Building}
            />
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-full sm:w-[200px] h-9">
                <SelectValue placeholder="Select Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {ownerData.properties.map(p => (
                  <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <MetricGrid cols={4}>
            <StatCard label="Total Units" value={totalUnits} icon={Building} variant="green" />
            <StatCard label="Occupied" value={occupiedUnits} icon={Users} variant="green" />
            <StatCard label="Vacant" value={vacantUnits} icon={Home} variant="red" />
            <StatCard label="Monthly Income" value={formatCurrency(monthlyIncome)} icon={DollarSign} variant="green" />
            <StatCard label="Outstanding" value={formatCurrency(outstanding)} icon={AlertCircle} variant="amber" />
            <StatCard label="Pending Repairs" value={pendingMaintenance} icon={Wrench} variant="amber" />
            <StatCard label="Expiring Leases" value={expiringLeases} icon={Calendar} variant="amber" />
            <StatCard label="Properties" value={ownerData.properties.length} icon={Activity} />
          </MetricGrid>

          <SectionHeader title="Recent Activities" />
          <div className="dash-card">
            <div className="space-y-2">
              {ownerData.recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === "payment" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                      activity.type === "maintenance" ? "bg-amber-100 dark:bg-amber-900/30" :
                      activity.type === "lease" ? "bg-blue-100 dark:bg-blue-900/30" :
                      "bg-purple-100 dark:bg-purple-900/30"
                    }`}>
                      {activity.type === "payment" ? <DollarSign className="h-4 w-4 text-emerald-600" /> :
                       activity.type === "maintenance" ? <Wrench className="h-4 w-4 text-amber-600" /> :
                       activity.type === "lease" ? <FileText className="h-4 w-4 text-blue-600" /> :
                       <UserPlus className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-semibold text-emerald-600 font-data">{formatCurrency(activity.amount)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* 2. Tenant Management */}
        <TabsContent value="tenants" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageHeader
              title="Tenant Management"
              description="Manage all tenants across properties"
              icon={Users}
            />
            <Button onClick={() => setAddTenantDialogOpen(true)} className="bg-primary hover:bg-primary/90 btn-interactive">
              <UserPlus className="h-4 w-4 mr-2" /> Add Tenant
            </Button>
          </div>

          <div className="dash-card">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tenants..." className="max-w-sm h-9 bg-muted/30 border-0 focus-visible:ring-1" />
            </div>
            <div className="space-y-2">
              {filteredTenants.map((tenant) => (
                <div key={tenant.id} className="p-4 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-sm font-display">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{tenant.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Home className="h-3 w-3" /> {tenant.unit}</span>
                          <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {tenant.property}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Rent: <span className="font-medium text-foreground font-data">{formatCurrency(tenant.rentAmount)}/mo</span></p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(tenant.rentStatus)}>
                        {tenant.rentStatus}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleApproveTenant(tenant.id)}>Approve</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleRenewLease(tenant.id)}>Renew</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="dash-card">
              <SectionHeader title="Emergency Contacts" />
              <div className="space-y-2">
                {filteredTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">{tenant.phone}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <Phone className="h-3 w-3 mr-1" /> Call
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-card">
              <SectionHeader title="KYC Documents" />
              <div className="space-y-2">
                {filteredTenants.slice(0, 3).map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">ID, Utility Bill, Passport</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:border-emerald-800">Verified</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 3. Rent & Financial Management */}
        <TabsContent value="finances" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageHeader
              title="Rent & Financial Management"
              description="Track income, expenses, and profits"
              icon={DollarSign}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="h-9 text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Report
              </Button>
              <Button variant="outline" className="h-9 text-xs">
                <Receipt className="h-3.5 w-3.5 mr-1.5" /> Invoice
              </Button>
            </div>
          </div>

          <MetricGrid cols={4}>
            <StatCard
              label="Monthly Income"
              value={formatCurrency(ownerData.financials.totalMonthlyIncome)}
              icon={TrendingUp}
              change={12}
              changeLabel="from last month"
              variant="green"
            />
            <StatCard
              label="Collected This Month"
              value={formatCurrency(ownerData.financials.collectedThisMonth)}
              icon={CheckCircle}
              variant="green"
            />
            <StatCard
              label="Outstanding"
              value={formatCurrency(ownerData.financials.outstandingBalance)}
              icon={AlertCircle}
              variant="amber"
            />
            <StatCard
              label="Net Profit"
              value={formatCurrency(ownerData.financials.profit)}
              icon={TrendingUp}
              variant="green"
            />
          </MetricGrid>

          <SectionHeader title="Rent Collection Overview" />
          <div className="dash-card">
            <div className="space-y-2">
              {filteredTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground">{tenant.unit} - {tenant.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground font-data">{formatCurrency(tenant.rentAmount)}</p>
                    <p className="text-xs text-muted-foreground">Last paid: {tenant.lastPayment ? formatDate(tenant.lastPayment) : "N/A"}</p>
                  </div>
                  <Badge className={getStatusColor(tenant.rentStatus)}>{tenant.rentStatus}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="dash-card">
              <SectionHeader title="Service Charges Collected" />
              <p className="text-2xl font-bold text-foreground font-display">{formatCurrency(ownerData.financials.serviceCharges)}</p>
              <p className="text-xs text-muted-foreground mt-1">Monthly service charges</p>
            </div>
            <div className="dash-card">
              <SectionHeader title="Monthly Expenses" />
              <p className="text-2xl font-bold text-destructive font-display">{formatCurrency(ownerData.financials.expenses)}</p>
              <p className="text-xs text-muted-foreground mt-1">Maintenance, security, utilities</p>
            </div>
          </div>
        </TabsContent>

        {/* 4. Lease Management */}
        <TabsContent value="leases" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageHeader
              title="Lease Management"
              description="Digital lease agreements and renewals"
              icon={FileText}
            />
            <Button className="bg-primary hover:bg-primary/90 btn-interactive">
              <Plus className="h-4 w-4 mr-2" /> Create New Lease
            </Button>
          </div>

          <div className="dash-card">
            <SectionHeader title="Active Leases" />
            <div className="space-y-2">
              {ownerData.leases.map((lease) => (
                <div key={lease.id} className="p-4 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{lease.tenant}</p>
                      <p className="text-xs text-muted-foreground">{lease.unit} - {lease.property}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                      </p>
                      <p className="text-sm font-semibold text-foreground font-data">{formatCurrency(lease.monthlyRent)}/mo</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(lease.status)}>{lease.status.replace(/_/g, " ")}</Badge>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <FileText className="h-3 w-3 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <Edit className="h-3 w-3 mr-1" /> Renew
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SectionHeader title="Lease Expiry Reminders" />
          <div className="space-y-2">
            {ownerData.leases.filter(l => l.status === "expiring_soon").map((lease) => (
              <div key={lease.id} className="dash-card flex items-center justify-between border-l-4 border-l-amber-400">
                <div>
                  <p className="font-medium text-foreground">{lease.tenant}</p>
                  <p className="text-xs text-muted-foreground">Expires: {formatDate(lease.endDate)}</p>
                </div>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                  Send Reminder
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 5. Maintenance Management */}
        <TabsContent value="maintenance" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageHeader
              title="Maintenance Management"
              description="Track and assign repair requests"
              icon={Wrench}
            />
            <Button onClick={() => setAddMaintenanceDialogOpen(true)} className="bg-primary hover:bg-primary/90 btn-interactive">
              <Plus className="h-4 w-4 mr-2" /> New Request
            </Button>
          </div>

          <MetricGrid cols={3}>
            <StatCard
              label="Pending"
              value={ownerData.maintenanceRequests.filter(m => m.status === "pending").length}
              icon={Clock}
              variant="amber"
            />
            <StatCard
              label="In Progress"
              value={ownerData.maintenanceRequests.filter(m => m.status === "in_progress").length}
              icon={Zap}
            />
            <StatCard
              label="Completed"
              value={ownerData.maintenanceRequests.filter(m => m.status === "completed").length}
              icon={CheckCircle}
              variant="green"
            />
          </MetricGrid>

          <SectionHeader title="Maintenance Requests" />
          <div className="dash-card">
            <div className="space-y-2">
              {ownerData.maintenanceRequests.map((request) => (
                <div key={request.id} className="p-4 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        request.status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                        request.status === "in_progress" ? "bg-blue-100 dark:bg-blue-900/30" :
                        "bg-amber-100 dark:bg-amber-900/30"
                      }`}>
                        {request.category === "plumbing" ? (
                          <Droplets className="h-4 w-4 text-blue-600" />
                        ) : request.category === "electrical" ? (
                          <Zap className="h-4 w-4 text-amber-600" />
                        ) : request.category === "security" ? (
                          <Key className="h-4 w-4 text-slate-600" />
                        ) : (
                          <Wrench className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{request.issue}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.unit} &bull; {request.tenant} &bull; {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {request.estimatedCost && (
                          <p className="text-sm font-medium text-foreground font-data">
                            Est: {formatCurrency(request.estimatedCost)}
                          </p>
                        )}
                        {request.assignedTo && (
                          <p className="text-xs text-muted-foreground">
                            Assigned: {request.assignedTo}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      {request.status !== "completed" && (
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleAssignTechnician(request.id)}>
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="mt-6">
          <TransactionsPanel
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        {/* Tenant Feedback */}
        <TabsContent value="feedback" className="mt-6">
          <AdminFeedbackPanel />
        </TabsContent>
      </Tabs>

      {/* Add Tenant Dialog */}
      <Dialog open={addTenantDialogOpen} onOpenChange={setAddTenantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="tenant-name">Full Name</Label>
              <Input id="tenant-name" placeholder="Enter tenant name" />
            </div>
            <div>
              <Label htmlFor="tenant-email">Email</Label>
              <Input id="tenant-email" placeholder="Enter email" type="email" />
            </div>
            <div>
              <Label htmlFor="tenant-phone">Phone</Label>
              <Input id="tenant-phone" placeholder="Enter phone number" />
            </div>
            <div>
              <Label htmlFor="tenant-property">Property</Label>
              <Select>
                <SelectTrigger id="tenant-property"><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {ownerData.properties.map(p => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tenant-unit">Unit/Apartment</Label>
              <Input id="tenant-unit" placeholder="Enter unit number" />
            </div>
            <div>
              <Label htmlFor="tenant-rent">Monthly Rent</Label>
              <Input id="tenant-rent" placeholder="Enter rent amount" type="number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTenantDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTenant}>Add Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
