import { ExplainerCallout } from "@/components/ui-kit";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";

export function AcademicStandingBanner() {
  const { academicUnit } = useInstitutionTerminology();

  return (
    <ExplainerCallout
      title="Academic Standing Policies"
      body={`Define cumulative performance (CGPA) thresholds, probation evaluation rules, and progression policies. Resolution Precedence: Program-specific policies override Department, which override ${academicUnit.singular}, which override Global policies.`}
    />
  );
}
