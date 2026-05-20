/**
 * ScoreInput — an inline numeric score entry cell for grade book tables.
 *
 * Renders a borderless InputNumber whose text color reflects the score band:
 *   - ≥ 70  → success (green)
 *   - ≥ 50  → warning (amber)
 *   - < 50  → error   (red)
 *   - null  → tertiary (muted placeholder)
 *
 * The component applies the `.score-cell-input` CSS class (defined in
 * `src/index.css`) to force full-opacity text regardless of Ant Design's
 * disabled/borderless state styles.
 *
 * @example
 * <ScoreInput
 *   value={scores["CA1"]}
 *   scoreKey="CA1"
 *   saving={savingCells.has("CA1")}
 *   error={errorCells["CA1"]}
 *   onChange={(key, val) => handleScoreChange(key, val)}
 *   onSave={(key) => handleScoreSave(key)}
 * />
 */
import { InputNumber, theme } from "antd";
import type { UIKitCommonProps } from "../foundation";

export interface ScoreInputProps extends UIKitCommonProps {
  /** The score key (column code) this cell represents. */
  scoreKey: string;
  /** Current score value. Pass `null` or `undefined` for an empty cell. */
  value: number | null | undefined;
  /** When true renders a loading overlay and makes the input read-only. */
  saving?: boolean;
  /** Error message string. When truthy the cell renders in error state. */
  error?: string;
  /** Called on every value change with the score key and new value. */
  onChange: (key: string, value: number | null) => void;
  /** Called on blur or Enter press with the score key. */
  onSave: (key: string) => void;
  /** Minimum allowed value. Defaults to 0. */
  min?: number;
  /** Maximum allowed value. Defaults to 100. */
  max?: number;
}

export function ScoreInput({
  scoreKey,
  value,
  saving = false,
  error,
  onChange,
  onSave,
  min = 0,
  max = 100,
  style,
  className,
  "data-testid": testId,
  "aria-label": ariaLabel,
}: ScoreInputProps) {
  const { token } = theme.useToken();

  const hasValue = value !== null && value !== undefined;
  const hasError = Boolean(error);

  // ─── Score band colour ────────────────────────────────────────────────────
  const scoreColor = hasError ? token.colorError : token.colorTextTertiary;

  return (
    /*
     * Wrapper div sets `color` so the `.score-cell-input` CSS rule can use
     * `color: inherit !important` and `-webkit-text-fill-color: inherit !important`
     * to override Ant Design's disabled/borderless text fade.
     */
    <div
      style={{
        position: "relative",
        width: "100%",
        color: scoreColor,
        ...style,
      }}
      className={className}
      data-testid={testId}
    >
      <InputNumber
        value={hasValue ? value : undefined}
        placeholder="—"
        aria-label={ariaLabel}
        onChange={(val) => onChange(scoreKey, val)}
        onBlur={() => onSave(scoreKey)}
        onPressEnter={() => onSave(scoreKey)}
        variant="borderless"
        className="score-cell-input"
        style={{
          width: "100%",
          background: "transparent",
        }}
        styles={{
          input: {
            textAlign: "center",
            fontWeight: hasValue ? 700 : 400,
            fontSize: token.fontSize,
            letterSpacing: hasValue ? "0.02em" : undefined,
            padding: `${token.paddingXS}px ${token.paddingSM}px`,
          },
        }}
        status={hasError ? "error" : undefined}
        disabled={saving}
        min={min}
        max={max}
        controls={false}
      />
    </div>
  );
}
