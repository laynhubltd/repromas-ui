import { Button, List, Modal, Typography } from "antd";
import type { BillableEventPolicySeedResult } from "../../types/billable-event-policy";
import { skippedReasonLabel } from "../../utils/billingPolicyDisplay";

type SeedPoliciesSummaryModalProps = {
  open: boolean;
  result: BillableEventPolicySeedResult | null;
  onClose: () => void;
};

export function SeedPoliciesSummaryModal({
  open,
  result,
  onClose,
}: SeedPoliciesSummaryModalProps) {
  if (!result) return null;

  return (
    <Modal
      title="Setup summary"
      open={open}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          Done
        </Button>
      }
      destroyOnHidden
    >
      <Typography.Paragraph>
        Created {result.createdCount} fee type(s). Skipped {result.skippedCount}.
      </Typography.Paragraph>

      {result.createdEvents.length > 0 ? (
        <>
          <Typography.Text strong>Created</Typography.Text>
          <List
            size="small"
            dataSource={result.createdEvents}
            renderItem={(item) => (
              <List.Item>
                {item.name} ({item.code})
              </List.Item>
            )}
          />
        </>
      ) : null}

      {result.skipped.length > 0 ? (
        <>
          <Typography.Text strong style={{ display: "block", marginTop: 16 }}>
            Skipped
          </Typography.Text>
          <List
            size="small"
            dataSource={result.skipped}
            renderItem={(item) => (
              <List.Item>
                {item.code} — {skippedReasonLabel(item.reason)}
              </List.Item>
            )}
          />
        </>
      ) : null}
    </Modal>
  );
}
