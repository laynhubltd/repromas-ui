import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  MATRIC_NUMBER_FORMAT_UI_COPY,
  matricSlotLabel,
} from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Alert, Button, Col, Flex, Row, Tag, Typography } from "antd";
import type { MatricFormatActiveSlot, MatricFormatSlot, MatricNumberFormat } from "../types/matric-number-format";
import { useMatricFormatSlotOverview } from "../hooks/useMatricFormatSlotOverview";
import type { MatricSlotCardVariant } from "../hooks/useMatricFormatSlotOverview";

type MatricFormatSlotOverviewProps = {
  slots: MatricFormatActiveSlot[];
  currentSessionId: number | null;
  sessionLabel: string | null;
  isLoading: boolean;
  sectionError: string | null;
  onViewFormat: (format: MatricNumberFormat) => void;
  onCreateForSlot: (entryMode: MatricFormatSlot) => void;
  onRetry: () => void;
};

const variantTagColor: Record<MatricSlotCardVariant, string> = {
  live: "success",
  liveLocked: "success",
  notConfigured: "warning",
  missingLocked: "error",
};

const variantStatusLabel: Record<MatricSlotCardVariant, string> = {
  live: MATRIC_NUMBER_FORMAT_UI_COPY.slotLive,
  liveLocked: MATRIC_NUMBER_FORMAT_UI_COPY.slotLiveLocked,
  notConfigured: MATRIC_NUMBER_FORMAT_UI_COPY.slotNotConfigured,
  missingLocked: MATRIC_NUMBER_FORMAT_UI_COPY.slotMissingLocked,
};

export function MatricFormatSlotOverview({
  slots,
  currentSessionId,
  sessionLabel,
  isLoading,
  sectionError,
  onViewFormat,
  onCreateForSlot,
  onRetry,
}: MatricFormatSlotOverviewProps) {
  const token = useToken();
  const { cards } = useMatricFormatSlotOverview({ slots, currentSessionId });

  return (
    <Flex vertical gap={12}>
      <ConditionalRenderer when={currentSessionId !== null}>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {MATRIC_NUMBER_FORMAT_UI_COPY.currentSessionLabel}:{" "}
          {sessionLabel ?? "—"} (id {currentSessionId})
        </Typography.Text>
      </ConditionalRenderer>

      <ConditionalRenderer when={sectionError !== null}>
        <ErrorAlert variant="section" error={sectionError} onRetry={onRetry} />
      </ConditionalRenderer>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={2} variant="card" />}>
        <Row gutter={[16, 16]}>
          {cards.map((card) => (
            <Col key={matricSlotLabel(card.entryMode)} xs={24} sm={12} lg={6}>
              <Flex
                vertical
                gap={12}
                style={{
                  padding: 16,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBgContainer,
                  height: "100%",
                }}
              >
                <Flex justify="space-between" align="center" gap={8} wrap="wrap">
                  <Typography.Text strong>{matricSlotLabel(card.entryMode)}</Typography.Text>
                  <Tag color={variantTagColor[card.variant]}>
                    {variantStatusLabel[card.variant]}
                  </Tag>
                </Flex>

                <ConditionalRenderer when={card.format !== null}>
                  <Typography.Text code style={{ fontSize: token.fontSizeSM }}>
                    {card.format?.code}
                  </Typography.Text>
                </ConditionalRenderer>

                <ConditionalRenderer when={card.showLockBanner}>
                  <Alert
                    type="warning"
                    showIcon
                    message={MATRIC_NUMBER_FORMAT_UI_COPY.slotLockBanner}
                    style={{ fontSize: token.fontSizeSM }}
                  />
                </ConditionalRenderer>

                <ConditionalRenderer when={card.showFallbackWarning}>
                  <Alert
                    type="info"
                    showIcon
                    message={MATRIC_NUMBER_FORMAT_UI_COPY.slotFallbackWarning}
                    style={{ fontSize: token.fontSizeSM }}
                  />
                </ConditionalRenderer>

                <Flex gap={8} wrap="wrap" style={{ marginTop: "auto" }}>
                  <ConditionalRenderer when={card.format !== null}>
                    <Button size="small" onClick={() => onViewFormat(card.format!)}>
                      {MATRIC_NUMBER_FORMAT_UI_COPY.actionView}
                    </Button>
                  </ConditionalRenderer>
                  <ConditionalRenderer when={card.variant === "notConfigured"}>
                    <PermissionGuard permission={Permission.MatricNumberFormatsCreate}>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => onCreateForSlot(card.entryMode)}
                      >
                        {MATRIC_NUMBER_FORMAT_UI_COPY.slotCreateDraftCta}{" "}
                        {matricSlotLabel(card.entryMode)}
                      </Button>
                    </PermissionGuard>
                  </ConditionalRenderer>
                </Flex>
              </Flex>
            </Col>
          ))}
        </Row>
      </DataLoader>
    </Flex>
  );
}
