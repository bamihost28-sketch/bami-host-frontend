import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL, withColdStartRetry } from './api';

export interface BusinessType {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateBusinessTypePayload {
    name: string;
    description?: string;
}

export interface UpdateBusinessTypePayload {
    name?: string;
    description?: string;
}

export interface BusinessTypeResponse {
    success: boolean;
    message?: string;
    data: BusinessType;
}

export interface BusinessTypesListResponse {
    success: boolean;
    count: number;
    data: BusinessType[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
}

export interface GetBusinessTypesParams {
    page?: number;
    limit?: number;
    activeOnly?: boolean;
}

export const businessTypesApi = createApi({
    reducerPath: 'businessTypesApi',
    baseQuery: withColdStartRetry(fetchBaseQuery({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) headers.set('authorization', `Bearer ${token}`);
            headers.set('content-type', 'application/json');
            return headers;
        },
    })),
    tagTypes: ['BusinessType', 'BusinessTypeList'],
    endpoints: (builder) => ({
        getBusinessTypes: builder.query<BusinessTypesListResponse, GetBusinessTypesParams | void>({
            query: (params = {}) => {
                const qs = new URLSearchParams();
                if (params.page != null) qs.set('page', String(params.page));
                if (params.limit != null) qs.set('limit', String(params.limit));
                if (params.activeOnly != null) qs.set('activeOnly', String(params.activeOnly));
                return `/api/business-types${qs.toString() ? `?${qs.toString()}` : ''}`;
            },
            providesTags: (result) =>
                result && Array.isArray(result.data)
                    ? [
                        ...result.data.map((type) => ({ type: 'BusinessType' as const, id: type._id })),
                        { type: 'BusinessTypeList' as const, id: 'LIST' },
                    ]
                    : [{ type: 'BusinessTypeList' as const, id: 'LIST' }],
        }),
        getBusinessType: builder.query<BusinessTypeResponse, string>({
            query: (id) => `/api/business-types/${id}`,
            providesTags: (result, error, id) => [{ type: 'BusinessType', id }],
        }),
        createBusinessType: builder.mutation<BusinessTypeResponse, CreateBusinessTypePayload>({
            query: (payload) => ({
                url: '/api/business-types',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: [{ type: 'BusinessTypeList', id: 'LIST' }],
        }),
        updateBusinessType: builder.mutation<BusinessTypeResponse, { id: string; data: UpdateBusinessTypePayload }>({
            query: ({ id, data }) => ({
                url: `/api/business-types/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'BusinessType', id },
                { type: 'BusinessTypeList', id: 'LIST' },
            ],
        }),
        deleteBusinessType: builder.mutation<{ success: boolean; message?: string }, string>({
            query: (id) => ({
                url: `/api/business-types/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'BusinessType', id },
                { type: 'BusinessTypeList', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetBusinessTypesQuery,
    useGetBusinessTypeQuery,
    useCreateBusinessTypeMutation,
    useUpdateBusinessTypeMutation,
    useDeleteBusinessTypeMutation,
} = businessTypesApi;
