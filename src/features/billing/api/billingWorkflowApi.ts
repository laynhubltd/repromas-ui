import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  WorkflowStepDecisionParams,
  WorkflowStepDecisionResponse,
} from "../types/workflow-step-decision";

const billingWorkflowApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkflowStepDecision: builder.query<
      WorkflowStepDecisionResponse,
      WorkflowStepDecisionParams
    >({
      query: (params) => ({
        url: "/billing/workflow-step-decision",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.BillingWorkflow],
    }),
  }),
});

export const { useGetWorkflowStepDecisionQuery } = billingWorkflowApi;
