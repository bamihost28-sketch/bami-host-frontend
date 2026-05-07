export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'inflow' | 'outflow';
  portfolioType?: 'personal' | 'business';
  businessUnit?: string;
  status?: 'pending' | 'completed' | 'failed';
}

export interface WalletData {
  balance: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  pendingTransactions: number;
  allocations: {
    investment: number; // 50%
    withdrawals: number; // 30%
    operations: number; // 20%
  };
}

export interface NetWorthData {
  total: number;
  monthlyChange: number;
  changePercentage: number;
  breakdown: {
    personal: number;
    business: number;
  };
  historical: {
    hourly: number[];
    daily: number[];
    monthly: number[];
    yearly: number[];
    threeYear: number[];
  };
}

export interface SplitData {
  needs: { allocated: number; spent: number; budget: number; };
  wants: { allocated: number; spent: number; budget: number; };
  savings: { allocated: number; spent: number; budget: number; };
}

export interface Property {
  id: string;
  location: string;
  type: 'flat' | 'office' | 'shop';
  rentAmount: number;
  tenantName: string;
  tenantType: 'old' | 'new';
  status: 'occupied' | 'vacant' | 'maintenance';
  lastPayment: string;
  nextDue: string;
  serviceCharge: number;
  cautionFee: number;
  legalFee: number;
}

export interface Business {
  id: string;
  name: string;
  type: 'estate' | 'filling_station' | 'equipment';
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  assets: any[];
  performance: {
    efficiency: number;
    roi: number;
    growthRate: number;
  };
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: 'police' | 'political' | 'security' | 'community' | 'vendor' | 'customer';
  isVendor: boolean;
  commissionRate?: number;
  totalCommissions?: number;
  relationship: string;
  notes: string;
}

export interface LibraryContent {
  id: string;
  title: string;
  type: 'text' | 'audio' | 'video' | 'diagram';
  category: 'strategic' | 'operational' | 'technical' | 'training';
  targetAudience: ('super_admin' | 'admin' | 'manager' | 'vendor' | 'customer')[];
  content: string;
  tags: string[];
  crossReferences: string[];
  contradictions: string[];
  lastUpdated: string;
}

// Demo Users Data
export const DEMO_USERS = [
  {
    id: '1',
    email: 'ebami@eyituoyo.com',
    name: 'Ebami Eyituoyo',
    role: 'super_admin' as const,
    permissions: ['all'],
    workHours: { total: 8, active: 3 }, // 1/3rd rule
  },
  {
    id: '2',
    email: 'big7@eyituoyo.com',
    name: 'Big 7 Member',
    role: 'big7' as const,
    permissions: ['view_allocations', 'manage_portfolio'],
    profitShare: 15000,
  },
  // 8 Manager roles
  {
    id: '3',
    email: 'operations@eyituoyo.com',
    name: 'Operations Manager',
    role: 'manager' as const,
    department: 'operations',
    hourlyRate: 2500,
    permissions: ['manage_operations', 'view_reports'],
  },
  {
    id: '4',
    email: 'marketing@eyituoyo.com',
    name: 'Marketing Manager',
    role: 'manager' as const,
    department: 'marketing',
    hourlyRate: 2200,
    permissions: ['manage_marketing', 'view_analytics'],
  },
  {
    id: '5',
    email: 'sales@eyituoyo.com',
    name: 'Sales Manager',
    role: 'manager' as const,
    department: 'sales',
    hourlyRate: 2800,
    permissions: ['manage_sales', 'view_customers'],
  },
  {
    id: '6',
    email: 'delivery@eyituoyo.com',
    name: 'Delivery Manager',
    role: 'manager' as const,
    department: 'delivery',
    hourlyRate: 2000,
    permissions: ['manage_delivery', 'track_projects'],
  },
  {
    id: '7',
    email: 'financial@eyituoyo.com',
    name: 'Financial Manager',
    role: 'manager' as const,
    department: 'financial',
    hourlyRate: 3000,
    permissions: ['manage_finances', 'view_all_transactions'],
  },
  {
    id: '8',
    email: 'fundraising@eyituoyo.com',
    name: 'Fundraising Manager',
    role: 'manager' as const,
    department: 'fundraising',
    hourlyRate: 2600,
    permissions: ['manage_fundraising', 'view_investors'],
  },
  {
    id: '9',
    email: 'legal@eyituoyo.com',
    name: 'Legal & Security Manager',
    role: 'manager' as const,
    department: 'legal_security',
    hourlyRate: 3500,
    permissions: ['manage_legal', 'manage_security'],
  },
  {
    id: '10',
    email: 'automation@eyituoyo.com',
    name: 'Automation Manager',
    role: 'manager' as const,
    department: 'automation',
    hourlyRate: 4000,
    permissions: ['manage_automation', 'system_admin'],
  },
  // Vendor Users
  {
    id: '11',
    email: 'vendor@eyituoyo.com',
    name: 'Service Vendor',
    role: 'vendor' as const,
    department: 'external',
    commissionRate: 15,
    totalEarnings: 75000,
    permissions: ['upload_work', 'view_payments', 'track_commissions'],
  },
  {
    id: '12',
    email: 'contractor@eyituoyo.com',
    name: 'Building Contractor',
    role: 'vendor' as const,
    department: 'construction',
    commissionRate: 12,
    totalEarnings: 240000,
    permissions: ['manage_projects', 'submit_reports'],
  },
  // Customer Users
  {
    id: '13',
    email: 'customer@eyituoyo.com',
    name: 'Premium Customer',
    role: 'customer' as const,
    customerType: 'premium',
    totalSpent: 450000,
    activeContracts: 2,
    permissions: ['view_account', 'make_payments', 'track_projects'],
  },
  {
    id: '14',
    email: 'client@eyituoyo.com',
    name: 'Regular Client',
    role: 'customer' as const,
    customerType: 'regular',
    totalSpent: 125000,
    activeContracts: 1,
    permissions: ['view_account', 'make_payments'],
  },
];

// Net Worth Data
export const NET_WORTH_DATA: NetWorthData = {
  total: 52750000, // ₦52.75M
  monthlyChange: 1250000,
  changePercentage: 2.4,
  breakdown: {
    personal: 15750000,
    business: 37000000,
  },
  historical: {
    hourly: [52750000, 52751500, 52749800, 52752300],
    daily: [52750000, 52680000, 52820000, 52750000],
    monthly: [51500000, 51800000, 52100000, 52750000],
    yearly: [48000000, 50200000, 51800000, 52750000],
    threeYear: [42000000, 45000000, 48000000, 50200000, 51800000, 52750000],
  },
};

// Estate Portfolio Data (₦18M yearly)
export const ESTATE_PROPERTIES: Property[] = [
  // Balado Estate - 32 units
  ...Array.from({ length: 32 }, (_, i) => ({
    id: `balado_${i + 1}`,
    location: `Balado Estate Unit ${i + 1}`,
    type: 'flat' as 'flat' | 'office' | 'shop',
    rentAmount: 45000,
    tenantName: `Tenant ${i + 1}`,
    tenantType: i < 20 ? 'old' as const : 'new' as const,
    status: i < 30 ? 'occupied' as const : 'vacant' as const,
    lastPayment: '2024-01-01',
    nextDue: '2024-02-01',
    serviceCharge: 5000,
    cautionFee: 90000,
    legalFee: 15000,
  })),
  // Oke Street - 2 units
  {
    id: 'oke_1',
    location: 'Oke Street Unit 1',
    type: 'flat',
    rentAmount: 65000,
    tenantName: 'Oke Tenant 1',
    tenantType: 'old',
    status: 'occupied',
    lastPayment: '2024-01-01',
    nextDue: '2024-02-01',
    serviceCharge: 7000,
    cautionFee: 130000,
    legalFee: 20000,
  },
  {
    id: 'oke_2',
    location: 'Oke Street Unit 2',
    type: 'flat',
    rentAmount: 65000,
    tenantName: 'Oke Tenant 2',
    tenantType: 'new',
    status: 'occupied',
    lastPayment: '2024-01-01',
    nextDue: '2024-02-01',
    serviceCharge: 7000,
    cautionFee: 130000,
    legalFee: 20000,
  },
  // Itskiri - 4 units
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `itskiri_${i + 1}`,
    location: `Itskiri Unit ${i + 1}`,
    type: 'flat' as 'flat' | 'office' | 'shop',
    rentAmount: 55000,
    tenantName: `Itskiri Tenant ${i + 1}`,
    tenantType: i < 2 ? 'old' as const : 'new' as const,
    status: 'occupied' as const,
    lastPayment: '2024-01-01',
    nextDue: '2024-02-01',
    serviceCharge: 6000,
    cautionFee: 110000,
    legalFee: 18000,
  })),
];

// Business Data
export const BUSINESSES: Business[] = [
  {
    id: 'estate',
    name: 'Real Estate Portfolio',
    type: 'estate',
    monthlyRevenue: 1500000, // ₦18M/12
    monthlyExpenses: 300000,
    netProfit: 1200000,
    assets: ESTATE_PROPERTIES,
    performance: {
      efficiency: 85,
      roi: 24.5,
      growthRate: 12.3,
    },
  },
  {
    id: 'filling_station',
    name: 'Filling Station Business',
    type: 'filling_station',
    monthlyRevenue: 850000,
    monthlyExpenses: 420000,
    netProfit: 430000,
    assets: [
      {
        id: 'tank_1',
        type: 'fuel_tank',
        capacity: 33000,
        currentLevel: 28500,
        lastRefill: '2024-01-10',
        fuelType: 'Petrol',
      },
      {
        id: 'tank_2',
        type: 'fuel_tank',
        capacity: 33000,
        currentLevel: 31200,
        lastRefill: '2024-01-08',
        fuelType: 'Diesel',
      },
      {
        id: 'tank_3',
        type: 'fuel_tank',
        capacity: 33000,
        currentLevel: 15600,
        lastRefill: '2024-01-12',
        fuelType: 'Kerosene',
      },
      {
        id: 'tank_4',
        type: 'fuel_tank',
        capacity: 33000,
        currentLevel: 22800,
        lastRefill: '2024-01-09',
        fuelType: 'Premium',
      },
      {
        id: 'office_1',
        type: 'office_space',
        monthlyRent: 45000,
        tenant: 'Mini Mart',
        status: 'occupied',
      },
      {
        id: 'carwash',
        type: 'carwash',
        dailyRevenue: 8500,
        monthlyRevenue: 255000,
        status: 'operational',
      },
      {
        id: 'gas_station',
        type: 'gas_station',
        monthlyRevenue: 125000,
        cylindersInStock: 45,
        status: 'operational',
      },
    ],
    performance: {
      efficiency: 78,
      roi: 18.2,
      growthRate: 8.7,
    },
  },
  {
    id: 'equipment',
    name: 'Equipment Rental',
    type: 'equipment',
    monthlyRevenue: 320000,
    monthlyExpenses: 120000,
    netProfit: 200000,
    assets: [
      {
        id: 'tipper_1',
        type: 'tipper',
        model: 'Dangote Tipper',
        dailyRate: 25000,
        monthlyRevenue: 450000,
        status: 'available',
        lastService: '2024-01-05',
        nextService: '2024-04-05',
      },
      {
        id: 'excavator_1',
        type: 'excavator',
        model: 'CAT Excavator',
        dailyRate: 35000,
        monthlyRevenue: 630000,
        status: 'rented',
        currentClient: 'Construction Co.',
        rentEndDate: '2024-02-15',
      },
      {
        id: 'loader_1',
        type: 'self_loader',
        model: 'Self Loader',
        dailyRate: 28000,
        monthlyRevenue: 420000,
        status: 'maintenance',
        maintenanceEndDate: '2024-01-20',
      },
    ],
    performance: {
      efficiency: 92,
      roi: 22.8,
      growthRate: 15.4,
    },
  },
];

// Wallet Data for different user types
export const WALLET_DATA = {
  owner: {
    balance: 2850000,
    monthlyInflow: 3200000,
    monthlyOutflow: 1950000,
    pendingTransactions: 5,
    allocations: {
      investment: 1600000, // 50%
      withdrawals: 960000, // 30%
      operations: 640000, // 20%
    },
  },
  big7: {
    balance: 185000,
    monthlyInflow: 150000,
    monthlyOutflow: 85000,
    pendingTransactions: 2,
    allocations: {
      investment: 75000,
      withdrawals: 45000,
      operations: 30000,
    },
  },
  manager: {
    balance: 125000,
    monthlyInflow: 200000,
    monthlyOutflow: 145000,
    pendingTransactions: 3,
    allocations: {
      investment: 100000,
      withdrawals: 60000,
      operations: 40000,
    },
  },
  vendor: {
    balance: 85000,
    monthlyInflow: 120000,
    monthlyOutflow: 95000,
    pendingTransactions: 1,
    allocations: {
      investment: 60000,
      withdrawals: 36000,
      operations: 24000,
    },
  },
  customer: {
    balance: 45000,
    monthlyInflow: 350000,
    monthlyOutflow: 320000,
    pendingTransactions: 2,
    allocations: {
      investment: 175000,
      withdrawals: 105000,
      operations: 70000,
    },
  },
};

// Recent Transactions
export const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Estate Rental Income - Balado',
    amount: 1440000,
    category: 'Business Income',
    type: 'inflow',
    portfolioType: 'business',
    businessUnit: 'estate',
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Filling Station Revenue',
    amount: 850000,
    category: 'Business Income',
    type: 'inflow',
    portfolioType: 'business',
    businessUnit: 'filling_station',
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'Equipment Rental - Excavator',
    amount: 35000,
    category: 'Business Income',
    type: 'inflow',
    portfolioType: 'business',
    businessUnit: 'equipment',
    status: 'completed',
  },
  {
    id: '4',
    date: '2024-01-12',
    description: 'Owner Withdrawal - Personal',
    amount: -250000,
    category: 'Owner Withdrawal',
    type: 'outflow',
    portfolioType: 'personal',
    status: 'completed',
  },
  {
    id: '5',
    date: '2024-01-11',
    description: 'Operations - Estate Maintenance',
    amount: -85000,
    category: 'Operations',
    type: 'outflow',
    portfolioType: 'business',
    businessUnit: 'estate',
    status: 'completed',
  },
  {
    id: '6',
    date: '2024-01-10',
    description: 'Investment - T-Bills Purchase',
    amount: -500000,
    category: 'Investment',
    type: 'outflow',
    portfolioType: 'business',
    status: 'pending',
  },
];

// Personal Life Sub-Portfolios
export const PERSONAL_PORTFOLIOS = {
  food: {
    monthlyBudget: 120000,
    spent: 95000,
    category: 'needs',
    split: { investment: 60000, withdrawals: 36000, operations: 24000 },
  },
  healthcare: {
    monthlyBudget: 80000,
    spent: 65000,
    category: 'needs',
    split: { investment: 40000, withdrawals: 24000, operations: 16000 },
  },
  shelter: {
    monthlyBudget: 200000,
    spent: 180000,
    category: 'needs',
    split: { investment: 100000, withdrawals: 60000, operations: 40000 },
  },
  family: {
    monthlyBudget: 150000,
    spent: 120000,
    category: 'wants',
    split: { investment: 75000, withdrawals: 45000, operations: 30000 },
  },
  transport: {
    monthlyBudget: 100000,
    spent: 85000,
    category: 'needs',
    split: { investment: 50000, withdrawals: 30000, operations: 20000 },
  },
  education: {
    monthlyBudget: 75000,
    spent: 75000,
    category: 'savings',
    split: { investment: 37500, withdrawals: 22500, operations: 15000 },
  },
  selfBranding: {
    monthlyBudget: 90000,
    spent: 70000,
    category: 'wants',
    split: { investment: 45000, withdrawals: 27000, operations: 18000 },
  },
};

// CRM Contacts
export const CRM_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Inspector Johnson',
    email: 'johnson@police.gov',
    phone: '+234801234567',
    category: 'police',
    isVendor: true,
    commissionRate: 5,
    totalCommissions: 25000,
    relationship: 'Security Contact',
    notes: 'Reliable for estate security matters',
  },
  {
    id: '2',
    name: 'Hon. Williams',
    email: 'williams@lagosstate.gov',
    phone: '+234802345678',
    category: 'political',
    isVendor: false,
    relationship: 'Local Government Contact',
    notes: 'Helps with permits and approvals',
  },
  {
    id: '3',
    name: 'Chief Adebayo',
    email: 'adebayo@community.org',
    phone: '+234803456789',
    category: 'community',
    isVendor: true,
    commissionRate: 3,
    totalCommissions: 15000,
    relationship: 'Community Leader',
    notes: 'Mediates tenant disputes',
  },
  {
    id: '4',
    name: 'ABC Construction Ltd',
    email: 'info@abcconstruction.com',
    phone: '+234804567890',
    category: 'vendor',
    isVendor: true,
    commissionRate: 0,
    totalCommissions: 0,
    relationship: 'Equipment Rental Client',
    notes: 'Regular excavator rentals',
  },
];

// Library Content
export const LIBRARY_CONTENT: LibraryContent[] = [
  {
    id: '1',
    title: 'Strategic Decision Making Framework',
    type: 'text',
    category: 'strategic',
    targetAudience: ['manager'] as any,
    content: 'Framework for making high-impact decisions using the 4% rule...',
    tags: ['strategy', 'decision-making', '4% rule'],
    crossReferences: ['2', '3'],
    contradictions: [],
    lastUpdated: '2024-01-10',
  },
  {
    id: '2',
    title: 'Time Management - 1/3rd Rule Implementation',
    type: 'video',
    category: 'strategic',
    targetAudience: ['manager'] as any,
    content: 'Video guide on implementing the 1/3rd active time rule...',
    tags: ['time-management', '1/3rd rule', 'efficiency'],
    crossReferences: ['1'],
    contradictions: [],
    lastUpdated: '2024-01-08',
  },
  {
    id: '3',
    title: 'Hire Like a Boss - Complete System',
    type: 'text',
    category: 'operational',
    targetAudience: ['manager'],
    content: 'Complete hiring system with interviews, assessments...',
    tags: ['hiring', 'management', 'team-building'],
    crossReferences: ['4'],
    contradictions: [],
    lastUpdated: '2024-01-05',
  },
  {
    id: '4',
    title: 'Sell Like Crazy - Sales Framework',
    type: 'audio',
    category: 'operational',
    targetAudience: ['manager'],
    content: 'Audio course on advanced sales techniques...',
    tags: ['sales', 'customer-relations', 'revenue'],
    crossReferences: ['3'],
    contradictions: [],
    lastUpdated: '2024-01-03',
  },
];

// Helper function to calculate 50/30/20 splits
export const calculateSplit = (amount: number) => ({
  investment: amount * 0.5,
  withdrawals: amount * 0.3,
  operations: amount * 0.2,
});

// Helper function to calculate 4/20/80 rule
export const calculateEfficiency = (activities: any[]) => ({
  strategic: activities.filter(a => a.type === 'strategic').length / activities.length,
  managerial: activities.filter(a => a.type === 'managerial').length / activities.length,
  delegatable: activities.filter(a => a.type === 'delegatable').length / activities.length,
});

// ============================================================
// Dashboard Demo Data (for dashboards without API endpoints)
// ============================================================

// --- Tenant Dashboard Demo Data ---
export const TENANT_DEMO_DATA = {
  tenant: {
    id: "tenant_001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+2349012345678",
    apartmentNumber: "Flat 4B",
    estateName: "Rose Garden Estate",
    leaseStatus: "active",
    leaseEndDate: "2026-12-31",
    monthlyRent: 250000,
    rentDueDay: 25,
    outstandingBalance: 0,
    nextPaymentDue: "2025-05-25"
  },
  paymentHistory: [
    { id: "1", month: "April 2025", amount: 250000, status: "paid", date: "2025-04-23", method: "Transfer" },
    { id: "2", month: "March 2025", amount: 250000, status: "paid", date: "2025-03-22", method: "Transfer" },
    { id: "3", month: "February 2025", amount: 250000, status: "paid", date: "2025-02-24", method: "Bank Deposit" },
    { id: "4", month: "January 2025", amount: 250000, status: "paid", date: "2025-01-23", method: "Transfer" }
  ],
  serviceCharges: [
    { id: "1", type: "Service Charge", month: "April 2025", amount: 15000, status: "paid", date: "2025-04-10" },
    { id: "2", type: "Service Charge", month: "March 2025", amount: 15000, status: "paid", date: "2025-03-10" },
    { id: "3", type: "Water Bill", month: "April 2025", amount: 5000, status: "pending" },
    { id: "4", type: "Electricity", month: "April 2025", amount: 12000, status: "pending" }
  ],
  maintenanceRequests: [
    { id: "1", title: "Leaking kitchen faucet", category: "plumbing", status: "in_progress", createdAt: "2025-04-15", assignedTo: "Mr. Adebayo", estimatedCompletion: "2025-04-25" },
    { id: "2", title: "AC not cooling properly", category: "ac_repair", status: "pending", createdAt: "2025-04-20", assignedTo: null, estimatedCompletion: null },
    { id: "3", title: "Broken bedroom lock", category: "security", status: "completed", createdAt: "2025-03-10", assignedTo: "Mr. Chidi", estimatedCompletion: "2025-03-12" }
  ],
  visitors: [
    { id: "1", name: "Michael Brown", phone: "+2348012345678", purpose: "Family Visit", expectedArrival: "2025-04-25", accessCode: "VST-2025-0425", status: "approved" },
    { id: "2", name: "Delivery - DHL", phone: "+2347000000000", purpose: "Package Delivery", expectedArrival: "2025-04-24", accessCode: "VST-2025-0424", status: "pending" }
  ],
  notices: [
    { id: "1", title: "Scheduled Water Shutdown", type: "important", date: "2025-04-28", content: "Water supply will be disrupted from 9AM to 5PM for maintenance work." },
    { id: "2", title: "Estate Security Update", type: "info", date: "2025-04-22", content: "New security protocols effective immediately. Please ensure all visitors register at the gate." },
    { id: "3", title: "Community Meeting", type: "event", date: "2025-05-01", content: "Monthly estate meeting holding at the clubhouse by 10AM." }
  ],
  documents: [
    { id: "1", name: "Lease Agreement", type: "lease", date: "2024-12-31" },
    { id: "2", name: "Move-in Checklist", type: "checklist", date: "2024-12-31" },
    { id: "3", name: "House Rules", type: "policy", date: "2024-12-31" }
  ],
  complaints: [
    { id: "1", title: "Excessive noise from 5B", category: "noise", status: "resolved", createdAt: "2025-03-15", response: "Warning issued to the resident." }
  ]
};

// --- Owner Dashboard Demo Data ---
export const OWNER_DEMO_DATA = {
  owner: { id: "owner_001", name: "Property Owner", email: "owner@estate.com", phone: "+2349012345678" },
  properties: [
    { id: "prop_001", name: "Rose Garden Estate", address: "123 Rose Garden Ave, Lagos", totalUnits: 24, occupiedUnits: 20, vacantUnits: 4, monthlyRent: 2400000, outstanding: 150000 },
    { id: "prop_002", name: "Palm Springs Apartments", address: "45 Palm Drive, Lagos", totalUnits: 12, occupiedUnits: 10, vacantUnits: 2, monthlyRent: 1200000, outstanding: 80000 }
  ],
  tenants: [
    { id: "tenant_001", name: "John Doe", email: "john.doe@email.com", phone: "+2349012345678", property: "Rose Garden Estate", unit: "Flat 4B", leaseStart: "2024-01-01", leaseEnd: "2026-12-31", rentStatus: "paid", rentAmount: 250000, lastPayment: "2025-04-23" },
    { id: "tenant_002", name: "Jane Smith", email: "jane.smith@email.com", phone: "+2348012345678", property: "Rose Garden Estate", unit: "Flat 5A", leaseStart: "2024-06-01", leaseEnd: "2025-05-31", rentStatus: "pending", rentAmount: 200000, lastPayment: "2025-03-01" },
    { id: "tenant_003", name: "Mike Johnson", email: "mike.j@email.com", phone: "+2347012345678", property: "Palm Springs", unit: "Unit 8", leaseStart: "2024-03-01", leaseEnd: "2025-02-28", rentStatus: "paid", rentAmount: 150000, lastPayment: "2025-04-20" },
    { id: "tenant_004", name: "Sarah Williams", email: "sarah.w@email.com", phone: "+2348011111111", property: "Rose Garden Estate", unit: "Flat 2A", leaseStart: "2025-01-01", leaseEnd: "2025-12-31", rentStatus: "overdue", rentAmount: 300000, lastPayment: "2025-01-15" }
  ],
  maintenanceRequests: [
    { id: "maint_001", tenant: "John Doe", unit: "Flat 4B", issue: "Leaking kitchen faucet", category: "plumbing", status: "pending", createdAt: "2025-04-20", estimatedCost: 15000 },
    { id: "maint_002", tenant: "Jane Smith", unit: "Flat 5A", issue: "AC not cooling", category: "ac_repair", status: "in_progress", createdAt: "2025-04-18", assignedTo: "Mr. Adebayo", estimatedCost: 35000 },
    { id: "maint_003", tenant: "Mike Johnson", unit: "Unit 8", issue: "Broken bedroom lock", category: "security", status: "completed", createdAt: "2025-04-10", completedAt: "2025-04-12", cost: 8000 }
  ],
  financials: { totalMonthlyIncome: 3600000, collectedThisMonth: 2950000, outstandingBalance: 230000, serviceCharges: 180000, expenses: 450000, profit: 2970000 },
  leases: [
    { id: "lease_001", tenant: "John Doe", unit: "Flat 4B", property: "Rose Garden Estate", startDate: "2024-01-01", endDate: "2026-12-31", status: "active", monthlyRent: 250000 },
    { id: "lease_002", tenant: "Jane Smith", unit: "Flat 5A", property: "Rose Garden Estate", startDate: "2024-06-01", endDate: "2025-05-31", status: "expiring_soon", monthlyRent: 200000 },
    { id: "lease_003", tenant: "Sarah Williams", unit: "Flat 2A", property: "Rose Garden Estate", startDate: "2025-01-01", endDate: "2025-12-31", status: "active", monthlyRent: 300000 }
  ],
  recentActivities: [
    { id: 1, type: "payment", description: "Rent payment received from John Doe", amount: 250000, date: "2025-04-23" },
    { id: 2, type: "maintenance", description: "New maintenance request from Flat 4B", date: "2025-04-20" },
    { id: 3, type: "lease", description: "Lease renewed for Unit 8", date: "2025-04-18" },
    { id: 4, type: "tenant", description: "New tenant moved into Flat 2A", date: "2025-04-15" },
    { id: 5, type: "payment", description: "Rent payment received from Mike Johnson", amount: 150000, date: "2025-04-20" }
  ]
};

// --- Manager Dashboard Demo Data ---
export const MANAGER_DEMO_DATA = {
  manager: { id: "mgr_001", name: "Estate Manager", email: "manager@estate.com", phone: "+2349012345678", assignedProperty: "Rose Garden Estate" },
  property: { name: "Rose Garden Estate", address: "123 Rose Garden Ave, Lagos", totalUnits: 120, occupiedUnits: 105, vacantUnits: 15 },
  tenants: [
    { id: "t1", name: "John Doe", unit: "Flat 4B", phone: "+2349012345678", status: "active", rentStatus: "paid" },
    { id: "t2", name: "Jane Smith", unit: "Flat 5A", phone: "+2348012345678", status: "active", rentStatus: "pending" },
    { id: "t3", name: "Mike Johnson", unit: "Unit 8", phone: "+2347012345678", status: "active", rentStatus: "paid" },
    { id: "t4", name: "Sarah Williams", unit: "Flat 2A", phone: "+2348011111111", status: "active", rentStatus: "overdue" }
  ],
  maintenanceRequests: [
    { id: "m1", tenant: "John Doe", unit: "Flat 4B", issue: "Leaking faucet", category: "plumbing", priority: "medium", status: "pending", date: "2025-04-20", estimatedCost: 15000 },
    { id: "m2", tenant: "Jane Smith", unit: "Flat 5A", issue: "AC not cooling", category: "ac", priority: "high", status: "in_progress", date: "2025-04-18", assignedTo: "Mr. Adebayo" },
    { id: "m3", tenant: "Mike Johnson", unit: "Unit 8", issue: "Broken lock", category: "security", priority: "low", status: "completed", date: "2025-04-10", completedDate: "2025-04-12", cost: 8000 }
  ],
  staff: [
    { id: "s1", name: "Mr. John", role: "Security", shift: "Morning", status: "on_duty", phone: "+2348011111111" },
    { id: "s2", name: "Mr. Adebayo", role: "Electrician", shift: "Day", status: "on_duty", phone: "+2348022222222" },
    { id: "s3", name: "Mrs. Grace", role: "Cleaner", shift: "Morning", status: "off_duty", phone: "+2348033333333" },
    { id: "s4", name: "Mr. Chidi", role: "Plumber", shift: "Day", status: "on_duty", phone: "+2348044444444" }
  ],
  visitors: [
    { id: "v1", name: "Michael Brown", phone: "+2349000000000", unit: "Flat 4B", purpose: "Family Visit", time: "10:30 AM", status: "approved" },
    { id: "v2", name: "DHL Delivery", phone: "+2347000000000", unit: "Flat 5A", purpose: "Package", time: "11:00 AM", status: "pending" },
    { id: "v3", name: "Sarah's Guest", phone: "+2348055555555", unit: "Flat 2A", purpose: "Friend", time: "2:00 PM", status: "approved" }
  ],
  complaints: [
    { id: "c1", tenant: "Sarah Williams", unit: "Flat 2A", type: "noise", description: "Noise from 2B", status: "pending", date: "2025-04-20" },
    { id: "c2", tenant: "Mike Johnson", unit: "Unit 8", type: "neighbor", description: "Parking issue", status: "resolved", date: "2025-04-15" }
  ],
  leases: [
    { id: "l1", tenant: "John Doe", unit: "Flat 4B", startDate: "2024-01-01", endDate: "2026-12-31", status: "active" },
    { id: "l2", tenant: "Jane Smith", unit: "Flat 5A", startDate: "2024-06-01", endDate: "2025-05-31", status: "expiring_soon" },
    { id: "l3", tenant: "Mike Johnson", unit: "Unit 8", startDate: "2024-03-01", endDate: "2025-02-28", status: "active" }
  ],
  utilities: [
    { id: "u1", type: "Water", status: "normal", lastChecked: "2025-04-20" },
    { id: "u2", type: "Electricity", status: "normal", lastChecked: "2025-04-20" },
    { id: "u3", type: "Generator", status: "maintenance_due", lastChecked: "2025-04-15" }
  ],
  vendors: [
    { id: "v1", name: "ABC Electric", service: "Electrical", phone: "+2348011111111" },
    { id: "v2", name: "Quick Fix Plumbing", service: "Plumbing", phone: "+2348022222222" },
    { id: "v3", name: "Clean Pro Services", service: "Cleaning", phone: "+2348033333333" }
  ],
  dailyLogs: [
    { id: "d1", type: "maintenance", description: "Completed 3 repairs", staff: "Mr. Adebayo", date: "2025-04-20" },
    { id: "d2", type: "security", description: "No incidents reported", staff: "Mr. John", date: "2025-04-20" },
    { id: "d3", type: "visitor", description: "15 visitors today", staff: "Security", date: "2025-04-20" }
  ]
};

// --- Vendor Dashboard Demo Data ---
export const VENDOR_DEMO_DATA = {
  vendor: { id: "v001", name: "Mr. Adebayo", company: "Quick Fix Services", service: "Plumbing & Electrical", phone: "+2348012345678", email: "adebayo@quickfix.com", rating: 4.8, completedJobs: 156, totalEarnings: 2450000 },
  jobs: [
    { id: "j001", title: "Fix leaking kitchen faucet", unit: "Flat 4B", property: "Rose Garden Estate", category: "plumbing", priority: "high", status: "assigned", assignedBy: "Estate Manager", scheduledDate: "2025-04-25", expectedCompletion: "2025-04-25", pay: 15000 },
    { id: "j002", title: "AC unit not cooling", unit: "Flat 5A", property: "Rose Garden Estate", category: "ac_repair", priority: "medium", status: "in_progress", assignedBy: "Estate Manager", scheduledDate: "2025-04-24", expectedCompletion: "2025-04-26", pay: 35000 },
    { id: "j003", title: "Replace broken door lock", unit: "Unit 8", property: "Palm Springs", category: "security", priority: "low", status: "completed", assignedBy: "Estate Manager", scheduledDate: "2025-04-10", completedDate: "2025-04-12", pay: 8000 }
  ],
  invoices: [
    { id: "inv001", job: "Fix leaking kitchen faucet", amount: 15000, status: "pending", date: "2025-04-20" },
    { id: "inv002", job: "AC repair", amount: 35000, status: "approved", date: "2025-04-18" },
    { id: "inv003", job: "Door lock replacement", amount: 8000, status: "paid", date: "2025-04-12" }
  ],
  payments: [
    { id: "p001", description: "Door lock replacement", amount: 8000, date: "2025-04-12", status: "paid" },
    { id: "p002", description: "Bathroom pipe repair", amount: 12000, date: "2025-04-08", status: "paid" }
  ],
  messages: [
    { id: "m1", from: "Estate Manager", message: "Please prioritize Flat 4B", time: "2 hours ago" },
    { id: "m2", from: "Tenant - Flat 5A", message: "When will you arrive?", time: "5 hours ago" }
  ],
  schedule: [
    { id: "s1", task: "Fix leaking faucet", time: "10:00 AM", unit: "Flat 4B" },
    { id: "s2", task: "AC inspection", time: "2:00 PM", unit: "Flat 5A" }
  ],
  performance: { completedJobs: 156, responseTime: "2 hours", rating: 4.8, onTimeRate: 95 },
  documents: [
    { id: "d1", name: "Service Agreement 2024", type: "contract", date: "2024-01-01" },
    { id: "d2", name: "Insurance Certificate", type: "compliance", date: "2024-01-15" }
  ]
};

// --- Customer Dashboard Demo Data ---
export const CUSTOMER_DEMO_DATA = {
  customer: {
    id: "cus_123", name: "David Lee", email: "david.lee@email.com", phone: "+234901234567",
    accountNumber: "ACC-789456", walletBalance: 450000, totalContracts: 3, activeContracts: 2,
    completedProjects: 8, totalBalance: 580000, currentDue: 72000, creditLimit: 1500000, nextPaymentDate: "2024-02-15"
  },
  contracts: [
    {
      id: "contract_001", projectName: "Estate Property Maintenance", vendorName: "ABC Construction Ltd", vendorId: "ven_789",
      totalAmount: 1200000, paymentOption: "installment", upfrontDeposit: 480000, remainingBalance: 720000,
      interestRate: 0.20, balanceWithInterest: 864000, monthlyPayment: 72000, paymentsRemaining: 8,
      nextPaymentDue: "2024-02-15", latePenaltyPerDay: 300, cancellationFee: 240000, status: "active",
      startDate: "2024-01-15", expectedCompletionDate: "2024-04-15", escrowAccount: "OPAY_ESC_001", escrowBalance: 864000,
      deliveryStages: [
        { stage: 1, name: "Foundation & Planning", amount: 400000, status: "completed", customerAcknowledged: true, acknowledgedDate: "2024-01-22", paymentReleased: true, paymentReleaseDate: "2024-01-22" },
        { stage: 2, name: "Structure & Roofing", amount: 400000, status: "in_progress", customerAcknowledged: false, acknowledgedDate: null, paymentReleased: false },
        { stage: 3, name: "Finishing & Handover", amount: 400000, status: "pending", customerAcknowledged: false, acknowledgedDate: null, paymentReleased: false }
      ]
    },
    {
      id: "contract_002", projectName: "Equipment Rental - Excavator", vendorName: "Heavy Equipment Rentals", vendorId: "ven_456",
      totalAmount: 800000, paymentOption: "one_time", upfrontDeposit: 800000, remainingBalance: 0,
      interestRate: 0, balanceWithInterest: 0, monthlyPayment: 0, paymentsRemaining: 0,
      nextPaymentDue: null, latePenaltyPerDay: 0, cancellationFee: 160000, status: "active",
      startDate: "2024-02-01", expectedCompletionDate: "2024-02-28", escrowAccount: "OPAY_ESC_002", escrowBalance: 266666,
      deliveryStages: [
        { stage: 1, name: "Equipment Delivery & Setup", amount: 266667, status: "completed", customerAcknowledged: true, acknowledgedDate: "2024-02-01", paymentReleased: true },
        { stage: 2, name: "Operation & Maintenance", amount: 266667, status: "completed", customerAcknowledged: true, acknowledgedDate: "2024-02-09", paymentReleased: true },
        { stage: 3, name: "Project Completion & Return", amount: 266666, status: "in_progress", customerAcknowledged: false, acknowledgedDate: null, paymentReleased: false }
      ]
    }
  ],
  paymentHistory: [
    { id: "pay_001", contractId: "contract_001", date: "2024-01-15", description: "Estate Maintenance - Upfront Deposit (40%)", amount: 480000, type: "deposit", status: "completed", method: "bank_transfer", penalty: 0 },
    { id: "pay_002", contractId: "contract_001", date: "2024-01-22", description: "Stage 1 Payment Release to Vendor", amount: 400000, type: "stage_payment", status: "released_to_vendor", method: "escrow_release", penalty: 0 },
    { id: "pay_003", contractId: "contract_001", date: "2024-02-15", description: "Monthly Installment Payment", amount: 72000, type: "installment", status: "overdue", method: "auto_debit", penalty: 900, daysOverdue: 3 },
    { id: "pay_004", contractId: "contract_002", date: "2024-02-01", description: "Equipment Rental - Full Payment", amount: 800000, type: "full_payment", status: "completed", method: "wallet_debit", penalty: 0 }
  ],
  installmentPlans: [
    { id: '1', name: 'Equipment Purchase - Phase 1', totalAmount: 15000, paidAmount: 9000, remainingAmount: 6000, monthlyPayment: 1500, nextDue: '2024-02-01', installmentsLeft: 4, status: 'active' },
    { id: '2', name: 'Service Package - Annual', totalAmount: 12000, paidAmount: 6000, remainingAmount: 6000, monthlyPayment: 1000, nextDue: '2024-02-15', installmentsLeft: 6, status: 'active' },
    { id: '3', name: 'Consultation Services', totalAmount: 5000, paidAmount: 5000, remainingAmount: 0, monthlyPayment: 833, nextDue: null, installmentsLeft: 0, status: 'completed' }
  ],
  penalties: { totalPenalties: 150, activePenalties: 75, paidPenalties: 75 }
};

// --- Big7 Dashboard Demo Data ---
export const BIG7_DEMO_DATA = {
  member: { name: "Sarah Johnson", allocation: 14.28, monthlyProfit: 12500, totalInvestment: 175000, profitShare: 8750 },
  portfolio: { totalValue: 2450000, monthlyGrowth: 3.2, allocation: { stocks: 45, bonds: 25, realEstate: 20, crypto: 10 } },
  performance: { ytdReturn: 18.5, monthlyReturn: 2.1, quarterlyReturn: 7.8 }
};

// --- Assistant Dashboard Demo Data ---
export const ASSISTANT_DEMO_DATA = {
  chatHistory: [
    { id: '1', type: 'user', message: 'What is the current occupancy rate of Balado Estate?', timestamp: '10:30 AM' },
    { id: '2', type: 'assistant', message: 'Balado Estate currently has 30 out of 32 units occupied, giving you a 93.75% occupancy rate.', timestamp: '10:30 AM' },
    { id: '3', type: 'user', message: 'Schedule maintenance for the filling station tanks', timestamp: '10:35 AM' },
    { id: '4', type: 'assistant', message: 'I\'ve scheduled maintenance for all 4 filling station tanks.', timestamp: '10:35 AM' },
    { id: '5', type: 'user', message: 'Yes, send notifications and calculate this month\'s 50/30/20 split', timestamp: '10:40 AM' },
    { id: '6', type: 'assistant', message: 'WhatsApp notifications sent to maintenance team.', timestamp: '10:40 AM' }
  ],
  activeTasks: [
    { id: '1', title: 'Send rent reminders to Balado Estate tenants', status: 'in_progress', type: 'automated', estimatedCompletion: '2:00 PM' },
    { id: '2', title: 'Generate quarterly ROI report', status: 'pending', type: 'manual_approval', estimatedCompletion: '5:00 PM' },
    { id: '3', title: 'Process vendor commission payments', status: 'completed', type: 'automated', completedAt: '9:30 AM' },
    { id: '4', title: 'Update fuel tank levels from suppliers', status: 'in_progress', type: 'automated', estimatedCompletion: '1:30 PM' }
  ],
  whatsappStatus: { connected: true, lastSync: '2 minutes ago', pendingMessages: 3, todaysSent: 47 },
  notificationSettings: [
    { type: 'rent_due', enabled: true, method: 'whatsapp' },
    { type: 'low_fuel', enabled: true, method: 'both' },
    { type: 'maintenance_due', enabled: true, method: 'whatsapp' },
    { type: 'payment_received', enabled: false, method: 'sms' },
    { type: 'equipment_available', enabled: true, method: 'whatsapp' }
  ]
};