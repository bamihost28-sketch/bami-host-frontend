import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface BankDeposit {
  _id: string;
  user: { _id: string; name: string; email: string } | string;
  tenant?: { _id: string; tenantName: string; unitLabel: string } | null;
  amount: number;
  proofImageUrl: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  reviewedBy?: { _id: string; name: string; email: string } | null;
  reviewedAt?: string;
  walletTransactionRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositsListResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: BankDeposit[];
}

export interface SubmitDepositResponse {
  success: boolean;
  message: string;
  data: {
    depositId: string;
    amount: number;
    status: string;
    submittedAt: string;
  };
}

export interface ApproveRejectResponse {
  success: boolean;
  message: string;
  data: {
    depositId: string;
    amount?: number;
    status: string;
    newWalletBalance?: number;
  };
}

export const bankDepositsApi = createApi({
  reducerPath: 'bankDepositsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      // Do NOT set content-type here — the file upload endpoint requires
      // multipart/form-data which the browser sets automatically with the correct boundary.
      return headers;
    },
  }),
  tagTypes: ['BankDeposits', 'MyDeposits'],
  endpoints: (builder) => ({
    getBankInfo: builder.query<{ success: boolean; data: BankInfo }, void>({
      query: () => '/api/bank-deposits/bank-info',
    }),

    submitDeposit: builder.mutation<SubmitDepositResponse, FormData>({
      query: (formData) => ({
        url: '/api/bank-deposits',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['MyDeposits'],
    }),

    getMyDeposits: builder.query<DepositsListResponse, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: '/api/bank-deposits/my', params }),
      providesTags: ['MyDeposits'],
    }),

    getAllDeposits: builder.query<
      DepositsListResponse,
      { page?: number; limit?: number; status?: string; userId?: string; search?: string }
    >({
      query: (params) => ({ url: '/api/bank-deposits', params }),
      providesTags: ['BankDeposits'],
    }),

    getDeposit: builder.query<{ success: boolean; data: BankDeposit }, string>({
      query: (id) => `/api/bank-deposits/${id}`,
    }),

    approveDeposit: builder.mutation<ApproveRejectResponse, { id: string; adminNote?: string }>({
      query: ({ id, adminNote }) => ({
        url: `/api/bank-deposits/${id}/approve`,
        method: 'PATCH',
        body: { adminNote },
      }),
      invalidatesTags: ['BankDeposits'],
    }),

    rejectDeposit: builder.mutation<ApproveRejectResponse, { id: string; adminNote?: string }>({
      query: ({ id, adminNote }) => ({
        url: `/api/bank-deposits/${id}/reject`,
        method: 'PATCH',
        body: { adminNote },
      }),
      invalidatesTags: ['BankDeposits'],
    }),
  }),
});

export const {
  useGetBankInfoQuery,
  useSubmitDepositMutation,
  useGetMyDepositsQuery,
  useGetAllDepositsQuery,
  useGetDepositQuery,
  useApproveDepositMutation,
  useRejectDepositMutation,
} = bankDepositsApi;
