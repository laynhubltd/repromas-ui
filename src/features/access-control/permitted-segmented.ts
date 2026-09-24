import type { NormalizedSegmentedOption } from "@/components/ui-kit/tabs/primarySegmentedOptions";
import { useMemo } from "react";
import type { PermissionRequirement } from "./types";
import { useAccessControl } from "./use-access-control";

export type PermittedSegmentedOption<T extends string | number = string> =
  NormalizedSegmentedOption<T> & {
    permission?: PermissionRequirement;
  };

/**
 * Headless pure filtering engine for Segmented options.
 *
 * Drops unauthorized options based on the permission requirement.
 *
 * @param options List of PermittedSegmentedOption items.
 * @param isAllowed Predicate determining if a requirement is satisfied.
 * @returns Clean NormalizedSegmentedOption array with permitted options.
 */
export function filterPermittedSegmentedOptions<T extends string | number = string>(
  options: PermittedSegmentedOption<T>[] | undefined | null,
  isAllowed: (requirement?: PermissionRequirement) => boolean,
): NormalizedSegmentedOption<T>[] {
  if (!options || options.length === 0) return [];

  return options
    .filter((option) => !option.permission || isAllowed(option.permission))
    .map(({ permission: _, ...rest }) => rest);
}

/**
 * React hook binding for filtering segmented options using the active user's permissions.
 */
export function usePermittedSegmentedOptions<T extends string | number = string>(
  options: PermittedSegmentedOption<T>[] | undefined | null,
): NormalizedSegmentedOption<T>[] {
  const { isPermitted } = useAccessControl();

  return useMemo(
    () => filterPermittedSegmentedOptions(options, isPermitted),
    [options, isPermitted],
  );
}
