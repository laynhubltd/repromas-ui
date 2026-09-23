import {
  useGetOlevelSubjectQuery,
  useGetOlevelSubjectsQuery,
} from "@/features/admission-config/tabs/olevel-subject/api/olevelSubjectApi";
import { OLEVEL_SUBJECT_SORT_DEFAULT } from "@/shared/constants/olevelSubjectOptions";
import { OLEVEL_SUBJECT_PICKER_ITEMS_PER_PAGE } from "@/shared/constants/programAdmissionConfigOptions";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useMemo, useState } from "react";

export type OlevelSubjectPickerOption = {
  id: number;
  label: string;
};

export function useOlevelSubjectPickerOptions(
  enabled: boolean,
  selectedId: number | null | undefined,
): {
  options: OlevelSubjectPickerOption[];
  isLoading: boolean;
  search: string;
  setSearch: (value: string) => void;
} {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);

  const { data: listData, isLoading: isListLoading } = useGetOlevelSubjectsQuery(
    {
      itemsPerPage: OLEVEL_SUBJECT_PICKER_ITEMS_PER_PAGE,
      sort: OLEVEL_SUBJECT_SORT_DEFAULT,
      ...(debouncedSearch ? { "search[name]": debouncedSearch } : {}),
    },
    { skip: !enabled },
  );

  const selectedIdResolved = selectedId ?? null;
  const selectedInList = (listData?.member ?? []).some(
    (subject) => subject.id === selectedIdResolved,
  );

  const { data: selectedSubject, isLoading: isSelectedLoading } =
    useGetOlevelSubjectQuery(selectedIdResolved!, {
      skip: !enabled || selectedIdResolved == null || selectedInList,
    });

  const options = useMemo(() => {
    const fromList = (listData?.member ?? []).map((subject) => ({
      id: subject.id,
      label: subject.code ? `${subject.name} (${subject.code})` : subject.name,
    }));

    if (
      selectedIdResolved != null &&
      selectedSubject &&
      !fromList.some((opt) => opt.id === selectedIdResolved)
    ) {
      return [
        {
          id: selectedSubject.id,
          label: selectedSubject.code
            ? `${selectedSubject.name} (${selectedSubject.code})`
            : selectedSubject.name,
        },
        ...fromList,
      ];
    }

    return fromList;
  }, [listData?.member, selectedIdResolved, selectedSubject]);

  return {
    options,
    isLoading: isListLoading || isSelectedLoading,
    search,
    setSearch,
  };
}
