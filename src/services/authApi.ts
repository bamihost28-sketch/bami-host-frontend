import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginRequest, LoginResponse, UpdateEmailRequest, UpdateEmailResponse, UpdatePasswordRequest, UpdatePasswordResponse, OnboardBusinessOwnerRequest, OnboardBusinessOwnerResponse, GetBusinessOwnersResponse, UpdateBusinessOwnerRequest, UpdateBusinessOwnerStatusRequest, UpdateBusinessOwnerResponse, DeleteBusinessOwnerResponse, OnboardManagerRequest, OnboardManagerResponse, GetManagersResponse, UpdateManagerRequest, UpdateManagerResponse, DeleteManagerResponse, RequestOtpRequest, VerifyOtpRequest, ResetPasswordOtpRequest, AuthResponse, SignAgreementRequest, SignAgreementResponse } from '../types/auth';
import { BASE_API_URL } from './api';

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      // Get token directly from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    updateSuperadminEmail: builder.mutation<UpdateEmailResponse, UpdateEmailRequest>({
      query: (data) => ({
        url: '/api/auth/update-superadmin-email',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
    updatePassword: builder.mutation<UpdatePasswordResponse, UpdatePasswordRequest>({
      query: (data) => ({
        url: '/api/auth/updatepassword',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
    onboardBusinessOwner: builder.mutation<OnboardBusinessOwnerResponse, OnboardBusinessOwnerRequest>({
      query: (data) => ({
        url: '/api/auth/onboard-business-owner',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
    getBusinessOwners: builder.query<GetBusinessOwnersResponse, void>({
      query: () => '/api/auth/business-owners',
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ _id }) => ({ type: 'Auth' as const, id: _id })),
            { type: 'Auth', id: 'LIST' },
          ]
          : [{ type: 'Auth', id: 'LIST' }],
    }),
    updateBusinessOwner: builder.mutation<UpdateBusinessOwnerResponse, { id: string; data: UpdateBusinessOwnerRequest }>({
      query: ({ id, data }) => ({
        url: `/api/auth/business-owner/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Auth', id },
        { type: 'Auth', id: 'LIST' },
      ],
    }),
    updateBusinessOwnerStatus: builder.mutation<UpdateBusinessOwnerResponse, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/api/auth/business-owner/${id}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Auth', id },
        { type: 'Auth', id: 'LIST' },
      ],
    }),
    deleteBusinessOwner: builder.mutation<DeleteBusinessOwnerResponse, string>({
      query: (id) => ({
        url: `/api/auth/business-owner/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Auth', id: 'LIST' }],
    }),
    // Manager endpoints
    onboardManager: builder.mutation<OnboardManagerResponse, OnboardManagerRequest>({
      query: (data) => ({
        url: '/api/auth/onboard-manager',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
    getManagers: builder.query<GetManagersResponse, void>({
      query: () => '/api/auth/managers',
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ _id }) => ({ type: 'Auth' as const, id: _id })),
            { type: 'Auth', id: 'MANAGER_LIST' },
          ]
          : [{ type: 'Auth', id: 'MANAGER_LIST' }],
    }),
    updateManager: builder.mutation<UpdateManagerResponse, { id: string; data: UpdateManagerRequest }>({
      query: ({ id, data }) => ({
        url: `/api/auth/manager/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Auth', id },
        { type: 'Auth', id: 'MANAGER_LIST' },
      ],
    }),
    updateManagerStatus: builder.mutation<UpdateManagerResponse, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/api/auth/manager/${id}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Auth', id },
        { type: 'Auth', id: 'MANAGER_LIST' },
      ],
    }),
    deleteManager: builder.mutation<DeleteManagerResponse, string>({
      query: (id) => ({
        url: `/api/auth/manager/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Auth', id: 'MANAGER_LIST' }],
    }),
    resendBusinessOwnerCredentials: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/auth/business-owner/${id}/resend-credentials`,
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    resendManagerCredentials: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/auth/manager/${id}/resend-credentials`,
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    resendVendorCredentials: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/auth/vendor/${id}/resend-credentials`,
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    requestOtp: builder.mutation<AuthResponse, RequestOtpRequest>({
      query: (data) => ({
        url: '/api/auth/forgotpassword-otp',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: '/api/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resetPasswordWithOtp: builder.mutation<AuthResponse, ResetPasswordOtpRequest>({
      query: (data) => ({
        url: '/api/auth/resetpassword-otp',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
    signAgreement: builder.mutation<SignAgreementResponse, SignAgreementRequest>({
      query: (data) => ({
        url: '/api/auth/me/sign-agreement',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useLoginMutation,
  useUpdateSuperadminEmailMutation,
  useUpdatePasswordMutation,
  useOnboardBusinessOwnerMutation,
  useGetBusinessOwnersQuery,
  useUpdateBusinessOwnerMutation,
  useUpdateBusinessOwnerStatusMutation,
  useDeleteBusinessOwnerMutation,
  useOnboardManagerMutation,
  useGetManagersQuery,
  useUpdateManagerMutation,
  useUpdateManagerStatusMutation,
  useDeleteManagerMutation,
  useResendBusinessOwnerCredentialsMutation,
  useResendManagerCredentialsMutation,
  useResendVendorCredentialsMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordWithOtpMutation,
  useSignAgreementMutation
} = authApi;