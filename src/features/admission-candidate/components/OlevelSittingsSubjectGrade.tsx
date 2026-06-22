import type { useToken } from "@/shared/hooks/useToken";
import type { OlevelSitting } from "../tabs/candidate/types/admission-candidate";
import { Flex, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

const GRADE_COLUMNS: ColumnsType<OlevelSitting["grades"][number]> = [
  {
    title: "Subject",
    dataIndex: ["subject", "name"],
    key: "subject",
    render: (_: unknown, row) => row.subject?.name ?? `Subject #${row.subjectId}`,
  },
  {
    title: "Grade",
    dataIndex: "grade",
    key: "grade",
    width: 80,
    render: (grade: string) => <Tag>{grade}</Tag>,
  },
];

export default function OlevelSittingsSubjectGrade({
  sittings,
  token,
}: {
  sittings: OlevelSitting[];
  token: ReturnType<typeof useToken>;
}) {
  if (sittings.length === 0) return null;

  return (
    <Flex vertical gap={16}>
      <Typography.Text strong style={{ fontSize: token.fontSize }}>
        O-Level Sittings
      </Typography.Text>

      {sittings.map((sitting) => (
        <Flex key={sitting.id} vertical gap={8}>
          <Flex gap={8} align="center" wrap="wrap">
            <Tag color="blue">{sitting.examType}</Tag>
            <Typography.Text type="secondary">
              {sitting.examYear}
            </Typography.Text>
            {sitting.examRegNo && (
              <Typography.Text code style={{ fontSize: token.fontSizeSM }}>
                {sitting.examRegNo}
              </Typography.Text>
            )}
            {sitting.schoolName && (
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {sitting.schoolName}
              </Typography.Text>
            )}
          </Flex>

          <Table
            dataSource={sitting.grades}
            columns={GRADE_COLUMNS}
            rowKey="id"
            size="small"
            pagination={false}
            bordered
          />
        </Flex>
      ))}
    </Flex>
  );
}