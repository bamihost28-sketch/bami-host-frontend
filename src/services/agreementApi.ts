import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

export interface AgreementParties {
  landlord_name: string;
  estate_name: string;
  estate_address: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  unit_label: string;
  rent_amount: number;
  rent_display: string;
  start_date: string | null;
  start_date_display: string;
}

export interface AgreementData {
  id?: string;
  parties: AgreementParties;
  terms: string[];
  typedName: string | null;
  signatureImage: string | null;
  signedAt: string | null;
}

export interface AgreementResponse {
  success: boolean;
  signed: boolean;
  data: AgreementData | null;
}

export const agreementApi = createApi({
  reducerPath: 'agreementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['MyAgreement', 'TenantAgreement'],
  endpoints: (builder) => ({
    getMyAgreement: builder.query<AgreementResponse, void>({
      query: () => '/api/tenants/me/agreement',
      providesTags: ['MyAgreement'],
    }),
    signMyAgreement: builder.mutation<{ success: boolean; data: AgreementData }, { typedName: string; signatureImage?: string | null }>({
      query: (body) => ({ url: '/api/tenants/me/agreement/sign', method: 'POST', body }),
      invalidatesTags: ['MyAgreement'],
    }),
    getTenantAgreement: builder.query<AgreementResponse, string>({
      query: (tenantId) => `/api/tenants/${tenantId}/agreement`,
      providesTags: (result, error, tenantId) => [{ type: 'TenantAgreement', id: tenantId }],
    }),
    downloadMyAgreement: builder.query<{ blob: Blob; filename: string }, void>({
      query: () => ({
        url: '/api/tenants/me/agreement/pdf',
        responseHandler: async (response) => {
          const blob = await response.blob();
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = 'tenancy-agreement.pdf';
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1];
          }
          return { blob, filename };
        },
        cache: 'no-cache',
      }),
    }),
  }),
});

export const {
  useGetMyAgreementQuery,
  useSignMyAgreementMutation,
  useGetTenantAgreementQuery,
  useLazyDownloadMyAgreementQuery,
} = agreementApi;
