import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { PRICING_RULE_UI_COPY } from "@/shared/constants/pricingRuleOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Alert, Badge, Button, Flex, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import type { PricingRule, PricingRuleItemRead } from "../types/pricing-rule";
import { formatCurrencyDisplay } from "../utils/computeGrossPreview";
import {
  formatLineAccountingCode,
  getPricingRuleCardDisplay,
  sortPricingRuleItems,
} from "../utils/pricingRuleDisplay";

type PricingRuleCardProps = {
  rule: PricingRule;
  eventNames: Map<string, string>;
  referenceNames: Map<number, string>;
  isLocked: boolean;
  isExpanded: boolean;
  onExpandToggle: () => void;
  onEdit: (rule: PricingRule) => void;
  onDelete: (rule: PricingRule) => void;
  onAddLine: (rule: PricingRule) => void;
  onEditLine: (rule: PricingRule, item: PricingRuleItemRead) => void;
  onDeleteLine: (rule: PricingRule, item: PricingRuleItemRead) => void;
};

type PricingRuleMetaRecord = {
  key: string;
  indigene: React.ReactNode;
  studentCategory: React.ReactNode;
  feeItems: React.ReactNode;
};

export function PricingRuleCard({
  rule,
  eventNames,
  referenceNames,
  isLocked,
  isExpanded,
  onExpandToggle,
  onEdit,
  onDelete,
  onAddLine,
  onEditLine,
  onDeleteLine,
}: PricingRuleCardProps) {
  const token = useToken();
  const display = getPricingRuleCardDisplay(rule, referenceNames, eventNames);
  const lineItems = sortPricingRuleItems(rule.items);
  const isGlobal = rule.scope === "GLOBAL";
  const showReference =
    !isGlobal &&
    display.referenceLabel !== "—" &&
    display.referenceLabel !== "Global";

  const metaData = useMemo<PricingRuleMetaRecord[]>(
    () => [
      {
        key: String(rule.id),
        indigene: (
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeSM, textTransform: "capitalize" }}
          >
            {display.indigeneLabel}
          </Typography.Text>
        ),
        studentCategory: (
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
            {display.studentCategoryLabel ?? "Any"}
          </Typography.Text>
        ),
        feeItems: (
          <Tooltip title={display.lineCountLabel}>
            <Tag style={{ margin: 0, fontWeight: 600 }}>
              {display.lineCount}
            </Tag>
          </Tooltip>
        ),
      },
    ],
    [display, rule.id, token.fontSizeSM],
  );

  const metaColumns = useMemo<ColumnsType<PricingRuleMetaRecord>>(
    () => {
      const headerCellStyle = {
        background: token.colorFillAlter,
        fontSize: token.fontSizeSM,
      };
      const bodyCellStyle = { verticalAlign: "middle" as const };

      return [
        {
          title: "Indigene",
          dataIndex: "indigene",
          onHeaderCell: () => ({ style: headerCellStyle }),
          onCell: () => ({ style: bodyCellStyle }),
        },
        {
          title: "Student category",
          dataIndex: "studentCategory",
          onHeaderCell: () => ({ style: headerCellStyle }),
          onCell: () => ({ style: bodyCellStyle }),
        },
        {
          title: "Fee Items",
          dataIndex: "feeItems",
          onHeaderCell: () => ({ style: headerCellStyle }),
          onCell: () => ({ style: bodyCellStyle }),
        },
      ];
    },
    [token.colorFillAlter, token.fontSizeSM],
  );

  const metaTableStyles = useMemo(
    () => ({
      root: { width: "100%", maxWidth: "100%", display: "block" },
      content: { width: "100%" },
      header: {
        cell: {
          border: "none",
          borderBottom: "none",
        },
      },
      body: {
        cell: {
          border: "none",
          borderBottom: "none",
        },
      },
    }),
    [],
  );

  const metaTableComponents = useMemo(
    () => ({
      table: (props: React.HTMLAttributes<HTMLTableElement>) => (
        <table
          {...props}
          style={{
            ...props.style,
            width: "100%",
            tableLayout: "fixed",
          }}
        />
      ),
    }),
    [],
  );

  const lineItemColumns = useMemo<ColumnsType<PricingRuleItemRead>>(
    () => {
      const columns: ColumnsType<PricingRuleItemRead> = [
      {
        title: "Line",
        dataIndex: "sortOrder",
        width: 64,
        render: (sortOrder: number) => (
          <Typography.Text style={{ fontSize: token.fontSizeSM }}>
            {sortOrder}
          </Typography.Text>
        ),
      },
      {
        title: "Fee item",
        dataIndex: "feeItemName",
        ellipsis: true,
        render: (name: string) => (
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
            {name}
          </Typography.Text>
        ),
      },
      {
        title: "Accounting code",
        dataIndex: "accountingCode",
        ellipsis: true,
        render: (code: string | null) => (
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {formatLineAccountingCode(code)}
          </Typography.Text>
        ),
      },
      {
        title: "Amount",
        dataIndex: "amount",
        align: "right",
        width: 120,
        render: (amount: string) => (
          <Typography.Text style={{ fontSize: token.fontSizeSM }}>
            {formatCurrencyDisplay(amount)}
          </Typography.Text>
        ),
      },
      {
        title: "Required",
        dataIndex: "isMandatory",
        width: 110,
        render: (isMandatory: boolean) =>
          isMandatory ? (
            <Tag color="orange" style={{ margin: 0 }}>
              Mandatory
            </Tag>
          ) : (
            <Tag style={{ margin: 0 }}>Optional</Tag>
          ),
      },
      ];

      if (!isLocked) {
        columns.push({
          title: "Actions",
          key: "actions",
          align: "right",
          width: 96,
          fixed: "right",
          render: (_: unknown, record: PricingRuleItemRead) => (
            <Flex align="center" justify="flex-end" gap={4}>
              <PermissionGuard permission={Permission.BillingPricingRulesUpdate}>
                <Tooltip title="Edit line">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEditLine(rule, record)}
                  />
                </Tooltip>
              </PermissionGuard>
              <PermissionGuard permission={Permission.BillingPricingRulesUpdate}>
                <Tooltip title="Remove line">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDeleteLine(rule, record)}
                  />
                </Tooltip>
              </PermissionGuard>
            </Flex>
          ),
        });
      }

      return columns;
    },
    [isLocked, onDeleteLine, onEditLine, rule, token.fontSizeSM],
  );

  const totalFooter = (
    <div
      style={{
        padding: `${token.paddingXS}px ${token.paddingMD}px`,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgLayout,
      }}
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Total
        </Typography.Text>
        <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
          {display.grossDisplay}
        </Typography.Text>
      </Flex>
    </div>
  );

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        marginBottom: token.marginSM,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: `${token.paddingSM}px ${token.paddingMD}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Flex vertical gap={8} style={{ width: "100%" }}>
          <Flex justify="space-between" align="flex-start" gap={12}>
            <Flex vertical gap={8} style={{ flex: 1, minWidth: 0 }}>
              <Flex align="center" gap={8} wrap="wrap">
                <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                  {display.eventLabel}
                </Typography.Text>
                {isLocked ? (
                  <Tag icon={<LockOutlined />} color="warning" style={{ margin: 0 }}>
                    Locked
                  </Tag>
                ) : null}
                <Badge
                  status={rule.isActive ? "success" : "default"}
                  text={
                    <span style={{ fontSize: token.fontSizeSM }}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </span>
                  }
                />
              </Flex>

              <Flex align="center" gap={8} wrap="wrap">
                <Tag color={display.scopeTagColor} style={{ margin: 0 }}>
                  {display.scopeLabel}
                </Tag>
                {showReference ? (
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM }}
                    ellipsis={{ tooltip: display.referenceLabel }}
                  >
                    {display.referenceLabel}
                  </Typography.Text>
                ) : null}
              </Flex>
            </Flex>

            <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
              <PermissionGuard permission={Permission.BillingPricingRulesUpdate}>
                <Tooltip title="Edit pricing rule">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(rule)}
                  />
                </Tooltip>
              </PermissionGuard>
              <PermissionGuard permission={Permission.BillingPricingRulesDelete}>
                <Tooltip title={isLocked ? "Retire rule" : "Delete rule"}>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(rule)}
                  />
                </Tooltip>
              </PermissionGuard>
              <Tooltip
                title={isExpanded ? "Collapse fee lines" : "Expand fee lines"}
              >
                <Button
                  type="text"
                  size="small"
                  icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                  onClick={onExpandToggle}
                />
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>
      </div>

      {isExpanded ? (
        <div style={{ padding: `${token.paddingSM}px ${token.paddingMD}px` }}>
          <Table<PricingRuleMetaRecord>
            rowKey="key"
            size="small"
            bordered={false}
            pagination={false}
            showHeader
            columns={metaColumns}
            dataSource={metaData}
            styles={metaTableStyles}
            components={metaTableComponents}
            style={{ marginBottom: token.marginSM }}
          />

          {isLocked ? (
            <Alert
              type="warning"
              showIcon
              message={PRICING_RULE_UI_COPY.lineLockedHint}
              style={{ marginBottom: token.marginSM }}
            />
          ) : null}

          <Flex justify="flex-end" style={{ marginBottom: token.marginSM }}>
            <PermissionGuard permission={Permission.BillingPricingRulesUpdate}>
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                disabled={isLocked}
                onClick={() => onAddLine(rule)}
              >
                Add line
              </Button>
            </PermissionGuard>
          </Flex>

          {lineItems.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <Table<PricingRuleItemRead>
                rowKey="id"
                size="small"
                pagination={false}
                columns={lineItemColumns}
                dataSource={lineItems}
                scroll={{ x: isLocked ? 520 : 640 }}
              />
            </div>
          ) : (
            <Flex
              vertical
              align="center"
              justify="center"
              gap={8}
              style={{
                padding: `${token.paddingMD}px`,
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                background: token.colorBgLayout,
              }}
            >
              <Typography.Text type="secondary">
                No fee lines on this rule
              </Typography.Text>
              {!isLocked ? (
                <PermissionGuard permission={Permission.BillingPricingRulesUpdate}>
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => onAddLine(rule)}
                  >
                    Add first line
                  </Button>
                </PermissionGuard>
              ) : null}
            </Flex>
          )}
        </div>
      ) : null}

      {totalFooter}
    </div>
  );
}
