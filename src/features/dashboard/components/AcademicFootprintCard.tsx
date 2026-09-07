import { Card, Col, Empty, Flex, Row, Skeleton, Typography } from "antd";
import { useToken } from "@/shared/hooks/useToken";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
import { formatCount } from "@/shared/utils/format/formatCount";
import type { AcademicFootprintCardProps } from "../types/dashboard";

export const AcademicFootprintCard: React.FC<AcademicFootprintCardProps> = ({
  structure,
  isLoading,
}) => {
  const token = useToken();
  const { academicUnit } = useInstitutionTerminology();

  if (isLoading) {
    return (
      <Card
        title={`Academic Footprint by ${academicUnit.singular}`}
        style={{ height: "100%", borderRadius: token.borderRadiusLG }}
      >
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  const facultyDistribution = structure?.facultyDistribution ?? [];
  const totalCreditUnits = structure?.totalCreditUnits ?? 0;
  const totalMountedCourses = structure?.totalMountedCourses ?? 0;

  return (
    <Card
      title={`Academic Footprint by ${academicUnit.singular}`}
      extra={
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {formatCount(totalMountedCourses)} Mounted Courses ({formatCount(totalCreditUnits)} Credits)
        </Typography.Text>
      }
      style={{ height: "100%", borderRadius: token.borderRadiusLG }}
    >
      {facultyDistribution.length === 0 ? (
        <Empty description={`No ${academicUnit.singular.toLowerCase()} data available`} />
      ) : (
        <Row gutter={[16, 16]}>
          {facultyDistribution.map((item) => (
            <Col key={item.facultyId} xs={24} sm={12} md={8}>
              <div
                style={{
                  padding: token.paddingSM,
                  borderRadius: token.borderRadius,
                  background: token.colorBgLayout,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  height: "100%",
                }}
              >
                <Flex justify="space-between" align="baseline" style={{ marginBottom: 4 }}>
                  <Typography.Text strong ellipsis style={{ fontSize: token.fontSizeSM, maxWidth: "70%" }}>
                    {item.facultyName}
                  </Typography.Text>
                  {item.facultyCode && (
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      {item.facultyCode}
                    </Typography.Text>
                  )}
                </Flex>

                <Flex justify="space-between" style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
                  <span>{formatCount(item.departmentCount)} Departments</span>
                  <span>{formatCount(item.programCount)} Programs</span>
                </Flex>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};
