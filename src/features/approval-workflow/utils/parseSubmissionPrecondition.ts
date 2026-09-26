export interface IncompleteStudentOutcome {
  matricNumber: string;
  studentName: string;
  reason: string;
}

/**
 * Parses the 422 Workflow Transition Precondition Failed error detail string.
 * Example detail:
 * "Cannot submit score sheet: 2 student(s) have unrecorded or incomplete outcomes: 2024/0012 (Jane Doe): No scores entered; 2024/0045 (John Smith): Incomplete scores (grade not resolved). Please enter scores or assign an evaluation status (e.g. Absent/Excused)."
 */
export function parseSubmissionPreconditionError(
  detail: string | null | undefined,
): { count: number; students: IncompleteStudentOutcome[] } | null {
  if (!detail || typeof detail !== "string") return null;

  if (
    !detail.toLowerCase().includes("incomplete outcomes") &&
    !detail.toLowerCase().includes("unrecorded or incomplete")
  ) {
    return null;
  }

  // Extract the list segment between "outcomes:" and ". Please enter" or end
  const match = detail.match(/outcomes:\s*(.*?)(?:\.\s*Please enter|\.?$)/i);
  const studentSegment = match ? match[1] : detail;

  const entries = studentSegment.split(";").map((s) => s.trim()).filter(Boolean);
  const students: IncompleteStudentOutcome[] = [];

  for (const entry of entries) {
    // Matches e.g. "2024/0012 (Jane Doe): No scores entered"
    const entryMatch = entry.match(/^([^(:]+)\s*\(([^)]+)\)\s*:\s*(.+)$/);
    if (entryMatch) {
      students.push({
        matricNumber: entryMatch[1].trim(),
        studentName: entryMatch[2].trim(),
        reason: entryMatch[3].trim(),
      });
    } else {
      // Fallback if formatting differs slightly: "2024/0012: No scores entered"
      const simpleMatch = entry.match(/^([^:]+)\s*:\s*(.+)$/);
      if (simpleMatch) {
        students.push({
          matricNumber: simpleMatch[1].trim(),
          studentName: "—",
          reason: simpleMatch[2].trim(),
        });
      }
    }
  }

  if (students.length === 0) return null;

  return {
    count: students.length,
    students,
  };
}
