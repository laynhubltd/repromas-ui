import { useGetOlevelSubjectQuery } from "@/features/admission-config/tabs/olevel-subject/api/olevelSubjectApi";

type OlevelSubjectLabelProps = {
  subjectId: number | null;
};

export function OlevelSubjectLabel({ subjectId }: OlevelSubjectLabelProps) {
  const { data, isLoading } = useGetOlevelSubjectQuery(subjectId!, {
    skip: subjectId == null,
  });

  if (subjectId == null) return <>—</>;
  if (isLoading) return <>Loading…</>;
  if (!data) return <>Subject #{subjectId}</>;

  return <>{data.code ? `${data.name} (${data.code})` : data.name}</>;
}
