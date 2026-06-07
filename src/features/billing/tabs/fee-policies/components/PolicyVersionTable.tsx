import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { BILLING_POLICY_UI_COPY } from "@/shared/constants/billingPolicyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { Badge, Button, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { BillableEventPolicy } from "../types/billable-event-policy";
import {
  formatEffectiveRange,
  formatPolicyVersionLabel,
} from "../utils/billingPolicyDisplay";

type PolicyVersionTableProps = {
  policies: BillableEventPolicy[];
  loading: boolean;
  onView: (policy: BillableEventPolicy) => void;
  onPublishRevision: (policy: BillableEventPolicy) => void;
  onUseAsDraft: (policy: BillableEventPolicy) => void;
  onDelete: (policy: BillableEventPolicy) => void;
};

export function PolicyVersionTable({
  policies,
  loading,
  onView,
  onPublishRevision,
  onUseAsDraft,
  onDelete,
}: PolicyVersionTableProps) {
  const token = useToken();

  const columns: ColumnsType<BillableEventPolicy> = [
    {
      title: "Version",
      dataIndex: "versionNo",
      key: "versionNo",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Typography.Text strong>
            {formatPolicyVersionLabel(record)}
          </Typography.Text>
          {record.isActive ? (
            <Badge
              status="success"
              text={
                <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                  {BILLING_POLICY_UI_COPY.currentBadge}
                </Typography.Text>
              }
            />
          ) : null}
        </Space>
      ),
    },
    {
      title: "Effective",
      key: "effective",
      render: (_, record) => formatEffectiveRange(record),
    },
    {
      title: "Timing",
      dataIndex: "paymentTiming",
      key: "paymentTiming",
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: "Occurrence",
      dataIndex: "occurrenceMode",
      key: "occurrenceMode",
    },
    {
      title: "Period",
      dataIndex: "periodType",
      key: "periodType",
    },
    {
      title: "Guard step",
      dataIndex: "guardWorkflowStep",
      key: "guardWorkflowStep",
      ellipsis: true,
    },
    {
      title: "Arrears",
      dataIndex: "arrearsMode",
      key: "arrearsMode",
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space size={4} wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          >
            {BILLING_POLICY_UI_COPY.viewVersion}
          </Button>
          {!record.isActive ? (
            <Button
              type="link"
              size="small"
              onClick={() => onUseAsDraft(record)}
            >
              {BILLING_POLICY_UI_COPY.useAsDraft}
            </Button>
          ) : (
            <PermissionGuard permission={Permission.BillingBillableEventsUpdate}>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onPublishRevision(record)}
              >
                {BILLING_POLICY_UI_COPY.publishRevision}
              </Button>
            </PermissionGuard>
          )}
          {!record.isActive ? (
            <PermissionGuard permission={Permission.BillingBillableEventsDelete}>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
              >
                {BILLING_POLICY_UI_COPY.deleteVersion}
              </Button>
            </PermissionGuard>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={policies}
      loading={loading}
      pagination={false}
      locale={{ emptyText: BILLING_POLICY_UI_COPY.noVersions }}
      size="middle"
    />
  );
}
