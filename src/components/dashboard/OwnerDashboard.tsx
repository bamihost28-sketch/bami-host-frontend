import { useState } from "react";
import {
  Building,
  Users,
  Home,
  DollarSign,
  Wrench,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  ChevronRight,
  Download,
  CreditCard,
  Wallet,
  Receipt,
  Edit,
  Trash2,
  UserPlus,
  Key,
  FileCheck,
  AlertTriangle,
  Activity,
  PieChart,
  BarChart3,
  ArrowUpRight,
  Truck,
  Zap,
  Droplets,
  SprayCan,
  Lightbulb,
  CalendarDays,
  Send
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OWNER_DEMO_DATA } from "@/data/demoData";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionsPanel } from "./TransactionsPanel";
import { AdminFeedbackPanel } from "./AdminFeedbackPanel";
import { formatCurrencyIntl as formatCurrency, formatDateNg as formatDate, getStatusColor } from "@/utils/propertyUtils";

const ownerData = OWNER_DEMO_DATA;

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "plumbing": return Droplets;
    case "electrical": return Zap;
    case "ac_repair": return Sprinklers;
    case "security": return Shield;
    default: return Wrench;
  }
};

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

  // Calculate totals
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
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="finances">Finance</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="maintenance">Maint.</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* 1. Property Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Owner Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">Property management control center</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-[200px]">
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
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Units</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{totalUnits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Occupied</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{occupiedUnits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 p-2 rounded-lg">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Vacant</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{vacantUnits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-600 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Monthly Income</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(monthlyIncome)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 p-2 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Outstanding</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(outstanding)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-600 p-2 rounded-lg">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Pending Repairs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{pendingMaintenance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-600 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Expiring Leases</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{expiringLeases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Properties</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{ownerData.properties.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ownerData.recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === "payment" ? (
                      <DollarSign className="h-5 w-5 text-green-600" />
                    ) : activity.type === "maintenance" ? (
                      <Wrench className="h-5 w-5 text-orange-600" />
                    ) : activity.type === "lease" ? (
                      <FileText className="h-5 w-5 text-green-600" />
                    ) : (
                      <UserPlus className="h-5 w-5 text-purple-600" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{activity.description}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className="font-semibold text-green-600">{formatCurrency(activity.amount)}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Tenant Management */}
        <TabsContent value="tenants" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tenant Management</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage all tenants across properties</p>
            </div>
            <Button onClick={() => setAddTenantDialogOpen(true)} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 btn-interactive">
              <UserPlus className="h-4 w-4 mr-2" /> Add Tenant
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-500" />
                <Input placeholder="Search tenants..." className="max-w-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTenants.map((tenant) => (
                  <div key={tenant.id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-semibold">
                            {tenant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{tenant.name}</p>
                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1"><Home className="h-3 w-3" /> {tenant.unit}</span>
                              <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {tenant.property}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Rent: {formatCurrency(tenant.rentAmount)}/month</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Lease: {formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(tenant.rentStatus)}>
                          {tenant.rentStatus}
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleApproveTenant(tenant.id)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleRenewLease(tenant.id)}>Renew</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts & KYC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{tenant.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{tenant.phone}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" /> Call
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">KYC Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredTenants.slice(0, 3).map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{tenant.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID, Utility Bill, Passport</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">Verified</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. Rent & Financial Management */}
        <TabsContent value="finances" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rent & Financial Management</h2>
              <p className="text-slate-500 dark:text-slate-400">Track income, expenses, and profits</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Download Report
              </Button>
              <Button variant="outline">
                <Receipt className="h-4 w-4 mr-2" /> Generate Invoice
              </Button>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(ownerData.financials.totalMonthlyIncome)}</p>
                <p className="text-xs text-green-600 flex items-center"><ArrowUpRight className="h-3 w-3" /> +12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Collected This Month</p>
                <p className="text-2xl font-bold text-emerald-600 tracking-tight">{formatCurrency(ownerData.financials.collectedThisMonth)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(ownerData.financials.outstandingBalance)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Net Profit</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(ownerData.financials.profit)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Rent Collection Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{tenant.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{tenant.unit} - {tenant.property}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(tenant.rentAmount)}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Last paid: {tenant.lastPayment ? formatDate(tenant.lastPayment) : 'N/A'}</p>
                    </div>
                    <Badge className={getStatusColor(tenant.rentStatus)}>{tenant.rentStatus}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expense Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Service Charges Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(ownerData.financials.serviceCharges)}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Monthly service charges</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(ownerData.financials.expenses)}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Maintenance, security, utilities</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 4. Lease Management */}
        <TabsContent value="leases" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lease Management</h2>
              <p className="text-slate-500 dark:text-slate-400">Digital lease agreements and renewals</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> Create New Lease
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Active Leases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ownerData.leases.map((lease) => (
                  <div key={lease.id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{lease.tenant}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{lease.unit} - {lease.property}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(lease.monthlyRent)}/month</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(lease.status)}>{lease.status.replace(/_/g, ' ')}</Badge>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" /> Renew
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expiry Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Lease Expiry Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ownerData.leases.filter(l => l.status === "expiring_soon").map((lease) => (
                <div key={lease.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-800 dark:text-orange-200">{lease.tenant}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-300">Expires: {formatDate(lease.endDate)}</p>
                  </div>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    Send Reminder
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Maintenance Management */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Management</h2>
              <p className="text-slate-500 dark:text-slate-400">Track and assign repair requests</p>
            </div>
            <Button onClick={() => setAddMaintenanceDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> New Request
            </Button>
          </div>

          {/* Maintenance Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {ownerData.maintenanceRequests.filter(m => m.status === "pending").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {ownerData.maintenanceRequests.filter(m => m.status === "in_progress").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {ownerData.maintenanceRequests.filter(m => m.status === "completed").length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownerData.maintenanceRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${request.status === "completed" ? "bg-green-100" : request.status === "in_progress" ? "bg-blue-100" : "bg-yellow-100"}`}>
                        {request.category === "plumbing" ? (
                          <Droplets className="h-5 w-5 text-blue-600" />
                        ) : request.category === "electrical" ? (
                          <Zap className="h-5 w-5 text-yellow-600" />
                        ) : request.category === "security" ? (
                          <Key className="h-5 w-5 text-gray-600" />
                        ) : (
                          <Wrench className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{request.issue}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {request.unit} • {request.tenant} • {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {request.estimatedCost && (
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Est: {formatCurrency(request.estimatedCost)}
                          </p>
                        )}
                        {request.assignedTo && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Assigned: {request.assignedTo}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      {request.status !== "completed" && (
                        <Button size="sm" variant="outline" onClick={() => handleAssignTechnician(request.id)}>
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions">
          <TransactionsPanel
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        {/* Tenant Feedback */}
        <TabsContent value="feedback" className="space-y-6">
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
              <Label>Full Name</Label>
              <Input placeholder="Enter tenant name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input placeholder="Enter email" type="email" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="Enter phone number" />
            </div>
            <div>
              <Label>Property</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {ownerData.properties.map(p => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit/Apartment</Label>
              <Input placeholder="Enter unit number" />
            </div>
            <div>
              <Label>Monthly Rent</Label>
              <Input placeholder="Enter rent amount" type="number" />
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