// Feature: approval-workflow
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  HistoryOutlined,
  LoadingOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Flex, Steps, Tag, Typography } from "antd";
import type { ApiTagLiteral } from "@/shared/types/apiTagTypes";
import { useWorkflowTransitions } from "../hooks/useWorkflowTransitions";
import type { WorkflowTargetEntity } from "../types/approval-workflow";
import { TransitionCommentModal } from "./TransitionCommentModal";
import { WorkflowAuditDrawer } from "./WorkflowAuditDrawer";

type WorkflowStatusBarProps = {
  targetEntity: WorkflowTargetEntity;
  targetId: number;
  targetTag?: ApiTagLiteral;
};

export function WorkflowStatusBar({
  targetEntity,
  targetId,
  targetTag,
}: WorkflowStatusBarProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  const { state, actions } = useWorkflowTransitions({
    targetEntity,
    targetId,
    targetTag,
  });

  const {
    currentStep,
    steps,
    transitions,
    isTerminal,
    isLoading,
    isExecuting,
    isPropagating,
    isCommentModalOpen,
    selectedTransition,
    comment,
    isAuditDrawerOpen,
  } = state;

  const {
    handleInitiateTransition,
    handleCommentChange,
    handleConfirmCommentModal,
    handleCancelCommentModal,
    handleOpenAuditDrawer,
    handleCloseAuditDrawer,
  } = actions;

  const currentStepIndex = currentStep
    ? steps.findIndex(
        (s) =>
          s.id === currentStep.id || s.stateCode === currentStep.stateCode,
      )
    : -1;
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div
      style={{
        padding: `${token.paddingSM}px ${token.paddingMD}px`,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        marginBottom: token.marginMD,
      }}
    >
      <DataLoader loading={isLoading} minHeight="60px">
        <Flex
          vertical={isMobile}
          align={isMobile ? "stretch" : "center"}
          justify="space-between"
          gap={token.marginMD}
        >
          {/* Steps Ladder */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <ConditionalRenderer when={steps.length > 0}>
              <Steps
                current={currentStepIndex >= 0 ? activeIndex : undefined}
                size="small"
                direction={isMobile ? "vertical" : "horizontal"}
                items={steps.map((step, idx) => {
                  const isCurrent =
                    currentStep !== null &&
                    (step.id === currentStep?.id ||
                      step.stateCode === currentStep?.stateCode);
                  const isPassed =
                    currentStepIndex >= 0 && idx < currentStepIndex;

                  return {
                    title: (
                      <span
                        style={{
                          fontWeight: isCurrent ? 700 : 500,
                          fontSize: token.fontSizeSM,
                          color: isCurrent
                            ? token.colorPrimary
                            : isPassed
                              ? token.colorText
                              : token.colorTextTertiary,
                        }}
                      >
                        {step.label || step.name || step.stateCode || ""}
                      </span>
                    ),
                    status: isCurrent
                      ? "process"
                      : isPassed
                        ? "finish"
                        : "wait",
                  };
                })}
              />
            </ConditionalRenderer>
          </div>

          {/* Propagating / Transition Actions Strip */}
          <Flex align="center" gap={token.marginSM} wrap="wrap">
            {/* Propagating Chip */}
            <ConditionalRenderer when={isPropagating}>
              <Tag
                icon={<LoadingOutlined spin />}
                color="processing"
                style={{ padding: "4px 8px", fontSize: token.fontSizeSM }}
              >
                Propagating effects…
              </Tag>
            </ConditionalRenderer>

            {/* Terminal Badge */}
            <ConditionalRenderer when={isTerminal && !isPropagating}>
              <Tag
                icon={<CheckOutlined />}
                color="success"
                style={{ padding: "4px 8px", fontSize: token.fontSizeSM }}
              >
                Approved & Published
              </Tag>
            </ConditionalRenderer>

            {/* Action Buttons */}
            <ConditionalRenderer when={transitions.length > 0}>
              {transitions.map((t) => {
                const tId = t.transitionId ?? t.id ?? 0;
                const isReverse = t.direction === "REVERSE";
                const label =
                  t.actionName || t.actionLabel || t.name || "Advance";

                return (
                  <Button
                    key={tId}
                    type={isReverse ? "default" : "primary"}
                    danger={isReverse}
                    icon={isReverse ? <ArrowLeftOutlined /> : <RightOutlined />}
                    disabled={isExecuting || isPropagating}
                    loading={
                      isExecuting &&
                      (selectedTransition?.transitionId === tId ||
                        selectedTransition?.id === tId)
                    }
                    onClick={() => handleInitiateTransition(t)}
                  >
                    {label}
                  </Button>
                );
              })}
            </ConditionalRenderer>

            {/* Read-only status info when no transitions are available */}
            <ConditionalRenderer when={transitions.length === 0 && !isLoading && !isTerminal}>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Awaiting next reviewer
              </Typography.Text>
            </ConditionalRenderer>

            {/* Audit History Trigger */}
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={handleOpenAuditDrawer}
              title="View approval audit trail"
            >
              History
            </Button>
          </Flex>
        </Flex>
      </DataLoader>

      {/* Mandatory Remark / Reason Modal */}
      <TransitionCommentModal
        open={isCommentModalOpen}
        transition={selectedTransition}
        comment={comment}
        isExecuting={isExecuting}
        onCommentChange={handleCommentChange}
        onConfirm={handleConfirmCommentModal}
        onCancel={handleCancelCommentModal}
      />

      {/* Audit Drawer */}
      <WorkflowAuditDrawer
        open={isAuditDrawerOpen}
        targetEntity={targetEntity}
        targetId={targetId}
        onClose={handleCloseAuditDrawer}
      />
    </div>
  );
}
