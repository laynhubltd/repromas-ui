import { useGetAcademicStandingsQuery } from "@/features/grading-config/tabs/academic-standing/api/academicStandingApi";
import type { AcademicStanding } from "@/features/grading-config/tabs/academic-standing/types/academic-standing";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
import { Card, Flex, Select, Tag, Typography } from "antd";

export interface AcademicStandingSelectorProps {
  selectedPolicyId: number | null;
  onSelectPolicy: (policyId: number, policy: AcademicStanding) => void;
}

export function AcademicStandingSelector({
  selectedPolicyId,
  onSelectPolicy,
}: AcademicStandingSelectorProps) {
  const { data, isLoading } = useGetAcademicStandingsQuery({
    itemsPerPage: 100,
    include: "boundaries",
  });
  const { academicUnit } = useInstitutionTerminology();

  const policies = data?.member ?? [];
  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case "GLOBAL":
        return "Global";
      case "FACULTY":
        return academicUnit.singular;
      case "DEPARTMENT":
        return "Department";
      case "PROGRAM":
        return "Program";
      default:
        return scope;
    }
  };

  const options = policies.map((policy) => ({
    value: policy.id,
    label: `${policy.name} (${getScopeLabel(policy.scope)} · Max ${Number(policy.maxCgpa).toFixed(2)})`,
  }));

  return (
    <Card variant="outlined" style={{ width: "100%" }}>
      <Flex vertical gap={8}>
        <Typography.Text strong>Select Academic Standing Policy</Typography.Text>
        <Flex gap={12} align="center" wrap="wrap">
          <Select
            placeholder="Select a policy to view and configure its CGPA boundaries"
            value={selectedPolicyId ?? undefined}
            onChange={(val) => {
              const p = policies.find((item) => item.id === val);
              if (p) onSelectPolicy(val, p);
            }}
            loading={isLoading}
            options={options}
            showSearch
            optionFilterProp="label"
            style={{ minWidth: 320, flex: 1 }}
          />

          {selectedPolicy && (
            <Flex align="center" gap={8} wrap="wrap">
              <Tag color="purple">Scale: 0.00 – {Number(selectedPolicy.maxCgpa).toFixed(2)}</Tag>
              <Tag color="blue">{getScopeLabel(selectedPolicy.scope)}</Tag>
              {selectedPolicy.referenceEntity && (
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  ({selectedPolicy.referenceEntity.name})
                </Typography.Text>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
