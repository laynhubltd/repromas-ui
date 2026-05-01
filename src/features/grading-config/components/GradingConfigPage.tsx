// Feature: grading-config
import { Tabs } from "@/components/ui-kit";
import { GradingSystemTab } from "../tabs/grading-system";
import { GradingSystemBoundaryTab } from "../tabs/grading-system-boundary";

export function GradingConfigPage() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Tabs
        items={[
          {
            key: "grading-system",
            label: "Grading Systems",
            children: <GradingSystemTab />,
          },
          {
            key: "grading-system-boundary",
            label: "Grade Boundaries",
            children: <GradingSystemBoundaryTab />,
          },
        ]}
        defaultActiveKey="grading-system"
        size="md"
        density="spacious"
        variant="default"
        aria-label="Grading configuration navigation"
      />
    </div>
  );
}
