import { useGetAcademicStandingsQuery } from "@/features/grading-config/tabs/academic-standing/api/academicStandingApi";
import { useGetAcademicStandingBoundariesQuery } from "@/features/grading-config/tabs/academic-standing-boundary/api/academicStandingBoundaryApi";
import type { AcademicStandingBoundary } from "@/features/grading-config/tabs/academic-standing-boundary/types/academic-standing-boundary";
import { Card, Col, Flex, Row, Select, Tag, Typography } from "antd";

export interface BoundarySelectorProps {
  selectedPolicyId: number | null;
  selectedBoundaryId: number | null;
  onSelectPolicy: (policyId: number) => void;
  onSelectBoundary: (boundaryId: number, boundary: AcademicStandingBoundary) => void;
}

export function BoundarySelector({
  selectedPolicyId,
  selectedBoundaryId,
  onSelectPolicy,
  onSelectBoundary,
}: BoundarySelectorProps) {
  const { data: policiesData, isLoading: isPoliciesLoading } =
    useGetAcademicStandingsQuery({ itemsPerPage: 100, include: "boundaries" });

  const policies = policiesData?.member ?? [];

  const { data: boundariesData, isLoading: isBoundariesLoading } =
    useGetAcademicStandingBoundariesQuery(
      {
        academicStandingId: selectedPolicyId!,
        sort: "minCgpa:desc",
        include: "escalationSteps,studentTransitionStatus",
      },
      { skip: selectedPolicyId === null },
    );

  const allBoundaries = boundariesData?.member ?? [];
  const ladderBoundaries = allBoundaries.filter((b) => b.hasEscalationLadder);

  const selectedBoundary = allBoundaries.find((b) => b.id === selectedBoundaryId);

  return (
    <Card variant="outlined" style={{ width: "100%" }}>
      <Flex vertical gap={12}>
        <Typography.Text strong>Select Policy & Ladder-Enabled Boundary</Typography.Text>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Flex vertical gap={4}>
              <Typography.Text style={{ fontSize: 13 }}>Standing Policy:</Typography.Text>
              <Select
                placeholder="Select Academic Standing Policy"
                value={selectedPolicyId ?? undefined}
                onChange={(val) => onSelectPolicy(val)}
                loading={isPoliciesLoading}
                options={policies.map((p) => ({
                  value: p.id,
                  label: `${p.name} (Max ${Number(p.maxCgpa).toFixed(2)})`,
                }))}
                showSearch
                optionFilterProp="label"
                style={{ width: "100%" }}
              />
            </Flex>
          </Col>

          <Col xs={24} md={12}>
            <Flex vertical gap={4}>
              <Typography.Text style={{ fontSize: 13 }}>
                Ladder-Enabled Tier Boundary:
              </Typography.Text>
              <Select
                placeholder={
                  selectedPolicyId === null
                    ? "Select a policy first"
                    : ladderBoundaries.length === 0
                    ? "No ladder-enabled boundaries in this policy"
                    : "Select a boundary tier"
                }
                value={selectedBoundaryId ?? undefined}
                disabled={selectedPolicyId === null || ladderBoundaries.length === 0}
                onChange={(val) => {
                  const b = ladderBoundaries.find((item) => item.id === val);
                  if (b) onSelectBoundary(val, b);
                }}
                loading={isBoundariesLoading}
                options={ladderBoundaries.map((b) => ({
                  value: b.id,
                  label: `${b.name} (Min CGPA: ${Number(b.minCgpa).toFixed(2)})`,
                }))}
                showSearch
                optionFilterProp="label"
                style={{ width: "100%" }}
              />
            </Flex>
          </Col>
        </Row>

        {selectedBoundary && (
          <Flex align="center" gap={8} wrap="wrap" style={{ marginTop: 4 }}>
            <Tag color="purple">
              Ladder Tier: <strong>{selectedBoundary.name}</strong>
            </Tag>
            <Tag color="blue">Min CGPA: {Number(selectedBoundary.minCgpa).toFixed(2)}</Tag>
            {selectedBoundary.studentTransitionStatus && (
              <Tag color="cyan">
                Default Status: {selectedBoundary.studentTransitionStatus.name}
              </Tag>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
