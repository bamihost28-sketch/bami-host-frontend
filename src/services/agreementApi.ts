import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

// The backend's global camelize middleware converts every JSON response from
// snake_case to camelCase (see middleware/camelize.py) — these field names
// match the wire format, not utils/tenancy_terms.py's Python dict literally.
export interface AgreementParties {
  landlordName: string;
  estateName: string;
  estateAddress: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  unitLabel: string;
  bedroomCount: string;
  rentAmount: number;
  rentDisplay: string;
  cautionFee: number;
  cautionFeeDisplay: string;
  legalFee: number;
  legalFeeDisplay: string;
  startDate: string | null;
  startDateDisplay: string;
  preparedByName: string;
  preparedByAddress: string;
  preparedByPhone: string;
  preparedByEmail: string;
}

export interface AgreementRegistration {
  address?: string;
  occupation?: string;
  employer?: string;
  idType?: string;
  idNumber?: string;
  idDocumentUrl?: string;
  kinName?: string;
  kinRelationship?: string;
  kinPhone?: string;
  witnessName?: string;
  witnessAddress?: string;
  witnessOccupation?: string;
  witnessPhone?: string;
  witnessRelationship?: string;
  witnessTypedName?: string;
  witnessSignatureImage?: string | null;
}

export interface AgreementData {
  id?: string;
  parties: AgreementParties;
  terms: string[];
  registration: AgreementRegistration;
  typedName: string | null;
  signatureImage: string | null;
  signedAt: string | null;
}

export interface AgreementResponse {
  success: boolean;
  signed: boolean;
  data: AgreementData | null;
}

export interface SignAgreementRequest {
  typedName: string;
  signatureImage?: string | null;
  address: string;
  occupation: string;
  employer?: string;
  idType: string;
  idNumber: string;
  idDocumentUrl: string;
  kinName: string;
  kinRelationship: string;
  kinPhone: string;
  witnessName: string;
  witnessAddress: string;
  witnessOccupation: string;
  witnessPhone?: string;
  witnessRelationship: string;
  witnessTypedName: string;
  witnessSignatureImage?: string | null;
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
    signMyAgreement: builder.mutation<{ success: boolean; data: AgreementData }, SignAgreementRequest>({
      query: (body) => ({ url: '/api/tenants/me/agreement/sign', method: 'POST', body }),
      invalidatesTags: ['MyAgreement'],
    }),
    uploadAgreementId: builder.mutation<{ success: boolean; data: { url: string } }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/api/tenants/me/agreement/upload-id', method: 'POST', body: formData };
      },
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
  useUploadAgreementIdMutation,
  useGetTenantAgreementQuery,
  useLazyDownloadMyAgreementQuery,
} = agreementApi;
