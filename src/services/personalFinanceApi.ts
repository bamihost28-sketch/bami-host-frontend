import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_API_URL } from "./api";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export interface PersonalFinance {
  exists: boolean;
  goals: any[];
  budget: Record<string, any>;
  portfolio: Record<string, any>;
  updated_at?: string;
}

export const personalFinanceApi = createApi({
  reducerPath: "personalFinanceApi",
  baseQuery,
  tagTypes: ["PersonalFinance"],
  endpoints: (b) => ({
    getPersonalFinance: b.query<PersonalFinance, void>({
      query: () => "/api/personal-finance",
      providesTags: ["PersonalFinance"],
    }),
    savePersonalFinance: b.mutation<{ success: boolean }, Partial<Pick<PersonalFinance, "goals" | "budget" | "portfolio">>>({
      query: (body) => ({ url: "/api/personal-finance", method: "PUT", body }),
    }),
  }),
});

export const { useGetPersonalFinanceQuery, useSavePersonalFinanceMutation } = personalFinanceApi;
