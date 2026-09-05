export interface LevelSemester {
  id: number;
  sessionId: number;
  semesterTypeId: number;
  semesterTypeName: string;
  position: number | null;
  semesterTitle: string | null;
  ordinalName: string;
  displayLabel: string;
  status: "PENDING" | "OPEN" | "GRADING" | "CLOSED" | string;
  isCurrent: boolean;
  startDate: string | null;
  endDate: string | null;
  session?: { id: number; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LevelSemestersQueryParams {
  "exact[sessionId]"?: number;
  "exact[isCurrent]"?: boolean;
  "exact[status]"?: string;
  include?: string;
  sort?: string;
  page?: number;
  itemsPerPage?: number;
}
