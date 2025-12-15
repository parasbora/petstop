import { baseApi } from "./baseApi";
import { setToken, clearToken } from "@/lib/auth";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
// types/auth.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error?: string;
  message?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        setToken(response.data.jwt);
        return response.data;
      },
      transformErrorResponse: (error: FetchBaseQueryError): string => {
        if ("data" in error && error.data) {
          const data = error.data as { error?: string; message?: string };
          return data.error || data.message || "Login failed";
        }
        if ("error" in error) return error.error;
        return "Login failed";
      },
      invalidatesTags: ["User"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        setToken(response.data.jwt);
        return response.data;
      },
      transformErrorResponse: (error: FetchBaseQueryError): string => {
        if ("data" in error && error.data) {
          const data = error.data as { error?: string; message?: string };
          return data.error || data.message || "Signup failed";
        }

        if ("error" in error) {
          return error.error;
        }

        return "Signup failed";
      },
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<void, void>({
      queryFn: async () => {
        clearToken();
        return { data: undefined };
      },
      invalidatesTags: ["User"],
    }),

    getMe: builder.query<AuthResponse["user"], void>({
      query: () => "/users/me",
      transformResponse: (response: ApiResponse<AuthResponse["user"]>) =>
        response.data,
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGetMeQuery,
} = authApi;
