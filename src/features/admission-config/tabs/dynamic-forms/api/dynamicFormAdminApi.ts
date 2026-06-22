import { baseApi } from "@/app/api/baseApi";
import type {
  BulkAssignRequest,
  CreateFormFieldRequest,
  CreateFormSectionRequest,
  CreateFormTemplateRequest,
  FormAssignment,
  FormField,
  FormListParams,
  FormSection,
  FormTemplate,
  AssignmentListParams,
  PaginatedResponse,
  UpdateFormFieldRequest,
  UpdateFormSectionRequest,
  UpdateFormTemplateRequest,
} from "@/features/dynamic-form/types";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { apiPlatformActionPost } from "@/shared/utils/api/apiPlatformActionPost";
import { normalizeCollectionResponse } from "../utils/normalizeCollectionResponse";
import { normalizeFormFieldCollection } from "../utils/normalizeFormField";

const dynamicFormAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDynamicForms: builder.query<
      PaginatedResponse<FormTemplate>,
      FormListParams | void
    >({
      query: (params) => ({
        url: "/dynamic-forms",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: [{ type: ApiTagTypes.DynamicForm, id: "LIST" }],
    }),

    getDynamicForm: builder.query<FormTemplate, number>({
      query: (id) => ({
        url: `/dynamic-forms/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: ApiTagTypes.DynamicForm, id }],
    }),

    createDynamicForm: builder.mutation<FormTemplate, CreateFormTemplateRequest>(
      {
        query: (body) => ({
          url: "/dynamic-forms",
          method: "POST",
          data: body,
        }),
        invalidatesTags: [{ type: ApiTagTypes.DynamicForm, id: "LIST" }],
      },
    ),

    updateDynamicForm: builder.mutation<
      FormTemplate,
      { id: number } & UpdateFormTemplateRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/dynamic-forms/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: ApiTagTypes.DynamicForm, id: "LIST" },
        { type: ApiTagTypes.DynamicForm, id },
      ],
    }),

    publishDynamicForm: builder.mutation<FormTemplate, number>({
      query: (id) => ({
        url: `/dynamic-forms/${id}/publish`,
        method: "POST",
        ...apiPlatformActionPost,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: ApiTagTypes.DynamicForm, id: "LIST" },
        { type: ApiTagTypes.DynamicForm, id },
        { type: ApiTagTypes.DynamicFormAssignment, id: "LIST" },
      ],
    }),

    archiveDynamicForm: builder.mutation<FormTemplate, number>({
      query: (id) => ({
        url: `/dynamic-forms/${id}/archive`,
        method: "POST",
        ...apiPlatformActionPost,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: ApiTagTypes.DynamicForm, id: "LIST" },
        { type: ApiTagTypes.DynamicForm, id },
      ],
    }),

    getFormSections: builder.query<FormSection[], number>({
      query: (formId) => ({
        url: `/dynamic-forms/${formId}/sections`,
        method: "GET",
      }),
      transformResponse: (raw: unknown) =>
        normalizeCollectionResponse<FormSection>(raw),
      providesTags: (_r, _e, formId) => [
        { type: ApiTagTypes.DynamicFormSection, id: `FORM-${formId}` },
      ],
    }),

    createFormSection: builder.mutation<
      FormSection,
      { formId: number } & CreateFormSectionRequest
    >({
      query: ({ formId, ...body }) => ({
        url: `/dynamic-forms/${formId}/sections`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_r, _e, { formId }) => [
        { type: ApiTagTypes.DynamicFormSection, id: `FORM-${formId}` },
      ],
    }),

    updateFormSection: builder.mutation<
      FormSection,
      { id: number; formId: number; body: UpdateFormSectionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/dynamic-form-sections/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_r, _e, { formId }) => [
        { type: ApiTagTypes.DynamicFormSection, id: `FORM-${formId}` },
      ],
    }),

    deleteFormSection: builder.mutation<
      void,
      { id: number; formId: number }
    >({
      query: ({ id }) => ({
        url: `/dynamic-form-sections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { formId }) => [
        { type: ApiTagTypes.DynamicFormSection, id: `FORM-${formId}` },
      ],
    }),

    getSectionFields: builder.query<FormField[], number>({
      query: (sectionId) => ({
        url: `/dynamic-form-sections/${sectionId}/fields`,
        method: "GET",
      }),
      transformResponse: (raw: unknown) => normalizeFormFieldCollection(raw),
      providesTags: (_r, _e, sectionId) => [
        { type: ApiTagTypes.DynamicFormField, id: `SECTION-${sectionId}` },
      ],
    }),

    createFormField: builder.mutation<
      FormField,
      { sectionId: number } & CreateFormFieldRequest
    >({
      query: ({ sectionId, ...body }) => ({
        url: `/dynamic-form-sections/${sectionId}/fields`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_r, _e, { sectionId }) => [
        { type: ApiTagTypes.DynamicFormField, id: `SECTION-${sectionId}` },
      ],
    }),

    updateFormField: builder.mutation<
      FormField,
      { id: number; sectionId: number; body: UpdateFormFieldRequest }
    >({
      query: ({ id, body }) => ({
        url: `/dynamic-form-fields/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_r, _e, { sectionId }) => [
        { type: ApiTagTypes.DynamicFormField, id: `SECTION-${sectionId}` },
      ],
    }),

    deleteFormField: builder.mutation<
      void,
      { id: number; sectionId: number }
    >({
      query: ({ id }) => ({
        url: `/dynamic-form-fields/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { sectionId }) => [
        { type: ApiTagTypes.DynamicFormField, id: `SECTION-${sectionId}` },
      ],
    }),

    getFormAssignments: builder.query<
      PaginatedResponse<FormAssignment>,
      AssignmentListParams | void
    >({
      query: (params) => ({
        url: "/dynamic-form-assignments",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: [{ type: ApiTagTypes.DynamicFormAssignment, id: "LIST" }],
    }),

    bulkAssignForm: builder.mutation<
      FormAssignment[],
      { formId: number } & BulkAssignRequest
    >({
      query: ({ formId, ...body }) => ({
        url: `/dynamic-forms/${formId}/assignments`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.DynamicFormAssignment, id: "LIST" }],
    }),

    deactivateAssignment: builder.mutation<FormAssignment, number>({
      query: (id) => ({
        url: `/dynamic-form-assignments/${id}/deactivate`,
        method: "POST",
        ...apiPlatformActionPost,
      }),
      invalidatesTags: [{ type: ApiTagTypes.DynamicFormAssignment, id: "LIST" }],
    }),

    activateAssignment: builder.mutation<FormAssignment, number>({
      query: (id) => ({
        url: `/dynamic-form-assignments/${id}/activate`,
        method: "POST",
        ...apiPlatformActionPost,
      }),
      invalidatesTags: [{ type: ApiTagTypes.DynamicFormAssignment, id: "LIST" }],
    }),

    deleteAssignment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/dynamic-form-assignments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: ApiTagTypes.DynamicFormAssignment, id: "LIST" }],
    }),
  }),
});

export const {
  useGetDynamicFormsQuery,
  useGetDynamicFormQuery,
  useCreateDynamicFormMutation,
  useUpdateDynamicFormMutation,
  usePublishDynamicFormMutation,
  useArchiveDynamicFormMutation,
  useGetFormSectionsQuery,
  useCreateFormSectionMutation,
  useUpdateFormSectionMutation,
  useDeleteFormSectionMutation,
  useGetSectionFieldsQuery,
  useCreateFormFieldMutation,
  useUpdateFormFieldMutation,
  useDeleteFormFieldMutation,
  useGetFormAssignmentsQuery,
  useBulkAssignFormMutation,
  useDeactivateAssignmentMutation,
  useActivateAssignmentMutation,
  useDeleteAssignmentMutation,
} = dynamicFormAdminApi;

export default dynamicFormAdminApi;
