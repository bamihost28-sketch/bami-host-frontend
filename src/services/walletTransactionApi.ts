import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface WalletData {
  _id: string;
  userId: User;
  balance: number;
  currency: string;
  totalEarnings: number;
  totalSpent: number;
  transactions: string[];
  lastUpdated: string;
  isActive: boolean;
  currencySymbol: string;
}

export interface WalletResponse {
  success: boolean;
  data: WalletData;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'rent' | 'other';
export type TransactionMethod = 'card' | 'bank_transfer' | 'ussd' | 'other';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'paid';
export type RecipientType = 'user' | 'estate';

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface Transaction {
  _id: string;
  user: User | string;
  walletId: string | { balance: number };
  estate?: { name: string };
  tenant?: { tenantName: string };
  amount: number;
  type: TransactionType;
  method: TransactionMethod;
  status: TransactionStatus;
  reference: string;
  description: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Transaction[];
}

export interface TransactionsResponse {
  success: boolean;
  count: number;
  data: Transaction[];
}

// ============================================
// REQUEST TYPES
// ============================================

export interface DepositRequest {
  type: 'deposit';
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  type: 'withdraw';
  amount: number;
  description?: string;
  bankDetails: BankDetails;
}

export interface TransferUserRequest {
  type: 'transfer';
  amount: number;
  description?: string;
  recipientEmail: string;
  recipientType: 'user';
}

export interface TransferEstateRequest {
  type: 'transfer';
  amount: number;
  description?: string;
  recipientId: string;
  recipientType: 'estate';
}

export type TransactionRequest = DepositRequest | WithdrawRequest | TransferUserRequest | TransferEstateRequest;

// ============================================
// RESPONSE TYPES
// ============================================

export interface DepositResponse {
  success: boolean;
  message: string;
  data: {
    transaction: string;
    amount: number;
    newBalance: number;
    type: 'deposit';
  };
}

export interface WithdrawResponse {
  success: boolean;
  message: string;
  data: {
    withdrawal: string;
    amount: number;
    newBalance: number;
    status: TransactionStatus;
    type: 'withdraw';
  };
}

export interface TransferResponse {
  success: boolean;
  message: string;
  data: {
    transaction: string;
    amount: number;
    newBalance: number;
    recipient: string;
    recipientType: RecipientType;
    type: 'transfer';
  };
}

export type TransactionResponse = DepositResponse | WithdrawResponse | TransferResponse;

export interface ValidationError {
  msg: string;
  path: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
}

// ============================================
// QUERY PARAMETERS
// ============================================

export interface TransactionListParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// RTK QUERY API
// ============================================

export const walletTransactionApi = createApi({
  reducerPath: 'walletTransactionApi',
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
  tagTypes: ['Wallet', 'Transaction'],
  endpoints: (builder) => ({
    // 1. Get Wallet Balance
    getWalletBalance: builder.query<WalletResponse, void>({
      query: () => '/api/wallet',
      providesTags: ['Wallet'],
    }),

    // 2. Create Transaction (Deposit, Withdraw, Transfer)
    createTransaction: builder.mutation<TransactionResponse, TransactionRequest>({
      query: (body) => ({
        url: '/api/wallet/transaction',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Transaction'],
    }),

    // 3. Get Own Transaction History
    getOwnTransactions: builder.query<TransactionsResponse, void>({
      query: () => '/api/wallet/transactions',
      providesTags: ['Transaction'],
    }),

    // 4. Get All Transactions with Pagination & Filters
    getTransactionsList: builder.query<TransactionListResponse, TransactionListParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.type) queryParams.append('type', params.type);
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        return `/api/wallet/transactions/list?${queryParams.toString()}`;
      },
      providesTags: ['Transaction'],
    }),

    // Deposit (Shortcut)
    deposit: builder.mutation<DepositResponse, { amount: number; description?: string }>({
      query: ({ amount, description }) => ({
        url: '/api/wallet/transaction',
        method: 'POST',
        body: {
          type: 'deposit',
          amount,
          description,
        },
      }),
      invalidatesTags: ['Wallet', 'Transaction'],
    }),

    // Withdraw (Shortcut)
    withdraw: builder.mutation<WithdrawResponse, { amount: number; bankDetails: BankDetails; description?: string }>({
      query: ({ amount, bankDetails, description }) => ({
        url: '/api/wallet/transaction',
        method: 'POST',
        body: {
          type: 'withdraw',
          amount,
          bankDetails,
          description,
        },
      }),
      invalidatesTags: ['Wallet', 'Transaction'],
    }),

    // Transfer to User (Shortcut)
    transferToUser: builder.mutation<TransferResponse, { amount: number; recipientEmail: string; description?: string }>({
      query: ({ amount, recipientEmail, description }) => ({
        url: '/api/wallet/transaction',
        method: 'POST',
        body: {
          type: 'transfer',
          amount,
          recipientEmail,
          recipientType: 'user',
          description,
        },
      }),
      invalidatesTags: ['Wallet', 'Transaction'],
    }),

    // Transfer to Estate (Shortcut)
    transferToEstate: builder.mutation<TransferResponse, { amount: number; recipientId: string; description?: string }>({
      query: ({ amount, recipientId, description }) => ({
        url: '/api/wallet/transaction',
        method: 'POST',
        body: {
          type: 'transfer',
          amount,
          recipientId,
          recipientType: 'estate',
          description,
        },
      }),
      invalidatesTags: ['Wallet', 'Transaction'],
    }),

    // Add Funds (test mode — bypasses Paystack, credits wallet directly)
    addFunds: builder.mutation<{ success: boolean; message?: string; data?: { balance: number } }, { amount: number }>({
      query: (body) => ({
        url: '/api/wallet/add-funds',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet'],
    }),
  }),
});

// Export hooks
export const {
  useGetWalletBalanceQuery,
  useCreateTransactionMutation,
  useGetOwnTransactionsQuery,
  useGetTransactionsListQuery,
  useDepositMutation,
  useWithdrawMutation,
  useTransferToUserMutation,
  useTransferToEstateMutation,
  useAddFundsMutation,
} = walletTransactionApi;
