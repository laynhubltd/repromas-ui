import { Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
  BroadsheetCourseColumn,
  BroadsheetRow,
} from "../types/result-broadsheet";
import { formatCgpa, formatGpa } from "./formatters";

export interface BuildMatrixColumnsOptions {
  courses: BroadsheetCourseColumn[];
  visibleCourseCodes?: string[];
  colorError?: string;
}

export function buildMatrixColumns({
  courses,
  visibleCourseCodes,
  colorError = "#ff4d4f",
}: BuildMatrixColumnsOptions): ColumnsType<BroadsheetRow> {
  const visibleCourses = visibleCourseCodes
    ? courses.filter((c) => {
        const code = c.courseCode ?? c.code ?? "";
        return visibleCourseCodes.includes(code);
      })
    : courses;

  const leftColumns: ColumnsType<BroadsheetRow> = [
    {
      title: "#",
      dataIndex: "serialNumber",
      key: "serialNumber",
      width: 50,
      fixed: "left",
      align: "center",
      render: (val: number, _row: BroadsheetRow, idx: number) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {val ?? idx + 1}
        </span>
      ),
    },
    {
      title: "Reg No",
      dataIndex: "matricNumber",
      key: "matricNumber",
      width: 150,
      fixed: "left",
      sorter: (a, b) => a.matricNumber.localeCompare(b.matricNumber),
      render: (val: string) => (
        <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
          {val}
        </Typography.Text>
      ),
    },
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 190,
      fixed: "left",
      ellipsis: true,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
  ];

  const courseColumns: ColumnsType<BroadsheetRow> = visibleCourses.map((course) => {
    const courseCode = course.courseCode ?? course.code ?? "";
    const creditUnits = course.creditUnits ?? course.creditUnit ?? 0;

    return {
      title: `${courseCode} (${creditUnits}u)`,
      key: `course_${courseCode}`,
      align: "center",
      children: [
        {
          title: "SC",
          key: `sc_${courseCode}`,
          width: 52,
          align: "center",
          render: (_: unknown, row: BroadsheetRow) => {
            const g = row.grades?.[courseCode];
            if (!g || g.isRegistered === false || g.grade === "NR") {
              return <span style={{ color: "#bfbfbf" }}>—</span>;
            }
            const isFail = g.isPass === false || g.status === "FAIL";
            return (
              <span
                style={{
                  color: isFail ? colorError : undefined,
                  fontWeight: isFail ? 600 : undefined,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {g.score !== null && g.score !== undefined ? g.score : "—"}
              </span>
            );
          },
        },
        {
          title: "GP",
          key: `gp_${courseCode}`,
          width: 48,
          align: "center",
          render: (_: unknown, row: BroadsheetRow) => {
            const g = row.grades?.[courseCode];
            if (!g || g.isRegistered === false || g.grade === "NR" || g.gradePoint === null || g.gradePoint === undefined) {
              return <span style={{ color: "#bfbfbf" }}>—</span>;
            }
            return (
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {g.gradePoint}
              </span>
            );
          },
        },
        {
          title: "NP",
          key: `np_${courseCode}`,
          width: 48,
          align: "center",
          render: (_: unknown, row: BroadsheetRow) => {
            const g = row.grades?.[courseCode];
            if (!g || g.isRegistered === false || g.grade === "NR" || g.netPoint === null || g.netPoint === undefined) {
              return <span style={{ color: "#bfbfbf" }}>—</span>;
            }
            return (
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {g.netPoint}
              </span>
            );
          },
        },
      ],
    };
  });

  const rightColumns: ColumnsType<BroadsheetRow> = [
    {
      title: "TCU",
      dataIndex: ["summary", "tcu"],
      key: "tcu",
      width: 52,
      align: "center",
      render: (val: number) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{val ?? 0}</span>
      ),
    },
    {
      title: "TNP",
      dataIndex: ["summary", "tnp"],
      key: "tnp",
      width: 56,
      align: "center",
      render: (val: number) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{val ?? 0}</span>
      ),
    },
    {
      title: "PCGPA",
      dataIndex: ["summary", "pcgpa"],
      key: "pcgpa",
      width: 64,
      align: "right",
      render: (val: number | null | undefined) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCgpa(val)}
        </span>
      ),
    },
    {
      title: "GPA",
      dataIndex: ["summary", "gpa"],
      key: "gpa",
      width: 64,
      align: "right",
      render: (val: number) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatGpa(val)}
        </span>
      ),
    },
    {
      title: "CGPA",
      dataIndex: ["summary", "cgpa"],
      key: "cgpa",
      width: 68,
      align: "right",
      sorter: (a, b) => a.summary.cgpa - b.summary.cgpa,
      render: (val: number) => (
        <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCgpa(val)}
        </Typography.Text>
      ),
    },
    {
      title: "Remark",
      key: "remark",
      width: 180,
      fixed: "right",
      render: (_: unknown, row: BroadsheetRow) => {
        const s = row.summary;
        const standingText = s?.academicStanding || s?.remark || "—";
        const carryovers = s?.unclearedCarryovers ?? s?.carryoverCourses ?? [];

        return (
          <div>
            <div>{standingText}</div>
            {carryovers.length > 0 && (
              <div style={{ marginTop: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                {carryovers.map((code) => (
                  <Tag key={code} color="error" style={{ fontSize: 10, margin: 0 }}>
                    {code}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return [...leftColumns, ...courseColumns, ...rightColumns];
}
