import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MeterDevice {
  id: string;
  deviceId: string;
  deviceName: string | null;
  unit: string | null;
  unitLabel?: string | null;
  estate: string | null;
  tenant: string | null;
  meterNumber: string | null;
  ratePerKwh: number;
  prepaidMode: boolean;
  creditBalance: number;
  lowBalanceThreshold: number;
  lastKwh: number;
  lastVoltage: number;
  lastCurrent: number;
  lastPower: number;
  lastSyncedAt: string | null;
  isOnline: boolean;
  isConnected: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface LiveStatus {
  voltage: number;
  current: number;
  power: number;
  kwh: number;
  powerFactor: number;
  switch: boolean;
  fault?: number;
  error?: string;
}

export interface MeterStatusResponse {
  success: boolean;
  data: MeterDevice & {
    live: LiveStatus;
    kwhThisMonth: number;
    costThisMonth: number;
  };
}

export interface MeterReading {
  id: string;
  kwh: number;
  voltage: number;
  current: number;
  power: number;
  creditBalance: number;
  recordedAt: string;
}

export interface MeterHistoryResponse {
  success: boolean;
  total: number;
  totalPages: number;
  page: number;
  data: MeterReading[];
}

export interface MeterListResponse {
  success: boolean;
  total: number;
  totalPages: number;
  page: number;
  data: MeterDevice[];
}

export interface TopUpRequest {
  amount: number;
}

export interface TopUpResponse {
  success: boolean;
  message: string;
  data: {
    amountPaid: number;
    kwhPurchased: number;
    newBalance: number;
    newWalletBalance: number;
    tuyaUpdated: boolean;
    transactionId: string;
  };
}

export interface RegisterMeterRequest {
  deviceId: string;
  deviceName?: string;
  unitId: string;
  meterNumber?: string;
  ratePerKwh?: number;
  prepaidMode?: boolean;
  lowBalanceThreshold?: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const meterApi = createApi({
  reducerPath: 'meterApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Meter', 'MeterHistory'],
  endpoints: (builder) => ({

    // ── admin ──────────────────────────────────────────────────────────────

    registerMeter: builder.mutation<{ success: boolean; data: MeterDevice }, RegisterMeterRequest>({
      query: (body) => ({ url: '/api/meters', method: 'POST', body }),
      invalidatesTags: ['Meter'],
    }),

    listMeters: builder.query<MeterListResponse, { estateId?: string; unitId?: string; page?: number; limit?: number }>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params.estateId) q.set('estateId', params.estateId);
        if (params.unitId)   q.set('unitId', params.unitId);
        if (params.page)     q.set('page', String(params.page));
        if (params.limit)    q.set('limit', String(params.limit));
        return `/api/meters?${q}`;
      },
      providesTags: ['Meter'],
    }),

    updateMeter: builder.mutation<{ success: boolean; data: MeterDevice },
      { meterId: string; body: Partial<Pick<MeterDevice, 'deviceName' | 'ratePerKwh' | 'lowBalanceThreshold' | 'prepaidMode'>> }>({
      query: ({ meterId, body }) => ({ url: `/api/meters/${meterId}`, method: 'PATCH', body }),
      invalidatesTags: ['Meter'],
    }),

    deleteMeter: builder.mutation<{ success: boolean }, string>({
      query: (meterId) => ({ url: `/api/meters/${meterId}`, method: 'DELETE' }),
      invalidatesTags: ['Meter'],
    }),

    getUnitMeterStatus: builder.query<MeterStatusResponse, string>({
      query: (unitId) => `/api/meters/unit/${unitId}/status`,
      providesTags: ['Meter'],
    }),

    getUnitMeterHistory: builder.query<MeterHistoryResponse, { unitId: string; days?: number; page?: number }>({
      query: ({ unitId, days = 30, page = 1 }) =>
        `/api/meters/unit/${unitId}/history?days=${days}&page=${page}`,
      providesTags: ['MeterHistory'],
    }),

    disconnectMeter: builder.mutation<{ success: boolean; message: string }, string>({
      query: (meterId) => ({ url: `/api/meters/${meterId}/disconnect`, method: 'POST' }),
      invalidatesTags: ['Meter'],
    }),

    reconnectMeter: builder.mutation<{ success: boolean; message: string }, string>({
      query: (meterId) => ({ url: `/api/meters/${meterId}/reconnect`, method: 'POST' }),
      invalidatesTags: ['Meter'],
    }),

    resetBaseline: builder.mutation<{ success: boolean }, string>({
      query: (meterId) => ({ url: `/api/meters/${meterId}/reset-baseline`, method: 'POST' }),
      invalidatesTags: ['Meter'],
    }),

    // ── tenant ─────────────────────────────────────────────────────────────

    getMyMeter: builder.query<MeterStatusResponse, void>({
      query: () => '/api/meters/my',
      providesTags: ['Meter'],
    }),

    getMyMeterHistory: builder.query<MeterHistoryResponse, { days?: number; page?: number }>({
      query: ({ days = 7, page = 1 }) => `/api/meters/my/history?days=${days}&page=${page}`,
      providesTags: ['MeterHistory'],
    }),

    topUpMeter: builder.mutation<TopUpResponse, TopUpRequest>({
      query: (body) => ({ url: '/api/meters/my/topup', method: 'POST', body }),
      invalidatesTags: ['Meter'],
    }),

  }),
});

export const {
  useRegisterMeterMutation,
  useListMetersQuery,
  useUpdateMeterMutation,
  useDeleteMeterMutation,
  useGetUnitMeterStatusQuery,
  useGetUnitMeterHistoryQuery,
  useDisconnectMeterMutation,
  useReconnectMeterMutation,
  useResetBaselineMutation,
  useGetMyMeterQuery,
  useGetMyMeterHistoryQuery,
  useTopUpMeterMutation,
} = meterApi;
