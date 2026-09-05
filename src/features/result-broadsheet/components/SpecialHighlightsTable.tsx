import { Table } from "@/components/ui-kit";
import { Card, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { BroadsheetRow, SpecialHighlight } from "../types/result-broadsheet";
import { formatCgpa } from "../utils/formatters";

export interface SpecialHighlightsTableProps {
  specialHighlights: SpecialHighlight[];
  rows?: BroadsheetRow[];
  isLoading?: boolean;
}

export function SpecialHighlightsTable({
  specialHighlights,
  rows = [],
  isLoading = false,
}: SpecialHighlightsTableProps) {
  const columns: ColumnsType<SpecialHighlight> = [
    {
      title: "#",
      key: "rank",
      width: 50,
      align: "center",
      render: (_: unknown, __: unknown, idx: number) => idx + 1,
    },
    {
      title: "Matric Number",
      dataIndex: "matricNumber",
      key: "matricNumber",
      width: 150,
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
      render: (val: string | undefined, record: SpecialHighlight) => {
        if (val) return val;
        const matchedRow = rows.find((r) => r.matricNumber === record.matricNumber);
        return matchedRow?.fullName || "—";
      },
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
  ];

  return (
    <Card
      size="small"
      title={<Typography.Text strong>Special Highlights (Top Performers)</Typography.Text>}
      styles={{ body: { padding: 0 } }}
    >
      <Table<SpecialHighlight>
        size="sm"
        loading={isLoading}
        pagination={false}
        columns={columns}
        dataSource={specialHighlights}
        rowKey="matricNumber"
      />
    </Card>
  );
}
