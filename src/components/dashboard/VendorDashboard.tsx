import { useState } from "react";
import {
  Wrench,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Upload,
  FileText,
  Camera,
  Video,
  MessageSquare,
  Send,
  Download,
  CreditCard,
  Building,
  Home,
  Users,
  Zap,
  Droplets,
  Lightbulb,
  Shield,
  SprayCan,
  Trash2,
  Activity,
  BarChart3,
  TrendingUp,
  Star,
  AlertTriangle,
  CheckSquare,
  UserCheck,
  FileCheck,
  Briefcase,
  Truck,
  Bell,
  Settings,
  Eye
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
import { VENDOR_DEMO_DATA } from "@/data/demoData";
import { useToast } from "@/components/providers/ToastProvider";

const vendorData = VENDOR_DEMO_DATA;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (date: string) => new Date(date).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
    case "approved":
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "assigned":
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
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

export const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadProofDialogOpen, setUploadProofDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const pendingJobs = vendorData.jobs.filter(j => j.status === "assigned");
  const activeJobs = vendorData.jobs.filter(j => j.status === "in_progress" || j.status === "assigned");
  const completedJobs = vendorData.jobs.filter(j => j.status === "completed");
  const urgentJobs = vendorData.jobs.filter(j => j.priority === "high" && j.status !== "completed");
  const pendingPayments = vendorData.invoices.filter(i => i.status === "pending");

  const handleAcceptJob = (jobId: string) => {
    toast("Success: Job accepted");
  };

  const handleRejectJob = (jobId: string) => {
    toast("Info: Job rejected");
  };

  const handleStartWork = (jobId: string) => {
    toast("Success: Work started");
  };

  const handleCompleteJob = (jobId: string) => {
    toast("Success: Job marked as completed");
    setUploadProofDialogOpen(false);
  };

  const handleUploadProof = (job: any) => {
    setSelectedJob(job);
    setUploadProofDialogOpen(true);
  };

  const handleSubmitInvoice = () => {
    toast("Success: Invoice submitted");
    setInvoiceDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="overview">Work</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="invoices">Pay</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="messages">Chat</TabsTrigger>
          <TabsTrigger value="performance">Stats</TabsTrigger>
          <TabsTrigger value="documents">Docs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* 1. Work Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Vendor Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">{vendorData.vendor.company} - {vendorData.vendor.service}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setInvoiceDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <FileText className="h-4 w-4 mr-2" /> Submit Invoice
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg"><Wrench className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Active Jobs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 p-2 rounded-lg"><AlertTriangle className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Urgent Tasks</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{urgentJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-600 p-2 rounded-lg"><Clock className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Pending Payment</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(pendingPayments.reduce((sum, i) => sum + i.amount, 0))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-2 rounded-lg"><CheckCircle className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendorData.schedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.task}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.unit}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{item.time}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Job Assignment */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Assigned Jobs</CardTitle>
              <CardDescription>Manage your job assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendorData.jobs.map((job) => (
                <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">{job.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {job.unit} - {job.property} • Assigned by {job.assignedBy}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Scheduled: {formatDate(job.scheduledDate)} - Pay: {formatCurrency(job.pay)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.status === "assigned" && (
                        <>
                          <Button size="sm" className="bg-green-600" onClick={() => handleAcceptJob(job.id)}>Accept</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectJob(job.id)}>Reject</Button>
                        </>
                      )}
                      {job.status === "in_progress" && (
                        <>
                          <Button size="sm" onClick={() => handleStartWork(job.id)}>Start Work</Button>
                          <Button size="sm" variant="outline" onClick={() => handleUploadProof(job)}>
                            <Upload className="h-4 w-4 mr-1" /> Upload Proof
                          </Button>
                          <Button size="sm" className="bg-green-600" onClick={() => handleCompleteJob(job.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Complete
                          </Button>
                        </>
                      )}
                      {job.status === "completed" && (
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" /> View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Invoice & Payment */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices & Payments</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage your invoices and payments</p>
            </div>
            <Button onClick={() => setInvoiceDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> New Invoice
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(vendorData.vendor.totalEarnings)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Payment</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(pendingPayments.reduce((sum, i) => sum + i.amount, 0))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(vendorData.invoices.filter(i => i.status === "approved").reduce((sum, i) => sum + i.amount, 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendorData.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{invoice.job}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(invoice.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(invoice.amount)}</p>
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    {invoice.status === "approved" && (
                      <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Schedule & Calendar */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendorData.schedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.task}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.unit}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{item.time}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Communication */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendorData.messages.map((msg) => (
                <div key={msg.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-900 dark:text-white">{msg.from}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{msg.message}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Type a message..." className="flex-1" />
                <Button><Send className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{vendorData.performance.rating}</p>
                <p className="text-sm text-slate-500">Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{vendorData.performance.completedJobs}</p>
                <p className="text-sm text-slate-500">Completed Jobs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{vendorData.performance.responseTime}</p>
                <p className="text-sm text-slate-500">Response Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{vendorData.performance.onTimeRate}%</p>
                <p className="text-sm text-slate-500">On-time Rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 7. Documents */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Documents & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendorData.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.type} - {formatDate(doc.date)}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>
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
      </Tabs>

      {/* Upload Proof Dialog */}
      <Dialog open={uploadProofDialogOpen} onOpenChange={setUploadProofDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Work Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Before Photo</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer">
                <Camera className="h-8 w-8 mx-auto text-slate-400" />
                <p className="text-sm text-slate-500 mt-2">Click to upload before photo</p>
              </div>
            </div>
            <div>
              <Label>After Photo</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer">
                <Camera className="h-8 w-8 mx-auto text-slate-400" />
                <p className="text-sm text-slate-500 mt-2">Click to upload after photo</p>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Describe the work done..." rows={3} />
            </div>
            <div>
              <Label>Materials Used</Label>
              <Input placeholder="List any materials used..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadProofDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => handleCompleteJob(selectedJob?.id)}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Job</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>
                  {vendorData.jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input placeholder="Enter amount" type="number" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Work description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitInvoice}>Submit Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};