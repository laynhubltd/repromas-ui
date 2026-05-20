// Feature: assessment
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { TeamOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";
import { useState } from "react";
import type { ScoreColumn, ScoreSheetRow } from "../types/score-sheet";
import { ScoreRow } from "./ScoreRow";
import { ScoreSheetCard } from "./ScoreSheetCard";

type ScoreSheetTableProps = {
  columns: ScoreColumn[];
  rows: ScoreSheetRow[];
};

export function ScoreSheetTable({ columns, rows }: ScoreSheetTableProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  // ─── Accordion state: only one card open at a time ────────────────────────
  const [activeId, setActiveId] = useState<number | null>(
    rows.length > 0 ? rows[0].registrationId : null,
  );

  const handleToggle = (registrationId: number) => {
    setActiveId((prev: number | null) =>
      prev === registrationId ? null : registrationId,
    );
  };

  // Total visible columns = 3 fixed (#, Reg No, Full Name) + leaf columns + 3 result columns + Eval Status
  const leafCount = columns.reduce(
    (acc, col) =>
      acc + (col.subComponents.length === 0 ? 1 : col.subComponents.length),
    0,
  );
  const totalCols = 7 + leafCount;

  const parentColumns = columns.filter((col) => col.subComponents.length > 0);

  // ─── Shared cell styles ───────────────────────────────────────────────────

  // Sticky header cell
  const thBase: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 3,
    padding: `${token.paddingSM}px ${token.paddingSM}px`,
    background: token.colorBgContainer,
    borderBottom: `2px solid ${token.colorPrimary}`,
    borderRight: `1px solid ${token.colorBorderSecondary}`,
    fontSize: token.fontSize,
    fontWeight: 700,
    whiteSpace: "nowrap",
    color: token.colorPrimaryText,
    userSelect: "none",
  };

  // Sticky left column header (frozen)
  const thFixed = (left: number): React.CSSProperties => ({
    ...thBase,
    left,
    zIndex: 4,
    boxShadow: "2px 0 4px rgba(0,0,0,0.06)",
  });

  // Row-2 sub-component header
  const thSub: React.CSSProperties = {
    ...thBase,
    top: 49, // height of row 1 header (paddingSM*2 + fontSize + weight line)
    fontSize: token.fontSize,
    fontWeight: 600,
    color: token.colorTextSecondary,
    background: token.colorBgLayout,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    textAlign: "center",
  };

  // ─── Shared empty state ───────────────────────────────────────────────────
  const emptyState = (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={token.marginSM}
      style={{
        padding: `${token.paddingLG * 2}px ${token.paddingMD}px`,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: token.colorPrimaryBg,
          border: `2px dashed ${token.colorPrimaryBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: token.marginSM,
        }}
      >
        <TeamOutlined style={{ fontSize: 44, color: token.colorPrimary }} />
      </div>
      <Typography.Title level={4} style={{ margin: 0, color: token.colorText }}>
        No students enrolled
      </Typography.Title>
      <Typography.Text
        type="secondary"
        style={{
          fontSize: token.fontSize,
          textAlign: "center",
          maxWidth: 380,
          display: "block",
          lineHeight: 1.6,
        }}
      >
        There are no registered students for this course configuration. Students
        must be enrolled before scores can be entered.
      </Typography.Text>
    </Flex>
  );

  // ─── Mobile: card list ────────────────────────────────────────────────────
  if (isMobile) {
    if (rows.length === 0) {
      return (
        <div
          style={{
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            background: token.colorBgContainer,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          {emptyState}
        </div>
      );
    }

    return (
      <Flex vertical gap={token.marginXS}>
        {rows.map((row, index) => (
          <ScoreSheetCard
            key={row.registrationId}
            row={row}
            columns={columns}
            rowIndex={index}
            isExpanded={activeId === row.registrationId}
            onToggle={() => handleToggle(row.registrationId)}
          />
        ))}
      </Flex>
    );
  }

  // ─── Desktop: table ───────────────────────────────────────────────────────
  return (
    <div
      style={{
        overflowX: "auto",
        overflowY: "auto",
        maxHeight: "65vh",
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: token.fontSize,
          tableLayout: "auto",
        }}
      >
        <thead>
          {/* ── Row 1 ── */}
          <tr>
            {/* # (row number) — frozen col 0 */}
            <th
              rowSpan={2}
              style={{ ...thFixed(0), width: 48, textAlign: "center" }}
            >
              #
            </th>
            {/* Reg No — frozen col 1 */}
            <th rowSpan={2} style={{ ...thFixed(48), minWidth: 110 }}>
              Reg No
            </th>
            {/* Full Name — frozen col 2 */}
            <th rowSpan={2} style={{ ...thFixed(158), minWidth: 180 }}>
              Full Name
            </th>

            {/* Score column headers */}
            {columns.map((col) =>
              col.subComponents.length === 0 ? (
                <th
                  key={col.code}
                  rowSpan={2}
                  style={{
                    ...thBase,
                    textAlign: "center",
                    minWidth: 90,
                  }}
                >
                  <div style={{ fontSize: token.fontSize, fontWeight: 700 }}>
                    {col.code}
                  </div>
                  <div
                    style={{
                      fontSize: token.fontSizeSM,
                      fontWeight: 400,
                      color: token.colorTextTertiary,
                      marginTop: 2,
                    }}
                  >
                    {col.weightPercentage}%
                  </div>
                </th>
              ) : (
                <th
                  key={col.code}
                  colSpan={col.subComponents.length}
                  style={{
                    ...thBase,
                    textAlign: "center",
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <div>{col.code}</div>
                  <div
                    style={{
                      fontSize: token.fontSizeSM,
                      fontWeight: 400,
                      color: token.colorTextTertiary,
                      marginTop: 2,
                    }}
                  >
                    {col.weightPercentage}%
                  </div>
                </th>
              ),
            )}

            {/* Result columns */}
            <th
              rowSpan={2}
              style={{ ...thBase, textAlign: "center", minWidth: 80 }}
            >
              Total
            </th>
            <th
              rowSpan={2}
              style={{ ...thBase, textAlign: "center", minWidth: 72 }}
            >
              Grade
            </th>
            <th
              rowSpan={2}
              style={{ ...thBase, textAlign: "center", minWidth: 72 }}
            >
              GP
            </th>

            {/* Eval Status — last column */}
            <th
              rowSpan={2}
              style={{ ...thBase, textAlign: "center", minWidth: 160 }}
            >
              Eval Status
            </th>
          </tr>

          {/* ── Row 2 — sub-component headers ── */}
          <tr>
            {parentColumns.flatMap((col) =>
              col.subComponents.map((sub) => (
                <th
                  key={`${col.code}-${sub.code}`}
                  style={{ ...thSub, minWidth: 90 }}
                >
                  {sub.code}
                </th>
              )),
            )}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={totalCols}
                style={{
                  background: token.colorBgContainer,
                  textAlign: "center",
                }}
              >
                {emptyState}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <ScoreRow
                key={row.registrationId}
                row={row}
                columns={columns}
                rowIndex={index}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
