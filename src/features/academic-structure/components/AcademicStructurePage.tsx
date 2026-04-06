// Feature: faculty-department-management
import { useAcademicStructurePage } from "../hooks/useAcademicStructurePage";
import { ExplorerSection } from "./ExplorerSection";
import { HierarchyView } from "./HierarchyView";
import { MetricsRow } from "./MetricsRow";

/**
 * AcademicStructurePage — page root component.
 * No props; invokes useAcademicStructurePage() and renders the full layout.
 * Layout: ExplorerSection → MetricsRow → HierarchyView (vertical stack).
 * Responsive: stacks vertically on mobile; HierarchyView supports horizontal scrolling.
 */
export function AcademicStructurePage() {
  useAcademicStructurePage();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ExplorerSection />
      <MetricsRow />
      <div style={{ overflowX: "auto", minWidth: 0 }}>
        <HierarchyView />
      </div>
    </div>
  );
}
