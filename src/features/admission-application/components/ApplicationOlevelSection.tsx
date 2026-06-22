import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { MetadataRenderer } from "@/shared/ui/MetadataRenderer";
import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { ME_APPLICATION_UI_COPY } from "../constants/meAdmissionApplicationOptions";
import type { MeAdmissionOlevelGrade, MeAdmissionOlevelSitting } from "../types/me-admission-application";

type ApplicationOlevelSectionProps = {
  sittings: MeAdmissionOlevelSitting[];
};

function resolveGradeSubjectName(grade: MeAdmissionOlevelGrade): string {
  return (
    grade.subject?.name ??
    (grade.subjectId != null ? `Subject #${grade.subjectId}` : "—")
  );
}

export function ApplicationOlevelSection({
  sittings,
}: ApplicationOlevelSectionProps) {
  const token = useToken();

  const gradeColumns: ColumnsType<MeAdmissionOlevelGrade> = useMemo(
    () => [
      {
        title: "Subject",
        key: "subject",
        render: (_: unknown, record) => resolveGradeSubjectName(record),
      },
      {
        title: "Grade",
        dataIndex: "grade",
        key: "grade",
        width: 100,
        align: "center",
      },
    ],
    [],
  );

  return (
    <>
      {sittings.map((sitting) => (
        <div key={sitting.id} style={{ marginBottom: token.paddingLG }}>
          <Typography.Text
            strong
            style={{
              display: "block",
              marginBottom: token.paddingSM,
              fontSize: token.fontSize,
            }}
          >
            {sitting.examType} ({sitting.examYear})
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{
              display: "block",
              marginBottom: token.paddingSM,
              fontSize: token.fontSizeSM,
            }}
          >
            {[
              sitting.schoolName,
              sitting.examRegNo ? `Reg: ${sitting.examRegNo}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Typography.Text>
          <div style={{ overflowX: "auto" }}>
            <Table<MeAdmissionOlevelGrade>
              rowKey="id"
              dataSource={sitting.grades}
              columns={gradeColumns}
              size="small"
              pagination={false}
              bordered
            />
          </div>
          <ConditionalRenderer when={Boolean(sitting.metadata)}>
            <div style={{ marginTop: token.paddingSM }}>
              <MetadataRenderer
                title="Sitting metadata"
                value={sitting.metadata}
                variant="descriptions"
                size="small"
                bordered
                column={1}
              />
            </div>
          </ConditionalRenderer>
        </div>
      ))}
      <ConditionalRenderer when={sittings.length === 0}>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {ME_APPLICATION_UI_COPY.noOlevelSittings}
        </Typography.Text>
      </ConditionalRenderer>
    </>
  );
}
