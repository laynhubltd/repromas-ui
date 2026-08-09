import { Flex } from "antd";
import { useBrandingConfig } from "../hooks/useBrandingConfig";
import { useSignatoriesConfig } from "../hooks/useSignatoriesConfig";
import { ForceCarryoverConfig } from "./ForceCarryoverConfig";
import { HasLevelCategoryConfig } from "./HasLevelCategoryConfig";
import SchoolInformationConfig from "./SchoolInformationConfig";
import SignatoriesConfig from "./SignatoriesConfig";

export function SystemConfigTab() {
  const branding = useBrandingConfig();
  const signatories = useSignatoriesConfig();

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>

      {/* Branding config */}
      <Flex vertical gap={4} style={{ width: "100%" }}>
        <SchoolInformationConfig {...branding} />
        <SignatoriesConfig {...signatories} />
        <HasLevelCategoryConfig />
        <ForceCarryoverConfig />
      </Flex>
    </Flex>
  );
}
