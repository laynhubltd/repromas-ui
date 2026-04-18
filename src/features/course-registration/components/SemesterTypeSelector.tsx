import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Select, Typography } from "antd";
import { useSemesterTypeSelector } from "../hooks/useSemesterTypeSelector";

export type SemesterTypeSelectorProps = {
  /** Currently selected semester type ID, or null if none selected. */
  semesterTypeId: number | null;
  /** Called when the user selects a semester type. */
  onSemesterTypeChange: (semesterTypeId: number) => void;
};

/**
 * Semester type dropdown for the course registration interface.
 *
 * View-only component — all business logic lives in useSemesterTypeSelector.
 *
 * Responsibilities:
 * - Load semester types from the API (Requirement 8.1, 8.2)
 * - Display semester types sorted by sortOrder (Requirement 8.2)
 * - Handle semester type selection (Requirement 8.5)
 * - Show the selected semester type clearly in the interface (Requirement 8.5)
 * - Show an empty/error state when no semester types are available
 *
 * Requirements: 8.1, 8.2, 8.5
 */
export function SemesterTypeSelector({
  semesterTypeId,
  onSemesterTypeChange,
}: SemesterTypeSelectorProps) {
  const token = useToken();
  const { state } = useSemesterTypeSelector(semesterTypeId);

  return (
    <div
      data-testid="semester-type-selector-wrapper"
      style={{ display: "flex", alignItems: "center", gap: 8 }}
    >
      {/* Label */}
      <Typography.Text
        type="secondary"
        style={{ fontSize: token.fontSizeSM, whiteSpace: "nowrap" }}
      >
        Semester:
      </Typography.Text>

      {/* Dropdown */}
      <Select
        data-testid="semester-type-selector"
        placeholder="Select semester"
        loading={state.isLoading}
        value={semesterTypeId ?? undefined}
        onChange={(val: number) => onSemesterTypeChange(val)}
        style={{ minWidth: 160 }}
        size="small"
        options={state.options}
        status={state.isError ? "error" : undefined}
      />

      {/* Empty state — no semester types available */}
      <ConditionalRenderer when={state.isEmpty}>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM }}
          data-testid="semester-type-empty"
        >
          No semester types available.
        </Typography.Text>
      </ConditionalRenderer>
    </div>
  );
}
