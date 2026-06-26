import {
  useGetLgasByStateQuery,
  useGetStateWithLgasQuery,
  useGetStatesQuery,
} from "@/features/admission-config/tabs/geography-rule/api/statesApi";
import { useMemo } from "react";
import { resolveGeographyStateId } from "../utils/geographyFieldKeys";

type GeographyOption = { value: number; label: string };

type UseGeographyFieldOptionsArgs = {
  sectionValues: Record<string, unknown>;
  skip?: boolean;
};

export function useGeographyFieldOptions({
  sectionValues,
  skip = false,
}: UseGeographyFieldOptionsArgs) {
  const selectedStateId = useMemo(
    () => resolveGeographyStateId(sectionValues),
    [sectionValues],
  );

  const { data: statesData, isLoading: isStatesLoading } = useGetStatesQuery(
    { itemsPerPage: 200, sort: "name:asc" },
    { skip },
  );

  const { data: stateWithLgas, isFetching: isStateLgasLoading } =
    useGetStateWithLgasQuery(selectedStateId!, {
      skip: skip || selectedStateId == null,
    });

  const embeddedLgaCount = stateWithLgas?.lgas?.length ?? 0;
  const { data: lgasListData, isFetching: isListLgasLoading } =
    useGetLgasByStateQuery(
      { stateId: selectedStateId!, itemsPerPage: 200 },
      {
        skip:
          skip ||
          selectedStateId == null ||
          isStateLgasLoading ||
          embeddedLgaCount > 0,
      },
    );

  const stateOptions: GeographyOption[] = useMemo(
    () =>
      (statesData?.member ?? []).map((state) => ({
        value: state.id,
        label: state.name,
      })),
    [statesData],
  );

  const lgaOptions: GeographyOption[] = useMemo(() => {
    const embedded = stateWithLgas?.lgas ?? [];
    const lgas =
      embedded.length > 0 ? embedded : (lgasListData?.member ?? []);
    return lgas.map((lga) => ({
      value: lga.id,
      label: lga.name,
    }));
  }, [stateWithLgas?.lgas, lgasListData?.member]);

  const isLgasLoading =
    selectedStateId != null && (isStateLgasLoading || isListLgasLoading);

  return {
    selectedStateId,
    stateOptions,
    lgaOptions,
    isStatesLoading,
    isLgasLoading,
  };
}
