export { StaffPage } from "./components/StaffPage";
export { StaffDrawer } from "./components/StaffDrawer";
export { StaffAllocatedCoursesTable } from "./components/StaffAllocatedCoursesTable";
export { AllocateCoursesModal } from "./components/modals/AllocateCoursesModal";
export { EditAllocationRoleModal } from "./components/modals/EditAllocationRoleModal";

export {
  default as courseAllocationsApi,
  useGetCourseAllocationsQuery,
  useGetCourseAllocationQuery,
  useCreateCourseAllocationMutation,
  useBatchAllocateCoursesMutation,
  useDeleteCourseAllocationMutation,
} from "./api/courseAllocationsApi";

export {
  default as staffApi,
  useGetStaffListQuery,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} from "./api/staffApi";

export { useAllocateCoursesModal } from "./hooks/useAllocateCoursesModal";
export { useStaffDrawer } from "./hooks/useStaffDrawer";
export { useStaffTab } from "./hooks/useStaffTab";

export {
  ALLOCATION_ROLE_CONFIG,
  ALLOCATION_ROLE_OPTIONS,
  getAllocationRoleLabel,
  getAllocationRoleTagColor,
  parseAllocationConflictError,
} from "./utils/allocationRoleUtils";

export type {
  AllocationRole,
  CourseAllocation,
  HydratedStaff,
  HydratedCourseConfiguration,
  HydratedAcademicSession,
  CourseAllocationListParams,
  CourseAllocationListResponse,
  CreateCourseAllocationPayload,
  BatchAllocateItem,
  BatchAllocateCoursesPayload,
} from "./types/courseAllocation";

export type {
  Staff,
  Role,
  RoleScope,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffListParams,
} from "./types/staff";
