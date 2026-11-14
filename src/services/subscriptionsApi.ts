import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL, withColdStartRetry } from './api';
import type { Currency, CurrencyTotals } from '@/lib/money';

export type SubscriptionCategory = 'domain' | 'frontend' | 'backend' | 'other';
/** Spend also includes development work, paid through contracts. */
export type SpendCategory = SubscriptionCategory | 'development' | 'legal' | 'maintenance' | 'design' | 'marketing';

export interface SubscriptionPayment {
    id: string;
    paidOn: string;
    /** Exactly what was paid, in `currency` (payments from before currencies existed are naira). */
    amount: number;
    currency?: Currency;
    /** For dollar payments: the naira the bank actually debited, if recorded. */
    ngnEquivalent?: number | null;
    months?: number | null;
    periodStart?: string | null;
    periodEnd?: string | null;
    note?: string | null;
}

export interface Subscription {
    _id?: string;
    id?: string;
    name: string;
    price: number;
    currency?: Currency;
    billingPeriod: 'month' | 'year' | 'week' | 'day' | 'one-time';
    description?: string;
    icon?: 'Layout (Frontend)' | 'Server (Backend)';
    category?: SubscriptionCategory | null;
    provider?: string | null;
    payments?: SubscriptionPayment[];
    /** Sum of every payment recorded against this subscription, per currency. */
    totalPaidByCurrency?: CurrencyTotals;
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
    currency?: Currency;
    /** Naira debited for a dollar payment (optional). */
    ngnEquivalent?: number;
    billingPeriod: 'month' | 'year' | 'week' | 'day' | 'one-time';
    description?: string;
    icon?: 'Layout (Frontend)' | 'Server (Backend)';
    category?: SubscriptionCategory;
    provider?: string;
    status?: 'Active' | 'Inactive';
    features?: string;
    startDate?: string;
    expiresAt?: string;
}

export interface UpdateSubscriptionPayload {
    name?: string;
    price?: number;
    currency?: Currency;
    billingPeriod?: 'month' | 'year' | 'week' | 'day' | 'one-time';
    description?: string;
    icon?: 'Layout (Frontend)' | 'Server (Backend)';
    category?: SubscriptionCategory;
    provider?: string;
    status?: 'Active' | 'Inactive';
    features?: string;
    startDate?: string;
    expiresAt?: string;
}

export interface RenewSubscriptionPayload {
    months: number;
    /** Defaults to the plan's price on the server. */
    amount?: number;
    /** Defaults to the plan's currency on the server. */
    currency?: Currency;
    ngnEquivalent?: number;
    paidOn?: string;
    note?: string;
}

export interface SpendPayment {
    paymentId: string;
    subscriptionId: string;
    name: string;
    category: SpendCategory;
    /** 'contract' = a confirmed payment on a development contract; the provider is then the developer. */
    source?: 'subscription' | 'contract';
    provider?: string | null;
    paidOn: string;
    amount: number;
    currency: Currency;
    ngnEquivalent?: number | null;
    months?: number | null;
    periodStart?: string | null;
    periodEnd?: string | null;
    note?: string | null;
}

export interface SubscriptionSpend {
    /** Currencies that appear in this period, dollars first. */
    currencies: Currency[];
    totals: CurrencyTotals;
    thisMonth: CurrencyTotals;
    thisYear: CurrencyTotals;
    /** Naira cost where known: naira payments + naira debited for dollar payments. */
    ngnTotal: number;
    /** Dollar payments with no naira amount recorded (so ngnTotal is understated). */
    ngnMissing: number;
    paymentCount: number;
    byMonth: { month: string; amounts: CurrencyTotals }[];
    byCategory: { category: SpendCategory; amounts: CurrencyTotals }[];
    payments: SpendPayment[];
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
    baseQuery: withColdStartRetry(fetchBaseQuery({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) headers.set('authorization', `Bearer ${token}`);
            headers.set('content-type', 'application/json');
            return headers;
        },
    }), 2),
    tagTypes: ['Subscription', 'SubscriptionList'],
    endpoints: (builder) => ({
        getSubscriptions: builder.query<PaginatedSubscriptionsResponse, GetSubscriptionsParams | void>({
            query: (arg) => {
                const params = (arg as GetSubscriptionsParams | undefined) ?? {};
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
        getSubscriptionSpend: builder.query<{ success: boolean; data: SubscriptionSpend }, { from?: string; to?: string; includeContracts?: boolean } | void>({
            query: (arg) => {
                const params = (arg as { from?: string; to?: string; includeContracts?: boolean } | undefined) ?? {};
                const qs = new URLSearchParams();
                if (params.from) qs.set('from', params.from);
                if (params.to) qs.set('to', params.to);
                if (params.includeContracts === false) qs.set('includeContracts', 'false');
                return `/api/subscriptions/spend${qs.toString() ? `?${qs.toString()}` : ''}`;
            },
            // renewals / new subscriptions change the totals
            providesTags: [{ type: 'SubscriptionList', id: 'SPEND' }],
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
            invalidatesTags: [{ type: 'SubscriptionList', id: 'LIST' }, { type: 'SubscriptionList', id: 'SPEND' }],
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
                { type: 'SubscriptionList', id: 'SPEND' },
            ],
        }),
        renewSubscription: builder.mutation<SubscriptionResponse, { id: string; payload: RenewSubscriptionPayload }>({
            query: ({ id, payload }) => ({
                url: `/api/subscriptions/${id}/renew`,
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Subscription', id },
                { type: 'SubscriptionList', id: 'LIST' },
                { type: 'SubscriptionList', id: 'SPEND' },
            ],
        }),
        deleteSubscriptionPayment: builder.mutation<SubscriptionResponse, { id: string; paymentId: string }>({
            query: ({ id, paymentId }) => ({ url: `/api/subscriptions/${id}/payments/${paymentId}`, method: 'DELETE' }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Subscription', id },
                { type: 'SubscriptionList', id: 'LIST' },
                { type: 'SubscriptionList', id: 'SPEND' },
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
                { type: 'SubscriptionList', id: 'SPEND' },
            ],
        }),
    }),
});

export const {
    useGetSubscriptionsQuery,
    useGetSubscriptionQuery,
    useGetSubscriptionSpendQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useRenewSubscriptionMutation,
    useDeleteSubscriptionPaymentMutation,
    useDeleteSubscriptionMutation,
} = subscriptionsApi;
