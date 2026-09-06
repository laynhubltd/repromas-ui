import {
  BroadsheetTable,
  type BroadsheetCellMode,
  type BroadsheetViewMode,
} from "@/components/ui-kit";
import type {
  BroadsheetCourseColumn,
  BroadsheetRow,
} from "../types/result-broadsheet";

export interface BroadsheetMatrixTableProps {
  courses: BroadsheetCourseColumn[];
  rows: BroadsheetRow[];
  visibleCourseCodes?: string[];
  cellMode?: BroadsheetCellMode;
  viewMode?: BroadsheetViewMode;
  showStudentName?: boolean;
  isLoading?: boolean;
  watermarkText?: string;
}

export function BroadsheetMatrixTable({
  courses,
  rows,
  visibleCourseCodes,
  cellMode = "score-gp-np",
  viewMode = "auto",
  showStudentName = false,
  isLoading = false,
  watermarkText,
}: BroadsheetMatrixTableProps) {

  return (
    <BroadsheetTable<BroadsheetRow>
      courses={courses}
      rows={rows}
      visibleCourseCodes={visibleCourseCodes}
      cellMode={cellMode}
      viewMode={viewMode}
      showStudentName={showStudentName}
      loading={isLoading}
      watermarkText={watermarkText}
      labels={{
        serialLabel: "#",
        registrationNoLabel: "Reg No",
        nameLabel: "Name",
        tcuLabel: "TCU",
        tnpLabel: "TNP",
        pcgpaLabel: "PCGPA",
        gpaLabel: "GPA",
        cgpaLabel: "CGPA",
        remarkLabel: "Remark/Carryovers",
      }}
    />
  );
}

