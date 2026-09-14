export type AllocationRole = 'PRIMARY_LECTURER' | 'CO_LECTURER' | 'ASSISTANT' | 'MARKER';

export type HydratedStaff = {
  id: number;
  userId: number;
  departmentId: number;
  fileNumber: string;
  department?: {
    id: number;
    name: string;
    code: string;
  };
  profile?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
};

export type HydratedCourseConfiguration = {
  id: number;
  programId: number;
  versionId: number;
  courseId: number;
  levelId: number;
  semesterTypeId: number;
  courseStatus: 'CORE' | 'ELECTIVE' | 'REQUIRED' | 'PREREQUISITE';
  creditUnit: number;
  semesterTitle?: string;
  semesterType?: {
    id: number;
    name: string;
    code?: string;
  };
  level?: {
    id: number;
    name: string;
  };
  semester?: {
    semesterTypeId: number;
    semesterTypeName: string;
    position?: number;
    semesterTitle?: string;
    ordinalName?: string;
    displayLabel: string;
  };
  course?: {
    id: number;
    code: string;
    title: string;
    creditUnit: number;
  };
  program?: {
    id: number;
    name: string;
    code: string;
  };
};

export type HydratedAcademicSession = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

export type CourseAllocation = {
  id: number;
  staffId: number;
  courseConfigurationId: number;
  academicSessionId: number;
  role: AllocationRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staff?: HydratedStaff;
  courseConfiguration?: HydratedCourseConfiguration;
  academicSession?: HydratedAcademicSession;
};

export type CourseAllocationListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  'exact[staffId]'?: number;
  'exact[academicSessionId]'?: number;
  'exact[courseConfigurationId]'?: number;
  'exact[role]'?: AllocationRole;
  'exact[isActive]'?: boolean;
};

export type CourseAllocationListResponse = {
  totalItems: number;
  member: CourseAllocation[];
};

export type CreateCourseAllocationPayload = {
  staffId: number;
  courseConfigurationId: number;
  academicSessionId: number;
  role?: AllocationRole;
};

export type BatchAllocateItem = {
  courseConfigurationId: number;
  role?: AllocationRole;
};

export type BatchAllocateCoursesPayload = {
  staffId: number;
  academicSessionId: number;
  allocations: BatchAllocateItem[];
};

export type TableVersionRow = {
  key: string;
  isGroup: true;
  versionId: number;
  label: string;
  scope: string;
  isActiveForAdmission: boolean;
  totalCourses: number;
  children: TableCourseLeafRow[];
};

export type TableCourseLeafRow = {
  key: number;
  isGroup: false;
  id: number;
  code: string;
  title: string;
  creditUnit: number;
  courseStatus: string;
  levelId: number;
  levelName?: string;
  semesterTypeId: number;
  semesterName?: string;
  versionLabel: string;
};

export type CourseAllocationTableRow = TableVersionRow | TableCourseLeafRow;
