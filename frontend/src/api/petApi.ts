import { baseApi } from "./baseApi";

export const petsitterApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPetSitterProfile: builder.query({
            query: ({ id }) => `/petsitters/${id}`,
            transformResponse: (response) => response.data,
            providesTags: (_result, _error, arg) => [{ type: "Profile", id: arg.id }],
        }),
        getPetSitters: builder.query({
            query: (params) => ({
                url: '/petsitters',
                params, // This will pass query parameters
            }),
        }),
        createReview: builder.mutation<
            unknown,
            { id: string | number; rating: number; comment?: string }
        >({
            query: ({ id, rating, comment }) => ({
                url: `/petsitters/${id}/reviews`,
                method: "POST",
                body: { rating, comment },
            }),
            invalidatesTags: (_result, _error, arg) => [{ type: "Profile", id: String(arg.id) }],
        }),
        updatePetSitter: builder.mutation<
            unknown,
            { id: string | number; data: Record<string, unknown> }
        >({
            query: ({ id, data }) => ({
                url: `/petsitters/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_result, _error, arg) => [{ type: "Profile", id: String(arg.id) }],
        }),
        createPetSitter: builder.mutation<unknown, Record<string, unknown>>({
            query: (data) => ({
                url: `/petsitters`,
                method: "POST",
                body: data,
            }),
            // Refetch getMe so the new petSitterId (set on the user) is reflected.
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useGetPetSittersQuery,
    useGetPetSitterProfileQuery,
    useCreateReviewMutation,
    useUpdatePetSitterMutation,
    useCreatePetSitterMutation,
} = petsitterApi;
