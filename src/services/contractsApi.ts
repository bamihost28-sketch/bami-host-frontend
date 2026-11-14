import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL, withColdStartRetry } from './api';
import type { Currency } from '@/lib/money';

export type ContractStatus = 'active' | 'completed' | 'cancelled';
export type ContractPaymentStatus = 'paid' | 'partial' | 'unpaid' | 'overdue' | 'cancelled';

export interface ContractInstalment {
    id: string;
    label: string;
    amount: number;
    dueDate: string | null;
    /** How much of this instalment the payments so far cover. */
    paid: number;
    outstanding: number;
    status: 'paid' | 'partial' | 'unpaid';
    daysUntilDue: number | null;
    overdue: boolean;
    dueSoon: boolean;
}

export interface ContractPayment {
    id: string;
    paidOn: string;
    amount: number;
    method?: string | null;
    note?: string | null;
    recordedBy?: string | null;
    recordedByName?: string | null;
    /** Only confirmed payments count. The developer confirms what others record. */
    status: 'confirmed' | 'pending' | 'rejected';
    rejectReason?: string | null;
}

export type ContractKind = 'project' | 'retainer';
/** accepted | pending (not yet) | changed (edited after it was accepted) | declined (changes requested) */
export type ContractAcceptanceStatus = 'accepted' | 'pending' | 'changed' | 'declined';
export type ContractCategory = 'development' | 'legal' | 'maintenance' | 'design' | 'marketing' | 'other';

export interface Contract {
    id: string;
    title: string;
    /** project = fixed price job; retainer = monthly support with no fixed total. */
    kind: ContractKind;
    createdBy?: string | null;
    category?: ContractCategory | null;
    /** The written scope and conditions the contractor accepts. */
    terms?: string | null;
    acceptanceStatus: ContractAcceptanceStatus;
    acceptance: {
        typedName?: string | null;
        acceptedAt?: string | null;
        /** "own contract" when the contractor made it themself. */
        how?: string | null;
        declineReason?: string | null;
        /** Audit detail, only sent to admins. */
        ip?: string | null;
    };
    /** What the signed-in person may do with this contract. */
    canEdit: boolean;
    canAccept: boolean;
    canDelete: boolean;
    monthlyAmount?: number | null;
    /** Day of the month (1-28) a monthly payment falls due. */
    billingDay?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
    clientName?: string | null;
    developerId?: string | null;
    developerName?: string | null;
    totalAmount: number;
    currency: Currency;
    status: ContractStatus;
    payments: ContractPayment[];
    paid: number;
    balance: number;
    /** Recorded but not yet confirmed by the developer (not counted in `paid`). */
    pendingAmount: number;
    pendingCount: number;
    percentPaid: number;
    instalments: ContractInstalment[];
    scheduledTotal: number;
    overdueAmount: number;
    overdueCount: number;
    dueSoonCount: number;
    nextDue: ContractInstalment | null;
    paymentStatus: ContractPaymentStatus;
    createdAt: string;
}

export interface ContractTotals {
    contracted: number;
    received: number;
    outstanding: number;
    overdue: number;
    pending: number;
}

export interface ContractsResponse {
    success: boolean;
    data: Contract[];
    summary: Partial<Record<Currency, ContractTotals>>;
    overdueCount: number;
    dueSoonCount: number;
    pendingCount: number;
}

export interface ContractInstalmentInput { label: string; amount: number; dueDate?: string }
export interface ContractPaymentInput { amount: number; paidOn?: string; method?: string; note?: string }

export interface CreateContractPayload {
    title: string;
    description?: string;
    clientName?: string;
    kind?: ContractKind;
    terms?: string;
    category?: ContractCategory;
    /** Projects: the agreed price. */
    totalAmount?: number;
    /** Monthly support: the amount due each month, on `billingDay`. */
    monthlyAmount?: number;
    billingDay?: number;
    startDate?: string;
    endDate?: string;
    currency: Currency;
    /** Owners must say whose contract it is; developers' own contracts ignore this. */
    developerId?: string;
    instalments?: ContractInstalmentInput[];
    /** Payments already received before the contract was entered. */
    received?: ContractPaymentInput[];
}

export interface UpdateContractPayload {
    title?: string;
    description?: string;
    clientName?: string;
    terms?: string;
    category?: ContractCategory;
    totalAmount?: number;
    monthlyAmount?: number;
    billingDay?: number;
    startDate?: string;
    /** An empty string clears the end date. */
    endDate?: string;
    currency?: Currency;
    status?: ContractStatus;
    developerId?: string;
    instalments?: ContractInstalmentInput[];
}

/** Someone a contract can be with: a contractor, a vendor (or an admin). */
export interface Developer { id: string; name: string; email: string; role: string; contractCount: number }

export interface OnboardedDeveloper {
    id: string;
    name: string;
    email: string;
    /** Shown once so it can be passed on if the email did not arrive. */
    tempPassword: string;
    emailSent: boolean;
}

export const contractsApi = createApi({
    reducerPath: 'contractsApi',
    baseQuery: withColdStartRetry(fetchBaseQuery({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) headers.set('authorization', `Bearer ${token}`);
            headers.set('content-type', 'application/json');
            return headers;
        },
    }), 2),
    tagTypes: ['Contract', 'Developer'],
    endpoints: (builder) => ({
        getContracts: builder.query<ContractsResponse, void>({
            query: () => '/api/contracts',
            providesTags: ['Contract'],
        }),
        createContract: builder.mutation<{ success: boolean; data: Contract }, CreateContractPayload>({
            query: (body) => ({ url: '/api/contracts', method: 'POST', body }),
            invalidatesTags: ['Contract', 'Developer'],
        }),
        updateContract: builder.mutation<{ success: boolean; data: Contract }, { id: string; payload: UpdateContractPayload }>({
            query: ({ id, payload }) => ({ url: `/api/contracts/${id}`, method: 'PUT', body: payload }),
            invalidatesTags: ['Contract'],
        }),
        deleteContract: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({ url: `/api/contracts/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Contract'],
        }),
        addContractPayment: builder.mutation<{ success: boolean; data: Contract }, { id: string; payload: ContractPaymentInput }>({
            query: ({ id, payload }) => ({ url: `/api/contracts/${id}/payments`, method: 'POST', body: payload }),
            invalidatesTags: ['Contract'],
        }),
        deleteContractPayment: builder.mutation<{ success: boolean; data: Contract }, { id: string; paymentId: string }>({
            query: ({ id, paymentId }) => ({ url: `/api/contracts/${id}/payments/${paymentId}`, method: 'DELETE' }),
            invalidatesTags: ['Contract'],
        }),
        confirmContractPayment: builder.mutation<{ success: boolean; data: Contract }, { id: string; paymentId: string }>({
            query: ({ id, paymentId }) => ({ url: `/api/contracts/${id}/payments/${paymentId}/confirm`, method: 'POST' }),
            invalidatesTags: ['Contract'],
        }),
        rejectContractPayment: builder.mutation<{ success: boolean; data: Contract }, { id: string; paymentId: string; reason?: string }>({
            query: ({ id, paymentId, reason }) => ({ url: `/api/contracts/${id}/payments/${paymentId}/reject`, method: 'POST', body: { reason } }),
            invalidatesTags: ['Contract'],
        }),
        acceptContract: builder.mutation<{ success: boolean; data: Contract }, { id: string; typedName: string }>({
            query: ({ id, typedName }) => ({ url: `/api/contracts/${id}/accept`, method: 'POST', body: { typedName } }),
            invalidatesTags: ['Contract', 'Developer'],
        }),
        declineContract: builder.mutation<{ success: boolean; data: Contract }, { id: string; reason: string }>({
            query: ({ id, reason }) => ({ url: `/api/contracts/${id}/decline`, method: 'POST', body: { reason } }),
            invalidatesTags: ['Contract'],
        }),
        getDevelopers: builder.query<{ success: boolean; data: Developer[] }, void>({
            query: () => '/api/contracts/developers',
            providesTags: ['Developer'],
        }),
        onboardDeveloper: builder.mutation<{ success: boolean; data: OnboardedDeveloper }, { name: string; email: string; phone?: string }>({
            query: (body) => ({ url: '/api/contracts/developers', method: 'POST', body }),
            invalidatesTags: ['Developer'],
        }),
    }),
});

export const {
    useGetContractsQuery,
    useCreateContractMutation,
    useUpdateContractMutation,
    useDeleteContractMutation,
    useAddContractPaymentMutation,
    useDeleteContractPaymentMutation,
    useConfirmContractPaymentMutation,
    useRejectContractPaymentMutation,
    useAcceptContractMutation,
    useDeclineContractMutation,
    useGetDevelopersQuery,
    useOnboardDeveloperMutation,
} = contractsApi;

/** Download a PDF (invoice or receipt). Plain links can't send the login token, so it is fetched and saved. */
export async function downloadContractPdf(path: string, fallbackName: string): Promise<void> {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_API_URL}${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
    if (!res.ok) {
        let detail = 'Could not download the PDF';
        try {
            const body = await res.json();
            if (typeof body?.detail === 'string') detail = body.detail;
        } catch { /* not JSON */ }
        throw new Error(detail);
    }
    const name = /filename="?([^";]+)"?/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? fallbackName;
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}
