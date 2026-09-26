// Feature: assessment
import { ScoreInput } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import {
  ClearOutlined,
  CloseCircleOutlined,
  DownOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  LockOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Flex, Popconfirm, Select, Tag, Tooltip, Typography } from "antd";
import { useScoreRow } from "../hooks/useScoreRow";
import { EvaluationStatusSource, type ScoreColumn, type ScoreSheetRow } from "../types/score-sheet";

type ScoreSheetCardProps = {
  row: ScoreSheetRow;
  columns: ScoreColumn[];
  rowIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  isLocked?: boolean;
};

export function ScoreSheetCard({
  row,
  columns,
  rowIndex,
  isExpanded,
  onToggle,
  isLocked = false,
}: ScoreSheetCardProps) {
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

  // ─── Build leaf code → display name map ──────────────────────────────────
  const labelMap: Record<string, string> = {};
  for (const col of columns) {
    if (col.subComponents.length === 0) {
      labelMap[col.code] = col.code;
    } else {
      for (const sub of col.subComponents) {
        labelMap[sub.code] = sub.code;
      }
    }
  }

  // ─── Score chip background by band ───────────────────────────────────────
  function getChipBg(score: number | null | undefined): string {
    if (score === null || score === undefined) return token.colorFillAlter;
    return token.colorFillAlter;
  }

  return (
    <div
      style={{
        border: `1px solid ${isExpanded ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        boxShadow: isExpanded ? token.boxShadow : token.boxShadowTertiary,
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* ── Clickable header row (always visible) ── */}
      <Flex
        align="center"
        gap={token.marginSM}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        style={{
          padding: `${token.paddingSM}px ${token.paddingMD}px`,
          background: isExpanded
            ? token.colorPrimaryBg
            : token.colorBgContainer,
          borderBottom: isExpanded
            ? `1px solid ${token.colorPrimaryBorder}`
            : "none",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Row number badge */}
        <div
          style={{
            minWidth: 28,
            height: 28,
            borderRadius: "50%",
            background: isExpanded
              ? token.colorPrimary
              : token.colorBgContainer,
            border: `1px solid ${token.colorPrimaryBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: token.fontSizeSM,
            fontWeight: 700,
            color: isExpanded ? token.colorWhite : token.colorPrimary,
            flexShrink: 0,
          }}
        >
          {row.isEditable === false ? (
            <Tooltip title="Locked — score sheet is in a non-editable state">
              <LockOutlined style={{ color: token.colorWarning, fontSize: 13 }} />
            </Tooltip>
          ) : (
            rowIndex + 1
          )}
        </div>

        {/* Student identity */}
        <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Typography.Text
            strong
            style={{
              color: token.colorPrimary,
              fontSize: token.fontSize,
              lineHeight: 1.3,
            }}
          >
            {row.regNo}
          </Typography.Text>
          <Typography.Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.fullName}
          </Typography.Text>
        </Flex>

        {/* Grade display tag on header */}
        <div style={{ flexShrink: 0 }}>
          {isManual ? (
            <Tag color="orange" style={{ margin: 0, fontWeight: 700 }}>
              {displayGrade} (Manual)
            </Tag>
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
        </div>

        {/* Expand/collapse chevron */}
        <div
          style={{
            color: token.colorTextTertiary,
            fontSize: token.fontSizeSM,
            flexShrink: 0,
            transition: "transform 0.2s",
          }}
        >
          {isExpanded ? <DownOutlined /> : <RightOutlined />}
        </div>
      </Flex>

      {/* ── Expandable score grid ── */}
      {isExpanded && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: token.marginSM,
            padding: token.paddingMD,
          }}
        >
          {leafCodes.map((key) => {
            const savedScore = row.scores[key];
            const dirtyValue = dirtyScores[key];
            const displayScore = key in dirtyScores ? dirtyValue : savedScore;

            const isSaving = savingCells.has(key);
            const errorMsg = errorCells[key];
            const hasError = Boolean(errorMsg);

            const chipBg = getChipBg(displayScore);

            const scoreInputEl = (
              <ScoreInput
                scoreKey={key}
                value={displayScore}
                saving={isSaving}
                disabled={isRowLocked || isManual}
                error={errorMsg}
                onChange={handleScoreChange}
                onSave={handleScoreSave}
                aria-label={`Score for ${labelMap[key] ?? key}`}
              />
            );

            return (
              <div
                key={key}
                style={{
                  position: "relative",
                  borderRadius: token.borderRadius,
                  background: chipBg,
                  border: hasError
                    ? `1.5px solid ${token.colorError}`
                    : `1px solid ${token.colorBorderSecondary}`,
                  overflow: "hidden",
                }}
              >
                {/* Chip label */}
                <div
                  style={{
                    padding: `${token.paddingXS}px ${token.paddingSM}px`,
                    fontSize: token.fontSizeSM,
                    fontWeight: 600,
                    color: token.colorTextSecondary,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    background: "rgba(0,0,0,0.02)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {labelMap[key] ?? key}
                </div>

                {/* Score input */}
                {scoreInputEl}

                {/* Saving spinner overlay */}
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
              </div>
            );
          })}

          {/* ── Result chips (read-only) ── */}
          {/* Total Score */}
          <div
            style={{
              borderRadius: token.borderRadius,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: `${token.paddingXS}px ${token.paddingSM}px`,
                fontSize: token.fontSizeSM,
                fontWeight: 600,
                color: token.colorTextSecondary,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                background: "rgba(0,0,0,0.02)",
              }}
            >
              Total
            </div>
            <div
              style={{
                padding: `${token.paddingSM}px ${token.paddingSM}px`,
                fontWeight: 700,
                fontSize: token.fontSizeLG,
                color:
                  row.totalScore >= 70
                    ? token.colorSuccess
                    : row.totalScore >= 50
                      ? token.colorWarning
                      : row.totalScore > 0
                        ? token.colorError
                        : token.colorTextTertiary,
                textAlign: "center",
              }}
            >
              <Tooltip
                title={row.wasVetoed ? row.vetoReason : undefined}
                color={row.wasVetoed ? token.colorWarning : undefined}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
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
            </div>
          </div>

          {/* Grade (Display Grade) */}
          <div
            style={{
              borderRadius: token.borderRadius,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: `${token.paddingXS}px ${token.paddingSM}px`,
                fontSize: token.fontSizeSM,
                fontWeight: 600,
                color: token.colorTextSecondary,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                background: "rgba(0,0,0,0.02)",
              }}
            >
              Grade
            </div>
            <div
              style={{
                padding: `${token.paddingSM}px ${token.paddingSM}px`,
                fontWeight: 700,
                fontSize: token.fontSizeLG,
                textAlign: "center",
              }}
            >
              {isManual ? (
                <Tag color="orange" style={{ margin: 0, fontWeight: 700 }}>
                  {displayGrade}
                </Tag>
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
            </div>
          </div>

          {/* Grade Point — full width */}
          <div
            style={{
              gridColumn: "1 / -1",
              borderRadius: token.borderRadius,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: `${token.paddingXS}px ${token.paddingSM}px`,
                fontSize: token.fontSizeSM,
                fontWeight: 600,
                color: token.colorTextSecondary,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                background: "rgba(0,0,0,0.02)",
              }}
            >
              Grade Point
            </div>
            <div
              style={{
                padding: `${token.paddingSM}px ${token.paddingSM}px`,
                fontWeight: 600,
                fontSize: token.fontSize,
                color: row.gradePoint > 0 ? token.colorText : token.colorTextTertiary,
                textAlign: "center",
              }}
            >
              {row.gradePoint !== null && row.gradePoint !== undefined && (row.grade || row.gradePoint > 0 || isManual)
                ? row.gradePoint.toFixed(1)
                : "—"}
            </div>
          </div>

          {/* Eval Status & Actions — last, full width */}
          <div
            style={{
              gridColumn: "1 / -1",
              borderRadius: token.borderRadius,
              background: token.colorFillAlter,
              border: evalStatusError
                ? `1.5px solid ${token.colorError}`
                : `1px solid ${token.colorBorderSecondary}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: `${token.paddingXS}px ${token.paddingSM}px`,
                fontSize: token.fontSizeSM,
                fontWeight: 600,
                color: token.colorTextSecondary,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                background: "rgba(0,0,0,0.02)",
              }}
            >
              Eval Status & Actions
            </div>
            <div style={{ padding: `${token.paddingXS}px ${token.paddingSM}px` }}>
              <Flex align="center" justify="space-between" gap={8}>
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
                  size="middle"
                  variant="borderless"
                  style={{ flex: 1 }}
                  placeholder="Select evaluation status…"
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
                    >
                      Wipe
                    </Button>
                  </Popconfirm>
                )}
              </Flex>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

