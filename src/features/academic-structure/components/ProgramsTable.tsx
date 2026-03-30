import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Table } from "antd";
import type { Program } from "../types";

export interface ProgramsTableProps {
  programs: Program[];
  onAddProgram?: () => void;
  onProgramDetails?: (program: Program) => void;
}

export function ProgramsTable({
  programs,
  onAddProgram,
  onProgramDetails,
}: ProgramsTableProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  const columns = [
    {
      title: "Program name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span style={{ fontWeight: 500, fontSize: token.fontSizeSM }}>{name}</span>
      ),
    },
    {
      title: "Degree title",
      dataIndex: "degreeTitle",
      key: "degreeTitle",
      render: (text: string) => (
        <span style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {text}
        </span>
      ),
    },
    {
      title: "Duration (years)",
      dataIndex: "durationInYears",
      key: "durationInYears",
      width: 100,
      render: (years: number) => (
        <span style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {years}
        </span>
      ),
    },
    {
      title: "UTME min units",
      dataIndex: "utmeMinimumTotalUnit",
      key: "utmeMinimumTotalUnit",
      width: 110,
      render: (val: number) => (
        <span style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {val ?? "—"}
        </span>
      ),
    },
    {
      title: "DE min units",
      dataIndex: "deMinimumTotalUnit",
      key: "deMinimumTotalUnit",
      width: 100,
      render: (val: number) => (
        <span style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {val ?? "—"}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 100,
      align: "right" as const,
      render: (_: unknown, record: Program) => (
        <Button
          type="link"
          size="small"
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: 0,
          }}
          onClick={() => onProgramDetails?.(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 8 : 0,
          paddingTop: 16,
          paddingBottom: 12,
          marginBottom: 8,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <span
          style={{
            fontSize: isMobile ? 9 : 10,
            fontWeight: 700,
            color: token.colorTextSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
          }}
        >
          Academic Programs
        </span>
        {onAddProgram && (
          <Button
            type="default"
            size="small"
            icon={<PlusOutlined />}
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
            onClick={onAddProgram}
          >
            Add Program
          </Button>
        )}
      </div>
      <div style={{ overflowX: "auto" }}>
        <Table
          size="small"
          dataSource={programs}
          columns={columns}
          rowKey="id"
          pagination={false}
          showHeader={true}
          style={{ fontSize: isMobile ? token.fontSizeSM - 1 : token.fontSizeSM, minWidth: isMobile ? 400 : undefined }}
          scroll={isMobile ? { x: 400 } : undefined}
        />
      </div>
    </div>
  );
}
