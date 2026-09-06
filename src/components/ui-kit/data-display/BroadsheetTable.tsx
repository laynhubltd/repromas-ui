import { AppstoreOutlined, SearchOutlined, TableOutlined } from "@ant-design/icons";
import { Button, Empty, Input, Segmented, Typography, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/useBreakpoint";
import type { UIComponentDensity, UIComponentSize, UIComponentState } from "../foundation";
import { BroadsheetStudentCard } from "./BroadsheetStudentCard";
import { Table, type TableEmptyState, type TableHeaderConfig } from "./Table";
import { createSearchableColumnProps, renderHighlightedText } from "./tableSearch";
import "./data-display.css";

export type BroadsheetCellMode =
  | "score-gp-np"    // NBTE Polytechnic: SC, GR, GP, NP
  | "score-grade-gp" // NUC University: SC, Grade, GP
  | "score-grade"    // Compact: SC, Grade
  | "score-only";    // Minimal: SC only

export type BroadsheetViewMode = "auto" | "matrix" | "cards";

export interface BroadsheetCourseColumnDef {
  configId?: number;
  courseId?: number;
  id?: number;
  code?: string;
  courseCode?: string;
  title?: string;
  courseTitle?: string;
  creditUnit?: number;
  creditUnits?: number;
  courseStatus?: string;
  levelId?: number;
}

export interface BroadsheetGradeValue {
  grade?: string;
  gradeLetter?: string;
  score: number | null;
  gradePoint: number | null;
  netPoint: number | null;
  isPass?: boolean;
  isRegistered?: boolean;
  status?: string | null;
}

export interface BroadsheetSummaryValue {
  tcu: number;
  tnp: number;
  pcgpa?: number | null;
  gpa: number;
  cgpa: number;
  totalEarnedUnits?: number;
  remark: string;
  academicStanding?: string;
  standingCategory?: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | string;
  academicStandingCategory?: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | string;
  carryoverCourses?: string[];
  unclearedCarryovers?: string[];
}

export interface BroadsheetRowBase {
  serialNumber?: number;
  studentId?: number;
  matricNumber: string;
  fullName: string;
  grades?: Record<string, BroadsheetGradeValue>;
  summary?: BroadsheetSummaryValue;
}

export interface BroadsheetTableLabels {
  serialLabel?: string;
  registrationNoLabel?: string;
  nameLabel?: string;
  tcuLabel?: string;
  tnpLabel?: string;
  pcgpaLabel?: string;
  gpaLabel?: string;
  cgpaLabel?: string;
  remarkLabel?: string;
}

export interface BroadsheetTableProps<RecordType extends object = BroadsheetRowBase> {
  courses: BroadsheetCourseColumnDef[];
  rows: RecordType[];
  visibleCourseCodes?: string[];
  cellMode?: BroadsheetCellMode;
  viewMode?: BroadsheetViewMode;
  showViewToggle?: boolean;
  batchSize?: number;
  labels?: BroadsheetTableLabels;
  showStudentName?: boolean;
  searchableColumns?: Array<"registrationNo" | "name">;
  freezeLeftCount?: number; // 1: S/N, 2: S/N + RegNo, 3: S/N + RegNo + Name (default: 2)
  freezeSummary?: boolean; // default: true (auto-degrades to false if rows > virtualThreshold)
  virtualThreshold?: number; // default: 400
  watermarkText?: string;
  header?: TableHeaderConfig;
  loading?: boolean;
  state?: UIComponentState;
  size?: UIComponentSize;
  density?: UIComponentDensity;
  emptyState?: TableEmptyState;
  className?: string;
  style?: CSSProperties;
  tableClassName?: string;
  tableStyle?: CSSProperties;
  scrollY?: number | string;
  "data-testid"?: string;
  cardRenderer?: (row: RecordType, index: number) => ReactNode;
  renderStandingBadge?: (summary: BroadsheetSummaryValue, row: RecordType) => ReactNode;
  onGradeCellClick?: (student: RecordType, courseCode: string) => void;
}

function format2dp(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) {
    return "—";
  }
  return Number(val).toFixed(2);
}

function format1or2dp(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) {
    return "—";
  }
  const num = Number(val);
  return Number.isInteger(num) ? `${num}.0` : num.toFixed(1);
}

const VIEW_MODE_STORAGE_KEY = "repromas_broadsheet_view_mode";

function getInitialMobileViewMode(): "cards" | "matrix" {
  try {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === "cards" || saved === "matrix") {
      return saved;
    }
  } catch {
    // localStorage may be unavailable
  }
  return "cards";
}

export function BroadsheetTable<RecordType extends object = BroadsheetRowBase>({
  courses,
  rows,
  visibleCourseCodes,
  cellMode = "score-gp-np",
  viewMode = "auto",
  showViewToggle = true,
  batchSize = 24,
  labels,
  showStudentName = false,
  searchableColumns = ["registrationNo", "name"],
  freezeLeftCount = 2,
  freezeSummary = true,
  virtualThreshold = 400,
  watermarkText,
  header,
  loading = false,
  state,
  size = "sm",
  density = "ledger",
  emptyState,
  className,
  style,
  tableClassName,
  tableStyle,
  scrollY = 650,
  "data-testid": dataTestId,
  cardRenderer,
  renderStandingBadge,
  onGradeCellClick,
}: BroadsheetTableProps<RecordType>) {
  const { token } = theme.useToken();
  const isMobile = useIsMobile();
  const [mobileViewMode, setMobileViewMode] = useState<"cards" | "matrix">(getInitialMobileViewMode);
  const [mobileQuery, setMobileQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const isHighVolume = rows.length > virtualThreshold;
  const shouldFreezeSummary = freezeSummary && !isHighVolume;

  const handleMobileViewModeChange = (val: string | number) => {
    const mode = val === "matrix" ? "matrix" : "cards";
    setMobileViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // localStorage may be unavailable
    }
  };

  const isCardsActive =
    viewMode === "cards" || (viewMode === "auto" && isMobile && mobileViewMode === "cards");

  const handleQueryChange = (key: string, query: string) => {
    setSearchQueries((prev) => {
      if (!query) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: query };
    });
  };

  const visibleCourses = useMemo(() => {
    if (!visibleCourseCodes) return courses;
    return courses.filter((c) => {
      const code = c.courseCode ?? c.code ?? "";
      return visibleCourseCodes.includes(code);
    });
  }, [courses, visibleCourseCodes]);

  const columns = useMemo(() => {
    const serialLabel = labels?.serialLabel ?? "#";
    const regLabel = labels?.registrationNoLabel ?? "Reg No";
    const nameLabel = labels?.nameLabel ?? "Name";
    const tcuLabel = labels?.tcuLabel ?? "TCU";
    const tnpLabel = labels?.tnpLabel ?? "TNP";
    const pcgpaLabel = labels?.pcgpaLabel ?? "PCGPA";
    const gpaLabel = labels?.gpaLabel ?? "GPA";
    const cgpaLabel = labels?.cgpaLabel ?? "CGPA";
    const remarkLabel = labels?.remarkLabel ?? "Remark/Carryovers";

    const isRegSearchable = searchableColumns?.includes("registrationNo");
    const isNameSearchable = searchableColumns?.includes("name");

    const regSearchProps = isRegSearchable
      ? createSearchableColumnProps<RecordType>({
          dataIndex: "matricNumber",
          label: regLabel,
          currentQuery: searchQueries.registrationNo,
          onQueryChange: (q) => handleQueryChange("registrationNo", q),
          colorPrimary: token.colorPrimary,
        })
      : {};

    const nameSearchProps = isNameSearchable
      ? createSearchableColumnProps<RecordType>({
          dataIndex: "fullName",
          label: nameLabel,
          currentQuery: searchQueries.name,
          onQueryChange: (q) => handleQueryChange("name", q),
          colorPrimary: token.colorPrimary,
        })
      : {};

    // Left frozen columns
    const leftColumns: ColumnsType<RecordType> = [
      {
        title: <span style={{ fontWeight: 600 }}>{serialLabel}</span>,
        dataIndex: "serialNumber",
        key: "serialNumber",
        width: 40,
        fixed: freezeLeftCount >= 1 ? "left" : undefined,
        align: "right",
        render: (val: number | undefined, _row: RecordType, idx: number) => (
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {val ?? idx + 1}
          </span>
        ),
      },
      {
        title: <span style={{ fontWeight: 600 }}>{regLabel}</span>,
        dataIndex: "matricNumber",
        key: "matricNumber",
        width: showStudentName ? 116 : 200,
        fixed: freezeLeftCount >= 2 ? "left" : undefined,
        align: "left",
        ...regSearchProps,
        onHeaderCell: () => ({
          className: showStudentName ? undefined : "ui-kit-broadsheet-header--section-end",
        }),
        onCell: () => ({
          className: showStudentName ? undefined : "ui-kit-broadsheet-cell--section-end",
        }),
        sorter: (a: unknown, b: unknown) => {
          const aMat = (a as BroadsheetRowBase).matricNumber || "";
          const bMat = (b as BroadsheetRowBase).matricNumber || "";
          return aMat.localeCompare(bMat);
        },
        render: (val: string) => (
          <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
            {renderHighlightedText(val, searchQueries.registrationNo)}
          </Typography.Text>
        ),
      },
      ...(showStudentName
        ? [
            {
              title: <span style={{ fontWeight: 600 }}>{nameLabel}</span>,
              dataIndex: "fullName",
              key: "fullName",
              width: 190,
              fixed: freezeLeftCount >= 3 ? "left" : undefined,
              align: "left" as const,
              ellipsis: { showTitle: true },
              ...nameSearchProps,
              onHeaderCell: () => ({
                className: "ui-kit-broadsheet-header--section-end",
              }),
              onCell: () => ({
                className: "ui-kit-broadsheet-cell--section-end",
              }),
              sorter: (a: unknown, b: unknown) => {
                const aName = (a as BroadsheetRowBase).fullName || "";
                const bName = (b as BroadsheetRowBase).fullName || "";
                return aName.localeCompare(bName);
              },
              render: (val: string) =>
                renderHighlightedText(val, searchQueries.name),
            },
          ]
        : []),
    ];

    // Center 3-tier grouped course columns
    const courseColumns: ColumnsType<RecordType> = visibleCourses.map((course) => {
      const courseCode = course.courseCode ?? course.code ?? "";
      const creditUnits = course.creditUnits ?? course.creditUnit ?? 0;

      // Define leaf sub-columns based on cellMode
      const buildLeaves = () => {
        if (cellMode === "score-gp-np") {
          return [
            {
              title: <span className="ui-kit-broadsheet-header--metric">SC</span>,
              key: `sc_${courseCode}`,
              width: 40,
              align: "center" as const,
              onCell: (row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                const isFail =
                  g &&
                  g.isRegistered !== false &&
                  g.grade !== "NR" &&
                  (g.isPass === false ||
                    g.status === "FAIL" ||
                    (g.score !== null && g.score < 40) ||
                    g.gradePoint === 0);
                return {
                  className: isFail ? "ui-kit-broadsheet-cell--fail" : undefined,
                };
              },
              render: (_: unknown, row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                if (!g || g.isRegistered === false || g.grade === "NR") {
                  return <span style={{ color: "#8c8c8c" }}>—</span>;
                }
                return (
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {g.score !== null && g.score !== undefined ? g.score : "—"}
                  </span>
                );
              },
            },
            {
              title: <span className="ui-kit-broadsheet-header--metric">GR</span>,
              key: `gr_${courseCode}`,
              width: 40,
              align: "center" as const,
              render: (_: unknown, row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                const gradeStr = g?.gradeLetter ?? g?.grade;
                if (!g || g.isRegistered === false || gradeStr === "NR" || !gradeStr) {
                  return <span style={{ color: "#8c8c8c" }}>—</span>;
                }
                return <span style={{ fontWeight: 600 }}>{gradeStr}</span>;
              },
            },
            {
              title: <span className="ui-kit-broadsheet-header--metric">GP</span>,
              key: `gp_${courseCode}`,
              width: 46,
              align: "right" as const,
              render: (_: unknown, row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                if (!g || g.isRegistered === false || g.grade === "NR" || g.gradePoint === null || g.gradePoint === undefined) {
                  return <span style={{ color: "#8c8c8c" }}>—</span>;
                }
                return (
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {format2dp(g.gradePoint)}
                  </span>
                );
              },
            },
            {
              title: <span className="ui-kit-broadsheet-header--metric">NP</span>,
              key: `np_${courseCode}`,
              width: 46,
              align: "right" as const,
              onHeaderCell: () => ({
                className: "ui-kit-broadsheet-header--course-end",
              }),
              onCell: () => ({
                className: "ui-kit-broadsheet-cell--course-end",
              }),
              render: (_: unknown, row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                if (!g || g.isRegistered === false || g.grade === "NR" || g.netPoint === null || g.netPoint === undefined) {
                  return <span style={{ color: "#8c8c8c" }}>—</span>;
                }
                return (
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {format1or2dp(g.netPoint)}
                  </span>
                );
              },
            },
          ];
        }

        if (cellMode === "score-grade-gp") {
          return [
            {
              title: <span className="ui-kit-broadsheet-header--metric">SC</span>,
              key: `sc_${courseCode}`,
              width: 40,
              align: "center" as const,
              onCell: (row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                const isFail =
                  g &&
                  g.isRegistered !== false &&
                  g.grade !== "NR" &&
                  (g.isPass === false ||
                    g.status === "FAIL" ||
                    (g.score !== null && g.score < 40) ||
                    g.gradePoint === 0);
                return {
                  className: isFail ? "ui-kit-broadsheet-cell--fail" : undefined,
                };
              },
              render: (_: unknown, row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                if (!g || g.isRegistered === false || g.grade === "NR") {
                  return <span style={{ color: "#8c8c8c" }}>—</span>;
                }
                return (
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {g.score !== null && g.score !== undefined ? g.score : "—"}
                  </span>
                );
              },
            },
            {
              title: <span className="ui-kit-broadsheet-header--metric">GR</span>,
              key: `gr_${courseCode}`,
              width: 40,
              align: "center" as const,
              render: (_: unknown, row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                const gradeStr = g?.gradeLetter ?? g?.grade;
                if (!g || g.isRegistered === false || gradeStr === "NR" || !gradeStr) {
                  return <span style={{ color: "#8c8c8c" }}>—</span>;
                }
                return <span style={{ fontWeight: 600 }}>{gradeStr}</span>;
              },
            },
            {
              title: <span className="ui-kit-broadsheet-header--metric">GP</span>,
              key: `gp_${courseCode}`,
              width: 46,
              align: "right" as const,
              onHeaderCell: () => ({
                className: "ui-kit-broadsheet-header--course-end",
              }),
              onCell: () => ({
                className: "ui-kit-broadsheet-cell--course-end",
              }),
              render: (_: unknown, row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                if (!g || g.isRegistered === false || g.grade === "NR" || g.gradePoint === null || g.gradePoint === undefined) {
                  return <span style={{ color: "#8c8c8c" }}>—</span>;
                }
                return (
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {format2dp(g.gradePoint)}
                  </span>
                );
              },
            },
          ];
        }

        if (cellMode === "score-grade") {
          return [
            {
              title: <span className="ui-kit-broadsheet-header--metric">SC</span>,
              key: `sc_${courseCode}`,
              width: 40,
              align: "center" as const,
              onCell: (row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                const isFail =
                  g &&
                  g.isRegistered !== false &&
                  g.grade !== "NR" &&
                  (g.isPass === false ||
                    g.status === "FAIL" ||
                    (g.score !== null && g.score < 40));
                return {
                  className: isFail ? "ui-kit-broadsheet-cell--fail" : undefined,
                };
              },
              render: (_: unknown, row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                if (!g || g.isRegistered === false || g.grade === "NR") {
                  return <span style={{ color: "#8c8c8c" }}>—</span>;
                }
                return (
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {g.score !== null && g.score !== undefined ? g.score : "—"}
                  </span>
                );
              },
            },
            {
              title: <span className="ui-kit-broadsheet-header--metric">GR</span>,
              key: `gr_${courseCode}`,
              width: 40,
              align: "center" as const,
              onHeaderCell: () => ({
                className: "ui-kit-broadsheet-header--course-end",
              }),
              onCell: () => ({
                className: "ui-kit-broadsheet-cell--course-end",
              }),
              render: (_: unknown, row: RecordType) => {
                const g = (row as BroadsheetRowBase).grades?.[courseCode];
                const gradeStr = g?.gradeLetter ?? g?.grade;
                if (!g || g.isRegistered === false || gradeStr === "NR" || !gradeStr) {
                  return <span style={{ color: "#8c8c8c" }}>—</span>;
                }
                return <span style={{ fontWeight: 600 }}>{gradeStr}</span>;
              },
            },
          ];
        }

        // cellMode === "score-only"
        return [
          {
            title: <span className="ui-kit-broadsheet-header--metric">SC</span>,
            key: `sc_${courseCode}`,
            width: 44,
            align: "center" as const,
            onHeaderCell: () => ({
              className: "ui-kit-broadsheet-header--course-end",
            }),
            onCell: (row: RecordType) => {
              const g = (row as BroadsheetRowBase).grades?.[courseCode];
              const isFail =
                g &&
                g.isRegistered !== false &&
                g.grade !== "NR" &&
                (g.isPass === false ||
                  g.status === "FAIL" ||
                  (g.score !== null && g.score < 40));
              return {
                className: isFail
                  ? "ui-kit-broadsheet-cell--fail ui-kit-broadsheet-cell--course-end"
                  : "ui-kit-broadsheet-cell--course-end",
              };
            },
            render: (_: unknown, row: RecordType) => {
              const g = (row as BroadsheetRowBase).grades?.[courseCode];
              if (!g || g.isRegistered === false || g.grade === "NR") {
                return <span style={{ color: "#8c8c8c" }}>—</span>;
              }
              return (
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {g.score !== null && g.score !== undefined ? g.score : "—"}
                </span>
              );
            },
          },
        ];
      };

      return {
        title: <span className="ui-kit-broadsheet-header--cc">{courseCode}</span>,
        key: `course_${courseCode}`,
        align: "center" as const,
        onHeaderCell: () => ({
          className: "ui-kit-broadsheet-header--course-end",
        }),
        children: [
          {
            title: (
              <span className="ui-kit-broadsheet-header--cu">
                {creditUnits} CU
              </span>
            ),
            key: `cu_${courseCode}`,
            align: "center" as const,
            onHeaderCell: () => ({
              className: "ui-kit-broadsheet-header--course-end",
            }),
            children: buildLeaves(),
          },
        ],
      };
    });

    // Right summary columns
    const rightColumns: ColumnsType<RecordType> = [
      {
        title: <span style={{ fontWeight: 600 }}>{tcuLabel}</span>,
        dataIndex: ["summary", "tcu"],
        key: "tcu",
        width: 52,
        align: "right",
        // fixed: shouldFreezeSummary ? "right" : undefined,
        render: (val: number | undefined) => (
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{val ?? 0}</span>
        ),
      },
      {
        title: <span style={{ fontWeight: 600 }}>{tnpLabel}</span>,
        dataIndex: ["summary", "tnp"],
        key: "tnp",
        width: 52,
        align: "right",
        // fixed: shouldFreezeSummary ? "right" : undefined,
        render: (val: number | undefined) => (
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {format1or2dp(val)}
          </span>
        ),
      },
      {
        title: <span style={{ fontWeight: 600 }}>{pcgpaLabel}</span>,
        dataIndex: ["summary", "pcgpa"],
        key: "pcgpa",
        width: 56,
        align: "right",
        // fixed: shouldFreezeSummary ? "right" : undefined,
        render: (val: number | null | undefined) => (
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {format2dp(val)}
          </span>
        ),
      },
      {
        title: <span style={{ fontWeight: 600 }}>{gpaLabel}</span>,
        dataIndex: ["summary", "gpa"],
        key: "gpa",
        width: 56,
        align: "right",
        // fixed: shouldFreezeSummary ? "right" : undefined,
        render: (val: number | undefined) => (
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {format2dp(val)}
          </span>
        ),
      },
      {
        title: <span style={{ fontWeight: 600 }}>{cgpaLabel}</span>,
        dataIndex: ["summary", "cgpa"],
        key: "cgpa",
        width: 56,
        align: "right",
        // fixed: shouldFreezeSummary ? "right" : undefined,
        sorter: (a: unknown, b: unknown) => {
          const aCgpa = (a as BroadsheetRowBase).summary?.cgpa ?? 0;
          const bCgpa = (b as BroadsheetRowBase).summary?.cgpa ?? 0;
          return aCgpa - bCgpa;
        },
        render: (val: number | undefined) => (
          <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
            {format2dp(val)}
          </Typography.Text>
        ),
      },
      {
        title: <span style={{ fontWeight: 600 }}>{remarkLabel}</span>,
        key: "remark",
        width: 200,
        // fixed: shouldFreezeSummary ? "right" : undefined,
        ellipsis: { showTitle: true },
        render: (_: unknown, row: RecordType) => {
          const s = (row as BroadsheetRowBase).summary;
          const standingText = s?.academicStanding || s?.remark || "—";
          const carryovers = s?.unclearedCarryovers ?? s?.carryoverCourses ?? [];

          return (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ whiteSpace: "nowrap" }}>{standingText}</span>
              {carryovers.length > 0 && (
                <div style={{ display: "inline-flex", flexWrap: "nowrap", gap: 3 }}>
                  {carryovers.map((code) => (
                    <span key={code} className="ui-kit-broadsheet-chip--fail">
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        },
      },
    ];

    return [...leftColumns, ...courseColumns, ...rightColumns];
  }, [
    visibleCourses,
    cellMode,
    labels,
    showStudentName,
    searchableColumns,
    searchQueries,
    token.colorPrimary,
    freezeLeftCount,
    shouldFreezeSummary,
  ]);

  // Compute total horizontal scroll width based on exact column widths
  const computedScrollWidth = useMemo(() => {
    const leftWidth = 40 + (showStudentName ? 116 + 190 : 200);
    const rightWidth = 52 + 52 + 56 + 56 + 56 + 200; // 472px
    let courseBlockWidth = 172; // 40 + 40 + 46 + 46 for score-gp-np (SC, GR, GP, NP)
    if (cellMode === "score-grade-gp") courseBlockWidth = 126; // 40 + 40 + 46
    if (cellMode === "score-grade") courseBlockWidth = 80; // 40 + 40
    if (cellMode === "score-only") courseBlockWidth = 44;

    const totalWidth = leftWidth + visibleCourses.length * courseBlockWidth + rightWidth;
    return Math.max(totalWidth, 1100);
  }, [visibleCourses.length, cellMode, showStudentName]);

  const filteredCardRows = useMemo(() => {
    const trimmed = mobileQuery.trim().toLowerCase();
    if (!trimmed) return rows;
    return rows.filter((r) => {
      const row = r as BroadsheetRowBase;
      const mat = (row.matricNumber || "").toLowerCase();
      const name = (row.fullName || "").toLowerCase();
      return mat.includes(trimmed) || name.includes(trimmed);
    });
  }, [rows, mobileQuery]);

  const activeQueries = Object.entries(searchQueries).filter(([_, q]) =>
    Boolean(q?.trim()),
  );

  if (isCardsActive) {
    return (
      <div
        className={className}
        style={{
          position: "relative",
          width: "100%",
          ...style,
        }}
        data-testid={dataTestId}
      >
        {watermarkText ? (
          <div className="ui-kit-broadsheet-watermark">{watermarkText}</div>
        ) : null}

        {/* Mobile Cards Toolbar: Unified Search + View Mode Switcher */}
        <div className="ui-kit-broadsheet-mobile-toolbar">
          <Input
            placeholder="Search Reg No or Name..."
            prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
            allowClear
            value={mobileQuery}
            onChange={(e) => {
              setMobileQuery(e.target.value);
              setVisibleCount(batchSize);
            }}
            style={{ maxWidth: showViewToggle ? 280 : "100%", flex: 1 }}
            data-testid="broadsheet-mobile-search-input"
          />
          {showViewToggle && (
            <Segmented
              value={mobileViewMode}
              onChange={handleMobileViewModeChange}
              options={[
                { label: "Cards", value: "cards", icon: <AppstoreOutlined /> },
                { label: "Table", value: "matrix", icon: <TableOutlined /> },
              ]}
              data-testid="broadsheet-view-mode-toggle"
            />
          )}
        </div>

        {/* Active Search Banner in Cards View */}
        {mobileQuery.trim() && (
          <div className="ui-kit-table-search__filter-bar" data-testid="table-search-filter-bar">
            <span>
              Search filter active: "{mobileQuery.trim()}" ({filteredCardRows.length}{" "}
              {filteredCardRows.length === 1 ? "match" : "matches"})
            </span>
            <Button
              type="link"
              size="small"
              onClick={() => {
                setMobileQuery("");
                setVisibleCount(batchSize);
              }}
              style={{ padding: 0 }}
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Student Cards Semantic List */}
        {filteredCardRows.length === 0 ? (
          <Empty description={emptyState?.description ?? "No students found"} />
        ) : (
          <>
            <ul role="list" className="ui-kit-broadsheet-cards-list">
              {filteredCardRows.slice(0, visibleCount).map((row, idx) => {
                if (cardRenderer) {
                  return cardRenderer(row, idx);
                }
                return (
                  <BroadsheetStudentCard<RecordType>
                    key={(row as BroadsheetRowBase).matricNumber || idx}
                    row={row}
                    index={idx}
                    courses={visibleCourses}
                    visibleCourseCodes={visibleCourseCodes}
                    cellMode={cellMode}
                    searchQuery={mobileQuery}
                    labels={labels}
                    showStudentName={showStudentName}
                    renderStandingBadge={renderStandingBadge}
                    onGradeCellClick={onGradeCellClick}
                  />
                );
              })}
            </ul>

            {visibleCount < filteredCardRows.length && (
              <div className="ui-kit-broadsheet-load-more">
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Showing {Math.min(visibleCount, filteredCardRows.length)} of{" "}
                  {filteredCardRows.length} students
                </Typography.Text>
                <Button
                  onClick={() => setVisibleCount((prev) => prev + batchSize)}
                  data-testid="broadsheet-load-more-btn"
                >
                  Load more students
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        overflowX: "auto",
        ...style,
      }}
      data-testid={dataTestId}
    >
      {watermarkText ? (
        <div className="ui-kit-broadsheet-watermark">{watermarkText}</div>
      ) : null}

      {/* Switcher when in matrix view on mobile */}
      {showViewToggle && isMobile && viewMode === "auto" && (
        <div
          className="ui-kit-broadsheet-mobile-toolbar"
          style={{ justifyContent: "flex-end" }}
        >
          <Segmented
            value={mobileViewMode}
            onChange={handleMobileViewModeChange}
            options={[
              { label: "Cards", value: "cards", icon: <AppstoreOutlined /> },
              { label: "Table", value: "matrix", icon: <TableOutlined /> },
            ]}
            data-testid="broadsheet-view-mode-toggle"
          />
        </div>
      )}

      {activeQueries.length > 0 && (
        <div className="ui-kit-table-search__filter-bar" data-testid="table-search-filter-bar">
          <span>
            Search filter active:{" "}
            {activeQueries
              .map(([key, q]) => `"${q}"`)
              .join(", ")}
          </span>
          <Button
            type="link"
            size="small"
            onClick={() => setSearchQueries({})}
            style={{ padding: 0 }}
          >
            Clear search
          </Button>
        </div>
      )}

      <Table<RecordType>
        header={header}
        size={size}
        density={density}
        state={state}
        loading={loading}
        pagination={false}
        scroll={{ x: computedScrollWidth, y: scrollY }}
        columns={columns}
        dataSource={rows}
        rowKey="matricNumber"
        tableClassName={tableClassName}
        tableStyle={tableStyle}
        emptyState={emptyState}
      />
    </div>
  );
}

