import type { FacultyWithChildren } from "../types";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useCreateFacultyMutation, useGetFacultiesQuery } from "../api/academicStructureApi";
import { HierarchyCard } from "./HierarchyCard";
import { PageFooter } from "./PageFooter";
import { PageHero } from "./PageHero";
import { StatsCards } from "./StatsCards";

export default function AcademicStructure() {
  const { data: faculties = [], isLoading } = useGetFacultiesQuery();
  const [createFaculty] = useCreateFacultyMutation();
  const isMobile = useIsMobile();

  const totalFaculties = faculties.length;
  const totalDepartments = faculties.reduce(
    (sum: number, f: FacultyWithChildren) => sum + f.departments.length,
    0,
  );
  const activePrograms = faculties.reduce(
    (sum: number, f: FacultyWithChildren) =>
      sum +
      f.departments.reduce(
        (subtotal: number, d) => subtotal + d.programs.length,
        0,
      ),
    0,
  );

  const handleAddFaculty = async (values: { code: string; name: string }) => {
    await createFaculty(values);
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
        totalFaculties={totalFaculties}
        totalDepartments={totalDepartments}
        activePrograms={activePrograms}
      />

      <HierarchyCard
        data={faculties}
        loading={isLoading}
        totalFaculties={totalFaculties}
        totalDepartments={totalDepartments}
        totalPrograms={activePrograms}
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
        totalFaculties={totalFaculties}
        totalDepartments={totalDepartments}
        updatedAt={new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      />
    </div>
  );
}
