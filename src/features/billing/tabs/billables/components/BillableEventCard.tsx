import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { BILLABLE_EVENT_TOOLTIPS } from "@/shared/constants/billableEventOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Badge, Button, Flex, Tag, Tooltip, Typography } from "antd";
import type { ReactNode } from "react";
import { useState } from "react";
import type { BillablesTabLabelMaps } from "../hooks/useBillablesTab";
import type { BillableEvent } from "../types/billable-event";
import { getBillableEventCardDisplay } from "../utils/billableEventDisplay";
import { LabelWithTooltip } from "./LabelWithTooltip";

type BillableEventCardProps = {
  billableEvent: BillableEvent;
  labelMaps: BillablesTabLabelMaps;
  onEdit: (billableEvent: BillableEvent) => void;
  onDelete: (billableEvent: BillableEvent) => void;
};

type DetailRowProps = {
  icon: ReactNode;
  label: string;
  tooltip: string;
  value: string;
};

function DetailRow({ icon, label, tooltip, value }: DetailRowProps) {
  const token = useToken();

  return (
    <Flex gap={10} align="flex-start">
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: token.borderRadius,
          background: token.colorBgLayout,
          border: `1px solid ${token.colorBorderSecondary}`,
          color: token.colorTextSecondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 15,
        }}
      >
        {icon}
      </div>
      <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
        <LabelWithTooltip label={label} tooltip={tooltip} uppercase />
        <Typography.Text
          style={{ fontSize: token.fontSize, lineHeight: 1.5 }}
          ellipsis={{ tooltip: value }}
        >
          {value}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

export function BillableEventCard({
  billableEvent,
  labelMaps,
  onEdit,
  onDelete,
}: BillableEventCardProps) {
  const token = useToken();
  const [hovered, setHovered] = useState(false);
  const display = getBillableEventCardDisplay(billableEvent, labelMaps);

  const policyLabel = display.isStrictPolicy
    ? "Strict policy"
    : "Flexible policy";

  return (
    <div
      style={{
        border: `1px solid ${hovered ? token.colorBorder : token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        display: "flex",
        flexDirection: "column",
        minHeight: 260,
        boxShadow: hovered ? token.boxShadowSecondary : "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Flex
        vertical
        gap={8}
        style={{
          padding: "16px 16px 14px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
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
              style={{ fontSize: token.fontSizeSM, lineHeight: 1.35 }}
              ellipsis={{ tooltip: display.feeTypeSubtitle }}
            >
              {display.feeTypeSubtitle}
            </Typography.Text>
          </Flex>
          <Tooltip title={BILLABLE_EVENT_TOOLTIPS.activeStatus}>
            <Badge
              status={billableEvent.isActive ? "success" : "default"}
              text={billableEvent.isActive ? "Active" : "Inactive"}
              style={{ flexShrink: 0, cursor: "help" }}
            />
          </Tooltip>
        </Flex>

        <Flex align="center" gap={8} wrap="wrap">
          <Tooltip
            title={
              display.isPayBefore
                ? BILLABLE_EVENT_TOOLTIPS.payBeforeTag
                : BILLABLE_EVENT_TOOLTIPS.payAfterTag
            }
          >
            <Tag
              color={display.isPayBefore ? "blue" : "gold"}
              style={{ margin: 0, cursor: "help" }}
            >
              {display.timingTag}
            </Tag>
          </Tooltip>
          <Tooltip title={BILLABLE_EVENT_TOOLTIPS.strictPolicy}>
            <Typography.Text
              type="secondary"
              style={{
                fontSize: token.fontSizeSM,
                lineHeight: 1.35,
                cursor: "help",
              }}
            >
              {policyLabel}
            </Typography.Text>
          </Tooltip>
        </Flex>
      </Flex>

      <Flex
        vertical
        gap={22}
        style={{
          padding: "16px",
          flex: 1,
        }}
      >
        <DetailRow
          icon={<ClockCircleOutlined />}
          label="When payment is due"
          tooltip={BILLABLE_EVENT_TOOLTIPS.paymentDue}
          value={display.paymentTimingSummary}
        />
        <DetailRow
          icon={<FileAddOutlined />}
          label="When the fee is recorded"
          tooltip={BILLABLE_EVENT_TOOLTIPS.feeRecorded}
          value={display.chargeCreatedWhen}
        />
        <DetailRow
          icon={<StopOutlined />}
          label="Step blocked until paid"
          tooltip={BILLABLE_EVENT_TOOLTIPS.stepBlocked}
          value={display.paymentRequiredBefore}
        />
        <DetailRow
          icon={<SafetyCertificateOutlined />}
          label="If no fee on file yet"
          tooltip={BILLABLE_EVENT_TOOLTIPS.noFeeOnFile}
          value={display.unpaidPolicySummary}
        />

        {display.fulfilledLabels.length > 0 ? (
          <Flex gap={10} align="flex-start">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: token.borderRadius,
                background: token.colorBgLayout,
                border: `1px solid ${token.colorBorderSecondary}`,
                color: token.colorTextSecondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 15,
              }}
            >
              <CheckCircleOutlined />
            </div>
            <Flex vertical gap={8} style={{ flex: 1, minWidth: 0 }}>
              <LabelWithTooltip
                label="Counts as paid"
                tooltip={BILLABLE_EVENT_TOOLTIPS.countsAsPaid}
              />
              <Flex gap={6} wrap="wrap">
                {display.fulfilledLabels.map((label) => (
                  <Tag key={label} style={{ margin: 0 }}>
                    {label}
                  </Tag>
                ))}
              </Flex>
            </Flex>
          </Flex>
        ) : null}
      </Flex>

      <Flex
        align="center"
        justify="flex-end"
        gap={4}
        style={{
          padding: "10px 12px",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <PermissionGuard permission={Permission.BillingBillableEventsUpdate}>
          <Tooltip title={BILLABLE_EVENT_TOOLTIPS.editFee}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(billableEvent)}
            >
              Edit
            </Button>
          </Tooltip>
        </PermissionGuard>
        <PermissionGuard permission={Permission.BillingBillableEventsDelete}>
          <Tooltip title={BILLABLE_EVENT_TOOLTIPS.removeFee}>
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
