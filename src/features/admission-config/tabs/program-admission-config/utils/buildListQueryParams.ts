import {
  PROGRAM_ADMISSION_CONFIG_INCLUDE,
  PROGRAM_ADMISSION_CONFIG_LIST_ITEMS_PER_PAGE,
  PROGRAM_ADMISSION_CONFIG_SORT,
} from "@/shared/constants/programAdmissionConfigOptions";
import type {
  ProgramAdmissionConfigListParams,
  ProgramAdmissionConfigListQueryState,
} from "../types/program-admission-config";

export function buildListQueryParams(
  state: ProgramAdmissionConfigListQueryState,
): ProgramAdmissionConfigListParams {
  const params: ProgramAdmissionConfigListParams = {
    page: state.page,
    itemsPerPage: PROGRAM_ADMISSION_CONFIG_LIST_ITEMS_PER_PAGE,
    sort: PROGRAM_ADMISSION_CONFIG_SORT,
    include: PROGRAM_ADMISSION_CONFIG_INCLUDE,
  };

  const programName = state.debouncedProgramNameSearch.trim();
  const departmentName = state.debouncedDepartmentNameSearch.trim();

  if (programName) {
    params["search[program.name]"] = programName;
  }

  if (departmentName) {
    params["search[program.department.name]"] = departmentName;
  }

  if (state.programFilter !== undefined) {
    params["exact[programId]"] = state.programFilter;
  }

  return params;
}
