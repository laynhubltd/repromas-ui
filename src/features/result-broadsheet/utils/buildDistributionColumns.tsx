import { Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { GradeDistributionItem } from "../types/result-broadsheet";

export interface BuildDistributionColumnsOptions {
  gradeLetters: string[];
  hasUnknownCount?: boolean;
}

export function buildDistributionColumns({
  gradeLetters,
  hasUnknownCount = false,
}: BuildDistributionColumnsOptions): ColumnsType<GradeDistributionItem> {
  const baseColumns: ColumnsType<GradeDistributionItem> = [
    {
      title: "Course Code",
      dataIndex: "courseCode",
      key: "courseCode",
      width: 120,
      fixed: "left",
      render: (val: string) => <Typography.Text strong>{val}</Typography.Text>,
    },
    {
      title: "Course Title",
      dataIndex: "courseTitle",
      key: "courseTitle",
      ellipsis: true,
    },
    {
      title: "CU",
      dataIndex: "creditUnit",
      key: "creditUnit",
      width: 60,
      align: "center",
      render: (val: number) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{val}</span>
      ),
    },
  ];

  const letterColumns: ColumnsType<GradeDistributionItem> = gradeLetters.map(
    (letter) => ({
      title: letter,
      key: `letter_${letter}`,
      width: 56,
      align: "center",
      render: (_: unknown, row: GradeDistributionItem) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {row.letterCounts?.[letter] ?? 0}
        </span>
      ),
    }),
  );

  const unknownColumn: ColumnsType<GradeDistributionItem> = hasUnknownCount
    ? [
        {
          title: (
            <Tooltip title="Unmapped or unclassified grades">
              <span style={{ cursor: "help", borderBottom: "1px dotted #8c8c8c" }}>
                ?
              </span>
            </Tooltip>
          ),
          key: "unknownCount",
          width: 56,
          align: "center",
          render: (_: unknown, row: GradeDistributionItem) => (
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {row.unknownCount ?? 0}
            </span>
          ),
        },
      ]
    : [];

  const totalColumn: ColumnsType<GradeDistributionItem> = [
    {
      title: "Total Sat",
      dataIndex: "totalSat",
      key: "totalSat",
      width: 90,
      align: "center",
      render: (val: number) => (
        <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
          {val ?? 0}
        </Typography.Text>
      ),
    },
  ];

  return [...baseColumns, ...letterColumns, ...unknownColumn, ...totalColumn];
}
