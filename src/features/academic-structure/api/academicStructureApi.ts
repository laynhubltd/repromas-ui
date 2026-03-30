import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { Faculty, FacultyWithChildren } from "../types";

interface CreateFacultyRequest {
  name: string;
  code: string;
}

const academicStructureApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaculties: builder.query<FacultyWithChildren[], void>({
      query: () => ({ url: "/api/academic/faculties", method: "GET" }),
      providesTags: [ApiTagTypes.AcademicStructure],
    }),

    createFaculty: builder.mutation<Faculty, CreateFacultyRequest>({
      query: (body) => ({
        url: "/api/academic/faculties",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.AcademicStructure],
    }),
  }),
});

export const { useGetFacultiesQuery, useCreateFacultyMutation } =
  academicStructureApi;

export default academicStructureApi;
