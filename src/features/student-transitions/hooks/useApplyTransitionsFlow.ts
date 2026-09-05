import useAuthState from "@/features/auth/use-auth-state";
import { message } from "antd";
import { useCallback, useState } from "react";
import { useApplyAcademicTransitionsMutation } from "../api/studentTransitionEvaluationApi";
import type {
  ApplyAcademicTransitionsPayload,
  ApplyAcademicTransitionsResponse,
} from "../types/student-transition-evaluation";

export interface ApplyTransitionsFlowParams {
  programId: number | null;
  levelId: number | null;
  sessionId: number | null;
  semesterId: number | null;
  semesterTypeId: number | null;
  overrides: Record<number, number>;
  onSuccessCommit?: () => void;
}

export function useApplyTransitionsFlow({
  programId,
  levelId,
  sessionId,
  semesterId,
  semesterTypeId,
  overrides,
  onSuccessCommit,
}: ApplyTransitionsFlowParams) {
  const { userProfile } = useAuthState();
  const [applyMutation, { isLoading: isApplying }] = useApplyAcademicTransitionsMutation();

  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<ApplyAcademicTransitionsResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const currentUserId = userProfile?.id ? Number(userProfile.id) : null;

  // Step 1: Run Dry-Run Simulation and open Preview Modal
  const runDryRunSimulation = useCallback(async () => {
    if (!programId || !levelId || !sessionId || !semesterId || !semesterTypeId) {
      message.warning("Please ensure all filter criteria (Program, Level, Session, Semester) are selected.");
      return;
    }

    setIsSimulating(true);
    try {
      const payload: ApplyAcademicTransitionsPayload = {
        programId,
        levelId,
        sessionId,
        semesterId,
        semesterTypeId,
        dryRun: true,
        actedByUserId: currentUserId,
        overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
      };

      const result = await applyMutation(payload).unwrap();
      setSimulationResult(result);
      setPreviewModalOpen(true);
    } catch (err: unknown) {
      const errMsg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message || "Simulation failed"
          : "Failed to evaluate dry run simulation.";
      message.error(errMsg);
    } finally {
      setIsSimulating(false);
    }
  }, [programId, levelId, sessionId, semesterId, semesterTypeId, overrides, currentUserId, applyMutation]);

  // Step 2: Final Commit with Senate Memo (approvalReference)
  const commitTransitions = useCallback(
    async (approvalReference: string) => {
      if (!programId || !levelId || !sessionId || !semesterId || !semesterTypeId) {
        return;
      }

      if (!approvalReference || !approvalReference.trim()) {
        message.error("Senate Approval Reference (Memo number) is required to commit transitions.");
        return;
      }

      try {
        const payload: ApplyAcademicTransitionsPayload = {
          programId,
          levelId,
          sessionId,
          semesterId,
          semesterTypeId,
          dryRun: false,
          approvalReference: approvalReference.trim(),
          actedByUserId: currentUserId,
          overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
        };

        const result = await applyMutation(payload).unwrap();
        message.success(
          `Successfully applied ${result.summary.totalCreated} academic transition(s) (Ref: ${approvalReference.trim()}).`
        );
        setPreviewModalOpen(false);
        setSimulationResult(null);
        onSuccessCommit?.();
      } catch (err: unknown) {
        const errMsg =
          typeof err === "object" && err !== null && "data" in err
            ? (err as { data?: { message?: string } }).data?.message || "Failed to commit transitions."
            : "Failed to commit academic transitions.";
        message.error(errMsg);
      }
    },
    [
      programId,
      levelId,
      sessionId,
      semesterId,
      semesterTypeId,
      overrides,
      currentUserId,
      applyMutation,
      onSuccessCommit,
    ]
  );

  const closePreviewModal = useCallback(() => {
    setPreviewModalOpen(false);
  }, []);

  return {
    state: {
      previewModalOpen,
      simulationResult,
      isSimulating,
      isApplying,
    },
    actions: {
      runDryRunSimulation,
      commitTransitions,
      closePreviewModal,
    },
  };
}
