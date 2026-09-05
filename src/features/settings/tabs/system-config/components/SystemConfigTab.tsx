import { Flex } from "antd";
import { useBrandingConfig } from "../hooks/useBrandingConfig";
import { useSignatoriesConfig } from "../hooks/useSignatoriesConfig";
import { ForceCarryoverConfig } from "./ForceCarryoverConfig";
import { HasLevelCategoryConfig } from "./HasLevelCategoryConfig";
import { InstitutionTypeConfig } from "./InstitutionTypeConfig";
import { OverrideCarryoverConfig } from "./OverrideCarryoverConfig";
import SchoolInformationConfig from "./SchoolInformationConfig";
import SignatoriesConfig from "./SignatoriesConfig";
import { UseSemesterOrdinalConfig } from "./UseSemesterOrdinalConfig";

export function SystemConfigTab() {
  const branding = useBrandingConfig();
  const signatories = useSignatoriesConfig();

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* System configuration items */}
      <Flex vertical gap={4} style={{ width: "100%" }}>
        <SchoolInformationConfig {...branding} />
        <SignatoriesConfig {...signatories} />
        <InstitutionTypeConfig />
        <HasLevelCategoryConfig />
        <UseSemesterOrdinalConfig />
        <ForceCarryoverConfig />
        <OverrideCarryoverConfig />
      </Flex>
    </Flex>
  );
}
