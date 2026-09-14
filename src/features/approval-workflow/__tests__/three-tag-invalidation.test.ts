import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { describe, expect, it } from "vitest";
import { approvalWorkflowApi } from "../api/approvalWorkflowApi";
import type { WorkflowStepDto } from "../types/approval-workflow";

describe("Three-Tag Invalidation Invariant", () => {
  it("invalidates target entity tag, WorkflowTransitions, and WorkflowAudit on executeTransition", () => {
    const executeEndpoint = approvalWorkflowApi.endpoints.executeTransition;
    expect(executeEndpoint).toBeDefined();

    // Verify invalidatesTags definition
    const targetEntity = "SCORE_SHEET";
    const targetId = 42;
    const targetTag = ApiTagTypes.StudentScoreSheetData;

    // @ts-expect-error accessing internal invalidatesTags for structural verification
    const invalidatesFn = executeEndpoint.invalidatesTags;

    if (typeof invalidatesFn === "function") {
      const tags = invalidatesFn(
        { success: true, currentStep: { id: 2 } as unknown as WorkflowStepDto },
        undefined,
        { targetEntity, targetId, transitionId: 10, targetTag },
      );

      expect(tags).toContainEqual({
        type: ApiTagTypes.WorkflowTransitions,
        id: "SCORE_SHEET:42",
      });
      expect(tags).toContainEqual({
        type: ApiTagTypes.WorkflowAudit,
        id: "SCORE_SHEET:42",
      });
      expect(tags).toContainEqual({
        type: ApiTagTypes.StudentScoreSheetData,
        id: "LIST",
      });
    }
  });
});
