import { ClockCircleOutlined } from "@ant-design/icons";
import { Popover, Tag, Typography } from "antd";

export interface DeferredReasonTooltipProps {
  standingLabel: string;
  deferralReason?: string | null;
}

export function DeferredReasonTooltip({
  standingLabel,
  deferralReason,
}: DeferredReasonTooltipProps) {
  const content = (
    <div style={{ maxWidth: 280 }}>
      <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>
        Evaluation Blocked
      </Typography.Text>
      <Typography.Paragraph strong style={{ margin: "4px 0" }}>
        {standingLabel}
      </Typography.Paragraph>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {deferralReason ||
          "Student has unapproved, draft, or missing score sheets in the semester. Transition cannot be processed until departmental sheets are published."}
      </Typography.Text>
    </div>
  );

  return (
    <Popover content={content} title="Deferred Academic Evaluation" trigger="hover">
      <Tag
        icon={<ClockCircleOutlined />}
        color="default"
        style={{ cursor: "pointer", fontWeight: 500 }}
      >
        {standingLabel || "Evaluation Deferred"}
      </Tag>
    </Popover>
  );
}
