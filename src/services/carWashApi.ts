import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

// Backend builds these dicts snake_case, but camelize_response_middleware
// (fastapi_app/middleware/camelize.py) auto-converts every JSON response's
// keys to camelCase — /api/carwash isn't on the middleware's snake_case
// opt-out list. Confirmed against the live response during backend testing.

export interface CarWashStation {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  address?: string | null;
  owner?: string | null;
  members: Array<{ userId: string; email: string; role: 'staff' | 'admin' }>;
  opensAt?: string | null;
  closesAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  myRole?: 'staff' | 'admin' | null;
}

export interface CreateStationPayload {
  name: string;
  description?: string;
  address?: string;
  opensAt?: string;
  closesAt?: string;
}
export type UpdateStationPayload = Partial<CreateStationPayload>;

export interface CarWashStationOverview {
  station: { id: string; name: string };
  queueLength: number;
  ordersToday: number;
  completedToday: number;
  revenueToday: number;
  revenue30D: number;
  openTickets: number;
}

export interface CarWashOverviewAll {
  stations: number;
  ordersToday: number;
  revenue30D: number;
  openTickets: number;
}

export interface CarWashStaffMember {
  userId: string;
  email: string;
  name: string | null;
  role: 'staff' | 'admin';
  isActive: boolean | null;
}

export interface AssignStaffPayload {
  name: string;
  email: string;
  role?: 'staff' | 'admin';
  phone?: string;
  sendCredentials?: boolean;
}

export interface CarWashService {
  id: string;
  stationId: string;
  name: string;
  description?: string | null;
  basePrice: number;
  durationMin: number;
  kind: 'queue' | 'slot';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  basePrice: number;
  durationMin?: number;
  kind?: 'queue' | 'slot';
}
export type UpdateServicePayload = Partial<CreateServicePayload>;

export interface CarWashAddon {
  id: string;
  stationId: string;
  serviceId?: string | null;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddonPayload {
  serviceId?: string;
  name: string;
  price: number;
}
export type UpdateAddonPayload = Partial<Pick<CreateAddonPayload, 'name' | 'price'>>;

export interface CarWashVehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year?: number | null;
  color?: string | null;
  plate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CarWashOrderStatus =
  | 'scheduled' | 'queued' | 'in_wash' | 'drying' | 'ready' | 'completed' | 'cancelled';

export interface CarWashOrder {
  id: string;
  stationId: string;
  userId: string;
  vehicleId: string;
  serviceId: string;
  status: CarWashOrderStatus;
  total: number;
  scheduledAt?: string | null;
  queuedAt?: string | null;
  slotStart?: string | null;
  staffId?: string | null;
  cancelledReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CarWashStatusEvent {
  id: string;
  orderId: string;
  status: string;
  note?: string | null;
  actorId?: string | null;
  at: string;
}

export interface CarWashOrderDetail extends CarWashOrder {
  timeline: CarWashStatusEvent[];
}

export interface CreateOrderPayload {
  stationId: string;
  vehicleId: string;
  serviceId: string;
  addonIds?: string[];
  scheduledAt?: string;
}

export interface CarWashQrPayment {
  id: string;
  orderId: string;
  amount: number;
  expiresAt: string;
  status: 'issued' | 'paid' | 'expired' | 'void';
  staffId: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface IssueQrResponse {
  qrToken: string;
  qrId: string;
  amount: number;
  expiresAt: string;
}

export type CarWashTicketStatus = 'open' | 'resolved' | 'refunded';

export interface CarWashSupportTicket {
  id: string;
  stationId: string;
  userId: string;
  orderId?: string | null;
  subject: string;
  description: string;
  status: CarWashTicketStatus;
  resolutionNote?: string | null;
  refundAmount?: number | null;
  refundTransactionId?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  stationId: string;
  orderId?: string;
  subject: string;
  description: string;
}

export interface ResolveTicketPayload {
  resolutionNote?: string;
  refund?: boolean;
  refundAmount?: number;
}

interface ListResponse<T> { success: boolean; count: number; total?: number; data: T[] }
interface ItemResponse<T> { success: boolean; data: T }

export const carWashApi = createApi({
  reducerPath: 'carWashApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['CarWashStation', 'CarWashStationList', 'CarWashService', 'CarWashAddon',
    'CarWashVehicle', 'CarWashOrder', 'CarWashOrderList', 'CarWashTicket', 'CarWashTicketList', 'CarWashStaff'],
  endpoints: (builder) => ({
    // ── overview ──────────────────────────────────────────────────────────
    getCarWashOverviewAll: builder.query<ItemResponse<CarWashOverviewAll>, void>({
      query: () => '/api/carwash/overview/all',
    }),
    getCarWashStationOverview: builder.query<ItemResponse<CarWashStationOverview>, string>({
      query: (stationId) => `/api/carwash/stations/${stationId}/overview`,
    }),

    // ── stations ──────────────────────────────────────────────────────────
    getCarWashStations: builder.query<ListResponse<CarWashStation>, void>({
      query: () => '/api/carwash/stations',
      providesTags: (result) =>
        result
          ? [...result.data.map((s) => ({ type: 'CarWashStation' as const, id: s.id })), { type: 'CarWashStationList' as const, id: 'LIST' }]
          : [{ type: 'CarWashStationList' as const, id: 'LIST' }],
    }),
    getCarWashStation: builder.query<ItemResponse<CarWashStation>, string>({
      query: (id) => `/api/carwash/stations/${id}`,
      providesTags: (r, e, id) => [{ type: 'CarWashStation', id }],
    }),
    createCarWashStation: builder.mutation<ItemResponse<CarWashStation>, CreateStationPayload>({
      query: (body) => ({ url: '/api/carwash/stations', method: 'POST', body }),
      invalidatesTags: [{ type: 'CarWashStationList', id: 'LIST' }],
    }),
    updateCarWashStation: builder.mutation<ItemResponse<CarWashStation>, { id: string; data: UpdateStationPayload }>({
      query: ({ id, data }) => ({ url: `/api/carwash/stations/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: 'CarWashStation', id }, { type: 'CarWashStationList', id: 'LIST' }],
    }),
    deleteCarWashStation: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/api/carwash/stations/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'CarWashStationList', id: 'LIST' }],
    }),

    // ── staff ─────────────────────────────────────────────────────────────
    getCarWashStaff: builder.query<{ success: boolean; owner: CarWashStaffMember | null; members: CarWashStaffMember[] }, string>({
      query: (stationId) => `/api/carwash/stations/${stationId}/staff`,
      providesTags: (r, e, stationId) => [{ type: 'CarWashStaff', id: stationId }],
    }),
    addCarWashStaff: builder.mutation<{ success: boolean; message: string; data: any }, { stationId: string; data: AssignStaffPayload }>({
      query: ({ stationId, data }) => ({ url: `/api/carwash/stations/${stationId}/staff`, method: 'POST', body: data }),
      invalidatesTags: (r, e, { stationId }) => [{ type: 'CarWashStaff', id: stationId }],
    }),
    removeCarWashStaff: builder.mutation<{ success: boolean; message: string }, { stationId: string; userId: string }>({
      query: ({ stationId, userId }) => ({ url: `/api/carwash/stations/${stationId}/staff/${userId}`, method: 'DELETE' }),
      invalidatesTags: (r, e, { stationId }) => [{ type: 'CarWashStaff', id: stationId }],
    }),

    // ── services & addons ─────────────────────────────────────────────────
    getCarWashServices: builder.query<ListResponse<CarWashService>, string>({
      query: (stationId) => `/api/carwash/stations/${stationId}/services`,
      providesTags: (r, e, stationId) => [{ type: 'CarWashService', id: stationId }],
    }),
    createCarWashService: builder.mutation<ItemResponse<CarWashService>, { stationId: string; data: CreateServicePayload }>({
      query: ({ stationId, data }) => ({ url: `/api/carwash/stations/${stationId}/services`, method: 'POST', body: data }),
      invalidatesTags: (r, e, { stationId }) => [{ type: 'CarWashService', id: stationId }],
    }),
    updateCarWashService: builder.mutation<ItemResponse<CarWashService>, { id: string; stationId: string; data: UpdateServicePayload }>({
      query: ({ id, data }) => ({ url: `/api/carwash/services/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (r, e, { stationId }) => [{ type: 'CarWashService', id: stationId }],
    }),
    deleteCarWashService: builder.mutation<{ success: boolean; message: string }, { id: string; stationId: string }>({
      query: ({ id }) => ({ url: `/api/carwash/services/${id}`, method: 'DELETE' }),
      invalidatesTags: (r, e, { stationId }) => [{ type: 'CarWashService', id: stationId }],
    }),

    getCarWashAddons: builder.query<ListResponse<CarWashAddon>, string>({
      query: (stationId) => `/api/carwash/stations/${stationId}/addons`,
      providesTags: (r, e, stationId) => [{ type: 'CarWashAddon', id: stationId }],
    }),
    createCarWashAddon: builder.mutation<ItemResponse<CarWashAddon>, { stationId: string; data: CreateAddonPayload }>({
      query: ({ stationId, data }) => ({ url: `/api/carwash/stations/${stationId}/addons`, method: 'POST', body: data }),
      invalidatesTags: (r, e, { stationId }) => [{ type: 'CarWashAddon', id: stationId }],
    }),
    updateCarWashAddon: builder.mutation<ItemResponse<CarWashAddon>, { id: string; stationId: string; data: UpdateAddonPayload }>({
      query: ({ id, data }) => ({ url: `/api/carwash/addons/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (r, e, { stationId }) => [{ type: 'CarWashAddon', id: stationId }],
    }),
    deleteCarWashAddon: builder.mutation<{ success: boolean; message: string }, { id: string; stationId: string }>({
      query: ({ id }) => ({ url: `/api/carwash/addons/${id}`, method: 'DELETE' }),
      invalidatesTags: (r, e, { stationId }) => [{ type: 'CarWashAddon', id: stationId }],
    }),

    // ── vehicles (customer self-service — kept for the eventual mobile rewiring) ──
    getMyCarWashVehicles: builder.query<ListResponse<CarWashVehicle>, void>({
      query: () => '/api/carwash/vehicles/my',
      providesTags: [{ type: 'CarWashVehicle', id: 'LIST' }],
    }),
    createCarWashVehicle: builder.mutation<ItemResponse<CarWashVehicle>, { make: string; model: string; year?: number; color?: string; plate: string }>({
      query: (body) => ({ url: '/api/carwash/vehicles', method: 'POST', body }),
      invalidatesTags: [{ type: 'CarWashVehicle', id: 'LIST' }],
    }),

    // ── orders ────────────────────────────────────────────────────────────
    getMyCarWashOrders: builder.query<ListResponse<CarWashOrder>, { status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/api/carwash/orders/my', params: params || {} }),
      providesTags: [{ type: 'CarWashOrderList', id: 'MINE' }],
    }),
    getCarWashStationOrders: builder.query<ListResponse<CarWashOrder>, { stationId: string; status?: string; page?: number; limit?: number }>({
      query: ({ stationId, ...params }) => ({ url: `/api/carwash/stations/${stationId}/orders`, params }),
      providesTags: (result, error, { stationId }) =>
        result
          ? [...result.data.map((o) => ({ type: 'CarWashOrder' as const, id: o.id })), { type: 'CarWashOrderList' as const, id: stationId }]
          : [{ type: 'CarWashOrderList' as const, id: stationId }],
    }),
    getCarWashOrder: builder.query<ItemResponse<CarWashOrderDetail>, string>({
      query: (id) => `/api/carwash/orders/${id}`,
      providesTags: (r, e, id) => [{ type: 'CarWashOrder', id }],
    }),
    createCarWashOrder: builder.mutation<ItemResponse<CarWashOrder>, CreateOrderPayload>({
      query: (body) => ({ url: '/api/carwash/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'CarWashOrderList', id: 'MINE' }],
    }),
    updateCarWashOrderStatus: builder.mutation<ItemResponse<CarWashOrder>, { id: string; stationId: string; status: CarWashOrderStatus; note?: string }>({
      query: ({ id, status, note }) => ({ url: `/api/carwash/orders/${id}/status`, method: 'PATCH', body: { status, note } }),
      invalidatesTags: (r, e, { id, stationId }) => [{ type: 'CarWashOrder', id }, { type: 'CarWashOrderList', id: stationId }],
    }),
    cancelCarWashOrder: builder.mutation<ItemResponse<CarWashOrder>, { id: string; stationId?: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/api/carwash/orders/${id}/cancel`, method: 'POST', body: { reason } }),
      invalidatesTags: (r, e, { id, stationId }) => [{ type: 'CarWashOrder', id }, { type: 'CarWashOrderList', id: stationId || 'MINE' }],
    }),

    // ── QR payment ────────────────────────────────────────────────────────
    issueCarWashQr: builder.mutation<ItemResponse<IssueQrResponse>, string>({
      query: (orderId) => ({ url: `/api/carwash/orders/${orderId}/qr/issue`, method: 'POST' }),
    }),
    getCarWashQrStatus: builder.query<ItemResponse<CarWashQrPayment>, string>({
      query: (qrId) => `/api/carwash/qr/${qrId}`,
    }),
    scanCarWashQr: builder.mutation<{ success: boolean; message: string; data: { amountPaid: number; newWalletBalance: number; transactionId: string } }, string>({
      query: (qrToken) => ({ url: '/api/carwash/qr/scan', method: 'POST', body: { qrToken } }),
    }),

    // ── support tickets ───────────────────────────────────────────────────
    getMyCarWashTickets: builder.query<ListResponse<CarWashSupportTicket>, void>({
      query: () => '/api/carwash/support-tickets/my',
      providesTags: [{ type: 'CarWashTicketList', id: 'MINE' }],
    }),
    getCarWashStationTickets: builder.query<ListResponse<CarWashSupportTicket>, { stationId: string; status?: string }>({
      query: ({ stationId, status }) => ({ url: `/api/carwash/stations/${stationId}/support-tickets`, params: status ? { status } : {} }),
      providesTags: (r, e, { stationId }) => [{ type: 'CarWashTicketList', id: stationId }],
    }),
    createCarWashTicket: builder.mutation<ItemResponse<CarWashSupportTicket>, CreateTicketPayload>({
      query: (body) => ({ url: '/api/carwash/support-tickets', method: 'POST', body }),
      invalidatesTags: [{ type: 'CarWashTicketList', id: 'MINE' }],
    }),
    resolveCarWashTicket: builder.mutation<ItemResponse<CarWashSupportTicket>, { id: string; stationId: string; data: ResolveTicketPayload }>({
      query: ({ id, data }) => ({ url: `/api/carwash/support-tickets/${id}/resolve`, method: 'PATCH', body: data }),
      invalidatesTags: (r, e, { stationId }) => [{ type: 'CarWashTicketList', id: stationId }],
    }),
  }),
});

export const {
  useGetCarWashOverviewAllQuery,
  useGetCarWashStationOverviewQuery,
  useGetCarWashStationsQuery,
  useGetCarWashStationQuery,
  useCreateCarWashStationMutation,
  useUpdateCarWashStationMutation,
  useDeleteCarWashStationMutation,
  useGetCarWashStaffQuery,
  useAddCarWashStaffMutation,
  useRemoveCarWashStaffMutation,
  useGetCarWashServicesQuery,
  useCreateCarWashServiceMutation,
  useUpdateCarWashServiceMutation,
  useDeleteCarWashServiceMutation,
  useGetCarWashAddonsQuery,
  useCreateCarWashAddonMutation,
  useUpdateCarWashAddonMutation,
  useDeleteCarWashAddonMutation,
  useGetMyCarWashVehiclesQuery,
  useCreateCarWashVehicleMutation,
  useGetMyCarWashOrdersQuery,
  useGetCarWashStationOrdersQuery,
  useGetCarWashOrderQuery,
  useCreateCarWashOrderMutation,
  useUpdateCarWashOrderStatusMutation,
  useCancelCarWashOrderMutation,
  useIssueCarWashQrMutation,
  useGetCarWashQrStatusQuery,
  useScanCarWashQrMutation,
  useGetMyCarWashTicketsQuery,
  useGetCarWashStationTicketsQuery,
  useCreateCarWashTicketMutation,
  useResolveCarWashTicketMutation,
} = carWashApi;
