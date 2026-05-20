// Feature: assessment
import { ScoreInput } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import { ExclamationCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { Select, Tooltip } from "antd";
import { useScoreRow } from "../hooks/useScoreRow";
import type { ScoreColumn, ScoreSheetRow } from "../types/score-sheet";

type ScoreRowProps = {
  row: ScoreSheetRow;
  columns: ScoreColumn[];
  rowIndex: number;
};

export function ScoreRow({ row, columns, rowIndex }: ScoreRowProps) {
  const token = useToken();
  const { state, actions } = useScoreRow(row);
  const {
    dirtyScores,
    savingCells,
    errorCells,
    localEvalStatusCode,
    isSavingEvalStatus,
    evalStatusError,
  } = state;
  const { handleScoreChange, handleScoreSave, handleEvalStatusChange } =
    actions;

  // ─── Flatten columns to leaf codes in API order ───────────────────────────
  const leafCodes: string[] = columns.flatMap((col) =>
    col.subComponents.length === 0
      ? [col.code]
      : col.subComponents.map((sub) => sub.code),
  );

  const isEven = rowIndex % 2 === 0;
  const rowBg = isEven ? token.colorBgContainer : token.colorFillAlter;
  const borderBottom = `1px solid ${token.colorBorderSecondary}`;

  const tdBase: React.CSSProperties = {
    padding: `${token.paddingXS}px ${token.paddingSM}px`,
    borderBottom,
    borderRight: `1px solid ${token.colorBorderSecondary}`,
    background: rowBg,
    fontSize: token.fontSize,
    transition: "background 0.15s",
  };

  const tdFixed = (left: number, extraWidth?: number): React.CSSProperties => ({
    ...tdBase,
    position: "sticky",
    left,
    zIndex: 2,
    boxShadow: "2px 0 4px rgba(0,0,0,0.04)",
    whiteSpace: "nowrap",
    ...(extraWidth ? { minWidth: extraWidth } : {}),
  });

  return (
    <tr>
      {/* # row number */}
      <td
        style={{
          ...tdFixed(0),
          width: 48,
          textAlign: "center",
          color: token.colorTextTertiary,
          fontWeight: 600,
          fontSize: token.fontSizeSM,
        }}
      >
        {rowIndex + 1}
      </td>

      {/* Reg No */}
      <td
        style={{
          ...tdFixed(48, 110),
          fontWeight: 500,
          fontSize: token.fontSize,
          color: token.colorText,
        }}
      >
        {row.regNo}
      </td>

      {/* Full Name */}
      <td
        style={{
          ...tdFixed(158, 180),
          fontSize: token.fontSize,
          color: token.colorText,
        }}
      >
        {row.fullName}
      </td>

      {/* Score cells */}
      {leafCodes.map((key) => {
        const savedScore = row.scores[key];
        const dirtyValue = dirtyScores[key];
        const displayScore = key in dirtyScores ? dirtyValue : savedScore;

        const isSaving = savingCells.has(key);
        const errorMsg = errorCells[key];
        const hasError = Boolean(errorMsg);
        // const hasValue = displayScore !== null && displayScore !== undefined;

        // Cell background tint by score band
        // const scoreBg = hasValue && !hasError ? rowBg : token.colorErrorBg;

        const scoreInputEl = (
          <ScoreInput
            scoreKey={key}
            value={displayScore}
            saving={isSaving}
            error={errorMsg}
            onChange={handleScoreChange}
            onSave={handleScoreSave}
            aria-label={`Score for ${key}`}
          />
        );

        return (
          <td
            key={key}
            style={{
              ...tdBase,
              // background: scoreBg,
              position: "relative",
              minWidth: 90,
              padding: 0,
              outline: hasError ? `1.5px solid ${token.colorError}` : undefined,
            }}
          >
            {scoreInputEl}

            {isSaving && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${token.colorBgContainer}cc`,
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                <LoadingOutlined
                  style={{
                    color: token.colorPrimary,
                    fontSize: token.fontSize,
                  }}
                />
              </div>
            )}
          </td>
        );
      })}

      {/* Total score */}
      <td
        style={{
          ...tdBase,
          textAlign: "center",
          fontWeight: 700,
          fontSize: token.fontSize,
          color:
            row.totalScore >= 70
              ? token.colorSuccess
              : row.totalScore >= 50
                ? token.colorWarning
                : row.totalScore > 0
                  ? token.colorError
                  : token.colorTextTertiary,
          minWidth: 80,
        }}
      >
        <Tooltip
          title={row.wasVetoed ? row.vetoReason : undefined}
          color={token.colorWarning}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            {row.totalScore > 0 ? row.totalScore.toFixed(1) : "—"}
            {row.wasVetoed && (
              <ExclamationCircleFilled
                style={{
                  color: token.colorWarning,
                  fontSize: token.fontSizeSM,
                }}
              />
            )}
          </span>
        </Tooltip>
      </td>

      {/* Grade */}
      <td
        style={{
          ...tdBase,
          textAlign: "center",
          fontWeight: 700,
          fontSize: token.fontSize,
          color: row.grade ? token.colorText : token.colorTextTertiary,
          minWidth: 72,
        }}
      >
        {row.grade || "—"}
      </td>

      {/* Grade Point */}
      <td
        style={{
          ...tdBase,
          textAlign: "center",
          fontWeight: 600,
          fontSize: token.fontSize,
          color: row.gradePoint > 0 ? token.colorText : token.colorTextTertiary,
          minWidth: 72,
        }}
      >
        {row.grade ? row.gradePoint.toFixed(1) : "—"}
      </td>

      {/* Eval Status — last column */}
      <td
        style={{
          ...tdBase,
          padding: `${token.paddingXXS}px ${token.paddingXS}px`,
          minWidth: 160,
          outline: evalStatusError
            ? `1.5px solid ${token.colorError}`
            : undefined,
        }}
      >
        <Select
          value={localEvalStatusCode || undefined}
          onChange={(code: string) => {
            const selected = row.evaluationStatuses.find(
              (s) => s.code === code,
            );
            if (selected) handleEvalStatusChange(selected.id);
          }}
          loading={isSavingEvalStatus}
          disabled={isSavingEvalStatus}
          size="small"
          variant="borderless"
          style={{ width: "100%", minWidth: 140 }}
          placeholder="—"
          aria-label="Evaluation status"
          options={row.evaluationStatuses.map((s) => ({
            value: s.code,
            label: (
              <span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 600,
                    marginRight: token.marginXXS,
                    color: token.colorPrimary,
                  }}
                >
                  {s.code}
                </span>
                <span
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: token.fontSizeSM,
                  }}
                >
                  {s.name}
                </span>
              </span>
            ),
          }))}
        />
      </td>
    </tr>
  );
}
