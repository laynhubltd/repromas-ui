import { Table } from "@/components/ui-kit";
import { Card, Typography } from "antd";
import { useMemo } from "react";
import type {
  BroadsheetCourseColumn,
  GradeDistributionItem,
} from "../types/result-broadsheet";
import { buildDistributionColumns } from "../utils/buildDistributionColumns";

export interface GradeDistributionMatrixProps {
  gradeLetters: string[];
  gradeDistribution: GradeDistributionItem[] | Record<string, Record<string, number>>;
  courses?: BroadsheetCourseColumn[];
  isLoading?: boolean;
}

export function GradeDistributionMatrix({
  gradeLetters,
  gradeDistribution,
  courses,
  isLoading = false,
}: GradeDistributionMatrixProps) {
  const items: GradeDistributionItem[] = useMemo(() => {
    if (Array.isArray(gradeDistribution)) {
      return gradeDistribution;
    }
    if (gradeDistribution && typeof gradeDistribution === "object") {
      return Object.entries(gradeDistribution).map(([courseCode, counts]) => {
        const course = courses?.find(
          (c) => (c.code ?? c.courseCode) === courseCode,
        );
        const totalSat = Object.values(counts).reduce(
          (acc, val) => acc + (typeof val === "number" ? val : 0),
          0,
        );
        return {
          courseCode,
          courseTitle: course?.title ?? course?.courseTitle ?? courseCode,
          creditUnit: course?.creditUnit ?? course?.creditUnits ?? 0,
          totalSat,
          letterCounts: counts,
        };
      });
    }
    return [];
  }, [gradeDistribution, courses]);

  const hasUnknownCount = useMemo(
    () => items.some((item) => (item.unknownCount ?? 0) > 0),
    [items],
  );

  const columns = useMemo(
    () =>
      buildDistributionColumns({
        gradeLetters,
        hasUnknownCount,
      }),
    [gradeLetters, hasUnknownCount],
  );

  return (
    <Card
      size="small"
      title={
        <Typography.Text strong>
          Grade Distribution Matrix (By Course)
        </Typography.Text>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Table<GradeDistributionItem>
        size="sm"
        loading={isLoading}
        pagination={false}
        scroll={{ x: 600 }}
        columns={columns}
        dataSource={items}
        rowKey="courseCode"
      />
    </Card>
  );
}
