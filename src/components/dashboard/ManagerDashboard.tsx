import { useState } from "react";
import {
  Building,
  Users,
  Home,
  Wrench,
  Clock,
  AlertCircle,
  Shield,
  UserCheck,
  UserPlus,
  FileText,
  DollarSign,
  Calendar,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  CheckCircle,
  XCircle,
  Truck,
  Zap,
  Droplets,
  Trash2,
  Activity,
  BarChart3,
  Download,
  Send,
  Bell,
  MessageSquare,
  Eye,
  Edit,
  Trash,
  ChevronRight,
  BadgeCheck,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  UserCog,
  ClipboardCheck,
  Megaphone,
  Lightbulb,
  Ticket,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Landmark
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
import { MANAGER_DEMO_DATA } from "@/data/demoData";
import { useToast } from "@/components/providers/ToastProvider";

const managerData = MANAGER_DEMO_DATA;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (date: string) => new Date(date).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
    case "active":
    case "completed":
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "pending":
    case "in_progress":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "overdue":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "expiring_soon":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "low":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [addMaintenanceDialogOpen, setAddMaintenanceDialogOpen] = useState(false);
  const [sendNoticeDialogOpen, setSendNoticeDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: "", method: "bank_transfer" });
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", description: "" });
  const [transferForm, setTransferForm] = useState({ amount: "", recipient: "", recipientAccount: "", bank: "", description: "" });

  const pendingMaintenance = managerData.maintenanceRequests.filter(m => m.status !== "completed").length;
  const pendingComplaints = managerData.complaints.filter(c => c.status !== "resolved").length;
  const todayVisitors = managerData.visitors.length;
  const paidRent = managerData.tenants.filter(t => t.rentStatus === "paid").length;
  const pendingRent = managerData.tenants.filter(t => t.rentStatus === "pending" || t.rentStatus === "overdue").length;

  const handleApproveVisitor = (visitorId: string) => {
    toast({ title: "Visitor Approved", description: "Access code sent" });
  };

  const handleAssignStaff = (requestId: string) => {
    toast({ title: "Staff Assigned", description: "Team member notified" });
    setAddMaintenanceDialogOpen(false);
  };

  const handleSendNotice = () => {
    toast({ title: "Notice Sent", description: "Broadcast sent to all tenants" });
    setSendNoticeDialogOpen(false);
  };

  const handleOpenDeposit = () => {
    setDepositForm({ amount: "", method: "bank_transfer" });
    setDepositDialogOpen(true);
  };

  const handleOpenWithdraw = () => {
    setWithdrawForm({ amount: "", description: "" });
    setWithdrawDialogOpen(true);
  };

  const handleOpenTransfer = () => {
    setTransferForm({ amount: "", recipient: "", recipientAccount: "", bank: "", description: "" });
    setTransferDialogOpen(true);
  };

  const handleDeposit = () => {
    if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount" });
      return;
    }
    toast({ title: "Success", description: `₦${parseFloat(depositForm.amount).toLocaleString()} deposited to wallet` });
    setDepositDialogOpen(false);
    setDepositForm({ amount: "", method: "bank_transfer" });
  };

  const handleWithdraw = () => {
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount" });
      return;
    }
    const amount = parseFloat(withdrawForm.amount);
    if (amount > managerData.wallet.balance) {
      toast({ title: "Error", description: "Insufficient wallet balance" });
      return;
    }
    toast({ title: "Success", description: `₦${amount.toLocaleString()} withdrawn from wallet` });
    setWithdrawDialogOpen(false);
    setWithdrawForm({ amount: "", description: "" });
  };

  const handleTransfer = () => {
    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount" });
      return;
    }
    if (!transferForm.recipient || !transferForm.recipientAccount) {
      toast({ title: "Error", description: "Please fill in recipient details" });
      return;
    }
    const amount = parseFloat(transferForm.amount);
    if (amount > managerData.wallet.balance) {
      toast({ title: "Error", description: "Insufficient wallet balance" });
      return;
    }
    toast({ title: "Success", description: `₦${amount.toLocaleString()} transferred to ${transferForm.recipient}` });
    setTransferDialogOpen(false);
    setTransferForm({ amount: "", recipient: "", recipientAccount: "", bank: "", description: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* 1. Operational Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Manager Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">{managerData.property.name} - Operational Control</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setSendNoticeDialogOpen(true)} variant="outline">
                <Megaphone className="h-4 w-4 mr-2" /> Send Notice
              </Button>
              <Button onClick={() => setAddMaintenanceDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> New Request
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg"><Building className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Units Managed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{managerData.property.totalUnits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-2 rounded-lg"><Home className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Occupied</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{managerData.property.occupiedUnits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 p-2 rounded-lg"><Home className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Vacant</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{managerData.property.vacantUnits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-600 p-2 rounded-lg"><Wrench className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Pending Requests</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingMaintenance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 p-2 rounded-lg"><UserCheck className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Staff Active</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{managerData.staff.filter(s => s.status === "on_duty").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-600 p-2 rounded-lg"><Users className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Visitors Today</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{todayVisitors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-2 rounded-lg"><DollarSign className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Rent Paid</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{paidRent}/{managerData.tenants.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 p-2 rounded-lg"><AlertTriangle className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Open Complaints</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingComplaints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Daily Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {managerData.dailyLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.type === "maintenance" ? <Wrench className="h-5 w-5 text-blue-600" /> :
                     log.type === "security" ? <Shield className="h-5 w-5 text-green-600" /> :
                     <Users className="h-5 w-5 text-purple-600" />}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{log.description}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{log.staff} - {formatDate(log.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Tenant Management */}
        <TabsContent value="tenants" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tenant Management</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage all tenants</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700"><UserPlus className="h-4 w-4 mr-2" /> Add Tenant</Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2"><Search className="h-4 w-4 text-slate-500" /><Input placeholder="Search tenants..." className="max-w-sm" /></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {managerData.tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {tenant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{tenant.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{tenant.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(tenant.rentStatus)}>{tenant.rentStatus}</Badge>
                    <Button size="sm" variant="outline"><MessageSquare className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline"><Phone className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Maintenance & Repairs */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance & Repairs</h2>
              <p className="text-slate-500 dark:text-slate-400">Track and manage repairs</p>
            </div>
            <Button onClick={() => setAddMaintenanceDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> New Request
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-4">
              {managerData.maintenanceRequests.map((request) => (
                <div key={request.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${request.status === "completed" ? "bg-green-100" : request.status === "in_progress" ? "bg-blue-100" : "bg-yellow-100"}`}>
                        {request.category === "plumbing" ? <Droplets className="h-5 w-5 text-blue-600" /> :
                         request.category === "electrical" ? <Zap className="h-5 w-5 text-yellow-600" /> :
                         <Shield className="h-5 w-5 text-gray-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{request.issue}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{request.unit} - {request.tenant}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(request.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      {request.status !== "completed" && (
                        <Button size="sm" variant="outline" onClick={() => handleAssignStaff(request.id)}>Assign</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Staff Management */}
        <TabsContent value="staff" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Management</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage estate staff</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700"><UserPlus className="h-4 w-4 mr-2" /> Add Staff</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">On Duty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {managerData.staff.filter(s => s.status === "on_duty").map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{member.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{member.role} - {member.shift}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">On Duty</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Off Duty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {managerData.staff.filter(s => s.status === "off_duty").map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{member.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{member.role} - {member.shift}</p>
                    </div>
                    <Badge variant="outline">Off Duty</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 5. Visitor & Security Control */}
        <TabsContent value="visitors" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Visitor & Security</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage visitor access</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {managerData.visitors.filter(v => v.status === "pending").map((visitor) => (
                <div key={visitor.id} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{visitor.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{visitor.unit} - {visitor.purpose}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600" onClick={() => handleApproveVisitor(visitor.id)}>Approve</Button>
                    <Button size="sm" variant="destructive">Reject</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Visitor History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {managerData.visitors.map((visitor) => (
                <div key={visitor.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{visitor.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{visitor.unit} - {visitor.purpose}</p>
                  </div>
                  <Badge className={getStatusColor(visitor.status)}>{visitor.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Complaints & Support */}
        <TabsContent value="complaints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Complaints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {managerData.complaints.map((complaint) => (
                <div key={complaint.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{complaint.tenant}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{complaint.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{complaint.unit} - {formatDate(complaint.date)}</p>
                    </div>
                    <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. Lease Monitoring */}
        <TabsContent value="leases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Lease Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {managerData.leases.map((lease) => (
                <div key={lease.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{lease.tenant}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{lease.unit}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(lease.status)}>{lease.status}</Badge>
                      {lease.status === "expiring_soon" && (
                        <Button size="sm" variant="outline">Remind</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. Utilities */}
        <TabsContent value="utilities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {managerData.utilities.map((utility) => (
              <Card key={utility.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{utility.type}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Last checked: {formatDate(utility.lastChecked)}</p>
                    </div>
                    <Badge className={getStatusColor(utility.status)}>{utility.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 9. Reports & Logs */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Reports & Daily Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Daily Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  <span className="text-xs">Staff Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  <span className="text-xs">Maintenance</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-xs">Security</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage your wallet and view transaction history</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Wallet Balance</CardTitle>
              <CardDescription>Your current wallet balance and quick actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Available Balance</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{formatCurrency(managerData.wallet.balance)}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleOpenDeposit} className="bg-green-600 hover:bg-green-700">
                      <ArrowDownRight className="h-4 w-4 mr-2" />
                      Deposit
                    </Button>
                    <Button variant="outline" onClick={handleOpenWithdraw}>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                    <Button variant="outline" onClick={handleOpenTransfer}>
                      <Send className="h-4 w-4 mr-2" />
                      Transfer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {managerData.transactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === "deposit" ? "bg-green-100 dark:bg-green-900/30" :
                        transaction.type === "withdraw" ? "bg-red-100 dark:bg-red-900/30" :
                        "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        {transaction.type === "deposit" ? (
                          <ArrowDownRight className="h-5 w-5 text-green-600" />
                        ) : transaction.type === "withdraw" ? (
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        ) : (
                          <Send className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{transaction.description}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(transaction.date)} • {transaction.reference}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === "deposit" ? "text-green-600" :
                        "text-red-600"
                      }`}>
                        {transaction.type === "deposit" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Notice Dialog */}
      <Dialog open={sendNoticeDialogOpen} onOpenChange={setSendNoticeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Notice Type</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Notice</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea placeholder="Enter your message..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendNoticeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendNotice}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit to Wallet</DialogTitle>
            <DialogDescription>Add funds to your wallet balance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" value={depositForm.amount} onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={depositForm.method} onValueChange={(value) => setDepositForm({ ...depositForm, method: value })}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Debit/Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeposit}>Deposit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw from Wallet</DialogTitle>
            <DialogDescription>Withdraw funds to your bank account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Available Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(managerData.wallet.balance)}</p>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="e.g., Withdrawal to bank account" value={withdrawForm.description} onChange={(e) => setWithdrawForm({ ...withdrawForm, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleWithdraw}>Withdraw</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Funds</DialogTitle>
            <DialogDescription>Send money to another user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Available Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(managerData.wallet.balance)}</p>
            </div>
            <div>
              <Label>Recipient Name</Label>
              <Input placeholder="Enter recipient name" value={transferForm.recipient} onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })} />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input placeholder="Enter account number" value={transferForm.recipientAccount} onChange={(e) => setTransferForm({ ...transferForm, recipientAccount: e.target.value })} />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};