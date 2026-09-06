import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Tag, Typography, theme } from "antd";
import { useMemo, useState, type ReactNode } from "react";
import type {
  BroadsheetCellMode,
  BroadsheetCourseColumnDef,
  BroadsheetRowBase,
  BroadsheetSummaryValue,
  BroadsheetTableLabels,
} from "./BroadsheetTable";
import { renderHighlightedText } from "./tableSearch";
import "./data-display.css";

export interface BroadsheetStudentCardProps<RecordType extends object = BroadsheetRowBase> {
  row: RecordType;
  index: number;
  courses: BroadsheetCourseColumnDef[];
  visibleCourseCodes?: string[];
  cellMode?: BroadsheetCellMode;
  searchQuery?: string;
  labels?: BroadsheetTableLabels;
  showStudentName?: boolean;
  renderStandingBadge?: (summary: BroadsheetSummaryValue, row: RecordType) => ReactNode;
  onGradeCellClick?: (student: RecordType, courseCode: string) => void;
  "data-testid"?: string;
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

export function BroadsheetStudentCard<RecordType extends object = BroadsheetRowBase>({
  row,
  index,
  courses,
  visibleCourseCodes,
  cellMode = "score-gp-np",
  searchQuery,
  labels,
  showStudentName = false,
  renderStandingBadge,
  onGradeCellClick,
  "data-testid": dataTestId,
}: BroadsheetStudentCardProps<RecordType>) {
  const { token } = theme.useToken();
  const [isExpanded, setIsExpanded] = useState(false);

  const student = row as BroadsheetRowBase;
  const summary = student.summary;

  const serialNum = student.serialNumber ?? index + 1;
  const matricNo = student.matricNumber || "—";
  const fullName = student.fullName || "—";

  const tcuLabel = labels?.tcuLabel ?? "TCU";
  const tnpLabel = labels?.tnpLabel ?? "TNP";
  const gpaLabel = labels?.gpaLabel ?? "GPA";
  const cgpaLabel = labels?.cgpaLabel ?? "CGPA";

  const carryovers = summary?.unclearedCarryovers ?? summary?.carryoverCourses ?? [];

  const visibleCourses = useMemo(() => {
    if (!visibleCourseCodes) return courses;
    return courses.filter((c) => {
      const code = c.courseCode ?? c.code ?? "";
      return visibleCourseCodes.includes(code);
    });
  }, [courses, visibleCourseCodes]);

  const defaultStandingBadge = useMemo(() => {
    if (!summary) return null;
    const category = summary.standingCategory ?? summary.academicStandingCategory;
    const standingText = summary.academicStanding || summary.remark || "—";

    let tagColor: string | undefined;
    if (category === "POSITIVE") {
      tagColor = "success";
    } else if (category === "NEGATIVE") {
      tagColor = "error";
    } else {
      tagColor = "default";
    }

    return (
      <Tag
        color={tagColor}
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: 11,
          lineHeight: "18px",
          padding: "0 6px",
        }}
      >
        {standingText}
      </Tag>
    );
  }, [summary]);

  const renderedStandingBadge = renderStandingBadge
    ? renderStandingBadge(summary ?? ({} as BroadsheetSummaryValue), row)
    : defaultStandingBadge;

  return (
    <li
      role="listitem"
      className="ui-kit-broadsheet-card"
      data-testid={dataTestId ?? `broadsheet-card-${matricNo}`}
    >
      {/* Card Header */}
      <div className="ui-kit-broadsheet-card__header">
        <div className="ui-kit-broadsheet-card__title-row">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="ui-kit-broadsheet-card__sn-badge">
              {serialNum}
            </span>
            <Typography.Text strong className="ui-kit-broadsheet-card__regno">
              {renderHighlightedText(matricNo, searchQuery)}
            </Typography.Text>
          </div>
          {renderedStandingBadge}
        </div>

        {(showStudentName || Boolean(student.fullName)) && (
          <div className="ui-kit-broadsheet-card__name">
            {renderHighlightedText(fullName, searchQuery)}
          </div>
        )}

        {carryovers.length > 0 && (
          <div className="ui-kit-broadsheet-card__carryovers">
            <Typography.Text
              type="secondary"
              style={{ fontSize: 11, marginRight: 4 }}
            >
              Carryovers:
            </Typography.Text>
            <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
              {carryovers.map((code) => (
                <span key={code} className="ui-kit-broadsheet-chip--fail">
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KPI Metrics Grid */}
      <div className="ui-kit-broadsheet-card__kpis">
        <div className="ui-kit-broadsheet-card__metric">
          <span className="ui-kit-broadsheet-card__metric-label">{tcuLabel}</span>
          <span className="ui-kit-broadsheet-card__metric-value">
            {summary?.tcu ?? "—"}
          </span>
        </div>
        <div className="ui-kit-broadsheet-card__metric">
          <span className="ui-kit-broadsheet-card__metric-label">{tnpLabel}</span>
          <span className="ui-kit-broadsheet-card__metric-value">
            {summary?.tnp !== undefined && summary?.tnp !== null
              ? format1or2dp(summary.tnp)
              : "—"}
          </span>
        </div>
        <div className="ui-kit-broadsheet-card__metric">
          <span className="ui-kit-broadsheet-card__metric-label">{gpaLabel}</span>
          <span className="ui-kit-broadsheet-card__metric-value">
            {format2dp(summary?.gpa)}
          </span>
        </div>
        <div className="ui-kit-broadsheet-card__metric">
          <span className="ui-kit-broadsheet-card__metric-label">{cgpaLabel}</span>
          <span className="ui-kit-broadsheet-card__metric-value">
            {format2dp(summary?.cgpa)}
          </span>
        </div>
      </div>

      {/* Expand/Collapse Course Breakdown Affordance (≥44px touch target) */}
      <Button
        type="text"
        block
        className="ui-kit-broadsheet-card__expand-btn"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
        data-testid={`broadsheet-card-toggle-${matricNo}`}
      >
        <span>
          {isExpanded ? "Hide Course Breakdown" : `View Courses (${visibleCourses.length})`}
        </span>
      </Button>

      {/* Lazy Course Table (Mounted only when expanded) */}
      {isExpanded && (
        <div
          className="ui-kit-broadsheet-card__courses"
          data-testid={`broadsheet-card-courses-${matricNo}`}
        >
          <table className="ui-kit-broadsheet-card__courses-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Course</th>
                <th style={{ textAlign: "center", width: 34 }}>CU</th>
                <th style={{ textAlign: "center", width: 38 }}>SC</th>
                {(cellMode === "score-gp-np" ||
                  cellMode === "score-grade-gp" ||
                  cellMode === "score-grade") && (
                  <th style={{ textAlign: "center", width: 34 }}>GR</th>
                )}
                {(cellMode === "score-gp-np" || cellMode === "score-grade-gp") && (
                  <th style={{ textAlign: "center", width: 34 }}>GP</th>
                )}
                {cellMode === "score-gp-np" && (
                  <th style={{ textAlign: "center", width: 38 }}>NP</th>
                )}
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((c) => {
                const code = c.courseCode ?? c.code ?? "";
                const cu = c.creditUnits ?? c.creditUnit ?? 0;
                const gradeInfo = student.grades?.[code];
                const isRegistered = gradeInfo?.isRegistered !== false;
                const isFail = isRegistered && gradeInfo?.isPass === false;

                const scoreText =
                  !isRegistered || gradeInfo?.score === null || gradeInfo?.score === undefined
                    ? "—"
                    : String(gradeInfo.score);
                const gradeText =
                  !isRegistered || !gradeInfo?.grade
                    ? "—"
                    : gradeInfo.gradeLetter ?? gradeInfo.grade;
                const gpText =
                  !isRegistered || gradeInfo?.gradePoint === null || gradeInfo?.gradePoint === undefined
                    ? "—"
                    : format1or2dp(gradeInfo.gradePoint);
                const npText =
                  !isRegistered || gradeInfo?.netPoint === null || gradeInfo?.netPoint === undefined
                    ? "—"
                    : format1or2dp(gradeInfo.netPoint);

                return (
                  <tr
                    key={code}
                    className={isFail ? "ui-kit-broadsheet-card__course-row--fail" : undefined}
                    onClick={() => onGradeCellClick?.(row, code)}
                    style={{ cursor: onGradeCellClick ? "pointer" : "default" }}
                  >
                    <td style={{ textAlign: "left" }}>
                      <span style={{ fontWeight: 600 }}>{code}</span>
                      {c.title && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 10.5,
                            color: token.colorTextSecondary,
                            maxWidth: 160,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.title}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>{cu}</td>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: isFail ? 700 : 500,
                        color: isFail ? token.colorErrorText : undefined,
                      }}
                    >
                      {scoreText}
                    </td>
                    {(cellMode === "score-gp-np" ||
                      cellMode === "score-grade-gp" ||
                      cellMode === "score-grade") && (
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: isFail ? 700 : 500,
                          color: isFail ? token.colorErrorText : undefined,
                        }}
                      >
                        {gradeText}
                      </td>
                    )}
                    {(cellMode === "score-gp-np" || cellMode === "score-grade-gp") && (
                      <td style={{ textAlign: "center" }}>{gpText}</td>
                    )}
                    {cellMode === "score-gp-np" && (
                      <td style={{ textAlign: "center" }}>{npText}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </li>
  );
}
