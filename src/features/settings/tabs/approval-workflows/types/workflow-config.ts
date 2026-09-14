// Feature: settings/tabs/approval-workflows
import type { WorkflowTargetEntity } from "@/features/approval-workflow/types/approval-workflow";

export type WorkflowDefinitionDto = {
  id: number;
  name: string;
  code: string;
  targetEntity: WorkflowTargetEntity;
  description?: string | null;
  isActive: boolean;
  isDefault: boolean;
  stepsCount: number;
  transitionsCount: number;
  inUseCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowStepConfigDto = {
  id: number;
  workflowId?: number;
  stateCode?: string;
  label?: string;
  name: string;
  sortOrder?: number;
  sequenceOrder: number;
  isInitial?: boolean;
  isTerminal?: boolean;
  isEditable?: boolean;
  inUseCount?: number;
  outgoingTransitions?: WorkflowTransitionConfigDto[];
};

export type WorkflowTransitionConfigDto = {
  id: number;
  name?: string;
  actionName?: string;
  actionLabel?: string;
  direction: "FORWARD" | "REVERSE";
  fromStepId: number;
  toStepId: number;
  allowedRoleIds?: number[];
  roleBindings?: Array<{ roleId: number; roleName?: string }>;
  requiresComment: boolean;
  preventSelfTransition?: boolean;
  preventSelfApproval?: boolean;
  systemActionCode?: string | null;
};

export type WorkflowDefinitionDetailDto = WorkflowDefinitionDto & {
  steps: WorkflowStepConfigDto[];
  transitions?: WorkflowTransitionConfigDto[];
};

export type CreateWorkflowDefinitionRequest = {
  name: string;
  code: string;
  targetEntity: WorkflowTargetEntity;
  description?: string;
};

export type UpdateWorkflowDefinitionRequest = {
  id: number;
  name: string;
  description?: string;
};

export type UpsertWorkflowStepRequest = {
  id?: number;
  definitionId: number;
  name: string;
  label?: string;
  stateCode?: string;
  sequenceOrder: number;
  sortOrder?: number;
  isInitial?: boolean;
  isTerminal?: boolean;
  isEditable?: boolean;
};

export type UpsertWorkflowTransitionRequest = {
  id?: number;
  definitionId: number;
  name?: string;
  actionName?: string;
  actionLabel?: string;
  direction: "FORWARD" | "REVERSE";
  fromStepId: number;
  toStepId: number;
  allowedRoleIds?: number[];
  roleBindings?: Array<{ roleId: number }>;
  requiresComment: boolean;
  preventSelfTransition?: boolean;
  preventSelfApproval?: boolean;
  systemActionCode?: string;
};

export type ActivateWorkflowResponse = {
  success: boolean;
  definition: WorkflowDefinitionDto;
  message?: string;
};

export type WorkflowActivationViolation = {
  code: string;
  message: string;
  stepId?: number;
  transitionId?: number;
};
