import { useState } from "react";
import { SkillsAssistant } from "@/components/skills/SkillsAssistant";
import { BusinessHealthWidget } from "@/components/dashboard/BusinessHealthWidget";
import {
  Building, Users, Home, Wrench, AlertCircle, Shield,
  UserPlus, FileText, DollarSign, Search, Plus, CheckCircle,
  Activity, BarChart3, Send, Bell, MessageSquare, Phone,
  AlertTriangle, ClipboardList, Megaphone, Wallet,
  ArrowDownRight, ArrowUpRight, RefreshCw, TrendingUp,
  Zap, ChevronRight, Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, SectionHeader } from "./DashboardPrimitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import { AdminFeedbackPanel } from "./AdminFeedbackPanel";
import { formatCurrencyIntl as formatCurrency, formatDateNg as formatDate, getStatusColor, getPriorityColor } from "@/utils/propertyUtils";
import {
  useGetManagerOverviewQuery,
  useGetManagerTenantsQuery,
  useGetManagerIssuesQuery,
  useGetManagerPaymentsQuery,
  useUpdateIssueStatusMutation,
  useCreateIssueMutation,
  useRecordPaymentMutation,
  useSendRentReminderMutation,
  useSendNotificationMutation,
  useGetManagerEnquiriesQuery,
  useUpdateEnquiryStatusMutation,
  useGetManagerApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetManagerBillingQuery,
  useAddBillingItemMutation,
  useMarkBillPaidMutation,
  useGetManagerServiceRequestsQuery,
  useUpdateServiceRequestStatusMutation,
  useGetVacantUnitsQuery,
} from "@/services/managerApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ManagerStatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
  <Card className={`bg-gradient-to-br ${color} border-0`}>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg"><Icon className="h-5 w-5 text-white" /></div>
        <div>
          <p className="text-sm text-white/80">{label}</p>
          <p className="text-2xl font-bold text-white font-display">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonCard = () => (
  <Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const ManagerDashboard: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [issueDialog, setIssueDialog] = useState(false);
  const [noticeDialog, setNoticeDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [billDialog, setBillDialog] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedTenantName, setSelectedTenantName] = useState("");
  const [noticeTarget, setNoticeTarget] = useState<{ userId: string; name: string } | null>(null);

  // Forms
  const [issueForm, setIssueForm] = useState({ title: "", description: "", category: "general", priority: "medium", estate_id: "" });
  const [paymentForm, setPaymentForm] = useState({ amount: "", type: "rent" });
  const [noticeForm, setNoticeForm] = useState({ title: "", message: "" });
  const [billForm, setBillForm] = useState({ label: "", amount: "" });

  // Data
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useGetManagerOverviewQuery();
  const { data: tenantsData, isLoading: tenantsLoading } = useGetManagerTenantsQuery({});
  const { data: issuesData, isLoading: issuesLoading } = useGetManagerIssuesQuery({});
  const { data: paymentsData, isLoading: paymentsLoading } = useGetManagerPaymentsQuery({});
  const { data: enquiriesData, isLoading: enquiriesLoading } = useGetManagerEnquiriesQuery({});
  const { data: applicationsData, isLoading: applicationsLoading } = useGetManagerApplicationsQuery({});
  const { data: billingData, isLoading: billingLoading } = useGetManagerBillingQuery({ is_paid: false });
  const { data: serviceRequestsData, isLoading: srLoading } = useGetManagerServiceRequestsQuery({});
  const { data: vacantUnitsData, isLoading: vacanciesLoading } = useGetVacantUnitsQuery({});

  // Mutations
  const [updateIssueStatus] = useUpdateIssueStatusMutation();
  const [createIssue] = useCreateIssueMutation();
  const [recordPayment] = useRecordPaymentMutation();
  const [sendReminder] = useSendRentReminderMutation();
  const [sendNotification] = useSendNotificationMutation();
  const [updateEnquiryStatus] = useUpdateEnquiryStatusMutation();
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();
  const [addBillingItem] = useAddBillingItemMutation();
  const [markBillPaid] = useMarkBillPaidMutation();
  const [updateSRStatus] = useUpdateServiceRequestStatusMutation();

  const tenants = tenantsData?.data ?? [];
  const issues = issuesData?.data ?? [];
  const payments = paymentsData?.data ?? [];

  const filteredTenants = searchQuery
    ? tenants.filter(t =>
        t.tenantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.unitLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tenantPhone?.includes(searchQuery) ||
        t.tenantEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tenants;

  const openIssues = issues.filter(i => i.status !== "closed" && i.status !== "resolved");
  const enquiries = enquiriesData?.data ?? [];
  const applications = applicationsData?.data ?? [];
  const pendingBills = billingData?.data ?? [];
  const serviceRequests = serviceRequestsData?.data ?? [];
  const vacantUnits = vacantUnitsData?.data ?? [];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleResolveIssue = async (issueId: string, newStatus: string) => {
    try {
      await updateIssueStatus({ issueId, status: newStatus }).unwrap();
      toast({ title: "Issue Updated", description: `Status changed to ${newStatus}` });
    } catch {
      toast({ title: "Error", description: "Could not update issue status", variant: "destructive" });
    }
  };

  const handleCreateIssue = async () => {
    if (!issueForm.title) { toast({ title: "Error", description: "Title is required" }); return; }
    const estateId = issueForm.estate_id || overview?.estate_breakdown?.[0]?.id || "";
    if (!estateId) { toast({ title: "Error", description: "No estate found" }); return; }
    try {
      await createIssue({ ...issueForm, estate: estateId }).unwrap();
      toast({ title: "Issue Created", description: "Maintenance request logged" });
      setIssueDialog(false);
      setIssueForm({ title: "", description: "", category: "general", priority: "medium", estate_id: "" });
    } catch {
      toast({ title: "Error", description: "Could not create issue", variant: "destructive" });
    }
  };

  const handleOpenPayment = (tenantId: string, name: string) => {
    setSelectedTenantId(tenantId);
    setSelectedTenantName(name);
    setPaymentForm({ amount: "", type: "rent" });
    setPaymentDialog(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedTenantId || !paymentForm.amount) { toast({ title: "Error", description: "Enter a valid amount" }); return; }
    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) { toast({ title: "Error", description: "Invalid amount" }); return; }
    try {
      await recordPayment({ tenant: selectedTenantId, amount, payment_type: paymentForm.type }).unwrap();
      toast({ title: "Payment Recorded", description: `₦${amount.toLocaleString()} recorded for ${selectedTenantName}` });
      setPaymentDialog(false);
      refetchOverview();
    } catch {
      toast({ title: "Error", description: "Could not record payment", variant: "destructive" });
    }
  };

  const handleSendReminder = async (tenantId: string, name: string) => {
    try {
      await sendReminder(tenantId).unwrap();
      toast({ title: "Reminder Sent", description: `Rent reminder sent to ${name}` });
    } catch {
      toast({ title: "Error", description: "Could not send reminder", variant: "destructive" });
    }
  };

  const handleEnquiryStatus = async (id: string, status: string) => {
    try {
      await updateEnquiryStatus({ enquiryId: id, status }).unwrap();
      toast({ title: "Enquiry Updated", description: `Status → ${status}` });
    } catch {
      toast({ title: "Error", description: "Could not update enquiry", variant: "destructive" });
    }
  };

  const handleApplicationAction = async (id: string, status: string, name: string) => {
    try {
      await updateApplicationStatus({ appId: id, status }).unwrap();
      toast({ title: `Application ${status}`, description: `${name}'s application has been ${status}` });
    } catch {
      toast({ title: "Error", description: "Could not update application", variant: "destructive" });
    }
  };

  const handleOpenBill = (tenantId: string, name: string) => {
    setSelectedTenantId(tenantId);
    setSelectedTenantName(name);
    setBillForm({ label: "", amount: "" });
    setBillDialog(true);
  };

  const handleAddBill = async () => {
    if (!selectedTenantId || !billForm.label || !billForm.amount) {
      toast({ title: "Error", description: "Fill in all fields" });
      return;
    }
    const amount = parseFloat(billForm.amount);
    if (isNaN(amount) || amount <= 0) { toast({ title: "Error", description: "Invalid amount" }); return; }
    try {
      await addBillingItem({ tenant: selectedTenantId, label: billForm.label, amount }).unwrap();
      toast({ title: "Bill Added", description: `₦${amount.toLocaleString()} charge added for ${selectedTenantName}` });
      setBillDialog(false);
    } catch {
      toast({ title: "Error", description: "Could not add bill", variant: "destructive" });
    }
  };

  const handleMarkBillPaid = async (itemId: string, label: string) => {
    try {
      await markBillPaid(itemId).unwrap();
      toast({ title: "Bill Marked Paid", description: label });
    } catch {
      toast({ title: "Error", description: "Could not mark bill as paid", variant: "destructive" });
    }
  };

  const handleSRStatus = async (id: string, status: string) => {
    try {
      await updateSRStatus({ srId: id, status }).unwrap();
      toast({ title: "Request Updated", description: `Status → ${status}` });
    } catch {
      toast({ title: "Error", description: "Could not update request", variant: "destructive" });
    }
  };

  const handleOpenNotice = (userId: string, name: string) => {
    setNoticeTarget({ userId, name });
    setNoticeForm({ title: "", message: "" });
    setNoticeDialog(true);
  };

  const handleSendNotice = async () => {
    if (!noticeTarget || !noticeForm.title || !noticeForm.message) {
      toast({ title: "Error", description: "Fill in title and message" });
      return;
    }
    try {
      await sendNotification({ user: noticeTarget.userId, ...noticeForm }).unwrap();
      toast({ title: "Notification Sent", description: `Message sent to ${noticeTarget.name}` });
      setNoticeDialog(false);
    } catch {
      toast({ title: "Error", description: "Could not send notification", variant: "destructive" });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="dashboard-tabs-list bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="tenants" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Tenants</TabsTrigger>
          <TabsTrigger value="overdue" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Overdue</TabsTrigger>
          <TabsTrigger value="issues" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Issues</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Payments</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Billing</TabsTrigger>
          <TabsTrigger value="service-requests" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Requests</TabsTrigger>
          <TabsTrigger value="enquiries" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Enquiries</TabsTrigger>
          <TabsTrigger value="feedback" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Feedback</TabsTrigger>
          <TabsTrigger value="applications" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Applications</TabsTrigger>
          <TabsTrigger value="vacancies" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Vacancies</TabsTrigger>
          <TabsTrigger value="estates" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Estates</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Reports</TabsTrigger>
        </TabsList>

        {/* ─── OVERVIEW TAB ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <PageHeader
              title="Manager Dashboard"
              description={overviewLoading ? "Loading..." : overview?.estate_names?.join(", ") || "Assigned Estates"}
              icon={Building}
            />
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => refetchOverview()}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => setNoticeDialog(true)}>
                <Megaphone className="h-4 w-4 mr-2" /> Broadcast
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 btn-interactive" onClick={() => setIssueDialog(true)}>
                <Plus className="h-4 w-4 mr-2" /> Report Issue
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {overviewLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                <ManagerStatCard icon={Building} label="Estates Managed" value={overview?.managed_estates ?? 0} color="from-primary to-primary/80" />
                <ManagerStatCard icon={Home} label="Occupancy Rate" value={`${overview?.units?.occupancy_rate ?? 0}%`} color="from-primary to-primary/80" />
                <ManagerStatCard icon={Home} label="Vacant Units" value={overview?.units?.vacant ?? 0} color="from-destructive to-destructive/80" />
                <ManagerStatCard icon={Users} label="Total Tenants" value={overview?.tenants?.total ?? 0} color="from-primary to-primary/80" />
                <ManagerStatCard icon={DollarSign} label="Revenue (30d)" value={formatCurrency(overview?.revenue?.monthly ?? 0)} color="from-primary to-primary/80" />
                <ManagerStatCard icon={TrendingUp} label="Collection Rate" value={`${overview?.collection_rate ?? 0}%`} color="from-primary to-primary/80" />
                <ManagerStatCard icon={AlertTriangle} label="Overdue Tenants" value={overview?.tenants?.overdue ?? 0} color="from-warning to-warning/80" />
                <ManagerStatCard icon={Wrench} label="Open Issues" value={overview?.skills?.open_issues ?? 0} color="from-warning to-warning/80" />
              </>
            )}
          </div>

          {/* Financial Summary */}
          {!overviewLoading && overview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="dash-card border-l-4 border-l-destructive">
                <SectionHeader title="Outstanding Rent" />
                <p className="text-2xl font-bold text-destructive font-display">{formatCurrency(overview.outstanding?.rent ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Across all managed estates</p>
              </div>
              <div className="dash-card border-l-4 border-l-amber-400">
                <SectionHeader title="Outstanding Service Charge" />
                <p className="text-2xl font-bold text-amber-600 font-display">{formatCurrency(overview.outstanding?.service_charge ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Service charges unpaid</p>
              </div>
              <div className="dash-card border-l-4 border-l-emerald-500">
                <SectionHeader title="Monthly Rent Roll" />
                <p className="text-2xl font-bold text-emerald-600 font-display">{formatCurrency(overview.monthly_rent_roll ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Potential monthly income</p>
              </div>
            </div>
          )}

          {/* AI Business Health Score */}
          <BusinessHealthWidget />

          {/* Business Skills Active Signals */}
          <SkillsAssistant overview={overview} />

          {/* High Priority Issues Alert */}
          {(overview?.skills?.high_priority_issues ?? 0) > 0 && (
            <div className="dash-card border-l-4 border-l-destructive bg-destructive/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {overview.skills.high_priority_issues} High Priority Issue{overview.skills.high_priority_issues > 1 ? "s" : ""} Need Attention
                  </p>
                  <p className="text-sm text-muted-foreground">Review the Issues tab immediately</p>
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setActiveTab("issues")}>
                  View Issues <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </div>
          )}

          {/* Overdue tenants quick list */}
          {(overview?.tenants?.overdue_list?.length ?? 0) > 0 && (
            <div className="dash-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground font-display">Overdue Tenants</h3>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setActiveTab("overdue")}>View All</Button>
              </div>
              <div className="space-y-2">
                {overview!.tenants.overdue_list.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.unit} &bull; Due: {t.due_date ? formatDate(t.due_date) : "N/A"}</p>
                    </div>
                    <Badge className="bg-destructive/10 text-destructive border-0 font-data">{formatCurrency(t.outstanding)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── TENANTS TAB ──────────────────────────────────────────────── */}
        <TabsContent value="tenants" className="space-y-6">
          <PageHeader
            title="Tenant Management"
            description={`${tenantsData?.total ?? 0} tenants across your estates`}
            icon={Users}
          />

          <div className="dash-card">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, unit, phone, email..."
                className="max-w-sm h-9 bg-muted/30 border-0 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {tenantsLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : filteredTenants.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No tenants found.</p>
              ) : (
                filteredTenants.map((tenant) => {
                  const outstanding = (tenant.rentOutstanding ?? 0) + (tenant.serviceChargeOutstanding ?? 0);
                  const isOverdue = outstanding > 0;
                  return (
                    <div key={tenant.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm font-display ${isOverdue ? "bg-destructive" : "bg-gradient-to-br from-primary to-primary/80"}`}>
                          {tenant.tenantName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tenant.tenantName}</p>
                          <p className="text-xs text-muted-foreground">{tenant.unitLabel} &bull; Due: {tenant.nextDueDate ? formatDate(tenant.nextDueDate) : "N/A"}</p>
                          {isOverdue && (
                            <p className="text-xs text-destructive font-medium font-data">Outstanding: {formatCurrency(outstanding)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className={isOverdue ? "bg-destructive/10 text-destructive border-0" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0"}>
                          {isOverdue ? "Overdue" : "Clear"}
                        </Badge>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleOpenPayment(tenant.id, tenant.tenantName)} title="Record Payment">
                          <DollarSign className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleSendReminder(tenant.id, tenant.tenantName)} title="Send Reminder">
                          <Bell className="h-3.5 w-3.5" />
                        </Button>
                        {tenant.tenantPhone && (
                          <a href={`tel:${tenant.tenantPhone}`}>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Call"><Phone className="h-3.5 w-3.5" /></Button>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── ISSUES / MAINTENANCE TAB ─────────────────────────────────── */}
        <TabsContent value="issues" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <PageHeader
              title="Issues & Maintenance"
              description={`${openIssues.length} open issues`}
              icon={Wrench}
            />
            <Button size="sm" className="bg-primary hover:bg-primary/90 btn-interactive" onClick={() => setIssueDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Log Issue
            </Button>
          </div>

          <div className="dash-card">
            <div className="space-y-2">
              {issuesLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : issues.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No issues found.</p>
              ) : (
                issues.map((issue) => (
                  <div key={issue.id} className="p-4 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`h-2 w-2 rounded-full ${issue.priority === "high" ? "bg-destructive" : issue.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                          <p className="text-sm font-medium text-foreground">{issue.title}</p>
                        </div>
                        {issue.description && <p className="text-xs text-muted-foreground mb-1">{issue.description}</p>}
                        <p className="text-xs text-muted-foreground/60">{formatDate(issue.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                        <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                        {issue.status === "open" && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleResolveIssue(issue.id, "in_progress")}>
                            Start
                          </Button>
                        )}
                        {issue.status === "in_progress" && (
                          <Button size="sm" className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleResolveIssue(issue.id, "resolved")}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </TabsContent>

        {/* ─── PAYMENTS TAB ────────────────────────────────────────────── */}
        <TabsContent value="payments" className="space-y-6">
          <PageHeader
            title="Payment Records"
            description="All payments across your estates"
            icon={DollarSign}
          />

          <div className="dash-card">
            <div className="space-y-2">
              {paymentsLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              ) : payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No payments found.</p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${payment.paymentStatus === "completed" || payment.paymentStatus === "success" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                        <DollarSign className={`h-4 w-4 ${payment.paymentStatus === "completed" || payment.paymentStatus === "success" ? "text-emerald-600" : "text-amber-600"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{payment.paymentType}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)} &bull; {payment.reference || "no ref"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground font-data">{formatCurrency(payment.amount)}</p>
                      <Badge className={getStatusColor(payment.paymentStatus)}>{payment.paymentStatus}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── OVERDUE TAB ──────────────────────────────────────────────── */}
        <TabsContent value="overdue" className="space-y-6">
          <PageHeader
            title="Overdue Tenants"
            description="Tenants with outstanding balances past due date"
            icon={AlertTriangle}
          />

          <div className="dash-card">
            <div className="space-y-2">
              {tenantsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : (
                (() => {
                  const overdue = tenants.filter(t => (t.rentOutstanding + t.serviceChargeOutstanding) > 0);
                  if (overdue.length === 0) return <p className="text-center text-emerald-600 py-8 font-medium text-sm">No overdue tenants &mdash; great job!</p>;
                  return overdue.map((tenant) => {
                    const outstanding = tenant.rentOutstanding + tenant.serviceChargeOutstanding;
                    return (
                      <div key={tenant.id} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{tenant.tenantName}</p>
                            <p className="text-xs text-muted-foreground">{tenant.unitLabel}</p>
                            <div className="flex gap-4 mt-1 text-xs">
                              <span className="text-destructive font-data">Rent: {formatCurrency(tenant.rentOutstanding)}</span>
                              <span className="text-amber-600 font-data">S.C: {formatCurrency(tenant.serviceChargeOutstanding)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {tenant.tenantPhone && <span className="mr-3">{tenant.tenantPhone}</span>}
                              {tenant.tenantEmail}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-xl font-bold text-destructive font-display">{formatCurrency(outstanding)}</p>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-primary hover:bg-primary/90 btn-interactive h-8 text-xs" onClick={() => handleOpenPayment(tenant.id, tenant.tenantName)}>
                                <DollarSign className="h-3 w-3 mr-1" /> Collect
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSendReminder(tenant.id, tenant.tenantName)}>
                                <Bell className="h-3 w-3 mr-1" /> Remind
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>

        </TabsContent>

        {/* ─── BILLING TAB ─────────────────────────────────────────────── */}
        <TabsContent value="billing" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <PageHeader
              title="Billing Management"
              description={`${pendingBills.length} unpaid bills across your estates`}
              icon={CreditCard}
            />
            <Button size="sm" className="bg-primary hover:bg-primary/90 btn-interactive" onClick={() => { setSelectedTenantId(null); setBillDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Charge
            </Button>
          </div>
          <div className="dash-card">
            <div className="space-y-2">
              {billingLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : pendingBills.length === 0 ? (
                <p className="text-center text-emerald-600 py-8 font-medium text-sm">No unpaid bills!</p>
              ) : (
                pendingBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                    <div>
                      <p className="text-sm font-medium text-foreground">{bill.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {bill.dueDate ? `Due: ${formatDate(bill.dueDate)}` : "No due date"} &bull; {bill.itemType}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-destructive font-data">{formatCurrency(bill.amount)}</p>
                      <Button size="sm" className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleMarkBillPaid(bill.id, bill.label)}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Mark Paid
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── SERVICE REQUESTS TAB ────────────────────────────────────── */}
        <TabsContent value="service-requests" className="space-y-6">
          <PageHeader
            title="Service Requests"
            description="Tenant-submitted requests across your estates"
            icon={ClipboardList}
          />
          <div className="dash-card">
            <div className="space-y-2">
              {srLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : serviceRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No service requests found.</p>
              ) : (
                serviceRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{req.title}</p>
                        {req.description && <p className="text-xs text-muted-foreground mt-1">{req.description}</p>}
                        <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(req.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>
                        <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                        {req.status === "pending" && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSRStatus(req.id, "in_progress")}>Start</Button>
                        )}
                        {req.status === "in_progress" && (
                          <Button size="sm" className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleSRStatus(req.id, "completed")}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── FEEDBACK TAB ────────────────────────────────────────────── */}
        <TabsContent value="feedback" className="space-y-6">
          <AdminFeedbackPanel />
        </TabsContent>

        {/* ─── ENQUIRIES TAB ───────────────────────────────────────────── */}
        <TabsContent value="enquiries" className="space-y-6">
          <PageHeader
            title="Property Enquiries"
            description="Inbound interest from prospective tenants"
            icon={MessageSquare}
          />
          <div className="dash-card">
            <div className="space-y-2">
              {enquiriesLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : enquiries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No enquiries yet.</p>
              ) : (
                enquiries.map((enq) => (
                  <div key={enq.id} className="p-4 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground">{enq.name}</p>
                          <Badge className={getStatusColor(enq.status)}>{enq.status}</Badge>
                          {enq.leadScore != null && (
                            <Badge className={`text-xs ${enq.leadScore >= 7 ? "bg-emerald-100 text-emerald-700" : enq.leadScore >= 4 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                              {enq.leadScore}/10
                            </Badge>
                          )}
</div>
                        <p className="text-xs text-muted-foreground">{enq.phone || enq.email} &bull; {enq.enquiryType}</p>
                        {enq.message && <p className="text-xs text-muted-foreground mt-1 italic">"{enq.message}"</p>}
                        <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(enq.createdAt)}</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {enq.status === "pending" && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleEnquiryStatus(enq.id, "contacted")}>
                            Mark Contacted
                          </Button>
                        )}
                        {enq.status === "contacted" && (
                          <Button size="sm" className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleEnquiryStatus(enq.id, "converted")}>
                            Converted
                          </Button>
                        )}
                        {enq.phone && (
                          <a href={`tel:${enq.phone}`}>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0"><Phone className="h-3.5 w-3.5" /></Button>
                          </a>
                        )}
                        {enq.status !== "closed" && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleEnquiryStatus(enq.id, "closed")}>
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </TabsContent>

        {/* ─── APPLICATIONS TAB ────────────────────────────────────────── */}
        <TabsContent value="applications" className="space-y-6">
          <PageHeader
            title="Rental Applications"
            description="Review and approve or reject applicants"
            icon={FileText}
          />
          <div className="dash-card">
            <div className="space-y-2">
              {applicationsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              ) : applications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No rental applications.</p>
              ) : (
                applications.map((app) => {
                  const fullName = `${app.firstName} ${app.lastName}`.trim();
                  return (
                    <div key={app.id} className="p-4 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground">{fullName}</p>
                            <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{app.phone || app.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Move-in: {app.moveInDate ? formatDate(app.moveInDate) : "TBD"} &bull; Applied: {formatDate(app.createdAt)}
                          </p>
                        </div>
                        {app.status === "pending" && (
                          <div className="flex gap-1.5">
                            <Button size="sm" className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleApplicationAction(app.id, "approved", fullName)}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleApplicationAction(app.id, "rejected", fullName)}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── VACANCIES TAB ───────────────────────────────────────────── */}
        <TabsContent value="vacancies" className="space-y-6">
          <PageHeader
            title="Vacant Units"
            description={`${vacantUnits.length} units currently available`}
            icon={Home}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vacanciesLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : vacantUnits.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <Home className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                <p className="text-emerald-600 font-semibold text-lg font-display">Fully Occupied!</p>
                <p className="text-muted-foreground text-sm">All units are currently occupied.</p>
              </div>
            ) : (
              vacantUnits.map((unit) => (
                <div key={unit.id} className="dash-card border-2 border-dashed border-border/60">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground text-lg font-display">{unit.label}</p>
                      <p className="text-xs text-muted-foreground">{unit.category}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0">Vacant</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    {unit.bedrooms != null && <span className="text-muted-foreground">{unit.bedrooms} bed</span>}
                    {unit.bathrooms != null && <span className="text-muted-foreground">{unit.bathrooms} bath</span>}
                    {unit.area != null && <span className="text-muted-foreground">{unit.area} sqm</span>}
                    {unit.availableDate && <span className="text-muted-foreground">{formatDate(unit.availableDate)}</span>}
                  </div>
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-lg font-bold text-emerald-600 font-display">{formatCurrency(unit.monthlyPrice)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    {unit.serviceChargeMonthly && (
                      <p className="text-xs text-muted-foreground">+ {formatCurrency(unit.serviceChargeMonthly)} service charge</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </TabsContent>

        {/* ─── ESTATES TAB ──────────────────────────────────────────────── */}
        <TabsContent value="estates" className="space-y-6">
          <PageHeader
            title="Estate Breakdown"
            description="Performance per estate"
            icon={Building}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overviewLoading ? (
              Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (overview?.estate_breakdown ?? []).map((estate) => (
              <div key={estate.id} className="dash-card">
                <h3 className="text-base font-semibold text-foreground font-display mb-3">{estate.name}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Occupancy</p>
                    <p className="text-xl font-bold text-foreground font-display">{estate.units.occupancy_rate}%</p>
                    <p className="text-xs text-muted-foreground">{estate.units.occupied}/{estate.units.total} units</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vacant</p>
                    <p className="text-xl font-bold text-destructive font-display">{estate.units.vacant}</p>
                    <p className="text-xs text-muted-foreground">units available</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tenants</p>
                    <p className="text-xl font-bold text-foreground font-display">{estate.tenants}</p>
                    <p className="text-xs text-destructive">{estate.overdue} overdue</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue (30d)</p>
                    <p className="text-lg font-bold text-emerald-600 font-display">{formatCurrency(estate.revenue_30d)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ─── REPORTS TAB ─────────────────────────────────────────────── */}
        <TabsContent value="reports" className="space-y-6">
          <PageHeader
            title="Manager Skills Report"
            description="Your estate performance at a glance"
            icon={BarChart3}
          />

          {overviewLoading ? <Skeleton className="h-64 w-full" /> : (
            <div className="space-y-4">
              <div className="dash-card">
                <h3 className="text-sm font-semibold text-foreground font-display mb-4">Portfolio Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${overview?.units?.occupancy_rate ?? 0}%` }} />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right font-data">{overview?.units?.occupancy_rate ?? 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Collection Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full transition-all" style={{ width: `${Math.min(overview?.collection_rate ?? 0, 100)}%` }} />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right font-data">{overview?.collection_rate ?? 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overdue Ratio</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-destructive h-2 rounded-full transition-all" style={{ width: `${overview?.tenants?.total ? (overview.tenants.overdue / overview.tenants.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right font-data">
                        {overview?.tenants?.total ? Math.round((overview.tenants.overdue / overview.tenants.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Wrench className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold">{overview?.skills?.open_issues ?? 0}</p>
                    <p className="text-sm text-slate-500">Open Issues</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                    <p className="text-2xl font-bold">{overview?.skills?.high_priority_issues ?? 0}</p>
                    <p className="text-sm text-slate-500">High Priority</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <ClipboardList className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{overview?.skills?.pending_bills ?? 0}</p>
                    <p className="text-sm text-slate-500">Pending Bills</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Home className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold">{overview?.units?.vacant ?? 0}</p>
                    <p className="text-sm text-slate-500">Vacant Units</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── DIALOGS ──────────────────────────────────────────────────────── */}

      {/* Log Issue */}
      <Dialog open={issueDialog} onOpenChange={setIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Maintenance Issue</DialogTitle>
            <DialogDescription>Report a new maintenance or repair issue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(overview?.estate_breakdown?.length ?? 0) > 1 && (
              <div>
                <Label>Estate</Label>
                <Select value={issueForm.estate_id} onValueChange={(v) => setIssueForm({ ...issueForm, estate_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select estate" /></SelectTrigger>
                  <SelectContent>
                    {overview!.estate_breakdown.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Title</Label>
              <Input placeholder="e.g. Leaking roof in Block A" value={issueForm.title} onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={issueForm.category} onValueChange={(v) => setIssueForm({ ...issueForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["general", "plumbing", "electrical", "structural", "security", "cleaning"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={issueForm.priority} onValueChange={(v) => setIssueForm({ ...issueForm, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea placeholder="Describe the issue..." rows={3} value={issueForm.description} onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateIssue}>Log Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment for {selectedTenantName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Payment Type</Label>
              <Select value={paymentForm.type} onValueChange={(v) => setPaymentForm({ ...paymentForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="service_charge">Service Charge</SelectItem>
                  <SelectItem value="bundle">Bundle (Rent + Service Charge)</SelectItem>
                  <SelectItem value="billing">Billing Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (₦)</Label>
              <Input type="number" placeholder="e.g. 150000" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} className="bg-green-600 hover:bg-green-700">Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification */}
      <Dialog open={noticeDialog} onOpenChange={setNoticeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              {noticeTarget ? `Message to ${noticeTarget.name}` : "Broadcast message"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title</Label>
              <Input placeholder="Notification title" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea placeholder="Write your message..." rows={4} value={noticeForm.message} onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoticeDialog(false)}>Cancel</Button>
            <Button onClick={handleSendNotice}><Send className="h-4 w-4 mr-2" /> Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ADD BILLING ITEM DIALOG ──────────────────────────────────── */}
      <Dialog open={billDialog} onOpenChange={setBillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Charge</DialogTitle>
            <DialogDescription>
              {selectedTenantId ? `Add a charge for ${selectedTenantName}` : "Add a billing charge to a tenant"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Charge Label</Label>
              <Input
                placeholder="e.g. Late payment fee, Water bill"
                value={billForm.label}
                onChange={(e) => setBillForm(p => ({ ...p, label: e.target.value }))}
              />
            </div>
            <div>
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={billForm.amount}
                onChange={(e) => setBillForm(p => ({ ...p, amount: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBillDialog(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90 btn-interactive" onClick={handleAddBill}>
              <Plus className="h-4 w-4 mr-2" /> Add Charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
