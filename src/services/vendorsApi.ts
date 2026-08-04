import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

export interface Vendor {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role: 'vendor';
    assignedEstates: any[];
    phone?: string;
    isActive: boolean;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    emailVerified: boolean;
    businessName?: string;
    businessTypeId?: string;
    specialization?: string;
    bio?: string;
    cacNumber?: string;
    govId?: string;
    certification?: string;
    isVerifiedPro?: boolean;
    businessAddress?: string;
    portfolio?: string[];
    assignedBusinesses: any[];
    createdAt: string;
    updatedAt: string;
    __v?: number;
    status?: 'approved' | 'pending' | 'suspended';
}

export interface OnboardVendorPayload {
    name: string;
    email: string;
    managerId: string;
    phone?: string;
    position?: string;
    businessTypeId?: string;
    sendCredentials?: boolean;
}

export interface UpdateVendorPayload {
    name?: string;
    email?: string;
    phone?: string;
    businessTypeId?: string;
    businessName?: string;
    specialization?: string;
    bio?: string;
    cacNumber?: string;
    govId?: string;
    certification?: string;
    isVerifiedPro?: boolean;
    businessAddress?: string;
    portfolio?: string[];
}

export interface VendorResponse {
    success: boolean;
    message?: string;
    data: Vendor;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    limit: number;
}

export interface VendorsListResponse {
    success: boolean;
    count: number;
    total: number;
    pagination: PaginationInfo;
    data: Vendor[];
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface UpdateVendorStatusPayload {
    id: string;
    isActive: boolean;
}

export const vendorsApi = createApi({
    reducerPath: 'vendorsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) headers.set('authorization', `Bearer ${token}`);
            headers.set('content-type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Vendor', 'VendorList'],
    endpoints: (builder) => ({
        getVendors: builder.query<VendorsListResponse, PaginationParams | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append('page', params.page.toString());
                if (params?.limit) queryParams.append('limit', params.limit.toString());
                const queryString = queryParams.toString();
                return `/api/auth/vendors${queryString ? '?' + queryString : ''}`;
            },
            providesTags: (result) =>
                result && Array.isArray(result.data)
                    ? [
                        ...result.data.map((vendor) => ({ type: 'Vendor' as const, id: vendor.id || vendor._id })),
                        { type: 'VendorList' as const, id: 'LIST' },
                    ]
                    : [{ type: 'VendorList' as const, id: 'LIST' }],
        }),
        onboardVendor: builder.mutation<VendorResponse, OnboardVendorPayload>({
            query: (payload) => ({
                url: '/api/auth/onboard-vendor',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: [{ type: 'VendorList', id: 'LIST' }],
        }),
        updateVendor: builder.mutation<VendorResponse, { id: string; data: UpdateVendorPayload }>({
            query: ({ id, data }) => ({
                url: `/api/auth/vendor/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Vendor', id },
                { type: 'VendorList', id: 'LIST' },
            ],
        }),
        updateVendorStatus: builder.mutation<VendorResponse, UpdateVendorStatusPayload>({
            query: ({ id, isActive }) => ({
                url: `/api/auth/vendor/${id}/status`,
                method: 'PUT',
                body: { isActive },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Vendor', id },
                { type: 'VendorList', id: 'LIST' },
            ],
        }),
        deleteVendor: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/api/auth/vendor/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'VendorList', id: 'LIST' }],
        }),
        resendVendorCredentials: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/api/auth/vendor/${id}/resend-credentials`,
                method: 'POST',
            }),
            invalidatesTags: ['Vendor'],
        }),
        getPublicVendors: builder.query<{ success: boolean; count: number; data: Vendor[] }, string | void>({
            query: (search) => ({
                url: '/api/auth/public/vendors',
                method: 'GET',
                params: search ? { search } : undefined,
            }),
            providesTags: (result) =>
                result
                    ? [...result.data.map(({ _id }) => ({ type: 'Vendors' as const, id: _id })), { type: 'Vendors', id: 'LIST' }]
                    : [{ type: 'Vendors', id: 'LIST' }],
        }),
        getPublicVendor: builder.query<{ success: boolean; data: Vendor }, string>({
            query: (id) => ({
                url: `/api/auth/public/vendors/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Vendors', id }],
        }),
    }),
});

export const {
    useGetVendorsQuery,
    useOnboardVendorMutation,
    useUpdateVendorMutation,
    useUpdateVendorStatusMutation,
    useDeleteVendorMutation,
    useResendVendorCredentialsMutation,
    useGetPublicVendorsQuery,
    useGetPublicVendorQuery
} = vendorsApi;
