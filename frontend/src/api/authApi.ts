import { baseApi } from "./baseApi";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
// types/auth.ts

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name?: string;
    email: string;
    password: string;
}

// The backend sets the JWT as an httpOnly cookie and returns only the user.
export interface AuthUser {
    id: number;
    email: string;
    name: string | null;
    petSitterId: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: AuthUser;
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
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(authApi.util.updateQueryData('getMe', undefined, () => undefined));
                    dispatch(authApi.util.resetApiState());
                } catch { }
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
