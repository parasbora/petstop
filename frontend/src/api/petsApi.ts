import { baseApi } from "./baseApi";

export type PetSpecies = "dog" | "cat";

export type Pet = {
  id: number;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  ownerId: number;
  createdAt: string;
};

export type PetInput = {
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
};

type ApiEnvelope<T> = { data: T };

const extractError = (fallback: string) => (error: unknown) => {
  if (error && typeof error === "object" && "data" in error && (error as { data?: unknown }).data) {
    const data = (error as { data?: { error?: string } }).data;
    return data?.error || fallback;
  }
  return fallback;
};

export const petsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPets: builder.query<Pet[], void>({
      query: () => "/pets",
      transformResponse: (response: ApiEnvelope<Pet[]>) => response.data,
      providesTags: ["Pet"],
    }),

    createPet: builder.mutation<Pet, PetInput>({
      query: (body) => ({
        url: "/pets",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<Pet>) => response.data,
      transformErrorResponse: extractError("Could not add pet"),
      invalidatesTags: ["Pet"],
    }),

    updatePet: builder.mutation<Pet, { id: number; data: Partial<PetInput> }>({
      query: ({ id, data }) => ({
        url: `/pets/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<Pet>) => response.data,
      transformErrorResponse: extractError("Could not update pet"),
      invalidatesTags: ["Pet"],
    }),

    deletePet: builder.mutation<void, number>({
      query: (id) => ({
        url: `/pets/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse: extractError("Could not remove pet"),
      invalidatesTags: ["Pet"],
    }),
  }),
});

export const {
  useGetMyPetsQuery,
  useCreatePetMutation,
  useUpdatePetMutation,
  useDeletePetMutation,
} = petsApi;
