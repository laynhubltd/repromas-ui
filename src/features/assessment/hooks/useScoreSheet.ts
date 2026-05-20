import { useGetScoreSheetDataQuery } from "../api/scoreSheetApi";
import type {
    ScoreColumn,
    ScoreSheetMeta,
    ScoreSheetRow,
} from "../types/score-sheet";

export function useScoreSheet(selectedConfigId: number | null) {
  const { data, isLoading, error, refetch } = useGetScoreSheetDataQuery(
    { courseConfigId: selectedConfigId! },
    { skip: selectedConfigId === null },
  );

  // ─── Extract data from member[0] ──────────────────────────────────────────
  const sheetData = data?.member[0];
  const meta: ScoreSheetMeta | undefined = sheetData?.meta;
  const columns: ScoreColumn[] = sheetData?.columns ?? [];
  const rows: ScoreSheetRow[] = sheetData?.rows ?? [];

  // ─── Error detection ──────────────────────────────────────────────────────
  const errorStatus =
    error && typeof error === "object" && "status" in error
      ? (error as { status?: number }).status
      : undefined;

  const error404 =
    errorStatus === 404
      ? "Course configuration not found. It may have been deleted."
      : null;

  const error500 =
    errorStatus === 500
      ? "Score sheet data is unavailable. Please ensure the assessment policy and current semester are configured."
      : null;

  const genericError =
    error && !error404 && !error500
      ? "An unexpected error occurred while loading the score sheet."
      : null;

  return {
    state: {
      meta,
      columns,
      rows,
      isLoading,
      error404,
      error500,
      genericError,
    },
    actions: {
      refetch,
    },
  };
}
