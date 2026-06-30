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
      query: () => '/api/brand/assets',
      providesTags: ['BrandAssets'],
    }),
    getBrandSummary: b.query<any, void>({
      query: () => '/api/brand/summary',
      providesTags: ['BrandSummary'],
    }),
    addBrandAsset: b.mutation<any, any>({
      query: (body) => ({ url: '/api/brand/assets', method: 'POST', body }),
      invalidatesTags: ['BrandAssets', 'BrandSummary'],
    }),
    updateBrandAsset: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/brand/assets/${id}`, method: 'PUT', body }),
      invalidatesTags: ['BrandAssets'],
    }),
    deleteBrandAsset: b.mutation<any, string>({
      query: (id) => ({ url: `/api/brand/assets/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BrandAssets', 'BrandSummary'],
    }),
    generateBrandIdentity: b.mutation<{ identity: BrandIdentity }, { business_description: string; vibe?: string }>({
      query: (body) => ({ url: '/api/brand/generate', method: 'POST', body }),
    }),
    saveBrandIdentity: b.mutation<{ created: number }, SaveIdentityBody>({
      query: (body) => ({ url: '/api/brand/save-identity', method: 'POST', body }),
      invalidatesTags: ['BrandAssets', 'BrandSummary'],
    }),
    generateLogo: b.mutation<{ url: string; public_id: string; file_type?: string }, {
      business_description: string; brand_name?: string; vibe?: string; colors?: BrandColor[]; style?: string;
    }>({
      query: (body) => ({ url: '/api/brand/generate-logo', method: 'POST', body }),
    }),
  }),
});

export interface BrandColor { name: string; hex: string; use?: string }
export interface BrandIdentity {
  brand_name_ideas: string[];
  tagline: string;
  colors: BrandColor[];
  fonts: { heading: string; body: string; note?: string };
  voice: string[];
  logo_concepts: string[];
}
export interface SaveIdentityBody {
  tagline?: string;
  colors?: BrandColor[];
  fonts?: { heading: string; body: string; note?: string };
  voice?: string[];
}

export const {
  useGetBrandAssetsQuery,
  useGetBrandSummaryQuery,
  useAddBrandAssetMutation,
  useUpdateBrandAssetMutation,
  useDeleteBrandAssetMutation,
  useGenerateBrandIdentityMutation,
  useSaveBrandIdentityMutation,
  useGenerateLogoMutation,
} = brandApi;

// ── Marketing API ──────────────────────────────────────────────────────────────
export const marketingApi = createApi({
  reducerPath: 'marketingApi',
  baseQuery,
  tagTypes: ['Campaigns', 'MktOverview'],
  endpoints: (b) => ({
    getMarketingOverview: b.query<any, void>({
      query: () => '/api/marketing/overview',
      providesTags: ['MktOverview'],
    }),
    getCampaigns: b.query<any, void>({
      query: () => '/api/marketing/campaigns',
      providesTags: ['Campaigns'],
    }),
    createCampaign: b.mutation<any, any>({
      query: (body) => ({ url: '/api/marketing/campaigns', method: 'POST', body }),
      invalidatesTags: ['Campaigns', 'MktOverview'],
    }),
    updateCampaign: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/marketing/campaigns/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Campaigns', 'MktOverview'],
    }),
    deleteCampaign: b.mutation<any, string>({
      query: (id) => ({ url: `/api/marketing/campaigns/${id}`, method: 'DELETE' }),
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
      query: () => '/api/sales/pipeline',
      providesTags: ['SalesPipeline'],
    }),
    getDeals: b.query<any, { stage?: string }>({
      query: ({ stage }) => ({ url: '/api/sales/deals', params: { stage } }),
      providesTags: ['Deals'],
    }),
    createDeal: b.mutation<any, any>({
      query: (body) => ({ url: '/api/sales/deals', method: 'POST', body }),
      invalidatesTags: ['Deals', 'SalesPipeline'],
    }),
    updateDeal: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/sales/deals/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Deals', 'SalesPipeline'],
    }),
    deleteDeal: b.mutation<any, string>({
      query: (id) => ({ url: `/api/sales/deals/${id}`, method: 'DELETE' }),
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
      query: () => '/api/operations/overview',
      providesTags: ['OpsOverview'],
    }),
    getVendors: b.query<any, { category?: string; status?: string }>({
      query: ({ category, status }) => ({ url: '/api/operations/vendors', params: { category, status } }),
      providesTags: ['Vendors'],
    }),
    createVendor: b.mutation<any, any>({
      query: (body) => ({ url: '/api/operations/vendors', method: 'POST', body }),
      invalidatesTags: ['Vendors', 'OpsOverview'],
    }),
    updateVendor: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/operations/vendors/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Vendors'],
    }),
    deleteVendor: b.mutation<any, string>({
      query: (id) => ({ url: `/api/operations/vendors/${id}`, method: 'DELETE' }),
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
  tagTypes: ['FinanceOverview', 'Cashflow', 'UnpaidBills', 'Forecast'],
  endpoints: (b) => ({
    getFinanceOverview: b.query<any, void>({
      query: () => '/api/finance/overview',
      providesTags: ['FinanceOverview'],
    }),
    getCashflow: b.query<any, { months?: number }>({
      query: ({ months = 6 }) => ({ url: '/api/finance/cashflow', params: { months } }),
      providesTags: ['Cashflow'],
    }),
    getUnpaidBills: b.query<any, void>({
      query: () => '/api/finance/unpaid-bills',
      providesTags: ['UnpaidBills'],
    }),
    getFinanceForecast: b.query<any, void>({
      query: () => '/api/finance/forecast',
      providesTags: ['Forecast'],
    }),
  }),
});

export const {
  useGetFinanceOverviewQuery,
  useGetCashflowQuery,
  useGetUnpaidBillsQuery,
  useGetFinanceForecastQuery,
} = financeApi;

// ── HR API ─────────────────────────────────────────────────────────────────────
export const hrApi = createApi({
  reducerPath: 'hrApi',
  baseQuery,
  tagTypes: ['Candidates', 'HRPipeline', 'HROverview'],
  endpoints: (b) => ({
    getHRPipeline: b.query<any, void>({
      query: () => '/api/hr/pipeline',
      providesTags: ['HRPipeline'],
    }),
    getHROverview: b.query<any, void>({
      query: () => '/api/hr/overview',
      providesTags: ['HROverview'],
    }),
    getCandidates: b.query<any, { stage?: string }>({
      query: ({ stage }) => ({ url: '/api/hr/candidates', params: { stage } }),
      providesTags: ['Candidates'],
    }),
    createCandidate: b.mutation<any, any>({
      query: (body) => ({ url: '/api/hr/candidates', method: 'POST', body }),
      invalidatesTags: ['Candidates', 'HRPipeline', 'HROverview'],
    }),
    updateCandidate: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/api/hr/candidates/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Candidates', 'HRPipeline'],
    }),
    deleteCandidate: b.mutation<any, string>({
      query: (id) => ({ url: `/api/hr/candidates/${id}`, method: 'DELETE' }),
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
