import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// ── Brand / Designer API ───────────────────────────────────────────────────────
export const brandApi = createApi({
  reducerPath: 'brandApi',
  baseQuery,
  tagTypes: ['BrandAssets', 'BrandSummary'],
  endpoints: (b) => ({
    getBrandAssets: b.query<{ data: Record<string, any[]>; total: number }, void>({
      query: () => '/api/v1/brand/assets',
      providesTags: ['BrandAssets'],
    }),
    getBrandSummary: b.query<any, void>({
      query: () => '/api/v1/brand/summary',
      providesTags: ['BrandSummary'],
    }),
    addBrandAsset: b.mutation<any, any>({
      query: (body) => ({ url: '/api/v1/brand/assets', method: 'POST', body }),
      invalidatesTags: ['BrandAssets', 'BrandSummary'],
    }),
    updateBrandAsset: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/v1/brand/assets/${id}`, method: 'PUT', body }),
      invalidatesTags: ['BrandAssets'],
    }),
    deleteBrandAsset: b.mutation<any, string>({
      query: (id) => ({ url: `/api/v1/brand/assets/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BrandAssets', 'BrandSummary'],
    }),
  }),
});

export const {
  useGetBrandAssetsQuery,
  useGetBrandSummaryQuery,
  useAddBrandAssetMutation,
  useUpdateBrandAssetMutation,
  useDeleteBrandAssetMutation,
} = brandApi;

// ── Marketing API ──────────────────────────────────────────────────────────────
export const marketingApi = createApi({
  reducerPath: 'marketingApi',
  baseQuery,
  tagTypes: ['Campaigns', 'MktOverview'],
  endpoints: (b) => ({
    getMarketingOverview: b.query<any, void>({
      query: () => '/api/v1/marketing/overview',
      providesTags: ['MktOverview'],
    }),
    getCampaigns: b.query<any, void>({
      query: () => '/api/v1/marketing/campaigns',
      providesTags: ['Campaigns'],
    }),
    createCampaign: b.mutation<any, any>({
      query: (body) => ({ url: '/api/v1/marketing/campaigns', method: 'POST', body }),
      invalidatesTags: ['Campaigns', 'MktOverview'],
    }),
    updateCampaign: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/v1/marketing/campaigns/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Campaigns', 'MktOverview'],
    }),
    deleteCampaign: b.mutation<any, string>({
      query: (id) => ({ url: `/api/v1/marketing/campaigns/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Campaigns', 'MktOverview'],
    }),
  }),
});

export const {
  useGetMarketingOverviewQuery,
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} = marketingApi;

// ── Sales API ──────────────────────────────────────────────────────────────────
export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery,
  tagTypes: ['Deals', 'SalesPipeline'],
  endpoints: (b) => ({
    getSalesPipeline: b.query<any, void>({
      query: () => '/api/v1/sales/pipeline',
      providesTags: ['SalesPipeline'],
    }),
    getDeals: b.query<any, { stage?: string }>({
      query: ({ stage }) => ({ url: '/api/v1/sales/deals', params: { stage } }),
      providesTags: ['Deals'],
    }),
    createDeal: b.mutation<any, any>({
      query: (body) => ({ url: '/api/v1/sales/deals', method: 'POST', body }),
      invalidatesTags: ['Deals', 'SalesPipeline'],
    }),
    updateDeal: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/v1/sales/deals/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Deals', 'SalesPipeline'],
    }),
    deleteDeal: b.mutation<any, string>({
      query: (id) => ({ url: `/api/v1/sales/deals/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Deals', 'SalesPipeline'],
    }),
  }),
});

export const {
  useGetSalesPipelineQuery,
  useGetDealsQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,
} = salesApi;

// ── Operations API ─────────────────────────────────────────────────────────────
export const operationsApi = createApi({
  reducerPath: 'operationsApi',
  baseQuery,
  tagTypes: ['Vendors', 'OpsOverview'],
  endpoints: (b) => ({
    getOpsOverview: b.query<any, void>({
      query: () => '/api/v1/operations/overview',
      providesTags: ['OpsOverview'],
    }),
    getVendors: b.query<any, { category?: string; status?: string }>({
      query: ({ category, status }) => ({ url: '/api/v1/operations/vendors', params: { category, status } }),
      providesTags: ['Vendors'],
    }),
    createVendor: b.mutation<any, any>({
      query: (body) => ({ url: '/api/v1/operations/vendors', method: 'POST', body }),
      invalidatesTags: ['Vendors', 'OpsOverview'],
    }),
    updateVendor: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/v1/operations/vendors/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Vendors'],
    }),
    deleteVendor: b.mutation<any, string>({
      query: (id) => ({ url: `/api/v1/operations/vendors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Vendors', 'OpsOverview'],
    }),
  }),
});

export const {
  useGetOpsOverviewQuery,
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = operationsApi;

// ── Finance API ────────────────────────────────────────────────────────────────
export const financeApi = createApi({
  reducerPath: 'financeApi',
  baseQuery,
  tagTypes: ['FinanceOverview', 'Cashflow', 'UnpaidBills'],
  endpoints: (b) => ({
    getFinanceOverview: b.query<any, void>({
      query: () => '/api/v1/finance/overview',
      providesTags: ['FinanceOverview'],
    }),
    getCashflow: b.query<any, { months?: number }>({
      query: ({ months = 6 }) => ({ url: '/api/v1/finance/cashflow', params: { months } }),
      providesTags: ['Cashflow'],
    }),
    getUnpaidBills: b.query<any, void>({
      query: () => '/api/v1/finance/unpaid-bills',
      providesTags: ['UnpaidBills'],
    }),
  }),
});

export const {
  useGetFinanceOverviewQuery,
  useGetCashflowQuery,
  useGetUnpaidBillsQuery,
} = financeApi;

// ── HR API ─────────────────────────────────────────────────────────────────────
export const hrApi = createApi({
  reducerPath: 'hrApi',
  baseQuery,
  tagTypes: ['Candidates', 'HRPipeline', 'HROverview'],
  endpoints: (b) => ({
    getHRPipeline: b.query<any, void>({
      query: () => '/api/v1/hr/pipeline',
      providesTags: ['HRPipeline'],
    }),
    getHROverview: b.query<any, void>({
      query: () => '/api/v1/hr/overview',
      providesTags: ['HROverview'],
    }),
    getCandidates: b.query<any, { stage?: string }>({
      query: ({ stage }) => ({ url: '/api/v1/hr/candidates', params: { stage } }),
      providesTags: ['Candidates'],
    }),
    createCandidate: b.mutation<any, any>({
      query: (body) => ({ url: '/api/v1/hr/candidates', method: 'POST', body }),
      invalidatesTags: ['Candidates', 'HRPipeline', 'HROverview'],
    }),
    updateCandidate: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/v1/hr/candidates/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Candidates', 'HRPipeline'],
    }),
    deleteCandidate: b.mutation<any, string>({
      query: (id) => ({ url: `/api/v1/hr/candidates/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Candidates', 'HRPipeline', 'HROverview'],
    }),
  }),
});

export const {
  useGetHRPipelineQuery,
  useGetHROverviewQuery,
  useGetCandidatesQuery,
  useCreateCandidateMutation,
  useUpdateCandidateMutation,
  useDeleteCandidateMutation,
} = hrApi;
