import { Table } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import { useMemo } from "react";
import type {
  BroadsheetCourseColumn,
  BroadsheetRow,
} from "../types/result-broadsheet";
import { buildMatrixColumns } from "../utils/buildMatrixColumns";

export interface BroadsheetMatrixTableProps {
  courses: BroadsheetCourseColumn[];
  rows: BroadsheetRow[];
  visibleCourseCodes?: string[];
  isLoading?: boolean;
}

export function BroadsheetMatrixTable({
  courses,
  rows,
  visibleCourseCodes,
  isLoading = false,
}: BroadsheetMatrixTableProps) {
  const token = useToken();

  const columns = useMemo(
    () =>
      buildMatrixColumns({
        courses,
        visibleCourseCodes,
        colorError: token.colorError,
      }),
    [courses, visibleCourseCodes, token.colorError],
  );

  const visibleCoursesCount = useMemo(() => {
    if (!visibleCourseCodes) return courses.length;
    return courses.filter((c) => {
      const code = c.courseCode ?? c.code ?? "";
      return visibleCourseCodes.includes(code);
    }).length;
  }, [courses, visibleCourseCodes]);

  const computedWidth = useMemo(
    () => Math.max(390 + 460 + visibleCoursesCount * 152, 1200),
    [visibleCoursesCount],
  );

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <Table<BroadsheetRow>
        size="sm"
        sticky
        loading={isLoading}
        pagination={false}
        scroll={{ x: computedWidth, y: 650 }}
        columns={columns}
        dataSource={rows}
        rowKey="matricNumber"
      />
    </div>
  );
}
