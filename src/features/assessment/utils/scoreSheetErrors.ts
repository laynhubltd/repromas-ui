export function map500Detail(detail: string): string {
  if (detail.includes("No default evaluation status")) {
    return "Score sheets cannot be created: no default evaluation status is configured. Contact your administrator.";
  }
  if (detail.includes("No assessment policy")) {
    return "Scores cannot be graded: no assessment policy is configured for this course. Contact your administrator.";
  }
  if (detail.includes("No grading system")) {
    return "Scores cannot be graded: no grading system is linked to this course's program. Contact your administrator.";
  }
  return detail;
}
