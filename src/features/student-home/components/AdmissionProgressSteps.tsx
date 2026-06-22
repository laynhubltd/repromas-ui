import { Card } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  ExclamationCircleFilled,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Badge, Flex, Tag, Typography } from "antd";
import { ME_PROGRESS_UI_COPY } from "../constants/meAdmissionProgressOptions";
import type {
  ProgressPhaseGroup,
  ProgressStepDisplayItem,
} from "../utils/admissionProgressDisplay";

const { Text, Title } = Typography;

type AdmissionProgressStepsProps = {
  phaseGroups: ProgressPhaseGroup[];
};

function StepStatusIcon({ step }: { step: ProgressStepDisplayItem }) {
  const token = useToken();

  if (step.apiStatus === "completed") {
    return (
      <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 18 }} />
    );
  }
  if (step.apiStatus === "blocked") {
    return (
      <ExclamationCircleFilled style={{ color: token.colorWarning, fontSize: 18 }} />
    );
  }
  if (step.isCurrent || step.apiStatus === "in_progress") {
    return (
      <Badge
        status="processing"
        style={{ marginTop: 2 }}
        aria-label="Current step"
      />
    );
  }
  if (step.apiStatus === "skipped") {
    return (
      <MinusCircleOutlined
        style={{ color: token.colorTextQuaternary, fontSize: 16 }}
      />
    );
  }

  return (
    <ClockCircleOutlined
      style={{ color: token.colorTextQuaternary, fontSize: 16 }}
    />
  );
}

function StepRow({ step }: { step: ProgressStepDisplayItem }) {
  const token = useToken();
  const isHighlighted =
    step.isCurrent ||
    step.apiStatus === "in_progress" ||
    step.apiStatus === "blocked";

  return (
    <Flex
      align="flex-start"
      gap={token.marginMD}
      style={{
        width: "100%",
        padding: `${token.paddingSM}px ${token.paddingMD}px`,
        borderRadius: token.borderRadiusLG,
        background: isHighlighted ? token.colorPrimaryBg : "transparent",
        border: isHighlighted
          ? `1px solid ${token.colorPrimaryBorder}`
          : "1px solid transparent",
      }}
    >
      <Flex style={{ paddingTop: 2, flexShrink: 0 }}>
        <StepStatusIcon step={step} />
      </Flex>

      <Flex vertical gap={4} style={{ minWidth: 0, flex: 1 }}>
        <Flex align="center" justify="space-between" gap={8} wrap="wrap">
          <Text strong={isHighlighted} style={{ fontSize: token.fontSize }}>
            {step.title}
          </Text>
          <Tag
            color={step.badgeColor}
            style={{ marginInlineEnd: 0, fontSize: token.fontSizeSM }}
          >
            {step.statusLabel}
          </Tag>
        </Flex>
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {step.description}
        </Text>
      </Flex>
    </Flex>
  );
}

export function AdmissionProgressSteps({ phaseGroups }: AdmissionProgressStepsProps) {
  const token = useToken();

  return (
    <Card
      header={ME_PROGRESS_UI_COPY.progressSectionTitle}
      subheader={ME_PROGRESS_UI_COPY.progressSectionHint}
      size="md"
      density="comfortable"
      style={{ width: "100%" }}
    >
      <Flex vertical gap={token.marginLG} style={{ width: "100%" }}>
        {phaseGroups.map((phase) => (
          <Flex key={phase.key} vertical gap={token.marginSM} style={{ width: "100%" }}>
            <Title
              level={5}
              style={{
                margin: 0,
                fontSize: token.fontSize,
                color: token.colorTextSecondary,
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              {phase.label}
            </Title>
            <Flex vertical gap={token.marginXS} style={{ width: "100%" }}>
              {phase.steps.map((step) => (
                <StepRow key={step.key} step={step} />
              ))}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}
