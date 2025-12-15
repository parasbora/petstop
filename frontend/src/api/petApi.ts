import { baseApi } from "./baseApi";

export const petsitterApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPetSitterProfile: builder.query({
            query: ({ id }) => `/petsitters/${id}`,
            transformResponse: (response) => response.data,
        })
        ,
        getPetSitters: builder.query({
            query: (params) => ({
                url: '/petsitters',
                params, // This will pass query parameters
            })}),


        }),
    });

    export const {
        useGetPetSittersQuery,
        useGetPetSitterProfileQuery,
    } = petsitterApi;
