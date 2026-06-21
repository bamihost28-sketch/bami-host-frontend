import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

export interface Subscription {
    _id?: string;
    id?: string;
    name: string;
    price: number;
    billingPeriod: 'month' | 'year' | 'week' | 'day' | 'one-time';
    description?: string;
    icon?: 'Layout (Frontend)' | 'Server (Backend)';
    status: 'Active' | 'Inactive';
    features: string[];
    startDate?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateSubscriptionPayload {
    name: string;
    price: number;
    billingPeriod: 'month' | 'year' | 'week' | 'day' | 'one-time';
    description?: string;
    icon?: 'Layout (Frontend)' | 'Server (Backend)';
    status?: 'Active' | 'Inactive';
    features?: string;
    startDate?: string;
    expiresAt?: string;
}

export interface UpdateSubscriptionPayload {
    name?: string;
    price?: number;
    billingPeriod?: 'month' | 'year' | 'week' | 'day' | 'one-time';
    description?: string;
    icon?: 'Layout (Frontend)' | 'Server (Backend)';
    status?: 'Active' | 'Inactive';
    features?: string;
    startDate?: string;
    expiresAt?: string;
}

export interface GetSubscriptionsParams {
    status?: 'Active' | 'Inactive';
    billingPeriod?: 'month' | 'year' | 'week' | 'day' | 'one-time';
    page?: number;
    limit?: number;
}

export interface PaginatedSubscriptionsResponse {
    success: boolean;
    data: Subscription[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
}

export interface SubscriptionResponse {
    success: boolean;
    message?: string;
    data: Subscription;
}

export const subscriptionsApi = createApi({
    reducerPath: 'subscriptionsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) headers.set('authorization', `Bearer ${token}`);
            headers.set('content-type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Subscription', 'SubscriptionList'],
    endpoints: (builder) => ({
        getSubscriptions: builder.query<PaginatedSubscriptionsResponse, GetSubscriptionsParams | void>({
            query: (params = {}) => {
                const qs = new URLSearchParams();
                if (params.status) qs.set('status', params.status);
                if (params.billingPeriod) qs.set('billingPeriod', params.billingPeriod);
                if (params.page != null) qs.set('page', String(params.page));
                if (params.limit != null) qs.set('limit', String(params.limit));
                return `/api/subscriptions${qs.toString() ? `?${qs.toString()}` : ''}`;
            },
            providesTags: (result) =>
                result && Array.isArray(result.data)
                    ? [
                        ...result.data.map((sub) => ({ type: 'Subscription' as const, id: sub._id })),
                        { type: 'SubscriptionList' as const, id: 'LIST' },
                    ]
                    : [{ type: 'SubscriptionList' as const, id: 'LIST' }],
        }),
        getSubscription: builder.query<SubscriptionResponse, string>({
            query: (id) => `/api/subscriptions/${id}`,
            providesTags: (result, error, id) => [{ type: 'Subscription', id }],
        }),
        createSubscription: builder.mutation<SubscriptionResponse, CreateSubscriptionPayload>({
            query: (payload) => ({
                url: '/api/subscriptions',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: [{ type: 'SubscriptionList', id: 'LIST' }],
        }),
        updateSubscription: builder.mutation<SubscriptionResponse, { id: string; payload: UpdateSubscriptionPayload }>({
            query: ({ id, payload }) => ({
                url: `/api/subscriptions/${id}`,
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Subscription', id },
                { type: 'SubscriptionList', id: 'LIST' },
            ],
        }),
        deleteSubscription: builder.mutation<{ success: boolean; message?: string }, string>({
            query: (id) => ({
                url: `/api/subscriptions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Subscription', id },
                { type: 'SubscriptionList', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetSubscriptionsQuery,
    useGetSubscriptionQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useDeleteSubscriptionMutation,
} = subscriptionsApi;
