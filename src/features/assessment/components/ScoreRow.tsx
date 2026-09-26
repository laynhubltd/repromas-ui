// Feature: assessment
import { ScoreInput } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import {
  ClearOutlined,
  CloseCircleOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Button, Flex, Popconfirm, Select, Tag, Tooltip } from "antd";
import { useScoreRow } from "../hooks/useScoreRow";
import { EvaluationStatusSource, type ScoreColumn, type ScoreSheetRow } from "../types/score-sheet";

type ScoreRowProps = {
  row: ScoreSheetRow;
  columns: ScoreColumn[];
  rowIndex: number;
  isLocked?: boolean;
};

export function ScoreRow({ row, columns, rowIndex, isLocked = false }: ScoreRowProps) {
  const token = useToken();
  const { state, actions } = useScoreRow(row);
  const {
    dirtyScores,
    savingCells,
    errorCells,
    localEvalStatusId,
    localEvalStatusCode,
    localEvalStatusSource,
    localDisplayGrade,
    isSavingEvalStatus,
    evalStatusError,
  } = state;
  const {
    handleScoreChange,
    handleScoreSave,
    handleAssignEvalStatus,
    handleClearEvalStatus,
    handleWipeScores,
  } = actions;

  const isRowLocked = isLocked || row.isEditable === false;

  const selectedStatus = row.evaluationStatuses?.find(
    (s) => s.id === localEvalStatusId || s.code === localEvalStatusCode,
  );
  const isManual =
    localEvalStatusSource === EvaluationStatusSource.MANUAL ||
    (selectedStatus ? !selectedStatus.isStandardGraded : false);
  const displayGrade =
    localDisplayGrade ||
    row.displayGrade ||
    row.grade ||
    (isManual ? selectedStatus?.code : null) ||
    "NR";

  const hasRecordedScores =
    Object.values(row.scores ?? {}).some((v) => v !== null && v !== undefined) ||
    Object.values(dirtyScores).some((v) => v !== null && v !== undefined);

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
        {row.isEditable === false ? (
          <Tooltip title="Locked score sheet is in a non-editable state">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
              <LockOutlined style={{ color: token.colorWarning, fontSize: token.fontSizeSM }} />
              {rowIndex + 1}
            </span>
          </Tooltip>
        ) : (
          rowIndex + 1
        )}
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

        const scoreInputEl = (
          <ScoreInput
            scoreKey={key}
            value={displayScore}
            saving={isSaving}
            disabled={isRowLocked || isManual}
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
          color={row.wasVetoed ? token.colorWarning : undefined}
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

      {/* Grade (Display Grade) */}
      <td
        style={{
          ...tdBase,
          textAlign: "center",
          fontWeight: 700,
          fontSize: token.fontSize,
          minWidth: 80,
        }}
      >
        {isManual ? (
          <Tooltip title="Administrative Override">
            <Tag color="orange" style={{ margin: 0, fontWeight: 700 }}>
              {displayGrade}
            </Tag>
          </Tooltip>
        ) : displayGrade === "NR" ? (
          <Tag color="default" style={{ margin: 0, color: token.colorTextTertiary }}>
            NR
          </Tag>
        ) : displayGrade === "F" || row.wasVetoed ? (
          <Tag color="error" style={{ margin: 0, fontWeight: 700 }}>
            {displayGrade}
          </Tag>
        ) : (
          <Tag color="success" style={{ margin: 0, fontWeight: 700 }}>
            {displayGrade}
          </Tag>
        )}
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
        {row.gradePoint !== null && row.gradePoint !== undefined && (row.grade || row.gradePoint > 0 || isManual)
          ? row.gradePoint.toFixed(1)
          : "—"}
      </td>

      {/* Eval Status & Actions — last column */}
      <td
        style={{
          ...tdBase,
          padding: `${token.paddingXXS}px ${token.paddingXS}px`,
          minWidth: 190,
          outline: evalStatusError
            ? `1.5px solid ${token.colorError}`
            : undefined,
        }}
      >
        <Flex align="center" justify="space-between" gap={4}>
          <Select
            value={localEvalStatusId ?? undefined}
            onChange={(statusId: number) => {
              const selected = row.evaluationStatuses?.find((s) => s.id === statusId);
              if (selected && !selected.isStandardGraded) {
                handleAssignEvalStatus(statusId);
              } else {
                handleClearEvalStatus();
              }
            }}
            loading={isSavingEvalStatus}
            disabled={isRowLocked || isSavingEvalStatus}
            size="small"
            variant="borderless"
            style={{ flex: 1, minWidth: 120 }}
            placeholder="Select status…"
            allowClear={false}
            aria-label="Evaluation status"
            options={row.evaluationStatuses?.map((s) => ({
              value: s.id,
              label: s.code,
              title: `${s.code} — ${s.name}`,
            }))}
          />
          {isManual && (
            <Popconfirm
              title="Clear Override"
              description="Clear administrative mark and re-evaluate numeric scores?"
              okText="Clear"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: isSavingEvalStatus }}
              onConfirm={handleClearEvalStatus}
              disabled={isRowLocked || isSavingEvalStatus}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                loading={isSavingEvalStatus}
                disabled={isRowLocked}
                title="Clear manual override"
              >
                Clear
              </Button>
            </Popconfirm>
          )}
          {hasRecordedScores && !isRowLocked && (
            <Popconfirm
              title="Clear all scores?"
              description="This will clear all numeric component scores and reset display grade to Not Recorded (NR). Any manual administrative override will be preserved."
              okText="Clear All"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: isSavingEvalStatus }}
              onConfirm={handleWipeScores}
              disabled={isRowLocked || isSavingEvalStatus}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<ClearOutlined />}
                loading={isSavingEvalStatus}
                disabled={isRowLocked}
                title="Clear all scores (wipe)"
              />
            </Popconfirm>
          )}
        </Flex>
      </td>
    </tr>
  );
}

