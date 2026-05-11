import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

export interface Estate {
  id: string;
  name: string;
  description?: string;
  totalUnits?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEstatePayload {
  name: string;
  description?: string;
  totalUnits: number;
}

export type UpdateEstatePayload = Partial<CreateEstatePayload>;

export interface EstateListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page?: number;
  limit?: number;
  total?: number;
}

export interface Tenant {
  id?: string;
  _id?: string;
  unitLabel?: string;
  tenantName?: string;  // Combined name for display (computed from firstName + otherNames + surname)
  firstName?: string;
  surname?: string;
  otherNames?: string;
  email?: string;
  tenantEmail?: string;  // Legacy field
  whatsapp?: string;
  tenantPhone?: string;  // Legacy field  
  whatsappNumber?: string;  // Legacy field
  rentAmount?: number;
  serviceChargeMonthly?: number;
  cautionFee?: number;
  legalFee?: number;
  tenantType?: 'new' | 'existing' | 'renewal' | 'transfer';
  electricMeterNumber?: string;
  status?: 'occupied' | 'vacant' | 'maintenance';
  nextDueDate?: string;
  entryDate?: string;
  createdAt?: string;
  estate?: { _id: string; name: string; id: string };
}

export interface TenantHistoryEntry {
  id: string;
  date: string; // ISO
  action: string; // e.g., 'moved_in', 'renewed', 'transferred', 'updated_rent'
  notes?: string;
}

export interface TenantTransactionEntry {
  id: string;
  date: string; // ISO
  amount: number;
  type: 'rent' | 'service' | 'misc';
  status?: 'pending' | 'completed' | 'failed';
  description?: string;
}

// Tenant billing
export interface TenantBillingItem {
  code: string;
  label: string;
  amount: number;
  frequency: string;
  type: string;
}

export interface TenantBillingResponse {
  success: boolean;
  viewAs: string;
  data: {
    tenant: {
      name: string;
      unit: string;
      estate: string;
      nextDueDate: string;
      daysUntilDue: number;
      isOverdue: boolean;
    };
    charges: {
      recurring: {
        code: string;
        label: string;
        storedAmount: number;
        effectiveAmount: number;
        isIncreased: boolean;
        frequency: string;
        nextDueDate: string | null;
        daysUntilDue: number | null;
        isOverdue: boolean;
      }[];
      oneTime: {
        code: string;
        label: string;
        amount: number;
        isPaid: boolean;
        status: string;
      }[];
      utilityBills: {
        label: string;
        amount: number;
        isOverdue: boolean;
        daysOverdue: number;
      }[];
    };
    summary: {
      recurringMonthly: number;
      oneTimeUnpaid: number;
      utilityUnpaid: number;
      totalOutstanding: number;
      overdueAmount: number;
      isOverdue: boolean;
      daysUntilDue: number | null;
    };
  };
}

// Payments
export type PaymentType = 'deposit' | 'rent' | 'service-charge' | 'security-charge' | 'caution-fee' | 'legal-fee';
export interface InitiatePaymentBody {
  tenantId: string;
  amount: number;
  description?: string;
  durationMonths?: number;
}

export interface ManualRecordPaymentBody {
  tenantId: string;
  paymentType: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cash' | 'check';
  durationMonths?: number;
  paymentDate: string;
  description?: string;
  notes?: string;
}
export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    paymentLink: string;
    reference: string;
    accessCode: string;
    amount: number;
    tenant?: { name: string; unit: string };
  };
}

export interface TenantOverview {
  name: string;
  unit: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  // Pricing breakdown
  rent?: number;                 // tenant.rentAmount (what you actually charge this tenant)
  unitMonthlyPrice?: number;     // unit.monthlyPrice (base unit price)
  serviceChargeMonthly?: number; // unit.serviceChargeMonthly
  cautionFee?: number;           // unit.cautionFee
  legalFee?: number;             // unit.legalFee
  nextDue?: string;
  meter?: string;
  type?: 'new' | 'existing' | 'renewal' | 'transfer';
  typeBadge?: string;
  status?: string;
  rentIncreased?: boolean;
  storedRent?: number;
  serviceCharge?: number;
  storedServiceCharge?: number;
  serviceChargeIncreased?: boolean;
}

export interface TenantDetailResponse {
  success: boolean;
  data: {
    tenant: Tenant;
    overview: TenantOverview;
    history?: TenantHistoryEntry[];
    transactions?: TenantTransactionEntry[];
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface EstateOverviewResponse {
  success: boolean;
  data: {
    estate: { _id: string; name: string; totalUnits: number; createdAt: string };
    occupancy: { totalUnits: number; occupiedUnits: number; vacantUnits: number; occupancyRate: number };
    billing: { upcomingDueCount: number; last30d: { revenue: number; transactions: number } };
  };
}

export interface FinancialSummary {
  tenantCount: number;
  totalMonthlyRent: number;
  totalQuarterRent: number;
  currency: string;
}

export interface QuarterlyTenantData {
  [month: string]: Tenant[];
}

export interface QuarterlyTenantResponse {
  success: boolean;
  data: QuarterlyTenantData;
  summary: FinancialSummary;
}

export interface AllEstatesOverviewResponse {
  success: boolean;
  data: {
    estates: {
      totalEstates: number;
      activeEstates: number;
    };
    units: {
      totalUnits: number;
      occupiedUnits: number;
      vacantUnits: number;
      maintenanceUnits: number;
      reservedUnits: number;
      occupancyRate: number;
    };
    tenants: {
      totalActiveTenants: number;
      dueSoon7Days: number;
      dueSoon30Days: number;
    };
    revenue: {
      last30Days: {
        amount: number;
        transactionCount: number;
      };
      last90Days: {
        amount: number;
        transactionCount: number;
      };
    };
    payments: {
      pendingCount: number;
      completedLast30Days: number;
    };
  };
}

export interface TenantDashboardOverviewResponse {
  success: boolean;
  message?: string;
  data: {
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    timestamp: string;
    data: {
      section: string;
      apartment: {
        id: string;
        tenantName: string;
        unit: string;
        unitType: string;
        estate: string;
        rentAmount: number;
        serviceChargeAmount: number;
        entryDate: string;
        nextDueDate: string;
        status: string;
        meterNumber?: string;
      };
      billing: {
        totalPending: number;
        totalPaid: number;
        upcomingDue: any[];
        overdue: any[];
      };
      payments: {
        recentPayments: any[];
        totalPaid: number;
      };
      yearlyPayment: {
        currentYear: {
          year: number;
          isFirstTime: boolean;
          rent: number;
          serviceCharge: number;
          other?: number;
          totalPaid: number;
        };
        nextYear: {
          year: number;
          isFirstTime: boolean;
          renewalStartDate: string;
          monthlyRent: number;
          monthlyServiceCharge: number;
          projectedRent: number;
          projectedServiceCharge: number;
          projectedTotal: number;
          projectedOther?: number;
          otherBreakdown?: { label: string; amount: number }[];
        };
      };
      wallet: {
        balance: number;
        totalEarnings: number;
        totalSpent: number;
        currency: string;
      };
      notifications: any[];
    };
  };
}

// Units
export interface EstateUnitFeature { name: string; value: string }
export interface EstateUnit {
  id?: string;
  _id?: string;
  label: string;
  monthlyPrice: number;
  serviceChargeMonthly?: number;
  cautionFee?: number;
  legalFee?: number;
  securityDeposit?: number;
  category?: string;
  listingType?: string;
  description?: string;
  availableDate?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  streetAddress?: string;
  amenities?: {
    wifi?: boolean;
    pool?: boolean;
    gym?: boolean;
    parking?: boolean;
    ac?: boolean;
    security?: boolean;
    petFriendly?: boolean;
    balcony?: boolean;
    laundry?: boolean;
  };
  meterNumber?: string;
  images?: string[];
  features?: EstateUnitFeature[];
}

export interface CreateTenantPayload {
  unitId: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  tenantType?: 'new' | 'existing' | 'renewal' | 'transfer';
  entryDate?: string; // ISO YYYY-MM-DD (when tenant moves in)
  durationMonths?: number; // how many months until next rent is due
  // nextDueDate is now computed by the backend when durationMonths is provided
  nextDueDate?: string; // ISO YYYY-MM-DD (optional override if durationMonths is not provided)
}


export interface IssueMedia {
  url: string;
  type: 'image' | 'video';
}

export interface IssueTimelineEntry {
  stage: 'review' | 'started' | 'inprogress' | 'completed';
  note: string;
  media: IssueMedia[];
  updatedBy: { name: string; email: string };
  updatedAt: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'structural' | 'water' | 'security' | 'cleaning' | 'internet' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'review' | 'started' | 'inprogress' | 'completed';
  timeline: IssueTimelineEntry[];
  createdAt: string;
}

export const estatesApi = createApi({
  reducerPath: 'estatesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Estate', 'EstateList', 'EstateTenants', 'EstateUnits', 'Tenant', 'TenantList', 'Issue'],
  endpoints: (builder) => ({
    getEstates: builder.query<PaginatedResponse<Estate>, EstateListParams | void>({
      query: (params) => ({
        url: '/api/estates',
        params: params || {},
      }),
      providesTags: (result) => [{ type: 'EstateList', id: 'LIST' }],
    }),
    getEstate: builder.query<Estate, string>({
      query: (id) => `/api/estates/${id}`,
      providesTags: (result, error, id) => [{ type: 'Estate', id }],
    }),
    getEstateTenants: builder.query<PaginatedResponse<Tenant> | QuarterlyTenantResponse, { estateId: string; quarter?: string; year?: number; page?: number; limit?: number; search?: string }>({
      query: ({ estateId, quarter, ...params }) => {
        const baseUrl = `/api/estates/${estateId}/tenants`;
        const url = quarter ? `${baseUrl}/${quarter}` : baseUrl;
        return { url, params };
      },
      providesTags: (result, error, args) => [{ type: 'EstateTenants', id: args.estateId }],
    }),
    createEstate: builder.mutation<Estate, CreateEstatePayload>({
      query: (payload) => ({ url: '/api/estates', method: 'POST', body: payload }),
      invalidatesTags: [{ type: 'EstateList', id: 'LIST' }],
    }),
    updateEstate: builder.mutation<Estate, { id: string } & UpdateEstatePayload>({
      query: ({ id, ...payload }) => ({ url: `/api/estates/${id}`, method: 'PUT', body: payload }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Estate', id },
        { type: 'EstateList', id: 'LIST' },
      ],
    }),
    deleteEstate: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({ url: `/api/estates/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Estate', id },
        { type: 'EstateList', id: 'LIST' },
      ],
    }),
    getEstateOverview: builder.query<EstateOverviewResponse, string>({
      query: (id) => `/api/estates/${id}/overview`,
      providesTags: (result, error, id) => [{ type: 'Estate', id }],
    }),
    getAllEstatesOverview: builder.query<AllEstatesOverviewResponse, void>({
      query: () => '/api/estates/overview/all',
      providesTags: [{ type: 'EstateList', id: 'LIST' }],
    }),
    createEstateTenant: builder.mutation<Tenant, { estateId: string; body: CreateTenantPayload }>({
      query: ({ estateId, body }) => ({ url: `/api/estates/${estateId}/tenants`, method: 'POST', body }),
      invalidatesTags: (result, error, { estateId }) => [
        { type: 'EstateTenants', id: estateId },
        { type: 'Estate', id: estateId },
        { type: 'TenantList', id: 'LIST' },
      ],
    }),
    createEstateUnit: builder.mutation<
      EstateUnit | { success?: boolean },
      {
        estateId: string; body: {
          label: string;
          monthlyPrice: number;
          serviceChargeMonthly?: number;
          cautionFee?: number;
          legalFee?: number;
          securityDeposit?: number;
          category?: string;
          listingType?: string;
          description?: string;
          availableDate?: string;
          bedrooms?: number;
          bathrooms?: number;
          area?: number;
          streetAddress?: string;
          amenities?: {
            wifi?: boolean;
            pool?: boolean;
            gym?: boolean;
            parking?: boolean;
            ac?: boolean;
            security?: boolean;
            petFriendly?: boolean;
            balcony?: boolean;
            laundry?: boolean;
          };
          meterNumber?: string;
          images?: string[];
          features?: { name: string; value: string }[];
        }
      }
    >({
      query: ({ estateId, body }) => ({ url: `/api/estates/${estateId}/units`, method: 'POST', body }),
      invalidatesTags: (result, error, { estateId }) => [
        { type: 'Estate', id: estateId },
      ],
    }),
    // Global tenants endpoints
    getTenants: builder.query<PaginatedResponse<Tenant>, { page?: number; limit?: number; search?: string } | void>({
      query: (params = {}) => ({
        url: '/api/tenants',
        params: params || {},
      }),
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
            ...result.data.map((t) => ({ type: 'Tenant' as const, id: (t.id || t._id) as string })),
            { type: 'TenantList' as const, id: 'LIST' },
          ]
          : [{ type: 'TenantList' as const, id: 'LIST' }],
    }),
    getTenant: builder.query<TenantDetailResponse | { success: boolean; data: { tenant: Tenant; overview: TenantOverview } }, string | { id: string; expand?: string; page?: number; limit?: number }>({
      query: (arg) => {
        const isString = typeof arg === 'string';
        const id = isString ? arg : arg.id;
        const params = isString ? undefined : { ...arg };
        if (params) delete (params as any).id;

        return {
          url: `/api/tenants/${id}`,
          params,
        };
      },
      providesTags: (result, error, arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        return [
          { type: 'Tenant' as const, id },
          { type: 'TenantList' as const, id: 'LIST' },
        ];
      },
    }),
    updateTenant: builder.mutation<Tenant, { tenantId: string; rentAmount?: number; nextDueDate?: string } & Partial<Tenant>>({
      query: ({ tenantId, ...body }) => ({ url: `/api/tenants/${tenantId}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { tenantId }) => [
        { type: 'EstateTenants', id: tenantId },
        { type: 'Tenant', id: tenantId },
        { type: 'TenantList', id: 'LIST' },
      ],
    }),
    deleteTenant: builder.mutation<{ success?: boolean }, string>({
      query: (tenantId) => ({ url: `/api/tenants/${tenantId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, tenantId) => [
        { type: 'Tenant', id: tenantId },
        { type: 'TenantList', id: 'LIST' },
      ],
    }),
    getTenantHistory: builder.query<TenantHistoryEntry[], string>({
      query: (tenantId) => `/api/tenants/${tenantId}/history`,
      providesTags: (result, error, tenantId) => [{ type: 'Tenant' as const, id: tenantId }],
    }),
    getTenantTransactions: builder.query<TenantTransactionEntry[], { tenantId: string; page?: number; limit?: number } | string>({
      query: (arg) => {
        const isString = typeof arg === 'string';
        const tenantId = isString ? arg : arg.tenantId;
        const params = isString ? undefined : { ...arg };
        if (params) delete (params as any).tenantId;

        return {
          url: `/api/tenants/${tenantId}/transactions`,
          params,
        };
      },
      providesTags: (result, error, arg) => {
        const tenantId = typeof arg === 'string' ? arg : arg.tenantId;
        return [{ type: 'Tenant' as const, id: tenantId }];
      },
    }),
    getTenantBilling: builder.query<TenantBillingResponse, string>({
      query: (tenantId) => `/api/tenants/${tenantId}/billing`,
      providesTags: (result, error, tenantId) => [{ type: 'Tenant' as const, id: tenantId }],
    }),
    getMyBilling: builder.query<TenantBillingResponse, void>({
      query: () => '/api/billing/summary',
      providesTags: (result, error) => [{ type: 'Tenant', id: 'ME' }],
    }),
    initiateRentPayment: builder.mutation<{ success: boolean; data: { authorizationUrl?: string; reference: string; amount: number } }, { amount: number; paymentType: string }>({
      query: ({ amount, paymentType }) => ({ url: '/api/payments/rent', method: 'POST', body: { amount, paymentType } }),
      invalidatesTags: (result, error) => [{ type: 'Tenant', id: 'ME' }],
    }),
    initiateServiceChargePayment: builder.mutation<{ success: boolean; data: { authorizationUrl?: string; reference: string; amount: number } }, { amount: number; billingId: string }>({
      query: ({ amount, billingId }) => ({ url: '/api/payments/service-charge', method: 'POST', body: { amount, billingId } }),
      invalidatesTags: (result, error) => [{ type: 'Tenant', id: 'ME' }],
    }),
    initiateCautionFeePayment: builder.mutation<{ success: boolean; data: { authorizationUrl?: string; reference: string; amount: number } }, { amount: number }>({
      query: ({ amount }) => ({ url: '/api/payments/caution-fee', method: 'POST', body: { amount } }),
      invalidatesTags: (result, error) => [{ type: 'Tenant', id: 'ME' }],
    }),
    initiateLegalFeePayment: builder.mutation<{ success: boolean; data: { authorization_url?: string; reference: string; amount: number } }, { amount: number }>({
      query: ({ amount }) => ({ url: '/api/payments/legal-fee', method: 'POST', body: { amount } }),
      invalidatesTags: (result, error) => [{ type: 'Tenant', id: 'ME' }],
    }),
    initiateInitialPayment: builder.mutation<{ success: boolean; data: { authorization_url?: string; reference: string; amount: number } }, { amount: number }>({
      query: ({ amount }) => ({ url: '/api/payments/initial', method: 'POST', body: { amount } }),
      invalidatesTags: (result, error) => [{ type: 'Tenant', id: 'ME' }],
    }),
    verifyPayment: builder.query<{ success: boolean; message?: string; data: { status?: string; amount?: number; reference?: string } }, string>({
      query: (reference) => `/api/payments/verify/${reference}`,
      providesTags: (result, error, reference) => [{ type: 'Payment', id: reference }],
    }),
    payBilling: builder.mutation<
      { success: boolean; data: { authorization_url?: string; reference?: string; amount?: number } },
      { itemIds: string[]; paymentMethod?: "wallet"; durationMonths?: 6 | 12 }
    >({
      query: (body) => ({
        url: '/api/tenants/me/billing/pay',
        method: 'POST',
        body
      }),
      invalidatesTags: (result, error) => [{ type: 'Tenant', id: 'ME' }],
    }),
    // Vacant units for an estate
    getEstateVacantUnits: builder.query<{ success: boolean; data: { unitId: string; label: string; monthlyPrice: number; meterNumber?: string; status?: string; description?: string }[]; total?: number }, string>({
      query: (estateId) => `/api/estates/${estateId}/units/vacant`,
      providesTags: (result, error, estateId) => [
        { type: 'EstateUnits' as const, id: estateId },
      ],
    }),
    clearEstateUnitTenant: builder.mutation<{ success?: boolean }, { estateId: string; unitId: string }>({
      query: ({ estateId, unitId }) => ({
        url: `/api/estates/${estateId}/units/${unitId}/remove-tenant`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { estateId }) => [
        { type: 'EstateTenants', id: estateId },
        { type: 'EstateUnits', id: estateId },
        { type: 'Estate', id: estateId },
        { type: 'TenantList', id: 'LIST' },
      ],
    }),
    updateEstateUnit: builder.mutation<
      { success?: boolean },
      { unitId: string; body: { monthlyPrice?: number; serviceChargeMonthly?: number; cautionFee?: number; legalFee?: number } }
    >({
      query: ({ unitId, body }) => ({ url: `/api/estates/unit/${unitId}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { unitId }) => [
        { type: 'EstateUnits', id: unitId },
        { type: 'TenantList', id: 'LIST' },
      ],
    }),
    deleteEstateUnit: builder.mutation<{ success?: boolean }, string>({
      query: (unitId) => ({ url: `/api/estates/unit/${unitId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, unitId) => [
        { type: 'EstateUnits', id: 'LIST' }, // Broad invalidation since we don't have estateId here easily
        { type: 'Estate', id: 'LIST' },
        { type: 'EstateList', id: 'LIST' },
      ],
    }),
    initiatePayment: builder.mutation<InitiatePaymentResponse, { type: PaymentType; body: InitiatePaymentBody; params?: any }>({
      query: ({ type, body, params }) => ({
        url: `/api/payments/${type}`,
        method: 'POST',
        body,
        params,
      }),
      invalidatesTags: (result, error, { body }) => [
        { type: 'Tenant' as const, id: body.tenantId },
      ],
    }),
    manualRecordPayment: builder.mutation<{ success: boolean; message: string; data?: any }, ManualRecordPaymentBody>({
      query: (body) => ({
        url: '/api/payments/manual-record',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { tenantId }) => [
        { type: 'Tenant' as const, id: tenantId },
      ],
    }),
    sendTenantReceipt: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (tenantId) => ({
        url: `/api/payments/tenant/${tenantId}/receipt`,
        method: 'POST',
      }),
    }),
    resendPaymentReceipt: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (paymentId) => ({
        url: `/api/payments/${paymentId}/receipt`,
        method: 'POST',
      }),
    }),
    downloadPaymentReceipt: builder.query<{ blob: Blob; filename: string }, string>({
      query: (paymentId) => ({
        url: `/api/payments/${paymentId}/download`,
        responseHandler: async (response) => {
          const blob = await response.blob();
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = `receipt-${paymentId}.pdf`;
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1];
          }
          return { blob, filename };
        },
        cache: 'no-cache',
      }),
    }),
    // Public List Endpoints
    getPublicListings: builder.query<PaginatedResponse<EstateUnit>, { page?: number; limit?: number; search?: string } | void>({
      query: (params = {}) => ({
        url: '/api/estates/public/listings',
        params: params || {},
      }),
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [...result.data.map((u) => ({ type: 'Estate' as const, id: u.id || u._id })), { type: 'Estate', id: 'LIST' }]
          : [{ type: 'Estate', id: 'LIST' }],
    }),
    getPublicListingById: builder.query<{ success: boolean; data: EstateUnit }, string>({
      query: (id) => `/api/estates/public/listings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Estate', id }],
    }),
    // Unified Payment Transactions Endpoint
    getPaymentTransactions: builder.query<
      { success: boolean; data: any[]; page?: number; limit?: number; total?: number },
      { page?: number; limit?: number; type?: string; status?: string; estateId?: string } | void
    >({
      query: (params = {}) => ({
        url: '/api/wallet/transactions',
        params: params || {},
      }),
      providesTags: ['Tenant'],
    }),
    getDashboardOverview: builder.query<TenantDashboardOverviewResponse, void>({
      query: () => '/api/dashboard/overview',
      providesTags: (result, error) => [
        { type: 'DashboardOverview', id: 'CURRENT' },
        { type: 'TenantList', id: 'LIST' },
      ],
    }),

    // Payment Receipts
    getPaymentReceipts: builder.query<
      {
        success: boolean;
        count: number;
        receipts: {
          receiptId: string;
          reference: string;
          paymentDate: string;
          paymentMethod: string;
          paymentType: string;
          description?: string;
          tenantName: string;
          phone: string;
          meterNo: string;
          bedroomType: string;
          flatType: string;
          moveInDate: string;
          expiryDate: string;
          amountPaid: number;
          breakdown: { rent?: number; serviceCharge?: number; cautionFee?: number; legalFee?: number };
          rent: number;
          serviceCharge: number;
          cautionFee: number;
          legalFee: number;
          rentOutstanding: number;
          serviceChargeOutstanding: number;
          outstandingBalance: number;
          currentTotalTenancyRate: number;
          nextTotalTenancyRate: number;
          tenancyDuration: string;
          tenantTotalStay: string;
          yearDuration: string;
          currentYear: number;
          nextYear: number;
          nextIncreaseDate: string;
          nextRentIncrease: number;
          nextServiceChargeIncrease: number;
          totalTenancyRateIncrease: number;
        }[];
      },
      void
    >({
      query: () => '/api/payments/receipts',
      providesTags: [{ type: 'Tenant', id: 'ME' }],
    }),

    // Issues
    reportIssue: builder.mutation<{ success: boolean; data: Issue }, FormData>({
      query: (body) => ({ url: '/api/issues', method: 'POST', body }),
      invalidatesTags: [{ type: 'Issue', id: 'LIST' }],
    }),
    getIssues: builder.query<{ success: boolean; data: Issue[] }, void>({
      query: () => '/api/issues',
      providesTags: [{ type: 'Issue', id: 'LIST' }],
    }),
    getIssue: builder.query<{ success: boolean; data: Issue }, string>({
      query: (id) => `/api/issues/${id}`,
      providesTags: (result, error, id) => [{ type: 'Issue', id }],
    }),
  }),
});

export const {
  useGetEstatesQuery,
  useGetEstateQuery,
  useGetEstateTenantsQuery,
  useCreateEstateMutation,
  useUpdateEstateMutation,
  useDeleteEstateMutation,
  useGetEstateOverviewQuery,
  useGetAllEstatesOverviewQuery,
  useGetDashboardOverviewQuery,
  useGetMyBillingQuery,
  useInitiateRentPaymentMutation,
  useInitiateServiceChargePaymentMutation,
  useInitiateCautionFeePaymentMutation,
  useInitiateLegalFeePaymentMutation,
  useInitiateInitialPaymentMutation,
  useVerifyPaymentQuery,
  useLazyVerifyPaymentQuery,
  usePayBillingMutation,
  useCreateEstateTenantMutation,
  useCreateEstateUnitMutation,
  useGetEstateVacantUnitsQuery,
  useClearEstateUnitTenantMutation,
  useUpdateEstateUnitMutation,
  useDeleteEstateUnitMutation,
  useGetTenantsQuery,
  useGetTenantQuery,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useGetTenantHistoryQuery,
  useGetTenantTransactionsQuery,
  useGetTenantBillingQuery,
  useInitiatePaymentMutation,
  useSendTenantReceiptMutation,
    useResendPaymentReceiptMutation,
    useLazyDownloadPaymentReceiptQuery,
    useManualRecordPaymentMutation,
    // Public
    useGetPublicListingsQuery,
    useGetPublicListingByIdQuery,
    // Unified Payment Transactions
    useGetPaymentTransactionsQuery,
    // Issues
    useReportIssueMutation,
    useGetIssuesQuery,
    useGetIssueQuery,
    // Receipts
    useGetPaymentReceiptsQuery,
  } = estatesApi;
