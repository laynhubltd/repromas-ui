import { ADMISSION_CANDIDATE_DETAIL_INCLUDE } from "@/shared/constants/admissionCandidateOptions";
import {
  useGetAdmissionCandidateQuery,
  useGetCandidatePriorQualificationsQuery,
} from "../api/admissionCandidateApi";

export function useAdmissionCandidateDrawer(
  candidateId: number | null,
  open: boolean,
) {
  const { data, isLoading, isError, refetch } = useGetAdmissionCandidateQuery(
    { id: candidateId!, include: ADMISSION_CANDIDATE_DETAIL_INCLUDE },
    { skip: candidateId === null || !open },
  );

  const shouldFetchPriorQualifications =
    open &&
    candidateId !== null &&
    (data?.entryMode === "DIRECT_ENTRY" || data?.entryMode === "TRANSFER");

  const {
    data: priorQualsData,
    isLoading: isLoadingPriorQualifications,
    isFetching: isFetchingPriorQualifications,
  } = useGetCandidatePriorQualificationsQuery(
    { candidateId: candidateId! },
    { skip: !shouldFetchPriorQualifications },
  );

  return {
    state: {
      candidate: data ?? null,
      priorQualifications: priorQualsData?.member ?? [],
      isLoadingPriorQualifications:
        isLoadingPriorQualifications || isFetchingPriorQualifications,
      isLoading,
      isError,
    },
    actions: { refetch },
  };
}
