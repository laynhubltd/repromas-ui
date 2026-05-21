// Feature: assessment
import { ScoreInput } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import {
  DownOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Flex, Select, Tooltip, Typography } from "antd";
import { useScoreRow } from "../hooks/useScoreRow";
import type { ScoreColumn, ScoreSheetRow } from "../types/score-sheet";

type ScoreSheetCardProps = {
  row: ScoreSheetRow;
  columns: ScoreColumn[];
  rowIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
};

export function ScoreSheetCard({
  row,
  columns,
  rowIndex,
  isExpanded,
  onToggle,
}: ScoreSheetCardProps) {
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
          {rowIndex + 1}
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

        {/* Collapsed score summary chips — removed: header is same in both states */}

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
                color={token.colorWarning}
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

          {/* Grade */}
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
                color: row.grade ? token.colorText : token.colorTextTertiary,
                textAlign: "center",
              }}
            >
              {row.grade || "—"}
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
                color:
                  row.gradePoint > 0
                    ? token.colorText
                    : token.colorTextTertiary,
                textAlign: "center",
              }}
            >
              {row.grade ? row.gradePoint.toFixed(1) : "—"}
            </div>
          </div>

          {/* Eval Status — last, full width */}
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
              Eval Status
            </div>
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
              size="middle"
              variant="borderless"
              style={{ width: "100%" }}
              placeholder="Select status…"
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
          </div>
        </div>
      )}
    </div>
  );
}
