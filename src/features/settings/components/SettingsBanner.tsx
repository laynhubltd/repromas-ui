import { SettingsBannerSvg } from "@/assets/illustrations/SettingsBannerSvg";
import { ExplainerCallout } from "@/components/ui-kit";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { Flex } from "antd";

export function SettingsBanner() {
  const isMobile = useIsMobile();

  return (
    <ExplainerCallout
      intent="info"
      size={isMobile ? "sm" : "md"}
      title="Settings"
      body="Configure academic sessions, semesters, and semester types in one place. Set the current session, manage terms per session, and define semester types used across the system."
      action={
        !isMobile ? (
          <Flex justify="flex-end">
            <SettingsBannerSvg width={180} />
          </Flex>
        ) : undefined
      }
      aria-label="Settings page description"
    />
  );
}
