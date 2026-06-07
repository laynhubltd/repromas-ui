import type { ConfigurePricingParams } from "@/features/billing/types/configure-pricing";
import { skippedReasonLabel } from "@/features/billing/tabs/fee-policies/utils/billingPolicyDisplay";
import { FEE_EVENT_UI_COPY } from "@/shared/constants/feeEventOptions";
import { Button, List, Modal, Typography } from "antd";
import type { BillableEventPolicySeedResult } from "@/features/billing/tabs/fee-policies/types/billable-event-policy";
import type { FeeEventsTabLabelMaps } from "../../types/fee-events-tab";
import {
  buildSeedCreatedLines,
  getSeedConfigurePricingParams,
} from "../../utils/seedFromCatalogDisplay";

type SeedFromCatalogSummaryModalProps = {
  open: boolean;
  result: BillableEventPolicySeedResult | null;
  labelMaps: FeeEventsTabLabelMaps;
  onClose: () => void;
  onConfigurePricing?: (params: ConfigurePricingParams) => void;
};

export function SeedFromCatalogSummaryModal({
  open,
  result,
  labelMaps,
  onClose,
  onConfigurePricing,
}: SeedFromCatalogSummaryModalProps) {
  if (!result) return null;

  const createdLines = buildSeedCreatedLines(result, labelMaps);
  const configureParams = getSeedConfigurePricingParams(result);

  const handleConfigurePricing = () => {
    if (!configureParams || !onConfigurePricing) return;
    onConfigurePricing(configureParams);
    onClose();
  };

  return (
    <Modal
      title={FEE_EVENT_UI_COPY.seedSuccessTitle}
      open={open}
      onCancel={onClose}
      footer={
        <>
          <Button onClick={onClose}>{FEE_EVENT_UI_COPY.seedReviewSettings}</Button>
          {onConfigurePricing && configureParams ? (
            <Button type="primary" onClick={handleConfigurePricing}>
              {FEE_EVENT_UI_COPY.seedConfigurePricing}
            </Button>
          ) : null}
        </>
      }
      destroyOnHidden
    >
      <Typography.Paragraph>
        {FEE_EVENT_UI_COPY.seedSuccessHeadline.replace(
          "{createdCount}",
          String(result.createdCount),
        )}
      </Typography.Paragraph>

      {createdLines.length > 0 ? (
        <>
          <Typography.Text strong>
            {FEE_EVENT_UI_COPY.seedCreatedListTitle}
          </Typography.Text>
          <List
            size="small"
            dataSource={createdLines}
            renderItem={(line) => <List.Item>{line}</List.Item>}
          />
        </>
      ) : null}

      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        {FEE_EVENT_UI_COPY.seedSkippedSummary.replace(
          "{skippedCount}",
          String(result.skippedCount),
        )}
      </Typography.Paragraph>

      {result.skipped.length > 0 ? (
        <List
          size="small"
          dataSource={result.skipped}
          renderItem={(item) => (
            <List.Item>
              {item.code} — {skippedReasonLabel(item.reason)}
            </List.Item>
          )}
        />
      ) : null}
    </Modal>
  );
}
