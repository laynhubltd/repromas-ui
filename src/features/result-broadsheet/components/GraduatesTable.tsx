import { Table } from "@/components/ui-kit";
import { Alert, Card, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { GraduatedStudent } from "../types/result-broadsheet";
import { formatCgpa } from "../utils/formatters";

export interface GraduatesTableProps {
  graduatedStudents: GraduatedStudent[];
  classificationFootnote?: string;
  isLoading?: boolean;
}

export function GraduatesTable({
  graduatedStudents,
  classificationFootnote,
  isLoading = false,
}: GraduatesTableProps) {
  const columns: ColumnsType<GraduatedStudent> = [
    {
      title: "S/N",
      dataIndex: "serialNumber",
      key: "serialNumber",
      width: 50,
      align: "center",
      render: (val: number, _: unknown, idx: number) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {val ?? idx + 1}
        </span>
      ),
    },
    {
      title: "Matric Number",
      dataIndex: "matricNumber",
      key: "matricNumber",
      width: 140,
      render: (val: string) => (
        <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
          {val}
        </Typography.Text>
      ),
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      ellipsis: true,
    },
    {
      title: "CGPA",
      dataIndex: "cgpa",
      key: "cgpa",
      width: 90,
      align: "right",
      render: (val: number) => (
        <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCgpa(val)}
        </Typography.Text>
      ),
    },
    {
      title: "Class of Degree",
      dataIndex: "classOfDegree",
      key: "classOfDegree",
      width: 180,
      render: (val: string) => <Typography.Text>{val || "—"}</Typography.Text>,
    },
    {
      title: "Graduation Session",
      dataIndex: "graduationSession",
      key: "graduationSession",
      width: 150,
      render: (val: string) => val || "—",
    },
  ];

  return (
    <Card
      size="small"
      title={<Typography.Text strong>Graduated Students (Degree Clearance)</Typography.Text>}
      styles={{ body: { padding: 0 } }}
    >
      <Table<GraduatedStudent>
        size="sm"
        loading={isLoading}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        columns={columns}
        dataSource={graduatedStudents}
        rowKey="matricNumber"
      />
      {classificationFootnote && (
        <div style={{ padding: "12px 16px" }}>
          <Alert
            message={classificationFootnote}
            type="info"
            showIcon
            style={{ fontSize: 13 }}
          />
        </div>
      )}
    </Card>
  );
}
