/**
 * Consolidated Demo Data
 * Contains all demo/mock data used across the application
 * Used primarily for development and UI testing
 */

// ============================================
// BUSINESS & PORTFOLIO DATA
// ============================================

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

// Estate Portfolio Data (₦18M yearly)
export const ESTATE_PROPERTIES: Property[] = [
  // Balado Estate - 32 units
  ...Array.from({ length: 32 }, (_, i) => ({
    id: `balado_${i + 1}`,
    location: `Balado Estate Unit ${i + 1}`,
    type: 'flat' as const,
    rentAmount: 45000,
    tenantName: `Tenant ${i + 1}`,
    tenantType: i < 20 ? ('old' as const) : ('new' as const),
    status: i < 30 ? ('occupied' as const) : ('vacant' as const),
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
    type: 'flat' as const,
    rentAmount: 55000,
    tenantName: `Itskiri Tenant ${i + 1}`,
    tenantType: i < 2 ? ('old' as const) : ('new' as const),
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
      {
        id: 'pipeline_welder_1',
        type: 'pipeline_welder',
        model: 'Pipeline Welding Machine',
        dailyRate: 45000,
        monthlyRevenue: 540000,
        status: 'available',
        lastService: '2024-01-10',
        nextService: '2024-04-10',
      },
      {
        id: 'sandblaster_1',
        type: 'sandblaster',
        model: 'Sandblasting Machine',
        dailyRate: 30000,
        monthlyRevenue: 360000,
        status: 'available',
        lastService: '2024-01-15',
        nextService: '2024-04-15',
      },
    ],
    performance: {
      efficiency: 92,
      roi: 22.8,
      growthRate: 15.4,
    },
  },
];

// ============================================
// CONTACT MANAGEMENT DATA
// ============================================

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

// ============================================
// TRANSACTIONS DATA
// ============================================

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

// ============================================
// UTILITY FUNCTIONS
// ============================================

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
