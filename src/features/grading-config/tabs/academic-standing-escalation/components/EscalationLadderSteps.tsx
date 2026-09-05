import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  StopOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Flex,
  Space,
  Steps,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { AcademicStandingEscalationStep, ActionTimingMode } from "../types/academic-standing-escalation";
import {
  validateStepSequence,
  type MinimalEscalationStep,
} from "../utils/stepSequenceValidator";

export interface EscalationLadderStepsProps {
  steps: AcademicStandingEscalationStep[];
  onAddStep: (nextStepNumber: number) => void;
  onEditStep: (step: AcademicStandingEscalationStep) => void;
  onDeleteStep: (step: AcademicStandingEscalationStep) => void;
}

export function EscalationLadderSteps({
  steps,
  onAddStep,
  onEditStep,
  onDeleteStep,
}: EscalationLadderStepsProps) {
  const token = useToken();
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  const validation = validateStepSequence(sortedSteps as MinimalEscalationStep[]);

  const getTimingLabel = (step: AcademicStandingEscalationStep) => {
    switch (step.actionTimingMode) {
      case "ANY_SEMESTER":
        return "Any Semester Diet";
      case "SESSION_END":
        return "Session End";
      case "SPECIFIC_SEMESTER":
        return step.semesterType ? `${step.semesterType.name} Only` : "Specific Semester";
    }
  };

  const getTimingTooltip = (mode: ActionTimingMode) => {
    switch (mode) {
      case "ANY_SEMESTER":
        return "Disciplinary status applies immediately at whichever semester diet the breach occurred.";
      case "SESSION_END":
        return "Executes only at session end. Mid-session breaches are clamped to earlier warning rungs with deferred status.";
      case "SPECIFIC_SEMESTER":
        return "Executes only when evaluated during the designated semester diet.";
    }
  };

  const stepItems = sortedSteps.map((step) => {
    const isTerminal = step.isTerminal;

    return {
      status: (isTerminal ? "error" : "process") as "error" | "process",
      icon: isTerminal ? <StopOutlined style={{ color: token.colorError }} /> : undefined,
      title: (
        <Flex justify="space-between" align="center" style={{ width: "100%" }}>
          <Flex align="center" gap={8} wrap="wrap">
            <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
              Step {step.stepNumber}: {step.label}
            </Typography.Text>
            {isTerminal && (
              <Tag color="error" icon={<StopOutlined />} style={{ fontWeight: 600 }}>
                Terminal Action
              </Tag>
            )}
          </Flex>

          <Space size="small">
            <PermissionGuard permission={Permission.AcademicStandingsUpdate}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditStep(step)}
                aria-label="Edit step"
              />
            </PermissionGuard>
            <PermissionGuard permission={Permission.AcademicStandingsDelete}>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onDeleteStep(step)}
                aria-label="Delete step"
              />
            </PermissionGuard>
          </Space>
        </Flex>
      ),
      description: (
        <Card
          variant="outlined"
          style={{
            marginTop: 8,
            marginBottom: 16,
            borderRadius: token.borderRadiusLG,
            borderColor: isTerminal ? token.colorErrorBorder : token.colorBorderSecondary,
            background: isTerminal ? token.colorErrorBg : token.colorBgContainer,
          }}
          styles={{
            body: { padding: token.paddingMD },
          }}
        >
          <Flex vertical gap={8}>
            <Flex wrap="wrap" gap={8} align="center">
              {step.studentTransitionStatus && (
                <Tag color="cyan">
                  Transition Status: <strong>{step.studentTransitionStatus.name}</strong>
                </Tag>
              )}

              <Tooltip title={getTimingTooltip(step.actionTimingMode)}>
                <Tag icon={<InfoCircleOutlined />} color="purple" style={{ cursor: "help" }}>
                  Timing: {getTimingLabel(step)}
                </Tag>
              </Tooltip>
            </Flex>

            {isTerminal && (
              <Typography.Text type="danger" style={{ fontSize: 13, fontWeight: 500 }}>
                ⚠ Terminal Exit: Students reaching this rung do not escalate further and exit active student standing.
              </Typography.Text>
            )}
          </Flex>
        </Card>
      ),
    };
  });

  return (
    <Flex vertical gap={16} style={{ width: "100%" }}>
      {/* Sequence Warnings */}
      {!validation.hasTerminalStep && steps.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          title="Missing Terminal Exit Step"
          description="This escalation ladder has no terminal step. Without a terminal step, students will loop indefinitely on the highest warning without undergoing final academic review or withdrawal."
        />
      )}

      {validation.warnings
        .filter((w) => !w.includes("never resolves") && !w.includes("No escalation"))
        .map((w, idx) => (
          <Alert key={idx} type="warning" showIcon description={w} />
        ))}

      {/* Steps Ladder */}
      {steps.length > 0 ? (
        <Steps
          direction="vertical"
          style={{ width: "100%" }}
          items={stepItems.map((item) => ({
            ...item,
            content: item.description,
          }))}
        />
      ) : null}

      {/* Bottom Ghost Rung / Add Step Affordance */}
      <PermissionGuard permission={Permission.AcademicStandingsCreate}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => onAddStep(validation.nextStepNumber)}
          style={{
            height: 48,
            width: "100%",
            borderRadius: token.borderRadiusLG,
            fontWeight: 600,
            borderColor: token.colorBorder,
          }}
        >
          + Add Step {validation.nextStepNumber}
        </Button>
      </PermissionGuard>
    </Flex>
  );
}
