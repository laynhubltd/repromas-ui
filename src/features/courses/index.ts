export { CoursePage } from "./components/CoursePage";

export {
  default as courseConfigurationsApi,
  useGetCourseConfigurationsQuery,
  useGetCourseConfigurationsGroupedQuery,
  useCreateCourseConfigurationMutation,
  useUpdateCourseConfigurationMutation,
  useDeleteCourseConfigurationMutation,
} from "./tabs/course-configurations/api/courseConfigurationsApi";

export type {
  CourseConfiguration,
  CourseConfigListParams,
  CourseConfigurationLeafOption,
  CourseConfigurationGroupOption,
  CourseConfigurationGroupedParams,
  CreateCourseConfigRequest,
  UpdateCourseConfigRequest,
} from "./tabs/course-configurations/types/course-configuration";

export {
  default as coursesApi,
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from "./tabs/courses/api/coursesApi";

export type {
  Course,
  CourseListParams,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "./tabs/courses/types/course";
