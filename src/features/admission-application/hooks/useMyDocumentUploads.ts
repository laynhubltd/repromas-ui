import { useGetDocumentUploadsQuery } from "@/features/dynamic-form/api/documentUploadApi";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import { useMemo } from "react";

type UseMyDocumentUploadsArgs = {
  candidateId: number | undefined;
  skip?: boolean;
};

export function useMyDocumentUploads({
  candidateId,
  skip = false,
}: UseMyDocumentUploadsArgs) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDocumentUploadsQuery(
    {
      "exact[actorType]": "CANDIDATE",
      "exact[actorId]": candidateId,
      include: "documentType",
      sort: "uploadedAt:desc",
      itemsPerPage: 100,
    },
    { skip: skip || candidateId == null },
  );

  const uploads = data?.member ?? [];

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, error, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, error],
  );

  return {
    state: { uploads, isLoading, sectionError },
    actions: { refetch },
    flags: { hasUploads: uploads.length > 0 },
  };
}
