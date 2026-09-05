import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
import { useToken } from "@/shared/hooks/useToken";
import {
  ArrowRightOutlined,
  BookOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PartitionOutlined,
} from "@ant-design/icons";
import { Button, Card, Flex, Space, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import type { AcademicStanding } from "../types/academic-standing";

export interface AcademicStandingCardProps {
  standing: AcademicStanding;
  onEdit: (standing: AcademicStanding) => void;
  onDelete: (standing: AcademicStanding) => void;
}

export function AcademicStandingCard({
  standing,
  onEdit,
  onDelete,
}: AcademicStandingCardProps) {
  const token = useToken();
  const navigate = useNavigate();
  const { academicUnit } = useInstitutionTerminology();

  const boundaries = standing.boundaries ?? [];
  const hasBoundaries = boundaries.length > 0;
  const hasBaseTier = boundaries.some((b) => b.minCgpa === 0);
  const ladderCount = boundaries.filter((b) => b.hasEscalationLadder).length;

  const getScopeLabel = () => {
    switch (standing.scope) {
      case "GLOBAL":
        return "Global";
      case "FACULTY":
        return academicUnit.singular;
      case "DEPARTMENT":
        return "Department";
      case "PROGRAM":
        return "Program";
      default:
        return standing.scope;
    }
  };

  const getScopeColor = () => {
    switch (standing.scope) {
      case "GLOBAL":
        return "purple";
      case "FACULTY":
        return "blue";
      case "DEPARTMENT":
        return "cyan";
      case "PROGRAM":
        return "geekblue";
      default:
        return "default";
    }
  };

  const handleConfigureBoundaries = () => {
    navigate(`?group=academic-standing&tab=cgpa-boundaries&policyId=${standing.id}`);
  };

  return (
    <Card
      variant="outlined"
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
        borderColor: token.colorBorderSecondary,
        transition: "all 0.2s ease-in-out",
      }}
      styles={{
        body: { padding: token.paddingLG },
      }}
    >
      <Flex vertical gap={token.marginMD}>
        {/* Header: Title, Scope, Actions */}
        <Flex justify="space-between" align="flex-start" gap={token.marginSM} wrap="wrap">
          <Flex vertical gap={4} style={{ flex: 1, minWidth: 200 }}>
            <Flex align="center" gap={8} wrap="wrap">
              <Typography.Title level={5} style={{ margin: 0 }}>
                {standing.name}
              </Typography.Title>
              <Tag color={getScopeColor()}>{getScopeLabel()}</Tag>
              {standing.referenceEntity && (
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  ({standing.referenceEntity.name})
                </Typography.Text>
              )}
            </Flex>
          </Flex>

          <Space size="small">
            <PermissionGuard permission={Permission.AcademicStandingsUpdate}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(standing)}
                aria-label="Edit policy"
              />
            </PermissionGuard>
            <PermissionGuard permission={Permission.AcademicStandingsDelete}>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(standing)}
                aria-label="Delete policy"
              />
            </PermissionGuard>
          </Space>
        </Flex>

        {/* Configuration Tags & Properties */}
        <Flex wrap="wrap" gap={8} align="center">
          <Tag color="default">
            Max CGPA: <strong>{Number(standing.maxCgpa).toFixed(2)}</strong>
          </Tag>
          <Tag color="default">
            Period: {standing.evaluationPeriod === "EACH_SEMESTER" ? "Each Semester" : "Session End Only"}
          </Tag>
          <Tag color="default">
            Recovery: {standing.resetOnRecovery ? "Resets Counter" : "Cumulative Across Career"}
          </Tag>
          <Tag color="default">
            Max Probations: {standing.maxProbationsPerCareer != null ? standing.maxProbationsPerCareer : "Unlimited"}
          </Tag>
          {standing.level && (
            <Tag icon={<PartitionOutlined />} color="orange">
              {standing.level.name}
            </Tag>
          )}
          {standing.curriculumVersion && (
            <Tag icon={<BookOutlined />} color="magenta">
              {standing.curriculumVersion.name ?? standing.curriculumVersion.versionTitle}
            </Tag>
          )}
        </Flex>

        {/* Completeness & Navigation Row */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={token.marginSM}
          style={{
            paddingTop: token.paddingSM,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {/* Completeness signals */}
          <Flex align="center" gap={8} wrap="wrap">
            {hasBoundaries ? (
              <>
                <Tag color="blue">{boundaries.length} {boundaries.length === 1 ? "Tier" : "Tiers"}</Tag>
                {ladderCount > 0 && (
                  <Tag color="cyan">{ladderCount} {ladderCount === 1 ? "Ladder" : "Ladders"}</Tag>
                )}
                {hasBaseTier ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Base Tier (0.00) Active
                  </Tag>
                ) : (
                  <Tag icon={<ExclamationCircleOutlined />} color="warning">
                    Missing 0.00 Base Tier
                  </Tag>
                )}
              </>
            ) : (
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                No boundaries configured yet
              </Tag>
            )}
          </Flex>

          <Button
            type="link"
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={handleConfigureBoundaries}
            style={{ fontWeight: 600, padding: 0 }}
          >
            Configure Boundaries
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
