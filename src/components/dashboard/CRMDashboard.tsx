import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRM_CONTACTS, BUSINESSES } from '@/data/mockData';
import { ProtectedFeature, ProtectedComponent } from "@/components/auth/ProtectedComponent";
import { PermissionAwareHeader, FeatureAccessIndicator } from "./PermissionAwareHeader";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useGetRentalApplicationsQuery,
  useUpdateRentalApplicationStatusMutation,
  useDeleteRentalApplicationMutation,
  useGetEnquiriesQuery,
  useUpdateEnquiryStatusMutation,
  useDeleteEnquiryMutation,
  type RentalApplicationStatus,
  type EnquiryStatus,
} from "@/services/estatesApi";
import { toast } from "@/components/ui/use-toast";
import {
  Users,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Shield,
  Building,
  UserCheck,
  TrendingUp,
  Search,
  Lock,
  Crown,
  FileText,
  Loader2,
  Trash2,
  MessageSquare,
} from "lucide-react";
const APP_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-purple-100 text-purple-800',
};

export const CRMDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState("all");
  const [appSearch, setAppSearch] = useState("");
  const [appStatus, setAppStatus] = useState("");
  const { hasPermission } = usePermissions();

  const [enqSearch, setEnqSearch] = useState("");
  const [enqStatus, setEnqStatus] = useState("");

  const { data: appsData, isLoading: appsLoading } = useGetRentalApplicationsQuery(
    { ...(appSearch ? { search: appSearch } : {}), ...(appStatus ? { status: appStatus } : {}) }
  );
  const [updateStatus] = useUpdateRentalApplicationStatusMutation();
  const [deleteApp] = useDeleteRentalApplicationMutation();
  const applications = appsData?.data ?? [];

  const { data: enqData, isLoading: enqLoading } = useGetEnquiriesQuery(
    { ...(enqSearch ? { search: enqSearch } : {}), ...(enqStatus ? { status: enqStatus } : {}) }
  );
  const [updateEnqStatus] = useUpdateEnquiryStatusMutation();
  const [deleteEnq] = useDeleteEnquiryMutation();
  const enquiries = enqData?.data ?? [];

  const handleStatusChange = async (id: string, status: RentalApplicationStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast({ title: 'Status updated' });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApp(id).unwrap();
      toast({ title: 'Application deleted' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleEnqStatusChange = async (id: string, status: EnquiryStatus) => {
    try {
      await updateEnqStatus({ id, status }).unwrap();
      toast({ title: 'Status updated' });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleEnqDelete = async (id: string) => {
    try {
      await deleteEnq(id).unwrap();
      toast({ title: 'Enquiry deleted' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const contacts = CRM_CONTACTS;
  const businesses = BUSINESSES;

  const walletData = {
    balance: 25000,
    transactions: [
      { id: 1, date: "2025-04-28", description: "Commission Payment - Vendor Referral", type: "deposit", amount: 5000, status: "completed", reference: "COM-20250428-001" },
      { id: 2, date: "2025-04-25", description: "Commission Payment - Police Contact", type: "deposit", amount: 3500, status: "completed", reference: "COM-20250425-001" },
      { id: 3, date: "2025-04-20", description: "Transfer to Bank Account", type: "withdraw", amount: 8000, status: "completed", reference: "TRF-20250420-001" },
      { id: 4, date: "2025-04-15", description: "Commission Payment - Security Vendor", type: "deposit", amount: 4500, status: "completed", reference: "COM-20250415-001" }
    ]
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalContacts = contacts.length;
  const vendorContacts = contacts.filter(c => c.isVendor).length;
  const totalCommissions = contacts.reduce((sum, c) => sum + (c.totalCommissions || 0), 0);
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'police': return <Shield className="h-4 w-4" />;
      case 'political': return <Building className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      case 'vendor': return <UserCheck className="h-4 w-4" />;
      case 'customer': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'police': return 'bg-blue-100 text-blue-800';
      case 'political': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'community': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-orange-100 text-orange-800';
      case 'customer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Permission-Aware Header */}
      <PermissionAwareHeader 
        title="CRM & Contact Management"
        description="Unified relationship management across all business units"
        showPermissionSummary={false}
        premiumFeature={false}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
          <FeatureAccessIndicator
            featureName="Add Contacts"
            requiredPermissions={['manage_commissions']}
            className="order-2 sm:order-1"
          />
          <ProtectedFeature
            requiredPermissions={['manage_commissions']}
            fallback={
              <Button disabled className="opacity-50 w-full sm:w-auto order-1 sm:order-2">
                <Lock className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Contact (Restricted)</span>
                <span className="sm:hidden">Restricted</span>
              </Button>
            }
          >
            <Button className="w-full sm:w-auto order-1 sm:order-2">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add New Contact</span>
              <span className="sm:hidden">Add Contact</span>
            </Button>
          </ProtectedFeature>
        </div>
      </PermissionAwareHeader>

      {/* CRM Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <div className="text-xs text-muted-foreground">Across all categories</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Partners</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorContacts}</div>
            <div className="text-xs text-muted-foreground">Commission-eligible</div>
          </CardContent>
        </Card>

        <ProtectedComponent 
          requiredPermissions={['manage_commissions', 'view_payment_history']}
          feature="Commission Data"
          showUpgradePrompt={true}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Total Commissions
                <Crown className="h-3 w-3 text-yellow-500" />
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalCommissions.toLocaleString()}</div>
              <div className="text-xs text-green-600">Paid out to date</div>
            </CardContent>
          </Card>
        </ProtectedComponent>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Adaptation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs text-muted-foreground">Business units integrated</div>
          </CardContent>
        </Card>
      </div>

      {/* Business-Specific CRM Adaptation */}
      <Card>
        <CardHeader>
          <CardTitle>CRM Business Adaptation</CardTitle>
          <CardDescription>Unified CRM system adapts per business unit requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Estate CRM */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Estate Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tenant Contacts</span>
                    <span className="font-medium">38</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Property Agents</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Maintenance Vendors</span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Tracks: Rent, Service charges, Caution fee, Legal fee
                </div>
              </CardContent>
            </Card>

            {/* Filling Station CRM */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Filling Station
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fuel Suppliers</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Office Tenants</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Customers</span>
                    <span className="font-medium">150+</span>
                  </div>
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Tracks: Tank capacity, Office rentals, Carwash, Gas space
                </div>
              </CardContent>
            </Card>

            {/* Equipment CRM */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Equipment Rental
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Construction Clients</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Equipment Dealers</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Partners</span>
                    <span className="font-medium">6</span>
                  </div>
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Tracks: Tipper/Excavator/Loader rentals, Service history
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Contact Management */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Database</CardTitle>
          <CardDescription>Comprehensive contact management with commission tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-contacts" className="space-y-4">
            <TabsList className="dashboard-tabs-list">
              <TabsTrigger value="all-contacts">All Contacts</TabsTrigger>
              <TabsTrigger value="vendors">Vendor Network</TabsTrigger>
              <TabsTrigger 
                value="commissions" 
                disabled={!hasPermission('manage_commissions')}
                className={!hasPermission('manage_commissions') ? 'opacity-50' : ''}
              >
                <div className="flex items-center gap-1">
                  Commission Tracking
                  {!hasPermission('manage_commissions') && <Lock className="w-3 h-3" />}
                </div>
              </TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="applications">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Applications
                  {applications.length > 0 && (
                    <span className="ml-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {applications.length}
                    </span>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger value="enquiries">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Enquiries
                  {enquiries.filter(e => e.status === 'new').length > 0 && (
                    <span className="ml-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {enquiries.filter(e => e.status === 'new').length}
                    </span>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-contacts" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm min-w-0 sm:min-w-[140px]"
                >
                  <option value="all">All Categories</option>
                  <option value="police">Police</option>
                  <option value="political">Political</option>
                  <option value="security">Security</option>
                  <option value="community">Community</option>
                  <option value="vendor">Vendor</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              {/* Contacts Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Vendor Status</TableHead>
                      <TableHead>Commissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{contact.name}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`flex items-center gap-1 ${getCategoryColor(contact.category)}`}>
                            {getCategoryIcon(contact.category)}
                            {contact.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{contact.relationship}</div>
                            <div className="text-xs text-muted-foreground">{contact.notes}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.isVendor ? (
                            <Badge variant="default">Vendor Partner</Badge>
                          ) : (
                            <Badge variant="outline">Regular Contact</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.totalCommissions ? (
                            <div className="space-y-1">
                              <div className="font-medium text-green-600">
                                ₦{contact.totalCommissions.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {contact.commissionRate}% rate
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="vendors" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vendor Partners</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contacts.filter(c => c.isVendor).map((vendor) => (
                        <div key={vendor.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="text-sm text-muted-foreground">{vendor.relationship}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₦{vendor.totalCommissions?.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">{vendor.commissionRate}% rate</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Commission Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Paid Out</span>
                        <span className="font-semibold">₦{totalCommissions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Vendors</span>
                        <span className="font-semibold">{vendorContacts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Rate</span>
                        <span className="font-semibold">
                          {(contacts.filter(c => c.isVendor).reduce((sum, c) => sum + (c.commissionRate || 0), 0) / vendorContacts).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="commissions" className="space-y-4">
              <ProtectedComponent
                requiredPermissions={['manage_commissions']}
                feature="Commission Management"
                showUpgradePrompt={true}
                fallback={
                  <div className="text-center py-8">
                    <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold text-muted-foreground">Commission Access Restricted</h3>
                    <p className="text-muted-foreground">This feature requires commission management permissions</p>
                  </div>
                }
              >
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Commission Management</h3>
                  <p className="text-muted-foreground">Track vendor commissions and payment schedules</p>
                  <Button className="mt-4">Process Payments</Button>
                </div>
              </ProtectedComponent>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {['police', 'political', 'security', 'community', 'vendor', 'customer'].map((category) => {
                  const count = contacts.filter(c => c.category === category).length;
                  return (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {getCategoryIcon(category)}
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">contacts</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="enquiries" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email…"
                    value={enqSearch}
                    onChange={(e) => setEnqSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={enqStatus || 'all'} onValueChange={(v) => setEnqStatus(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {enqLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : enquiries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No enquiries yet.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sender</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enquiries.map((enq) => (
                        <TableRow key={enq.id ?? enq._id} className={enq.status === 'new' ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}>
                          <TableCell>
                            <p className="font-medium">{enq.name}</p>
                            <p className="text-xs text-muted-foreground">{enq.email}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{enq.estate?.name ?? '—'}</p>
                            {enq.unit?.label && <p className="text-xs text-muted-foreground">{enq.unit.label}</p>}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-sm text-muted-foreground truncate">{enq.message}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${
                              enq.status === 'new' ? 'bg-orange-100 text-orange-800' :
                              enq.status === 'read' ? 'bg-blue-100 text-blue-800' :
                              enq.status === 'replied' ? 'bg-green-100 text-green-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {enq.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Select
                                value={enq.status}
                                onValueChange={(v) => handleEnqStatusChange(enq.id ?? enq._id, v as EnquiryStatus)}
                              >
                                <SelectTrigger className="h-7 text-xs w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="read">Read</SelectItem>
                                  <SelectItem value="replied">Replied</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                onClick={() => handleEnqDelete(enq.id ?? enq._id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email or phone…"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={appStatus || 'all'} onValueChange={(v) => setAppStatus(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              {appsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No rental applications yet.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Employment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id ?? app._id}>
                          <TableCell>
                            <p className="font-medium">{app.fullName}</p>
                            <p className="text-xs text-muted-foreground">{app.email}</p>
                            <p className="text-xs text-muted-foreground">{app.phone}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{app.estate?.name ?? '—'}</p>
                            {app.unit?.label && <p className="text-xs text-muted-foreground">{app.unit.label}</p>}
                          </TableCell>
                          <TableCell className="capitalize text-sm">
                            {app.employmentStatus?.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${APP_STATUS_COLORS[app.status] ?? 'bg-slate-100 text-slate-700'}`}>
                              {app.status?.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Select
                                value={app.status}
                                onValueChange={(v) => handleStatusChange(app.id ?? app._id, v as RentalApplicationStatus)}
                              >
                                <SelectTrigger className="h-7 text-xs w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="under_review">Under Review</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                onClick={() => handleDelete(app.id ?? app._id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
};