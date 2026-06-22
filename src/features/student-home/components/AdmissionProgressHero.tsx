import { Card } from "@/components/ui-kit";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Alert, Button, Flex, Progress, Tag, Typography } from "antd";
import {
  ME_PROGRESS_UI_COPY,
  type StatusDisplay,
} from "../constants/meAdmissionProgressOptions";

const { Text } = Typography;

type AdmissionProgressHeroProps = {
  portalDisplay: StatusDisplay;
  cycleStatus?: string;
  progressPercent: number;
  activeStepNumber: number;
  totalSteps: number;
  primaryCtaLabel: string;
  showPrimaryCta: boolean;
  showFeeBanner: boolean;
  nextAction: string;
  onPrimaryAction: () => void;
};

export function AdmissionProgressHero({
  portalDisplay,
  cycleStatus,
  progressPercent,
  activeStepNumber,
  totalSteps,
  primaryCtaLabel,
  showPrimaryCta,
  showFeeBanner,
  nextAction,
  onPrimaryAction,
}: AdmissionProgressHeroProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  const isWaiting =
    nextAction === "wait_for_screening" || nextAction === "wait_for_decision";
  const hideHeroCta =
    !showPrimaryCta || isWaiting || (showFeeBanner && nextAction === "pay_application_fee");

  const waitingMessage =
    nextAction === "wait_for_screening"
      ? ME_PROGRESS_UI_COPY.waitingScreeningHint
      : ME_PROGRESS_UI_COPY.waitingDecisionHint;

  const cycleLabel = cycleStatus
    ? cycleStatus.replaceAll("_", " ")
    : null;

  return (
    <Card size="md" density="comfortable" style={{ width: "100%" }}>
      <Flex vertical gap={token.marginLG} style={{ width: "100%" }}>
        <Flex
          align={isMobile ? "stretch" : "center"}
          justify="space-between"
          gap={token.marginMD}
          vertical={isMobile}
        >
          <Flex vertical gap={4} style={{ minWidth: 0, flex: 1 }}>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Current status
            </Text>
            <Tag
              color={portalDisplay.color}
              style={{
                alignSelf: "flex-start",
                marginInlineEnd: 0,
                fontSize: token.fontSizeLG,
                paddingInline: token.paddingMD,
                paddingBlock: token.paddingXS,
              }}
            >
              {portalDisplay.label}
            </Tag>
            {cycleLabel ? (
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Admission cycle · {cycleLabel}
              </Text>
            ) : null}
          </Flex>
        </Flex>

        <div style={{ width: "100%" }}>
          <Flex justify="space-between" align="center" gap={8} wrap="wrap">
            <Text strong>
              {progressPercent}% {ME_PROGRESS_UI_COPY.progressCompleteLabel}
            </Text>
            {totalSteps > 0 ? (
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {ME_PROGRESS_UI_COPY.progressStepOf} {activeStepNumber}{" "}
                {ME_PROGRESS_UI_COPY.progressOf} {totalSteps}
              </Text>
            ) : null}
          </Flex>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor={token.colorPrimary}
            trailColor={token.colorFillSecondary}
            style={{ marginTop: token.marginXS }}
          />
        </div>

        <ConditionalRenderer when={isWaiting}>
          <Alert type="info" showIcon message={waitingMessage} />
        </ConditionalRenderer>

        <ConditionalRenderer when={!hideHeroCta}>
          <Flex style={{ width: "100%" }}>
            <Button
              type="primary"
              size="large"
              block={isMobile}
              onClick={onPrimaryAction}
              style={{ maxWidth: isMobile ? undefined : 320 }}
            >
              {primaryCtaLabel}
              <ArrowRightOutlined />
            </Button>
          </Flex>
        </ConditionalRenderer>
      </Flex>
    </Card>
  );
}
