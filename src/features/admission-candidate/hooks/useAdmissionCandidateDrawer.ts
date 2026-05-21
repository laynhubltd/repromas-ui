import { ADMISSION_CANDIDATE_DETAIL_INCLUDE } from "@/shared/constants/admissionCandidateOptions";
import { useGetAdmissionCandidateQuery } from "../api/admissionCandidateApi";

export function useAdmissionCandidateDrawer(
  candidateId: number | null,
  open: boolean,
) {
  const { data, isLoading, isError, refetch } = useGetAdmissionCandidateQuery(
    { id: candidateId!, include: ADMISSION_CANDIDATE_DETAIL_INCLUDE },
    { skip: candidateId === null || !open },
  );

  return {
    state: {
      candidate: data ?? null,
      isLoading,
      isError,
    },
    actions: { refetch },
  };
}
