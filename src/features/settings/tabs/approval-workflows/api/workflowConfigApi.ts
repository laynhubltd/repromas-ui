// Feature: settings/tabs/approval-workflows
import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  ActivateWorkflowResponse,
  CreateWorkflowDefinitionRequest,
  UpdateWorkflowDefinitionRequest,
  UpsertWorkflowStepRequest,
  UpsertWorkflowTransitionRequest,
  WorkflowDefinitionDetailDto,
  WorkflowDefinitionDto,
} from "../types/workflow-config";

export const workflowConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkflowDefinitions: builder.query<WorkflowDefinitionDto[], void>({
      query: () => ({
        url: "workflows/definitions",
        method: "GET",
      }),
      transformResponse: (response: unknown): WorkflowDefinitionDto[] => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (typeof response === "object") {
          const obj = response as Record<string, unknown>;
          const members = obj.member ?? obj["hydra:member"] ?? obj.data ?? [];
          return Array.isArray(members)
            ? (members as WorkflowDefinitionDto[])
            : [];
        }
        return [];
      },
      providesTags: [{ type: ApiTagTypes.WorkflowDefinition, id: "LIST" }],
    }),

    getWorkflowDefinitionById: builder.query<
      WorkflowDefinitionDetailDto,
      number
    >({
      query: (id) => ({
        url: `workflows/definitions/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown): WorkflowDefinitionDetailDto => {
        if (!response || typeof response !== "object") {
          return response as WorkflowDefinitionDetailDto;
        }
        const obj = response as Record<string, unknown>;
        const rawSteps = Array.isArray(obj.steps)
          ? (obj.steps as Record<string, unknown>[])
          : [];
        const steps: WorkflowStepConfigDto[] = rawSteps.map((s) => ({
          ...s,
          id: typeof s.id === "number" ? s.id : Number(s.id),
          workflowId:
            typeof s.workflowId === "number" ? s.workflowId : undefined,
          stateCode: typeof s.stateCode === "string" ? s.stateCode : undefined,
          label: (s.label ?? s.name ?? s.stateCode ?? "") as string,
          name: (s.label ?? s.name ?? s.stateCode ?? "") as string,
          sortOrder:
            typeof s.sortOrder === "number"
              ? s.sortOrder
              : typeof s.sequenceOrder === "number"
                ? s.sequenceOrder
                : 1,
          sequenceOrder:
            typeof s.sortOrder === "number"
              ? s.sortOrder
              : typeof s.sequenceOrder === "number"
                ? s.sequenceOrder
                : 1,
          isInitial: Boolean(s.isInitial),
          isTerminal: Boolean(s.isTerminal),
          isEditable: Boolean(s.isEditable),
        }));

        let rawTransitions = Array.isArray(obj.transitions)
          ? (obj.transitions as Record<string, unknown>[])
          : [];

        if (rawTransitions.length === 0 && rawSteps.length > 0) {
          rawTransitions = rawSteps.flatMap(
            (s) =>
              (s.outgoingTransitions as Record<string, unknown>[]) ?? [],
          );
        }

        const transitions: WorkflowTransitionConfigDto[] = rawTransitions.map(
          (t) => {
            const roleBindings = Array.isArray(t.roleBindings)
              ? (t.roleBindings as Array<{ roleId: number; roleName?: string }>)
              : [];
            const allowedRoleIds =
              roleBindings.length > 0
                ? roleBindings.map((r) => r.roleId)
                : Array.isArray(t.allowedRoleIds)
                  ? (t.allowedRoleIds as number[])
                  : [];

            const actionName = (t.actionName ??
              t.actionLabel ??
              "") as string;
            const name = (t.name ?? "") as string;

            return {
              ...t,
              id: typeof t.id === "number" ? t.id : Number(t.id ?? 0),
              actionName: actionName || name || "Advance",
              actionLabel: actionName || name || "Advance",
              name: name || actionName || "Advance",
              fromStepId:
                typeof t.fromStepId === "number"
                  ? t.fromStepId
                  : Number(t.fromStepId ?? 0),
              toStepId:
                typeof t.toStepId === "number"
                  ? t.toStepId
                  : Number(t.toStepId ?? 0),
              direction: (t.direction === "REVERSE"
                ? "REVERSE"
                : "FORWARD") as "FORWARD" | "REVERSE",
              requiresComment: Boolean(t.requiresComment),
              preventSelfTransition: Boolean(
                t.preventSelfTransition ?? t.preventSelfApproval,
              ),
              preventSelfApproval: Boolean(
                t.preventSelfTransition ?? t.preventSelfApproval,
              ),
              systemActionCode: (t.systemActionCode ?? null) as string | null,
              roleBindings,
              allowedRoleIds,
            };
          },
        );

        return {
          ...(obj as unknown as WorkflowDefinitionDetailDto),
          steps,
          transitions,
        };
      },
      providesTags: (_result, _error, id) => [
        { type: ApiTagTypes.WorkflowDefinition, id },
      ],
    }),

    createWorkflowDefinition: builder.mutation<
      WorkflowDefinitionDto,
      CreateWorkflowDefinitionRequest
    >({
      query: (body) => ({
        url: "workflows/definitions",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.WorkflowDefinition, id: "LIST" }],
    }),

    updateWorkflowDefinition: builder.mutation<
      WorkflowDefinitionDto,
      UpdateWorkflowDefinitionRequest
    >({
      query: ({ id, ...body }) => ({
        url: `workflows/definitions/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: ApiTagTypes.WorkflowDefinition, id: "LIST" },
        { type: ApiTagTypes.WorkflowDefinition, id },
      ],
    }),

    deleteWorkflowDefinition: builder.mutation<void, number>({
      query: (id) => ({
        url: `workflows/definitions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: ApiTagTypes.WorkflowDefinition, id: "LIST" }],
    }),

    activateWorkflowDefinition: builder.mutation<
      ActivateWorkflowResponse,
      number
    >({
      query: (id) => ({
        url: `workflows/definitions/${id}/activate`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: ApiTagTypes.WorkflowDefinition, id: "LIST" },
        { type: ApiTagTypes.WorkflowDefinition, id },
      ],
    }),

    upsertWorkflowStep: builder.mutation<void, UpsertWorkflowStepRequest>({
      query: ({ definitionId, id, ...body }) => ({
        url: id
          ? `workflows/definitions/${definitionId}/steps/${id}`
          : `workflows/definitions/${definitionId}/steps`,
        method: id ? "PUT" : "POST",
        data: {
          name: body.name || body.label || "",
          label: body.name || body.label || "",
          stateCode: body.stateCode || undefined,
          code: body.stateCode || undefined,
          sequenceOrder: body.sequenceOrder ?? body.sortOrder ?? 1,
          sortOrder: body.sequenceOrder ?? body.sortOrder ?? 1,
          isInitial: Boolean(body.isInitial),
          isTerminal: Boolean(body.isTerminal),
          isEditable: Boolean(body.isEditable),
        },
      }),
      invalidatesTags: (_result, _error, { definitionId }) => [
        { type: ApiTagTypes.WorkflowDefinition, id: definitionId },
      ],
    }),

    deleteWorkflowStep: builder.mutation<
      void,
      { definitionId: number; stepId: number }
    >({
      query: ({ definitionId, stepId }) => ({
        url: `workflows/definitions/${definitionId}/steps/${stepId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { definitionId }) => [
        { type: ApiTagTypes.WorkflowDefinition, id: definitionId },
      ],
    }),

    upsertWorkflowTransition: builder.mutation<
      void,
      UpsertWorkflowTransitionRequest
    >({
      query: ({ definitionId, id, ...body }) => {
        const roleBindings =
          body.roleBindings ??
          (body.allowedRoleIds ?? []).map((roleId) => ({ roleId }));
        const payload = {
          fromStepId: body.fromStepId,
          toStepId: body.toStepId,
          actionName:
            body.actionName || body.actionLabel || body.name || "Transition",
          direction: body.direction,
          requiresComment: Boolean(body.requiresComment),
          preventSelfTransition: Boolean(
            body.preventSelfTransition ?? body.preventSelfApproval,
          ),
          systemActionCode: body.systemActionCode || undefined,
          roleBindings,
        };

        return {
          url: id
            ? `workflows/definitions/${definitionId}/transitions/${id}`
            : `workflows/definitions/${definitionId}/transitions`,
          method: id ? "PUT" : "POST",
          data: payload,
        };
      },
      invalidatesTags: (_result, _error, { definitionId }) => [
        { type: ApiTagTypes.WorkflowDefinition, id: definitionId },
      ],
    }),

    deleteWorkflowTransition: builder.mutation<
      void,
      { definitionId: number; transitionId: number }
    >({
      query: ({ definitionId, transitionId }) => ({
        url: `workflows/definitions/${definitionId}/transitions/${transitionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { definitionId }) => [
        { type: ApiTagTypes.WorkflowDefinition, id: definitionId },
      ],
    }),
  }),
});

export const {
  useGetWorkflowDefinitionsQuery,
  useGetWorkflowDefinitionByIdQuery,
  useCreateWorkflowDefinitionMutation,
  useUpdateWorkflowDefinitionMutation,
  useDeleteWorkflowDefinitionMutation,
  useActivateWorkflowDefinitionMutation,
  useUpsertWorkflowStepMutation,
  useDeleteWorkflowStepMutation,
  useUpsertWorkflowTransitionMutation,
  useDeleteWorkflowTransitionMutation,
} = workflowConfigApi;
