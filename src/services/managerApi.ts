import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ManagerOverview {
  section: string;
  managed_estates: number;
  estate_names: string[];
  estate_breakdown: EstateBreakdown[];
  units: { total: number; occupied: number; vacant: number; occupancy_rate: number };
  tenants: { total: number; overdue: number; overdue_list: OverdueTenant[] };
  revenue: { monthly: number; currency: string };
  outstanding: { rent: number; service_charge: number; total: number };
  collection_rate: number;
  monthly_rent_roll: number;
  skills: { open_issues: number; high_priority_issues: number; pending_bills: number };
}

export interface EstateBreakdown {
  id: string;
  name: string;
  units: { total: number; occupied: number; vacant: number; occupancy_rate: number };
  tenants: number;
  overdue: number;
  revenue_30d: number;
}

export interface OverdueTenant {
  id: string;
  name: string;
  unit: string;
  outstanding: number;
  due_date: string | null;
  phone: string | null;
  email: string | null;
}

export interface ManagerTenant {
  id: string;
  tenantName: string;
  tenantEmail: string | null;
  tenantPhone: string | null;
  unitLabel: string;
  rentAmount: number;
  serviceChargeAmount: number;
  rentOutstanding: number;
  serviceChargeOutstanding: number;
  nextDueDate: string | null;
  entryDate: string | null;
  status: string;
  tenantType: string;
  isActive: boolean;
}

export interface ManagerIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  estate: string;
  unit: string | null;
  createdAt: string;
}

export interface ManagerPayment {
  id: string;
  tenant: string;
  estate: string;
  amount: number;
  paymentType: string;
  paymentStatus: string;
  reference: string | null;
  createdAt: string;
}

export interface RecordPaymentPayload {
  tenant: string;
  estate?: string;
  amount: number;
  payment_type: string;
}

export interface CreateIssuePayload {
  title: string;
  description?: string;
  category: string;
  priority: string;
  estate: string;
  unit?: string;
  tenant?: string;
}

export interface SendNotificationPayload {
  user: string;
  title: string;
  message: string;
}

export interface ManagerEnquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  enquiryType: string;
  message: string | null;
  status: string;
  estate: string | null;
  unit: string | null;
  createdAt: string;
}

export interface ManagerApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  unit: string | null;
  estate: string | null;
  moveInDate: string | null;
  status: string;
  createdAt: string;
}

export interface ManagerBillingItem {
  id: string;
  label: string;
  amount: number;
  itemType: string;
  isPaid: boolean;
  dueDate: string | null;
  tenant: string | null;
  estate: string | null;
  createdAt: string;
}

export interface AddBillingItemPayload {
  tenant: string;
  estate?: string;
  label: string;
  amount: number;
  item_type?: string;
  due_date?: string;
}

export interface ManagerServiceRequest {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  estate: string | null;
  unit: string | null;
  tenant: string | null;
  createdAt: string;
}

export interface VacantUnit {
  id: string;
  label: string;
  category: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  monthlyPrice: number;
  serviceChargeMonthly: number | null;
  availableDate: string | null;
  estate: string | null;
  status: string;
}

// ── API Slice ─────────────────────────────────────────────────────────────────

export const managerApi = createApi({
  reducerPath: 'managerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Overview', 'Tenants', 'Issues', 'Payments', 'Enquiries', 'Applications', 'Billing', 'ServiceRequests', 'VacantUnits'],
  endpoints: (builder) => ({

    getManagerOverview: builder.query<ManagerOverview, void>({
      query: () => '/api/v1/dashboard/overview',
      transformResponse: (res: any) => res?.data?.data,
      providesTags: ['Overview'],
    }),

    getManagerTenants: builder.query<{ data: ManagerTenant[]; total: number }, { estate_id?: string; page?: number; limit?: number }>({
      query: ({ estate_id, page = 1, limit = 50 }) => ({
        url: '/api/v1/tenants',
        params: { estate_id, page, limit },
      }),
      providesTags: ['Tenants'],
    }),

    getManagerIssues: builder.query<{ data: ManagerIssue[] }, { estate_id?: string; status?: string }>({
      query: ({ estate_id, status }) => ({
        url: '/api/v1/issues',
        params: { estate_id, status },
      }),
      providesTags: ['Issues'],
    }),

    updateIssueStatus: builder.mutation<void, { issueId: string; status: string }>({
      query: ({ issueId, status }) => ({
        url: `/api/v1/issues/${issueId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Issues'],
    }),

    createIssue: builder.mutation<void, CreateIssuePayload>({
      query: (body) => ({
        url: '/api/v1/issues',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Issues', 'Overview'],
    }),

    getManagerPayments: builder.query<{ data: ManagerPayment[]; total: number }, { estate_id?: string; page?: number }>({
      query: ({ estate_id, page = 1 }) => ({
        url: '/api/v1/payments',
        params: { estate_id, page, limit: 20 },
      }),
      providesTags: ['Payments'],
    }),

    recordPayment: builder.mutation<void, RecordPaymentPayload>({
      query: (body) => ({
        url: '/api/v1/payments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payments', 'Tenants', 'Overview'],
    }),

    updatePaymentStatus: builder.mutation<void, { paymentId: string; status: string }>({
      query: ({ paymentId, status }) => ({
        url: `/api/v1/payments/${paymentId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Payments'],
    }),

    sendRentReminder: builder.mutation<void, string>({
      query: (tenantId) => ({
        url: `/api/v1/payments/tenant/${tenantId}/receipt`,
        method: 'POST',
      }),
    }),

    sendNotification: builder.mutation<void, SendNotificationPayload>({
      query: (body) => ({
        url: '/api/v1/notifications',
        method: 'POST',
        body,
      }),
    }),

    // ── Enquiries ─────────────────────────────────────────────────────────────
    getManagerEnquiries: builder.query<{ data: ManagerEnquiry[]; total: number }, { estate_id?: string; status?: string }>({
      query: ({ estate_id, status }) => ({
        url: '/api/v1/enquiries',
        params: { estate_id, status },
      }),
      providesTags: ['Enquiries'],
    }),

    updateEnquiryStatus: builder.mutation<void, { enquiryId: string; status: string }>({
      query: ({ enquiryId, status }) => ({
        url: `/api/v1/enquiries/${enquiryId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Enquiries'],
    }),

    // ── Rental Applications ───────────────────────────────────────────────────
    getManagerApplications: builder.query<{ data: ManagerApplication[]; total: number }, { estate_id?: string; status?: string }>({
      query: ({ estate_id, status }) => ({
        url: '/api/v1/estates/applications',
        params: { estate_id, status },
      }),
      providesTags: ['Applications'],
    }),

    updateApplicationStatus: builder.mutation<void, { appId: string; status: string }>({
      query: ({ appId, status }) => ({
        url: `/api/v1/estates/applications/${appId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Applications'],
    }),

    // ── Billing ───────────────────────────────────────────────────────────────
    getManagerBilling: builder.query<{ data: ManagerBillingItem[]; total: number }, { estate_id?: string; is_paid?: boolean }>({
      query: ({ estate_id, is_paid }) => ({
        url: '/api/v1/billing',
        params: { estate_id, is_paid },
      }),
      providesTags: ['Billing'],
    }),

    addBillingItem: builder.mutation<void, AddBillingItemPayload>({
      query: (body) => ({
        url: '/api/v1/billing/tenants/' + body.tenant + '/billing',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Billing', 'Tenants', 'Overview'],
    }),

    markBillPaid: builder.mutation<void, string>({
      query: (itemId) => ({
        url: `/api/v1/billing/${itemId}`,
        method: 'PUT',
        body: { is_paid: true },
      }),
      invalidatesTags: ['Billing', 'Overview'],
    }),

    // ── Service Requests ──────────────────────────────────────────────────────
    getManagerServiceRequests: builder.query<{ data: ManagerServiceRequest[] }, { estate_id?: string; status?: string }>({
      query: ({ estate_id, status }) => ({
        url: '/api/v1/service-requests',
        params: { estate_id, status },
      }),
      providesTags: ['ServiceRequests'],
    }),

    updateServiceRequestStatus: builder.mutation<void, { srId: string; status: string }>({
      query: ({ srId, status }) => ({
        url: `/api/v1/service-requests/${srId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['ServiceRequests'],
    }),

    // ── Vacant Units ──────────────────────────────────────────────────────────
    getVacantUnits: builder.query<{ data: VacantUnit[]; total: number }, { estate_id?: string }>({
      query: ({ estate_id }) => ({
        url: '/api/v1/units',
        params: { estate_id, status: 'vacant' },
      }),
      providesTags: ['VacantUnits'],
    }),

  }),
});

export const {
  useGetManagerOverviewQuery,
  useGetManagerTenantsQuery,
  useGetManagerIssuesQuery,
  useUpdateIssueStatusMutation,
  useCreateIssueMutation,
  useGetManagerPaymentsQuery,
  useRecordPaymentMutation,
  useUpdatePaymentStatusMutation,
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
} = managerApi;
