import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';
import {
  Wallet,
  WalletResponse,
  PaystackInitializeResponse,
  PaystackVerifyResponse,
  DepositInitializeRequest,
  WalletTransactionResponse,
} from '../types/wallet';

// Types for Global Wallet (Multi-Engine)
export interface WalletSubAllocation {
  name: string;
  balance: number;
  percentage: number;
}

export interface EngineWallet {
  marketing: WalletSubAllocation;
  operations: WalletSubAllocation;
  savings: WalletSubAllocation;
  total: number;
  percentage: number;
}

export interface WalletSummary {
  totalBalance: number;
  totalReceived: number;
  totalMarketing: number;
  totalOperations: number;
  totalSavings: number;
}

export interface GlobalWalletData {
  growthEngine: EngineWallet;
  fulfillmentEngine: EngineWallet;
  innovationEngine: EngineWallet;
  summary: WalletSummary;
}

export interface GlobalWalletResponse {
  success: boolean;
  data: GlobalWalletData;
}

// Transaction list types
export type WalletTxType = 'rent' | 'deposit' | 'service_charge' | 'caution_fee' | 'legal_fee' | 'withdrawal' | 'other';
export type WalletTxStatus = 'paid' | 'completed' | 'pending' | 'failed';

export interface WalletTransactionListItem {
  _id: string;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: number;
  description?: string;
  reference?: string;
  createdAt: string;
  user?: { name: string; email: string };
  estate?: { name: string };
}

export interface WalletTransactionListResponse {
  success: boolean;
  data: WalletTransactionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface TransactionListParams {
  type?: WalletTxType;
  status?: WalletTxStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Admin credit types
export interface AdminLookupData {
  userId: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  walletBalance: number;
  currency: string;
}

export interface AdminCreditData {
  transactionId: string;
  recipient: { id: string; name: string; email: string };
  amountCredited: number;
  newBalance: number;
}

// RTK Query API
export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Wallet', 'GlobalWallet', 'PersonalWallet', 'WalletTransactions'],
  endpoints: (builder) => ({
    // GLOBAL WALLET ENDPOINTS (Multi-Engine)
    // Global wallet summary across all 3 engines
    getGlobalWalletSummary: builder.query<GlobalWalletResponse, void>({
      query: () => '/api/wallets/global-summary',
      providesTags: ['GlobalWallet'],
    }),
    // Individual wallet by ID
    getWallet: builder.query<any, string>({
      query: (userId) => `/api/wallets/${userId}`,
      providesTags: ['Wallet'],
    }),

    // PERSONAL WALLET ENDPOINTS (Deposits/Transactions)
    // Get user's personal wallet
    getPersonalWallet: builder.query<WalletResponse, void>({
      query: () => '/api/wallet',
      providesTags: ['PersonalWallet'],
    }),

    // Initialize Paystack deposit
    initializePaystackDeposit: builder.mutation<
      PaystackInitializeResponse,
      DepositInitializeRequest
    >({
      query: (body) => ({
        url: '/api/wallet/paystack/initialize',
        method: 'POST',
        body,
      }),
    }),

    // Verify Paystack payment and credit wallet
    verifyPaystackDeposit: builder.mutation<
      PaystackVerifyResponse,
      { reference: string }
    >({
      query: ({ reference }) => ({
        url: `/api/wallet/paystack/verify/${reference}`,
        method: 'GET',
      }),
      invalidatesTags: ['PersonalWallet', 'WalletTransactions'],
    }),

    // Get wallet transactions
    getWalletTransactions: builder.query<WalletTransactionResponse, void>({
      query: () => '/api/wallet/transactions',
      providesTags: ['WalletTransactions'],
    }),

    // Paginated transaction list with filters (role-aware on backend)
    getWalletTransactionList: builder.query<WalletTransactionListResponse, TransactionListParams>({
      query: (params) => ({
        url: '/api/wallet/transactions/list',
        params,
      }),
      providesTags: ['WalletTransactions'],
    }),

    // Admin: look up user by email before crediting
    adminLookupUser: builder.query<{ success: boolean; data: AdminLookupData }, string>({
      query: (email) => `/api/wallet/admin/lookup?email=${encodeURIComponent(email)}`,
    }),

    // Admin: credit a user's wallet
    adminCreditWallet: builder.mutation<
      { success: boolean; message: string; data: AdminCreditData },
      { email: string; amount: number; reason?: string }
    >({
      query: (body) => ({
        url: '/api/wallet/admin/credit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GlobalWallet', 'WalletTransactions'],
    }),
  }),
});

// Export hooks
export const {
  useGetGlobalWalletSummaryQuery,
  useGetWalletQuery,
  useGetPersonalWalletQuery,
  useInitializePaystackDepositMutation,
  useVerifyPaystackDepositMutation,
  useGetWalletTransactionsQuery,
  useGetWalletTransactionListQuery,
  useLazyAdminLookupUserQuery,
  useAdminCreditWalletMutation,
} = walletApi;
