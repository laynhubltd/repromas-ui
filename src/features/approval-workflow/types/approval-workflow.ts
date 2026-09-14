// Feature: approval-workflow
import type { ApiTagLiteral } from "@/shared/types/apiTagTypes";

export type WorkflowTargetEntity =
  | "COURSE_SCORE_SHEET"
  | "SCORE_SHEET"
  | "COHORT_BROADSHEET";

export type TransitionDirection = "FORWARD" | "REVERSE";

export type WorkflowStepDto = {
  id: number;
  workflowId?: number;
  stateCode: string;
  label: string;
  sortOrder: number;
  name?: string;
  sequenceOrder?: number;
  isInitial?: boolean;
  isTerminal?: boolean;
  isEditable?: boolean;
  outgoingTransitions?: WorkflowTransitionDto[];
};

export type WorkflowTransitionDto = {
  transitionId: number;
  id?: number;
  actionName: string;
  name?: string;
  actionLabel?: string;
  fromState: string;
  toState: string;
  toLabel?: string;
  direction: TransitionDirection;
  requiresComment: boolean;
  systemActionCode?: string | null;
  fromStep?: WorkflowStepDto;
  toStep?: WorkflowStepDto;
};

export type AvailableTransitionsResponse = {
  currentStep: WorkflowStepDto | null;
  steps: WorkflowStepDto[];
  transitions: WorkflowTransitionDto[];
  isLocked: boolean;
  isTerminal: boolean;
};

export type ExecuteTransitionRequest = {
  targetEntity: WorkflowTargetEntity;
  targetId: number;
  transitionId: number;
  comment?: string;
  targetTag?: ApiTagLiteral;
};

export type ExecuteTransitionResponse = {
  success: boolean;
  targetEntity?: string;
  targetId?: number;
  previousState?: string;
  newState?: string;
  actionName?: string;
  actorUserId?: number;
  actingRoleName?: string;
  comment?: string | null;
  pendingEffects?: string[];
  currentStep?: WorkflowStepDto | null;
};

export type WorkflowAuditEntry = {
  id: number;
  targetEntity?: string;
  targetId?: number;
  fromState: string;
  toState: string;
  actionName: string;
  actorUserId: number;
  actorUserName?: string | null;
  actingRoleName?: string | null;
  comment?: string | null;
  createdAt: string;
  action?: string;
  actingUserName?: string;
  fromStepName?: string;
  toStepName?: string;
};
