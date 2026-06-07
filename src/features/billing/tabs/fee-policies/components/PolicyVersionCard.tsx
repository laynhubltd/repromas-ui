import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";
import { FEE_POLICY_UI_COPY } from "@/shared/constants/feePolicyOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Badge, Button, Col, Flex, Row, Tag, Typography } from "antd";
import { useState } from "react";
import type { BillableEventPolicy } from "../types/billable-event-policy";
import { getPolicyVersionCardDisplay } from "../utils/policyVersionDisplay";

type PolicyVersionCardProps = {
  policy: BillableEventPolicy;
  labelMaps: FeeEventsTabLabelMaps;
  showFeeType?: boolean;
  onView: (policy: BillableEventPolicy) => void;
  onPublishRevision: (policy: BillableEventPolicy) => void;
  onUseAsDraft: (policy: BillableEventPolicy) => void;
  onDelete: (policy: BillableEventPolicy) => void;
};

type SummaryCellProps = {
  label: string;
  value: string;
};

function SummaryCell({ label, value }: SummaryCellProps) {
  const token = useToken();
  return (
    <Flex vertical gap={2} style={{ minWidth: 0 }}>
      <Typography.Text
        type="secondary"
        style={{ fontSize: token.fontSizeSM, lineHeight: 1.2 }}
      >
        {label}
      </Typography.Text>
      <Typography.Text
        ellipsis={{ tooltip: value }}
        style={{ fontSize: token.fontSize, lineHeight: 1.35 }}
      >
        {value}
      </Typography.Text>
    </Flex>
  );
}

export function PolicyVersionCard({
  policy,
  labelMaps,
  showFeeType = false,
  onView,
  onPublishRevision,
  onUseAsDraft,
  onDelete,
}: PolicyVersionCardProps) {
  const token = useToken();
  const [hovered, setHovered] = useState(false);
  const display = getPolicyVersionCardDisplay(policy, labelMaps);

  return (
    <div
      style={{
        border: `1px solid ${hovered ? token.colorBorder : token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        display: "flex",
        flexDirection: "column",
        minHeight: 200,
        boxShadow: hovered ? token.boxShadowSecondary : "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Flex
        vertical
        gap={6}
        style={{
          padding: "14px 16px 10px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Flex align="center" justify="space-between" gap={8}>
          <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
            {display.versionLabel}
          </Typography.Text>
          {display.isCurrent ? (
            <Badge
              status="success"
              text={FEE_POLICY_UI_COPY.currentBadge}
            />
          ) : (
            <Tag style={{ margin: 0 }}>Historical</Tag>
          )}
        </Flex>
        {showFeeType ? (
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
            ellipsis={{ tooltip: policy.code }}
          >
            {labelMaps.codeLabels[policy.code] ?? policy.code}
          </Typography.Text>
        ) : null}
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {display.effectiveRange}
        </Typography.Text>
      </Flex>

      <div style={{ padding: "12px 16px", flex: 1 }}>
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <SummaryCell label="Pay timing" value={display.paymentTiming} />
          </Col>
          <Col span={12}>
            <SummaryCell label="Occurrence" value={display.occurrence} />
          </Col>
          <Col span={12}>
            <SummaryCell label="Period" value={display.period} />
          </Col>
          <Col span={12}>
            <SummaryCell label="Guard step" value={display.guardStep} />
          </Col>
          <Col span={24}>
            <SummaryCell label="Arrears" value={display.arrears} />
          </Col>
        </Row>
      </div>

      <Flex
        align="center"
        justify="flex-end"
        gap={4}
        wrap="wrap"
        style={{
          padding: "8px 10px",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onView(policy)}
        >
          {FEE_POLICY_UI_COPY.viewVersion}
        </Button>
        {!policy.isActive ? (
          <Button
            type="text"
            size="small"
            onClick={() => onUseAsDraft(policy)}
          >
            {FEE_POLICY_UI_COPY.useAsDraft}
          </Button>
        ) : (
          <PermissionGuard permission={Permission.BillingBillableEventsUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onPublishRevision(policy)}
            >
              {FEE_POLICY_UI_COPY.publishRevision}
            </Button>
          </PermissionGuard>
        )}
        {!policy.isActive ? (
          <PermissionGuard permission={Permission.BillingBillableEventsDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(policy)}
            >
              {FEE_POLICY_UI_COPY.deleteVersion}
            </Button>
          </PermissionGuard>
        ) : null}
      </Flex>
    </div>
  );
}
