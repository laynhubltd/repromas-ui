import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  FEE_EVENT_TOOLTIPS,
  FEE_EVENT_UI_COPY,
} from "@/shared/constants/feeEventOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Badge, Button, Flex, Tooltip, Typography } from "antd";
import { useState } from "react";
import type { BillableEvent } from "../types/billable-event";
import type { FeeEventsTabLabelMaps } from "../types/fee-events-tab";
import { getFeeEventCardDisplay } from "../utils/feeEventDisplay";

type FeeEventCardProps = {
  billableEvent: BillableEvent;
  labelMaps: FeeEventsTabLabelMaps;
  onEdit: (billableEvent: BillableEvent) => void;
  onViewPolicy?: () => void;
  onConfigurePricing?: () => void;
  onDelete: (billableEvent: BillableEvent) => void;
};

export function FeeEventCard({
  billableEvent,
  labelMaps,
  onEdit,
  onViewPolicy,
  onConfigurePricing,
  onDelete,
}: FeeEventCardProps) {
  const token = useToken();
  const [hovered, setHovered] = useState(false);
  const display = getFeeEventCardDisplay(billableEvent, labelMaps);

  return (
    <div
      style={{
        border: `1px solid ${hovered ? token.colorBorder : token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        display: "flex",
        flexDirection: "column",
        minHeight: 160,
        boxShadow: hovered ? token.boxShadowSecondary : "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Flex
        vertical
        gap={10}
        style={{
          padding: "16px",
          flex: 1,
        }}
      >
        <Flex align="flex-start" justify="space-between" gap={8}>
          <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Typography.Text
              strong
              style={{
                fontSize: token.fontSizeLG,
                lineHeight: 1.3,
                color: token.colorTextHeading,
              }}
              ellipsis={{ tooltip: display.title }}
            >
              {display.title}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
              ellipsis={{ tooltip: display.code }}
            >
              {display.feeTypeLabel} · {display.code}
            </Typography.Text>
          </Flex>
          <Tooltip title={FEE_EVENT_TOOLTIPS.activeStatus}>
            <Badge
              status={billableEvent.isActive ? "success" : "default"}
              text={billableEvent.isActive ? "Active" : "Inactive"}
              style={{ flexShrink: 0, cursor: "help" }}
            />
          </Tooltip>
        </Flex>

        {display.description ? (
          <Typography.Paragraph
            type="secondary"
            style={{ fontSize: token.fontSizeSM, lineHeight: 1.45, marginBottom: 0 }}
            ellipsis={{ rows: 2, tooltip: display.description }}
          >
            {display.description}
          </Typography.Paragraph>
        ) : (
          <Typography.Text
            type="secondary"
            italic
            style={{ fontSize: token.fontSizeSM }}
          >
            No description
          </Typography.Text>
        )}
      </Flex>

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
        {onViewPolicy ? (
          <Tooltip title={FEE_EVENT_TOOLTIPS.viewPolicy}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={onViewPolicy}
            >
              {FEE_EVENT_UI_COPY.viewPolicy}
            </Button>
          </Tooltip>
        ) : null}
        <PermissionGuard permission={Permission.BillingBillableEventsUpdate}>
          {onConfigurePricing ? (
            <Tooltip title={FEE_EVENT_TOOLTIPS.configurePricing}>
              <Button
                type="text"
                size="small"
                icon={<DollarOutlined />}
                onClick={onConfigurePricing}
              >
                {FEE_EVENT_UI_COPY.configurePricing}
              </Button>
            </Tooltip>
          ) : null}
          <Tooltip title={FEE_EVENT_TOOLTIPS.editMetadata}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(billableEvent)}
            >
              {FEE_EVENT_UI_COPY.editMetadata}
            </Button>
          </Tooltip>
        </PermissionGuard>
        <PermissionGuard permission={Permission.BillingBillableEventsDelete}>
          <Tooltip title={FEE_EVENT_TOOLTIPS.removeFee}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(billableEvent)}
            >
              Remove
            </Button>
          </Tooltip>
        </PermissionGuard>
      </Flex>
    </div>
  );
}
