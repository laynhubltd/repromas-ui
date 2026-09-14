export { default as Settings } from "./components/Settings";

export {
  default as academicCalendarApi,
  useGetAcademicSessionsQuery,
  useCreateAcademicSessionMutation,
  useUpdateAcademicSessionMutation,
  useSetCurrentAcademicSessionMutation,
  useDeleteAcademicSessionMutation,
} from "./tabs/academic-calendar/api/academicCalendarApi";

export type {
  AcademicSession,
  Semester,
  SemesterType,
} from "./tabs/academic-calendar/types/academic-calendar";
