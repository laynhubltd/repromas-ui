// Feature: system-config
import { ExplainerCallout } from "@/components/ui-kit";
import { Flex } from "antd";
import { useBrandingConfig } from "../hooks/useBrandingConfig";
import GeneralToggleConfig from "./GeneralToggleConfig";
import SchoolInformationConfig from "./SchoolInformationConfig";

export function SystemConfigTab() {
  const branding = useBrandingConfig();

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* Explainer callout */}
      <ExplainerCallout
        intent="new"
        title="System Configurations"
        body="System configurations control course registration behavior. CREDIT_LOAD_LIMITS must be configured for each program before students can register for courses."
        dismissible
        collapsible
      />

      {/* Branding config */}
      <Flex vertical gap={4} style={{ width: "100%" }}>
        <SchoolInformationConfig {...branding} />
        <GeneralToggleConfig />
      </Flex>
    </Flex>
  );
}
