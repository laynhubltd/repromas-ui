import { useAppDispatch } from "@/app/hooks";
import type { FormField } from "@/features/dynamic-form/types";
import { useEffect, useMemo, useState } from "react";
import dynamicFormAdminApi from "../api/dynamicFormAdminApi";

/**
 * Loads fields for all sections (for publish precheck). Uses RTK initiate + cache.
 */
export function useAllSectionFields(sectionIds: number[]) {
  const dispatch = useAppDispatch();
  const stableKey = useMemo(
    () => [...sectionIds].sort((a, b) => a - b).join(","),
    [sectionIds],
  );
  const [fieldsBySectionId, setFieldsBySectionId] = useState<
    Record<number, FormField[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ids = stableKey ? stableKey.split(",").map(Number) : [];
    if (ids.length === 0) {
      setFieldsBySectionId({});
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const entries = await Promise.all(
          ids.map(async (id) => {
            const result = await dispatch(
              dynamicFormAdminApi.endpoints.getSectionFields.initiate(id),
            ).unwrap();
            return [id, result] as const;
          }),
        );
        if (!cancelled) {
          setFieldsBySectionId(Object.fromEntries(entries));
        }
      } catch {
        if (!cancelled) {
          setFieldsBySectionId({});
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stableKey, dispatch]);

  return { fieldsBySectionId, isLoading };
}
