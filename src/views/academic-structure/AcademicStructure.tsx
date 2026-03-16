import {
  HierarchyCard,
  PageFooter,
  PageHero,
  StatsCards,
} from "./components";
import { getMockStats, mockHierarchy } from "./mock-data";
import { useIsMobile } from "@/hooks/useBreakpoint";

export default function AcademicStructure() {
  const stats = getMockStats();
  const isMobile = useIsMobile();

  const handleAddFaculty = async (values: { code: string; name: string }) => {
    // TODO: call API POST /api/academic/faculties
    console.log("Add faculty", values);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        gap: isMobile ? 16 : 24,
        padding: isMobile ? "0 8px" : 0,
      }}
    >
      <PageHero />

      <StatsCards
        totalFaculties={stats.totalFaculties}
        totalDepartments={stats.totalDepartments}
        activePrograms={stats.activePrograms}
      />

      <HierarchyCard
        data={mockHierarchy}
        loading={false}
        totalFaculties={stats.totalFaculties}
        totalDepartments={stats.totalDepartments}
        totalPrograms={stats.activePrograms}
        onAddFaculty={handleAddFaculty}
        onAddDepartment={(id, values) =>
          console.log("Add department to faculty", id, values)
        }
        onAddProgram={(id, values) =>
          console.log("Add program to department", id, values)
        }
        onEditFaculty={(id) => console.log("Edit faculty", id)}
        onEditDepartment={(id) => console.log("Edit department", id)}
        onProgramDetails={(p) => console.log("Program details", p)}
      />

      <PageFooter
        totalFaculties={stats.totalFaculties}
        totalDepartments={stats.totalDepartments}
        updatedAt={new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      />
    </div>
  );
}
