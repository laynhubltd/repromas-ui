import {
  JAMB_OPTION_INCLUDE,
  JAMB_OPTION_LIST_SORT_DEFAULT,
} from "@/shared/constants/jambRuleOptions";
import { useGetJambCombinationOptionsQuery } from "../api/jambRuleApi";
import type { JambCombinationGroup } from "../types/jamb-rule";

export function useJambRuleGroupCard(group: JambCombinationGroup) {
  const { data, isLoading, isError, refetch } =
    useGetJambCombinationOptionsQuery({
      "exact[groupId]": group.id,
      sort: JAMB_OPTION_LIST_SORT_DEFAULT,
      include: JAMB_OPTION_INCLUDE,
      itemsPerPage: 100,
    });

  const options = data?.member ?? [];
  const optionCount = options.length;
  const isAnyOf = group.requirementType === "ANY_OF";
  const isReady = !isLoading && !isError;

  // API blocks adding the next option when requiredCount > optionCount + 1
  const isAddBlocked =
    isReady && isAnyOf && group.requiredCount > optionCount + 1;

  const isIncomplete =
    isReady && isAnyOf && optionCount < group.requiredCount;

  const isSatisfied =
    isReady && isAnyOf && optionCount >= group.requiredCount;

  const subjectsNeeded = Math.max(0, group.requiredCount - optionCount);
  const maxRequiredCountToAddNext = optionCount + 1;

  return {
    state: {
      options,
      optionCount,
      isLoading,
      isError,
      isAnyOf,
      isAddBlocked,
      isIncomplete,
      isSatisfied,
      subjectsNeeded,
      maxRequiredCountToAddNext,
    },
    actions: { refetch },
  };
}
