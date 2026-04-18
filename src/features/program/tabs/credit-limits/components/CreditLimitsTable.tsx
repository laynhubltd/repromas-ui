// Feature: program-credit-limits
import { Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Flex, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
    LevelOption,
    ProgramOption,
    RegistrationCreditLimit,
    SemesterTypeOption,
    SessionOption,
    StatusOption,
} from "../types/credit-limits";
import { countActiveDimensions, resolveId } from "../utils/helpers";

export type CreditLimitsTableProps = {
  limits: RegistrationCreditLimit[];
  programs: ProgramOption[];
  levels: LevelOption[];
  sessions: SessionOption[];
  semesterTypes: SemesterTypeOption[];
  statuses: StatusOption[];
  pagination: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  onEdit: (record: RegistrationCreditLimit) => void;
  onDelete: (record: RegistrationCreditLimit) => void;
};

function renderDimensionCell(value: string): React.ReactNode {
  if (value === "Any" || value === "—") {
    return <Typography.Text type="secondary">{value}</Typography.Text>;
  }
  return <Typography.Text>{value}</Typography.Text>;
}

export function CreditLimitsTable({
  limits,
  programs,
  levels,
  sessions,
  semesterTypes,
  statuses,
  pagination,
  onEdit,
  onDelete,
}: CreditLimitsTableProps) {
  const token = useToken();

  const columns: ColumnsType<RegistrationCreditLimit> = [
    {
      title: "Specificity",
      key: "specificity",
      render: (_: unknown, record: RegistrationCreditLimit) => {
        const count = countActiveDimensions(record);
        return (
          <Tooltip title="Number of dimensions set. Higher specificity rules take priority when weights are equal.">
            <Typography.Text>{count}/5</Typography.Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Program",
      key: "program",
      render: (_: unknown, record: RegistrationCreditLimit) =>
        renderDimensionCell(resolveId(record.programId, programs)),
    },
    {
      title: "Level",
      key: "level",
      render: (_: unknown, record: RegistrationCreditLimit) =>
        renderDimensionCell(resolveId(record.levelId, levels)),
    },
    {
      title: "Session",
      key: "session",
      render: (_: unknown, record: RegistrationCreditLimit) =>
        renderDimensionCell(resolveId(record.sessionId, sessions)),
    },
    {
      title: "Semester Type",
      key: "semesterType",
      render: (_: unknown, record: RegistrationCreditLimit) =>
        renderDimensionCell(resolveId(record.semesterTypeId, semesterTypes)),
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: RegistrationCreditLimit) =>
        renderDimensionCell(resolveId(record.statusId, statuses)),
    },
    {
      title: "Min Credits",
      dataIndex: "minCredits",
      key: "minCredits",
    },
    {
      title: "Max Credits",
      dataIndex: "maxCredits",
      key: "maxCredits",
    },
    {
      title: "Priority Weight",
      key: "priorityWeight",
      render: (_: unknown, record: RegistrationCreditLimit) => (
        <Tag color={record.priorityWeight > 0 ? "blue" : "default"}>
          {record.priorityWeight}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 100,
      render: (_: unknown, record: RegistrationCreditLimit) => (
        <Flex align="center" justify="flex-end" gap={4}>
          <PermissionGuard
            permission={Permission.RegistrationCreditLimitsUpdate}
          >
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => onEdit(record)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard
            permission={Permission.RegistrationCreditLimitsDelete}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={
                <DeleteOutlined
                  style={{ fontSize: 16, color: token.colorError }}
                />
              }
              onClick={() => onDelete(record)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={limits}
      columns={columns}
      pagination={pagination}
    />
  );
}
