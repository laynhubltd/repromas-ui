import { useMemo } from "react";
import { useSystemConfig } from "@/features/settings/tabs/system-config/hooks/useSystemConfig";
import type { InstitutionType } from "@/features/settings/tabs/system-config/types/system-config";
import {
  getInstitutionTerminology,
  type InstitutionTerminology,
} from "@/shared/constants/institutionTerminology";

export type UseInstitutionTerminologyResult = InstitutionTerminology & {
  institutionType: InstitutionType;
};

export function useInstitutionTerminology(): UseInstitutionTerminologyResult {
  const configuredType = useSystemConfig<InstitutionType>("INSTITUTION_TYPE");
  const institutionType: InstitutionType = configuredType || "CONVENTIONAL";

  const terminology = useMemo(
    () => getInstitutionTerminology(institutionType),
    [institutionType],
  );

  return {
    ...terminology,
    institutionType,
  };
}
