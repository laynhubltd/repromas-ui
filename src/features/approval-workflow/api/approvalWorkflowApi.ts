// Feature: approval-workflow
import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes, type ApiTagLiteral } from "@/shared/types/apiTagTypes";
import type {
  AvailableTransitionsResponse,
  ExecuteTransitionRequest,
  ExecuteTransitionResponse,
  WorkflowAuditEntry,
  WorkflowStepDto,
  WorkflowTargetEntity,
  WorkflowTransitionDto,
} from "../types/approval-workflow";

export const approvalWorkflowApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableTransitions: builder.query<
      AvailableTransitionsResponse,
      { targetEntity: WorkflowTargetEntity; targetId: number }
    >({
      query: ({ targetEntity, targetId }) => ({
        url: "workflows/available-transitions",
        method: "GET",
        params: { targetEntity, targetId },
      }),
      transformResponse: (response: unknown): AvailableTransitionsResponse => {
        if (!response) {
          return {
            currentStep: null,
            steps: [],
            transitions: [],
            isLocked: false,
            isTerminal: false,
          };
        }

        const normalizeStep = (
          s: Record<string, unknown>,
        ): WorkflowStepDto => ({
          ...s,
          id: typeof s.id === "number" ? s.id : Number(s.id ?? 0),
          workflowId:
            typeof s.workflowId === "number" ? s.workflowId : undefined,
          stateCode: typeof s.stateCode === "string" ? s.stateCode : String(s.stateCode ?? ""),
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
        });

        const normalizeTransition = (
          t: Record<string, unknown>,
        ): WorkflowTransitionDto => {
          const fromStepRaw = t.fromStep as Record<string, unknown> | undefined;
          const toStepRaw = t.toStep as Record<string, unknown> | undefined;
          const fromStep = fromStepRaw ? normalizeStep(fromStepRaw) : undefined;
          const toStep = toStepRaw ? normalizeStep(toStepRaw) : undefined;
          const transId = typeof t.id === "number"
            ? t.id
            : typeof t.transitionId === "number"
              ? t.transitionId
              : Number(t.id ?? t.transitionId ?? 0);
          const transName = (t.actionName ?? t.name ?? "") as string;
          const transLabel = (t.actionLabel ?? t.name ?? t.actionName ?? "Advance") as string;
          const dir = (t.direction === "REVERSE" ? "REVERSE" : "FORWARD") as "FORWARD" | "REVERSE";
          const fromState = (t.fromState ?? fromStep?.stateCode ?? "") as string;
          const toState = (t.toState ?? toStep?.stateCode ?? "") as string;
          const toLabel = (t.toLabel ?? toStep?.label ?? toStep?.name ?? "") as string;

          return {
            ...t,
            transitionId: transId,
            id: transId,
            actionName: transName || transLabel,
            name: transName || transLabel,
            actionLabel: transLabel,
            fromState,
            toState,
            toLabel,
            direction: dir,
            requiresComment: Boolean(t.requiresComment),
            fromStep: fromStep ?? ({} as WorkflowStepDto),
            toStep: toStep ?? ({} as WorkflowStepDto),
          };
        };

        if (Array.isArray(response)) {
          const transitions = (response as Record<string, unknown>[]).map(
            normalizeTransition,
          );
          return {
            currentStep: transitions[0]?.fromStep ?? null,
            steps: [],
            transitions,
            isLocked: false,
            isTerminal: transitions.length === 0,
          };
        }

        const obj = response as Record<string, unknown>;
        const rawSteps = Array.isArray(obj.steps)
          ? (obj.steps as Record<string, unknown>[])
          : [];
        const rawCurrentStep = obj.currentStep as
          | Record<string, unknown>
          | undefined;

        const rawTransitions = Array.isArray(obj.transitions)
          ? (obj.transitions as Record<string, unknown>[])
          : Array.isArray(obj.availableTransitions)
            ? (obj.availableTransitions as Record<string, unknown>[])
            : Array.isArray(obj.member)
              ? (obj.member as Record<string, unknown>[])
              : [];

        return {
          ...(obj as unknown as AvailableTransitionsResponse),
          currentStep: rawCurrentStep ? normalizeStep(rawCurrentStep) : null,
          steps: rawSteps.map(normalizeStep),
          transitions: rawTransitions.map(normalizeTransition),
          isLocked: Boolean(obj.isLocked),
          isTerminal: Boolean(obj.isTerminal),
        };
      },
      providesTags: (_result, _error, { targetEntity, targetId }) => [
        {
          type: ApiTagTypes.WorkflowTransitions,
          id: `${targetEntity}:${targetId}`,
        },
      ],
    }),

    executeTransition: builder.mutation<
      ExecuteTransitionResponse,
      ExecuteTransitionRequest
    >({
      query: ({ targetEntity, targetId, transitionId, comment }) => ({
        url: "workflows/execute-transition",
        method: "POST",
        data: { targetEntity, targetId, transitionId, comment },
      }),
      invalidatesTags: (_result, _error, { targetEntity, targetId, targetTag }) => {
        const tags: Array<{ type: ApiTagLiteral; id?: string | number }> = [
          {
            type: ApiTagTypes.WorkflowTransitions,
            id: `${targetEntity}:${targetId}`,
          },
          {
            type: ApiTagTypes.WorkflowAudit,
            id: `${targetEntity}:${targetId}`,
          },
        ];
        if (targetTag) {
          tags.push({ type: targetTag, id: "LIST" });
        }
        return tags;
      },
    }),

    getWorkflowAuditHistory: builder.query<
      WorkflowAuditEntry[],
      { targetEntity: WorkflowTargetEntity; targetId: number }
    >({
      query: ({ targetEntity, targetId }) => ({
        url: "workflows/audit-logs",
        method: "GET",
        params: { targetEntity, targetId },
      }),
      transformResponse: (response: unknown): WorkflowAuditEntry[] => {
        if (!response) return [];
        let rawList: Record<string, unknown>[] = [];
        if (Array.isArray(response)) {
          rawList = response as Record<string, unknown>[];
        } else if (typeof response === "object" && response !== null) {
          const obj = response as Record<string, unknown>;
          rawList =
            (obj.member as Record<string, unknown>[]) ??
            (obj["hydra:member"] as Record<string, unknown>[]) ??
            (obj.data as Record<string, unknown>[]) ??
            [];
        }

        return rawList.map((item) => {
          const fromState = (item.fromState ?? item.fromStepName ?? "") as string;
          const toState = (item.toState ?? item.toStepName ?? "") as string;
          const actionName = (item.actionName ?? item.action ?? "") as string;
          const actorUserName = (item.actorUserName ?? item.actingUserName ?? null) as string | null;
          const actingRoleName = (item.actingRoleName ?? null) as string | null;

          return {
            id: typeof item.id === "number" ? item.id : Number(item.id ?? 0),
            targetEntity: (item.targetEntity ?? "") as string,
            targetId: typeof item.targetId === "number" ? item.targetId : Number(item.targetId ?? 0),
            fromState,
            toState,
            actionName,
            actorUserId: typeof item.actorUserId === "number" ? item.actorUserId : Number(item.actorUserId ?? 0),
            actorUserName,
            actingRoleName,
            comment: (item.comment ?? null) as string | null,
            createdAt: (item.createdAt ?? "") as string,
            // Aliases for compatibility
            action: actionName,
            actingUserName: actorUserName || (item.actorUserId ? `User #${item.actorUserId}` : "System"),
            fromStepName: fromState,
            toStepName: toState,
          };
        });
      },
      providesTags: (_result, _error, { targetEntity, targetId }) => [
        {
          type: ApiTagTypes.WorkflowAudit,
          id: `${targetEntity}:${targetId}`,
        },
      ],
    }),
  }),
});

export const {
  useGetAvailableTransitionsQuery,
  useExecuteTransitionMutation,
  useGetWorkflowAuditHistoryQuery,
} = approvalWorkflowApi;
